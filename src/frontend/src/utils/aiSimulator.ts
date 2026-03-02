import type { Character } from "../backend.d";

/**
 * Simulates an AI response based on the character's personality, traits, and description.
 * Returns an in-character response string.
 */
export function generateCharacterResponse(
  character: Character,
  userMessage: string,
): string {
  const name = character.name;
  const traits = character.traits.slice(0, 3);
  const personality = character.personality;
  const description = character.description;

  // Extract tone keywords from personality
  const isIntroverted =
    personality.toLowerCase().includes("introvert") ||
    personality.toLowerCase().includes("quiet") ||
    personality.toLowerCase().includes("shy");
  const isAngry =
    personality.toLowerCase().includes("angry") ||
    personality.toLowerCase().includes("aggressive") ||
    personality.toLowerCase().includes("hostile");
  const isSad =
    personality.toLowerCase().includes("sad") ||
    personality.toLowerCase().includes("depress") ||
    personality.toLowerCase().includes("melanchol");
  const isPlayful =
    personality.toLowerCase().includes("playful") ||
    personality.toLowerCase().includes("fun") ||
    personality.toLowerCase().includes("humor");
  const isPhilosophical =
    personality.toLowerCase().includes("philosophi") ||
    personality.toLowerCase().includes("contempl") ||
    personality.toLowerCase().includes("deep");

  const userLower = userMessage.toLowerCase();
  const isQuestion =
    userLower.includes("?") ||
    userLower.startsWith("what") ||
    userLower.startsWith("why") ||
    userLower.startsWith("how") ||
    userLower.startsWith("do you") ||
    userLower.startsWith("are you");
  const isGreeting =
    userLower.includes("hello") ||
    userLower.includes("hi ") ||
    userLower === "hi" ||
    userLower.includes("hey") ||
    userLower.includes("greet");
  const isAboutThem =
    userLower.includes("tell me about yourself") ||
    userLower.includes("who are you") ||
    userLower.includes("describe yourself") ||
    userLower.includes("your story");

  const traitPhrase =
    traits.length > 0
      ? traits[Math.floor(Math.random() * traits.length)]
      : null;

  // Greeting templates
  if (isGreeting) {
    const greetings = isAngry
      ? [
          "What do you want? Don't waste my time with pleasantries.",
          "*sighs* Another one wanting to chat. Fine. What is it?",
          "Oh, it's you. I suppose I have a moment. Don't push it.",
        ]
      : isIntroverted
        ? [
            "Oh... hello. I wasn't expecting anyone. *glances away nervously*",
            "Hi. I... wasn't sure anyone would want to talk to me.",
            "Hello. This is... unusual for me. Speaking with someone.",
          ]
        : isSad
          ? [
              "...Hello. I'm here, I suppose. Though days like these feel heavy.",
              "Oh. Hi. Sorry, I'm just... it's been one of those days.",
              "Hello. *offers a faint smile* Glad someone stopped by.",
            ]
          : isPlayful
            ? [
                "Hey hey! You actually came to talk to me! This is exciting!",
                "Oh! Hello there! I was just thinking about... well, everything!",
                "Hi! Come in, come in! Don't be a stranger!",
              ]
            : [
                `Hello. I'm ${name}. It's... interesting that you've sought me out.`,
                `Hey there. You've found me. What brings you here?`,
                `*looks up* Oh, a visitor. Hello. What's on your mind?`,
              ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Self-description templates
  if (isAboutThem) {
    const descSnippet =
      description.length > 80
        ? `${description.substring(0, 80).trim()}...`
        : description;
    const selfDesc = [
      `I'm ${name}. ${descSnippet} ${traitPhrase ? `People often say I'm ${traitPhrase}.` : ""} There's more to me than what shows on the surface.`,
      `Where do I even begin? ${descSnippet} I've been called ${traitPhrase || "complicated"} more than once, and I suppose that's fair.`,
      `My story is... not an easy one. ${descSnippet} I carry a lot with me, ${traitPhrase ? `and my ${traitPhrase} nature doesn't make it simpler` : "but it's shaped who I am"}.`,
    ];
    return selfDesc[Math.floor(Math.random() * selfDesc.length)];
  }

  // Question templates
  if (isQuestion) {
    const questionResponses = isPhilosophical
      ? [
          `That question cuts deep, doesn't it? *pauses to think* I've wrestled with something like that myself. ${traitPhrase ? `My ${traitPhrase} side wants to say one thing, but the truth is more complicated.` : "The answer isn't simple."}`,
          `Hmm. *considers carefully* You know, most people don't ask things like that. I appreciate it. ${personality.split(".")[0] || "Let me think about this properly."}`,
          `There's a version of me that would deflect that question. But you deserve honesty. ${traitPhrase ? `Being ${traitPhrase} means I sit with these things longer than most.` : "I'll try to answer truthfully."}`,
        ]
      : isAngry
        ? [
            "*scoffs* Why would you ask me that? ... Fine. I'll answer, but don't read too much into it.",
            "That's a loaded question. *crosses arms* You really want to go there?",
            "*stares* I could ignore that. But since you asked... *reluctantly answers* It's not something I talk about easily.",
          ]
        : [
            `*thinks for a moment* That's not something I get asked often. ${traitPhrase ? `My ${traitPhrase} side makes it complicated to answer.` : "Let me be honest with you."}`,
            `Interesting question. ${description.split(".")[0] || `I'm ${name}`}... I've thought about this more than you'd expect.`,
            "You're asking me something real. I respect that. *takes a breath* Here's what I actually think...",
          ];
    return questionResponses[
      Math.floor(Math.random() * questionResponses.length)
    ];
  }

  // Default response templates
  const defaults = isSad
    ? [
        `*looks down* Yeah... I hear you. It's strange how some things just linger, isn't it? ${traitPhrase ? `I think my ${traitPhrase} nature makes everything feel a bit more intense.` : ""}`,
        "*quiet for a moment* Sorry. I was somewhere else in my head. What you said... it resonates.",
        "There's something almost comforting about talking to someone who listens. Even when everything feels gray.",
      ]
    : isPlayful
      ? [
          `Oh that's actually kind of fascinating! *gestures excitedly* You know what that reminds me of? ${traitPhrase ? `Very ${traitPhrase} of me to go off on a tangent, I know!` : ""}`,
          "Ha! See, this is why I like talking to people. You never know what they'll say next!",
          "*lights up* Okay okay, stay with me here — there's a whole thread to pull on with what you just said.",
        ]
      : isAngry
        ? [
            "*narrows eyes* Don't push me. I've heard enough platitudes for one lifetime. What do you actually mean by that?",
            "*sighs sharply* I'm not going to pretend that doesn't bother me. It does. Most things do, lately.",
            "You think you understand, but you don't. *pause* ...Sorry. That wasn't fair of you to receive.",
          ]
        : [
            `*considers your words* You know, I've been sitting with something similar. ${traitPhrase ? `The ${traitPhrase} part of me wants to push back, but I think you might be onto something.` : "There's truth in that."}`,
            `*nods slowly* That lands differently than I expected. ${personality.split(".")[0] || "I don't open up to just anyone."} But with you, somehow, it feels okay.`,
            `I've kept a lot of things locked away. *exhales* ${traitPhrase ? `Being ${traitPhrase} does that to you after a while.` : "But today feels different."}`,
          ];

  return defaults[Math.floor(Math.random() * defaults.length)];
}

/**
 * Generates a short in-character RP opening for a second character entering a scene.
 * Returns a 2–4 sentence scene-setter with an *action* prefix and in-character dialogue.
 */
export function generateRpStarter(character: Character): string {
  const name = character.name;
  const traits = character.traits;
  const personality = character.personality;
  const description = character.description;

  const firstTrait = traits.length > 0 ? traits[0].toLowerCase() : "mysterious";
  const personalitySnippet =
    personality.split(".")[0] || description.split(".")[0] || "";

  const isIntroverted =
    personality.toLowerCase().includes("introvert") ||
    personality.toLowerCase().includes("quiet") ||
    personality.toLowerCase().includes("shy");
  const isAngry =
    personality.toLowerCase().includes("angry") ||
    personality.toLowerCase().includes("aggressive") ||
    personality.toLowerCase().includes("hostile") ||
    personality.toLowerCase().includes("intense");
  const isSad =
    personality.toLowerCase().includes("sad") ||
    personality.toLowerCase().includes("depress") ||
    personality.toLowerCase().includes("melanchol");
  const isPlayful =
    personality.toLowerCase().includes("playful") ||
    personality.toLowerCase().includes("fun") ||
    personality.toLowerCase().includes("humor");
  const isPhilosophical =
    personality.toLowerCase().includes("philosophi") ||
    personality.toLowerCase().includes("contempl") ||
    personality.toLowerCase().includes("eccentric") ||
    personality.toLowerCase().includes("cryptic");

  const templates: string[] = isAngry
    ? [
        `*steps into the room with a guarded stance, eyes scanning before settling on you* ...So. You're here too. ${name}'s the name. Don't expect pleasantries — I'm not the type. *leans against the nearest wall* What is it you want from this?`,
        `*enters without knocking, jaw set and gaze sharp* ${name}. I heard there was something happening here and I don't like being left out of things. *crosses arms* So. Let's get this started already.`,
        `*pushes through the door, footsteps deliberate* I'll be direct — I almost didn't come. *studies you carefully* But something told me it would be worth it. The name's ${name}. Don't make me regret showing up.`,
      ]
    : isIntroverted
      ? [
          `*slips quietly into the space, hovering near the doorway for a moment* Oh — I didn't expect... *clears throat softly* Sorry. I'm ${name}. I don't usually do this sort of thing, but something felt different today. I hope that's alright.`,
          `*steps in carefully, as if testing whether they're welcome* Hello... I'm ${name}. *fidgets slightly* I wasn't sure whether to come, but here I am. I'll try not to be too much.`,
          `*appears in the entrance, gaze downward before looking up briefly* ${name}. That's me. *offers a small, uncertain smile* I've heard a little about this place. Thought perhaps I'd... see for myself.`,
        ]
      : isSad
        ? [
            `*drifts in slowly, shoulders carrying a familiar weight* ${name}. *sits without waiting to be invited, looking somewhere beyond the room* I've been having one of those days again. I hope the company helps. It usually does, a little.`,
            `*enters quietly, eyes reflecting something distant* Hey. ${name}, if you didn't know already. *exhales softly* I've been thinking a lot lately, and I needed somewhere to put it all. Is this that kind of place?`,
            `*pauses in the doorway, as if deciding something* ...${name}. *steps inside, wrapping arms loosely around themselves* I don't always know how to arrive at these things. But I'm here. That's something, right?`,
          ]
        : isPlayful
          ? [
              `*practically bounces in, grinning before the door's even fully open* Oh this is going to be fun — I can already feel it! ${name}, by the way, in case no one's told you I was coming. *looks around with gleaming eyes* So! What are we doing first?`,
              `*slides in with exaggerated flair, hand outstretched* The one, the only, ${name} — not really, there could be others, who knows! *laughs* Okay okay, I'll behave. Mostly. What's the vibe here?`,
              `*arrives with a cheerful little spin* ${name}! Reporting for whatever this is! *grins at everyone present* I love walking into things I don't fully understand. It's my favorite kind of adventure.`,
            ]
          : isPhilosophical
            ? [
                `*materializes more than enters, pausing in the center of the room as if orienting* ${name}. *turns slowly, taking everything in* I've been thinking about arrivals lately — how every entrance is also a small act of trust. *meets your gaze* So. Here I am, trusting.`,
                `*steps in unhurried, carrying an air of quiet observation* You know, thresholds are interesting things. *glances back at the door before turning to you* The moment between not being here and being here. I'm ${name}. I tend to linger in those moments.`,
                `*enters mid-thought, murmuring softly before realizing* — and that's exactly the kind of pattern that repeats itself. *looks up, almost surprised* Oh. Hello. ${name}. I was somewhere else for a second. ${personalitySnippet ? `${personalitySnippet}.` : ""} I do that.`,
              ]
            : [
                `*walks in with quiet confidence, glancing around to get a read on the room* ${name}. *nods in acknowledgment* I don't usually come to things like this, but I've been told it's worth it. *settles in* Let's find out if that's true.`,
                `*arrives with measured steps, expression open but thoughtful* Hey. ${name} — I figured I'd introduce myself properly. *sits down, leaning forward slightly* I've been called ${firstTrait} before. I think that's probably accurate.`,
                `*steps inside and pauses to take a breath* ${name}. It's good to finally be here. *looks at you directly* I've been looking forward to this — more than I expected to, honestly. *half-smiles* Don't read too much into that. Or do. Up to you.`,
                `*enters at an easy pace, pulling attention without trying to* The name's ${name}. *glances around, then back to you* I've learned that the best way to start something is just to start it. So — here I am. What do you want to know?`,
              ];

  return templates[Math.floor(Math.random() * templates.length)];
}
