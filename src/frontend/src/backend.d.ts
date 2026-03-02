import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ChatMessage {
    id: bigint;
    content: string;
    userId: Principal;
    role: string;
    timestamp: Time;
    characterId: bigint;
}
export type Time = bigint;
export interface Character {
    id: bigint;
    personality: string;
    isMature: boolean;
    contentWarnings: Array<string>;
    traits: Array<string>;
    name: string;
    createdAt: Time;
    createdBy: Principal;
    description: string;
    avatarUrl?: string;
    backstory: string;
}
export interface UserProfile {
    bio: string;
    principal: Principal;
    displayName: string;
    hasAcknowledgedAge: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMessage(characterId: bigint, role: string, content: string): Promise<ChatMessage>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearChatHistory(characterId: bigint): Promise<void>;
    createCharacter(name: string, description: string, personality: string, backstory: string, traits: Array<string>, contentWarnings: Array<string>, isMature: boolean, avatarUrl: string | null): Promise<Character>;
    deleteCharacter(id: bigint): Promise<void>;
    getAllCharacters(): Promise<Array<Character>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCharacter(id: bigint): Promise<Character | null>;
    getCharactersByUser(user: Principal): Promise<Array<Character>>;
    getMessages(characterId: bigint): Promise<Array<ChatMessage>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(displayName: string, bio: string, hasAcknowledgedAge: boolean): Promise<UserProfile>;
    updateCharacter(id: bigint, name: string, description: string, personality: string, backstory: string, traits: Array<string>, contentWarnings: Array<string>, isMature: boolean, avatarUrl: string | null): Promise<Character>;
}
