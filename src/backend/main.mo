import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Character = {
    id : Nat;
    name : Text;
    description : Text;
    personality : Text;
    backstory : Text;
    traits : [Text];
    contentWarnings : [Text];
    isMature : Bool;
    createdBy : Principal;
    createdAt : Time.Time;
    avatarUrl : ?Text;
  };

  module Character {
    public func compare(character1 : Character, character2 : Character) : Order.Order {
      Nat.compare(character1.id, character2.id);
    };
  };

  type ChatMessage = {
    id : Nat;
    characterId : Nat;
    userId : Principal;
    role : Text; // "user" or "assistant"
    content : Text;
    timestamp : Time.Time;
  };

  module ChatMessage {
    public func compare(message1 : ChatMessage, message2 : ChatMessage) : Order.Order {
      if (message1.timestamp >= message2.timestamp) {
        #greater;
      } else {
        #less;
      };
    };
  };

  type UserProfile = {
    principal : Principal;
    displayName : Text;
    bio : Text;
    hasAcknowledgedAge : Bool;
  };

  let characters = Map.empty<Nat, Character>();
  let chatMessages = Map.empty<Text, List.List<ChatMessage>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextCharacterId = 0;
  var nextMessageId = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper function to create a unique key for user-character chat pairs
  func getChatKey(userId : Principal, characterId : Nat) : Text {
    userId.toText() # ":" # characterId.toText();
  };

  public shared ({ caller }) func createCharacter(name : Text, description : Text, personality : Text, backstory : Text, traits : [Text], contentWarnings : [Text], isMature : Bool, avatarUrl : ?Text) : async Character {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create characters");
    };
    let character : Character = {
      id = nextCharacterId;
      name;
      description;
      personality;
      backstory;
      traits;
      contentWarnings;
      isMature;
      createdBy = caller;
      createdAt = Time.now();
      avatarUrl;
    };
    characters.add(nextCharacterId, character);
    nextCharacterId += 1;
    character;
  };

  public query ({ caller }) func getCharacter(id : Nat) : async ?Character {
    characters.get(id);
  };

  public shared ({ caller }) func updateCharacter(id : Nat, name : Text, description : Text, personality : Text, backstory : Text, traits : [Text], contentWarnings : [Text], isMature : Bool, avatarUrl : ?Text) : async Character {
    let existing = switch (characters.get(id)) {
      case (null) { Runtime.trap("Character does not exist") };
      case (?char) { char };
    };
    if (existing.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the creator or admin can update this character");
    };
    let updatedCharacter : Character = {
      existing with name; description; personality; backstory; traits; contentWarnings; isMature; avatarUrl;
    };
    characters.add(id, updatedCharacter);
    updatedCharacter;
  };

  public shared ({ caller }) func deleteCharacter(id : Nat) : async () {
    let existing = switch (characters.get(id)) {
      case (null) { Runtime.trap("Character does not exist") };
      case (?char) { char };
    };
    if (existing.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the creator or admin can delete this character");
    };
    characters.remove(id);
  };

  public query ({ caller }) func getAllCharacters() : async [Character] {
    characters.values().toArray().sort();
  };

  public query ({ caller }) func getCharactersByUser(user : Principal) : async [Character] {
    characters.values().toArray().filter(func(c) { c.createdBy == user });
  };

  public shared ({ caller }) func addMessage(characterId : Nat, role : Text, content : Text) : async ChatMessage {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    let message : ChatMessage = {
      id = nextMessageId;
      characterId;
      userId = caller;
      role;
      content;
      timestamp = Time.now();
    };
    let chatKey = getChatKey(caller, characterId);
    let existingMessages = switch (chatMessages.get(chatKey)) {
      case (null) { List.empty<ChatMessage>() };
      case (?msgs) { msgs };
    };
    existingMessages.add(message);
    chatMessages.add(chatKey, existingMessages);
    nextMessageId += 1;
    message;
  };

  public query ({ caller }) func getMessages(characterId : Nat) : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve messages");
    };
    let chatKey = getChatKey(caller, characterId);
    switch (chatMessages.get(chatKey)) {
      case (null) { [] };
      case (?msgs) { msgs.toArray().sort() };
    };
  };

  public shared ({ caller }) func clearChatHistory(characterId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear chat history");
    };
    let chatKey = getChatKey(caller, characterId);
    chatMessages.remove(chatKey);
  };

  public shared ({ caller }) func saveCallerUserProfile(displayName : Text, bio : Text, hasAcknowledgedAge : Bool) : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let userProfile : UserProfile = {
      principal = caller;
      displayName;
      bio;
      hasAcknowledgedAge;
    };
    userProfiles.add(caller, userProfile);
    userProfile;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile unless you are an admin");
    };
    userProfiles.get(user);
  };
};
