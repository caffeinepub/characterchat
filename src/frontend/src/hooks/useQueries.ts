import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Character, ChatMessage, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

// ── Characters ────────────────────────────────────────────────

export function useAllCharacters() {
  const { actor, isFetching } = useActor();
  return useQuery<Character[]>({
    queryKey: ["characters"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCharacters();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCharacter(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Character | null>({
    queryKey: ["character", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getCharacter(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCharactersByUser(principal: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Character[]>({
    queryKey: ["myCharacters", principal],
    queryFn: async () => {
      if (!actor || !principal) return [];
      // We pass the principal string; the backend will use the caller's identity
      return actor
        .getAllCharacters()
        .then((chars) =>
          chars.filter((c) => c.createdBy.toString() === principal),
        );
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useCreateCharacter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      personality: string;
      backstory: string;
      traits: string[];
      contentWarnings: string[];
      isMature: boolean;
      avatarUrl: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCharacter(
        data.name,
        data.description,
        data.personality,
        data.backstory,
        data.traits,
        data.contentWarnings,
        data.isMature,
        data.avatarUrl,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      queryClient.invalidateQueries({ queryKey: ["myCharacters"] });
    },
  });
}

export function useUpdateCharacter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      description: string;
      personality: string;
      backstory: string;
      traits: string[];
      contentWarnings: string[];
      isMature: boolean;
      avatarUrl: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCharacter(
        data.id,
        data.name,
        data.description,
        data.personality,
        data.backstory,
        data.traits,
        data.contentWarnings,
        data.isMature,
        data.avatarUrl,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      queryClient.invalidateQueries({
        queryKey: ["character", variables.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["myCharacters"] });
    },
  });
}

export function useDeleteCharacter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteCharacter(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      queryClient.invalidateQueries({ queryKey: ["myCharacters"] });
    },
  });
}

// ── Messages ──────────────────────────────────────────────────

export function useMessages(characterId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ChatMessage[]>({
    queryKey: ["messages", characterId?.toString()],
    queryFn: async () => {
      if (!actor || characterId === null) return [];
      return actor.getMessages(characterId);
    },
    enabled: !!actor && !isFetching && characterId !== null,
  });
}

export function useAddMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      characterId: bigint;
      role: string;
      content: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addMessage(data.characterId, data.role, data.content);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.characterId.toString()],
      });
    },
  });
}

export function useClearChatHistory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (characterId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.clearChatHistory(characterId);
    },
    onSuccess: (_data, characterId) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", characterId.toString()],
      });
    },
  });
}

// ── User Profile ──────────────────────────────────────────────

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      displayName: string;
      bio: string;
      hasAcknowledgedAge: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(
        data.displayName,
        data.bio,
        data.hasAcknowledgedAge,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}
