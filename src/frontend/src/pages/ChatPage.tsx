import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Drama,
  Info,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Send,
  ShieldAlert,
  Trash2,
  User,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Character, ChatMessage } from "../backend.d";
import {
  useAddMessage,
  useAllCharacters,
  useCharacter,
  useClearChatHistory,
  useMessages,
} from "../hooks/useQueries";
import { generateCharacterResponse } from "../utils/aiSimulator";

// Sample character data for when backend doesn't have the character
const SAMPLE_CHARACTER_MAP: Record<string, Character> = {
  "1": {
    id: 1n,
    name: "Elena Moreau",
    description:
      "A former ballet dancer navigating recovery from an eating disorder, now working as a dance therapist.",
    personality:
      "Thoughtful, empathetic, and quietly resilient. She speaks with careful precision, choosing words that heal rather than harm. She has a melancholic warmth about her.",
    backstory:
      "Elena spent her formative years in the unforgiving world of professional ballet, where her body was both her instrument and her enemy.",
    traits: ["Empathetic", "Artistic", "Survivor", "Gentle"],
    contentWarnings: ["Eating Disorders", "Mental Health"],
    isMature: true,
    createdAt: BigInt(Date.now()),
    createdBy: {
      toString: () => "anon",
      isAnonymous: () => true,
      toText: () => "anon",
      compareTo: () => "lt",
    } as any,
    avatarUrl: undefined,
  },
  "2": {
    id: 2n,
    name: "Damien Cross",
    description:
      "A brooding ex-soldier haunted by his past, struggling with PTSD and substance use.",
    personality:
      "Guarded, intense, with sudden bursts of raw honesty. He deflects with dark humor but breaks when cornered by genuine kindness. Direct to the point of bluntness.",
    backstory:
      "Three tours changed Damien in ways he can't fully articulate. Back in civilian life, he self-medicates and avoids intimacy.",
    traits: ["Intense", "Protective", "Damaged", "Loyal"],
    contentWarnings: ["Substance Use", "Trauma", "Mental Health", "Violence"],
    isMature: true,
    createdAt: BigInt(Date.now()),
    createdBy: {
      toString: () => "anon",
      isAnonymous: () => true,
      toText: () => "anon",
      compareTo: () => "lt",
    } as any,
    avatarUrl: undefined,
  },
  "3": {
    id: 3n,
    name: "Seraphina Vale",
    description:
      "A mysterious author of gothic fiction whose characters seem to know her innermost secrets.",
    personality:
      "Philosophical, eccentric, and deeply introspective. She speaks in metaphors and often seems to drift between this conversation and another world entirely. Playfully cryptic.",
    backstory:
      "Seraphina was institutionalized at 19 after what she calls 'a necessary unraveling.' She emerged three years later with two manuscripts.",
    traits: ["Philosophical", "Creative", "Cryptic", "Haunted"],
    contentWarnings: ["Mental Health", "Trauma"],
    isMature: false,
    createdAt: BigInt(Date.now()),
    createdBy: {
      toString: () => "anon",
      isAnonymous: () => true,
      toText: () => "anon",
      compareTo: () => "lt",
    } as any,
    avatarUrl: undefined,
  },
};

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  speakerName?: string; // for role-play dual-character display
}

