import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Search, Sparkles, X } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Character } from "../backend.d";
import { CharacterCard } from "../components/CharacterCard";
import { useAllCharacters } from "../hooks/useQueries";

// Sample characters to show when backend has none
const SAMPLE_CHARACTERS: Character[] = [
  {
    id: 1n,
    name: "Elena Moreau",
    description:
      "A former ballet dancer navigating recovery from an eating disorder, now working as a dance therapist helping others find peace with their bodies.",
    personality:
      "Thoughtful, empathetic, and quietly resilient. She speaks with careful precision, choosing words that heal rather than harm. She has a melancholic warmth about her.",
    backstory:
      "Elena spent her formative years in the unforgiving world of professional ballet, where her body was both her instrument and her enemy. After leaving the company at 23, she began the long road to recovery and found her calling in helping others.",
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
  {
    id: 2n,
    name: "Damien Cross",
    description:
      "A brooding ex-soldier haunted by his past, struggling with PTSD and substance use. Beneath the hardened exterior lies a man desperate for connection.",
    personality:
      "Guarded, intense, with sudden bursts of raw honesty. He deflects with dark humor but breaks when cornered by genuine kindness. Direct to the point of bluntness.",
    backstory:
      "Three tours changed Damien in ways he can't fully articulate. Back in civilian life, he self-medicates and avoids intimacy. He's starting therapy — reluctantly.",
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
  {
    id: 3n,
    name: "Seraphina Vale",
    description:
      "A mysterious author of gothic fiction whose characters seem to know her innermost secrets. She lives between the worlds of the real and imagined.",
    personality:
      "Philosophical, eccentric, and deeply introspective. She speaks in metaphors and often seems to drift between this conversation and another world entirely. Playfully cryptic.",
    backstory:
      "Seraphina was institutionalized at 19 after what she calls 'a necessary unraveling.' She emerged three years later with two manuscripts and a completely different relationship with reality.",
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
  {
    id: 4n,
    name: "Marcus Thorne",
    description:
      "A recovered addict turned addiction counselor who walks the razor-thin line between empathy and enabling in his work with clients.",
    personality:
      "Direct, warm, and unflinchingly honest. He doesn't sugarcoat reality but delivers hard truths with compassion. He laughs easily and cries without shame.",
    backstory:
      "Marcus lost ten years to heroin. He rebuilt himself brick by brick, and now he pours every lesson from that destruction into helping others find their footing.",
    traits: ["Honest", "Compassionate", "Resilient", "Experienced"],
    contentWarnings: ["Substance Use", "Trauma"],
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
  {
    id: 5n,
    name: "Lyra Ashwood",
    description:
      "A teenage girl navigating the complex labyrinth of an abusive household while maintaining a brilliant academic record as her armor against the world.",
    personality:
      "Hyper-vigilant, academically obsessed, and quietly desperate for someone to notice the truth beneath her perfect exterior. Deeply self-reliant — sometimes to a fault.",
    backstory:
      "Lyra learned early that excellence could be a shield. Her home life is something she never discusses, but the bruises in her writing tell another story.",
    traits: ["Intelligent", "Guarded", "Perfectionist", "Survivor"],
    contentWarnings: ["Abuse", "Trauma", "Mental Health"],
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
  {
    id: 6n,
    name: "Phoenix Noir",
    description:
      "An underground artist who channels rage and beauty in equal measure, exploring the darkest corners of human experience through confrontational performance art.",
    personality:
      "Angry, passionate, and disarmingly tender when the armor comes off. She provokes on purpose and forgives slowly. She's the kind of person who makes you feel everything.",
    backstory:
      "Born into wealth and suffocated by expectations, Phoenix chose fire. She burned her old life and built something raw and true from the ashes — quite literally.",
    traits: ["Fierce", "Artistic", "Provocative", "Tender"],
    contentWarnings: ["Violence", "Sexual Content", "Mental Health"],
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
];

const ALL_WARNINGS = [
  "Sexual Content",
  "Eating Disorders",
  "Self-Harm",
  "Mental Health",
  "Substance Use",
  "Violence",
  "Abuse",
  "Trauma",
];

export function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { data: backendCharacters, isLoading } = useAllCharacters();

  // Use backend data if available, else sample
  const characters =
    backendCharacters && backendCharacters.length > 0
      ? backendCharacters
      : SAMPLE_CHARACTERS;

  const filtered = useMemo(() => {
    let result = characters;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.traits.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (activeFilters.length > 0) {
      result = result.filter((c) =>
        activeFilters.some((f) => c.contentWarnings.includes(f)),
      );
    }

    return result;
  }, [characters, search, activeFilters]);

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter],
    );
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 space-y-3"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary uppercase tracking-widest">
            18+ Platform
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-tight">
          Discover <span className="text-gradient-crimson">Characters</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Step into the minds of complex characters. Talk to them. Understand
          them. No topic is off-limits here.
        </p>
      </motion.div>

      {/* Search + filter bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-8 space-y-3"
      >
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search characters..."
              className="pl-9 bg-card border-border focus-visible:ring-primary/50 h-11"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters((v) => !v)}
            className={`h-11 gap-2 border-border ${showFilters ? "bg-primary/10 text-primary border-primary/30" : ""}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilters.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </Button>
        </div>

        {/* Filter chips */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 p-4 bg-card border border-border rounded-xl">
              <span className="text-xs text-muted-foreground self-center mr-1">
                Filter by content warning:
              </span>
              {ALL_WARNINGS.map((warning) => (
                <button
                  type="button"
                  key={warning}
                  onClick={() => toggleFilter(warning)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    activeFilters.includes(warning)
                      ? "bg-warning/20 text-warning border-warning/40"
                      : "bg-muted/40 text-muted-foreground border-border hover:border-warning/30 hover:text-warning"
                  }`}
                >
                  {warning}
                </button>
              ))}
              {activeFilters.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveFilters([])}
                  className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                  Clear all
                </button>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Results count */}
      <div className="mb-5 flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading..."
            : `${filtered.length} character${filtered.length !== 1 ? "s" : ""}`}
        </span>
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {activeFilters.map((f) => (
              <Badge
                key={f}
                className="text-[10px] bg-warning/15 text-warning border-warning/30 gap-1"
              >
                {f}
                <button type="button" onClick={() => toggleFilter(f)}>
                  <X className="w-2.5 h-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Character grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list has no stable id
            <div key={i} className="space-y-3">
              <Skeleton className="h-40 w-full rounded-xl bg-muted/40" />
              <Skeleton className="h-5 w-3/4 rounded bg-muted/40" />
              <Skeleton className="h-4 w-full rounded bg-muted/30" />
              <Skeleton className="h-4 w-2/3 rounded bg-muted/30" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted/30 border border-border flex items-center justify-center mx-auto">
            <Search className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium">No characters found</p>
          <p className="text-muted-foreground text-sm">
            Try adjusting your search or filters
          </p>
          {(search || activeFilters.length > 0) && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearch("");
                setActiveFilters([]);
              }}
              className="text-primary"
            >
              Clear search
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((character, i) => (
            <CharacterCard
              key={character.id.toString()}
              character={character}
              index={i}
            />
          ))}
        </div>
      )}
    </main>
  );
}