/** Parse *action text* into <em> segments */
function parseRolePlayContent(text: string): React.ReactNode {
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    const key = `rp-${i}-${part.length}`;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em
          key={key}
          className="text-muted-foreground not-italic opacity-80 italic font-medium"
        >
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

function MessageBubble({
  message,
  characterName,
  isRolePlay,
  overrideName,
}: {
  message: LocalMessage;
  characterName: string;
  isRolePlay?: boolean;
  overrideName?: string;
}) {
  const isUser = message.role === "user";
  const displayName = overrideName || (message.speakerName ?? characterName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-primary/20 border border-primary/30"
            : "bg-muted/60 border border-border"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary" />
        ) : (
          <span className="text-xs font-display font-bold text-muted-foreground">
            {displayName.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary/20 border border-primary/25 rounded-tr-sm"
            : "bg-card border border-border rounded-tl-sm"
        }`}
      >
        {!isUser && (
          <p className="text-[11px] font-semibold text-primary mb-1">
            {displayName}
          </p>
        )}
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {isRolePlay && !isUser
            ? parseRolePlayContent(message.content)
            : message.content}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </motion.div>
  );
}

function TypingIndicator({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-muted/60 border border-border flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-display font-bold text-muted-foreground">
          {name.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
        <p className="text-[11px] font-semibold text-primary mb-1">{name}</p>
        <div className="flex items-center gap-1 h-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.6,
                delay: i * 0.15,
                repeat: Number.POSITIVE_INFINITY,
              }}
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Check browser support for SpeechRecognition
const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    : null;

export function ChatPage() {
  const { characterId } = useParams({ from: "/chat/$characterId" });
  const navigate = useNavigate();
  const charIdBigInt = characterId ? BigInt(characterId) : null;

  const { data: backendCharacter, isLoading: charLoading } =
    useCharacter(charIdBigInt);
  const { data: backendMessages, isLoading: messagesLoading } =
    useMessages(charIdBigInt);
  const addMessage = useAddMessage();
  const clearHistory = useClearChatHistory();
  const { data: allCharacters } = useAllCharacters();

  // Use backend or sample character
  const character = backendCharacter || SAMPLE_CHARACTER_MAP[characterId ?? ""];

  // Local messages state (starts with backend messages, grows locally)
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Voice output (TTS) state
  const [ttsEnabled, setTtsEnabled] = useState(false);

  // Role-play state
  const [isRolePlayMode, setIsRolePlayMode] = useState(false);
  const [secondCharacter, setSecondCharacter] = useState<Character | null>(
    null,
  );
  const [nextResponder, setNextResponder] = useState<"primary" | "secondary">(
    "primary",
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesInitialized = useRef(false);

  // Load backend messages on mount
  useEffect(() => {
    if (backendMessages && !messagesInitialized.current) {
      messagesInitialized.current = true;
      const converted: LocalMessage[] = backendMessages
        .sort((a, b) => Number(a.timestamp - b.timestamp))
        .map((m) => ({
          id: m.id.toString(),
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: Number(m.timestamp / BigInt(1_000_000)), // nano to ms
        }));
      setLocalMessages(converted);
    }
  }, [backendMessages]);

  // Scroll to bottom when messages change
  // biome-ignore lint/correctness/useExhaustiveDependencies: scrollRef is a stable ref, triggers are correct
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, isTyping]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakText = useCallback(
    (text: string) => {
      if (!ttsEnabled || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    },
    [ttsEnabled],
  );

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI || isListening) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (transcript) {
        setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || !character || isTyping) return;

    const userContent = inputValue.trim();
    setInputValue("");

    // Cancel ongoing speech when user sends
    window.speechSynthesis?.cancel();

    const userMsg: LocalMessage = {
      id: `local-user-${Date.now()}`,
      role: "user",
      content: userContent,
      timestamp: Date.now(),
    };

    setLocalMessages((prev) => [...prev, userMsg]);

    // Save user message to backend (non-blocking)
    if (charIdBigInt) {
      addMessage.mutate({
        characterId: charIdBigInt,
        role: "user",
        content: userContent,
      });
    }

    // Determine which character responds
    const respondingCharacter =
      isRolePlayMode && secondCharacter && nextResponder === "secondary"
        ? secondCharacter
        : character;

    // Simulate typing delay
    setIsTyping(true);
    const delay = 600 + Math.random() * 800;

    setTimeout(async () => {
      const responseText = generateCharacterResponse(
        respondingCharacter,
        userContent,
      );

      const assistantMsg: LocalMessage = {
        id: `local-assistant-${Date.now()}`,
        role: "assistant",
        content: responseText,
        timestamp: Date.now(),
        speakerName: isRolePlayMode ? respondingCharacter.name : undefined,
      };

      setLocalMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);

      // TTS: speak the new assistant message
      speakText(responseText);

      // Toggle responder for next round
      if (isRolePlayMode && secondCharacter) {
        setNextResponder((prev) =>
          prev === "primary" ? "secondary" : "primary",
        );
      }

      // Save assistant message to backend (non-blocking)
      if (charIdBigInt) {
        addMessage.mutate({
          characterId: charIdBigInt,
          role: "assistant",
          content: responseText,
        });
      }
    }, delay);
  }, [
    inputValue,
    character,
    isTyping,
    charIdBigInt,
    addMessage,
    isRolePlayMode,
    secondCharacter,
    nextResponder,
    speakText,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const handleClearChat = async () => {
    if (charIdBigInt) {
      try {
        await clearHistory.mutateAsync(charIdBigInt);
        setLocalMessages([]);
        messagesInitialized.current = false;
        toast.success("Chat history cleared");
      } catch {
        toast.error("Failed to clear chat history");
      }
    } else {
      setLocalMessages([]);
    }
  };

  // Filter other characters for role-play second character picker
  const otherCharacters =
    allCharacters?.filter((c) => c.id !== charIdBigInt) ?? [];

  if (charLoading || messagesLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Character not found.</p>
        <Button
          variant="ghost"
          onClick={() => navigate({ to: "/" })}
          className="mt-4"
        >
          Back to Discover
        </Button>
      </div>
    );
  }

  const hasWarnings = character.contentWarnings.length > 0 && !warningDismissed;

  return (
    <div className="flex h-[calc(100vh-4.5rem)] overflow-hidden max-w-5xl mx-auto">
      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Chat header */}
        <div
          className={`flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0 transition-colors ${
            isRolePlayMode ? "bg-primary/5 border-primary/20" : ""
          }`}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/" })}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          {/* Character avatar */}
          <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
            {character.avatarUrl ? (
              <img
                src={character.avatarUrl}
                alt={character.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-sm font-display font-bold text-primary">
                {character.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-semibold text-foreground truncate">
                {character.name}
              </h2>
              {character.isMature && (
                <span className="text-[10px] bg-mature/20 text-mature border border-mature/30 px-1.5 py-0 rounded uppercase tracking-wider font-bold flex-shrink-0">
                  18+
                </span>
              )}
              {isRolePlayMode && (
                <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30 h-5 px-2">
                  Role-Play
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {character.traits.slice(0, 3).join(" · ")}
            </p>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Role-play toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsRolePlayMode((v) => !v);
                if (isRolePlayMode) {
                  setSecondCharacter(null);
                  setNextResponder("primary");
                }
              }}
              className={`h-8 w-8 transition-colors ${
                isRolePlayMode
                  ? "text-primary bg-primary/15"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Toggle role-play mode"
            >
              <Drama className="w-4 h-4" />
            </Button>

            {/* TTS toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setTtsEnabled((v) => {
                  if (v) window.speechSynthesis?.cancel();
                  return !v;
                });
              }}
              className={`h-8 w-8 transition-colors ${
                ttsEnabled
                  ? "text-primary bg-primary/15"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={
                ttsEnabled ? "Disable voice output" : "Enable voice output"
              }
            >
              {ttsEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInfo((v) => !v)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Character info"
            >
              <Info className="w-4 h-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This will delete all messages with {character.name}. This
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-border">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearChat}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Clear Chat
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Content warning banner */}
        <AnimatePresence>
          {hasWarnings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden flex-shrink-0"
            >
              <div className="flex items-start gap-3 px-4 py-3 bg-warning/10 border-b border-warning/25">
                <ShieldAlert className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-warning mb-1">
                    Content Warning
                  </p>
                  <p className="text-xs text-warning/80">
                    This character involves:{" "}
                    <span className="font-medium">
                      {character.contentWarnings.join(", ")}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setWarningDismissed(true)}
                  className="text-warning/60 hover:text-warning transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Role-play second character selector */}
        <AnimatePresence>
          {isRolePlayMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden flex-shrink-0"
            >
              <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/5 border-b border-primary/15">
                <Drama className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-xs font-medium text-primary whitespace-nowrap">
                  Add a second character:
                </span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {secondCharacter ? (
                    <div className="flex items-center gap-1.5">
                      <Badge className="text-[11px] bg-primary/15 text-primary border-primary/25 font-medium">
                        {secondCharacter.name}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => {
                          setSecondCharacter(null);
                          setNextResponder("primary");
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <Select
                      onValueChange={(val) => {
                        const found = otherCharacters.find(
                          (c) => c.id.toString() === val,
                        );
                        setSecondCharacter(found ?? null);
                      }}
                    >
                      <SelectTrigger className="h-7 text-xs bg-card border-border w-auto min-w-[160px] max-w-[200px]">
                        <SelectValue placeholder="Choose a character…" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {otherCharacters.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No other characters available
                          </SelectItem>
                        ) : (
                          otherCharacters.map((c) => (
                            <SelectItem
                              key={c.id.toString()}
                              value={c.id.toString()}
                            >
                              {c.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {secondCharacter && (
                  <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                    Next:{" "}
                    <span className="text-primary font-medium">
                      {nextResponder === "primary"
                        ? character.name
                        : secondCharacter.name}
                    </span>
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character info panel */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden flex-shrink-0"
            >
              <div className="px-4 py-3 bg-card/80 border-b border-border space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-foreground">
                    About {character.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowInfo(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {character.description}
                </p>
                {character.backstory && (
                  <p className="text-xs text-muted-foreground/80 leading-relaxed italic border-l-2 border-primary/30 pl-3">
                    {character.backstory.length > 150
                      ? `${character.backstory.substring(0, 150)}...`
                      : character.backstory}
                  </p>
                )}
                {character.traits.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {character.traits.map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 bg-secondary/50"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 chat-scroll"
        >
          {localMessages.length === 0 && !isTyping ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center justify-center h-full gap-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-primary/60" />
              </div>
              <div className="space-y-1">
                <p className="text-foreground font-medium">
                  Start a conversation
                </p>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Say hello to {character.name}. They're waiting to hear from
                  you.
                </p>
                {isRolePlayMode && (
                  <p className="text-primary/70 text-xs mt-2 flex items-center gap-1 justify-center">
                    <Drama className="w-3 h-3" />
                    Role-play mode active — actions like *this* will be
                    italicized
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <>
              {localMessages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  characterName={character.name}
                  isRolePlay={isRolePlayMode}
                  overrideName={
                    isRolePlayMode && msg.speakerName
                      ? msg.speakerName
                      : undefined
                  }
                />
              ))}
              <AnimatePresence>
                {isTyping && (
                  <TypingIndicator
                    name={
                      isRolePlayMode &&
                      secondCharacter &&
                      nextResponder === "secondary"
                        ? secondCharacter.name
                        : character.name
                    }
                  />
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-border bg-card/30">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${character.name}...`}
              className="flex-1 min-h-[44px] max-h-32 resize-none bg-input border-border focus-visible:ring-primary/50 text-sm"
              rows={1}
              disabled={isTyping}
            />

            {/* Mic button (only if browser supports SpeechRecognition) */}
            {SpeechRecognitionAPI && (
              <Button
                type="button"
                variant="ghost"
                onClick={isListening ? stopListening : startListening}
                disabled={isTyping}
                className={`h-11 w-11 p-0 flex-shrink-0 rounded-xl transition-colors ${
                  isListening
                    ? "bg-destructive/20 text-destructive hover:bg-destructive/30 animate-pulse"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
            )}

            <Button
              onClick={() => void sendMessage()}
              disabled={!inputValue.trim() || isTyping}
              className="h-11 w-11 p-0 bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0 rounded-xl"
            >
              {isTyping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 text-center">
            Enter to send · Shift+Enter for new line
            {isListening && (
              <span className="text-destructive ml-2 font-medium">
                · Listening…
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
