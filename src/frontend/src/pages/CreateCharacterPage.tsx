import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Plus, Save, ShieldAlert, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AvatarPicker } from "../components/AvatarPicker";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCharacter,
  useCreateCharacter,
  useUpdateCharacter,
} from "../hooks/useQueries";

const CONTENT_WARNING_PRESETS = [
  "Sexual Content",
  "Eating Disorders",
  "Self-Harm",
  "Mental Health",
  "Substance Use",
  "Violence",
  "Abuse",
  "Trauma",
];

interface FormState {
  name: string;
  description: string;
  personality: string;
  backstory: string;
  avatarUrl: string;
  traits: string[];
  contentWarnings: string[];
  isMature: boolean;
}

const DEFAULT_FORM: FormState = {
  name: "",
  description: "",
  personality: "",
  backstory: "",
  avatarUrl: "",
  traits: [],
  contentWarnings: [],
  isMature: false,
};

interface CreateCharacterPageProps {
  mode: "create" | "edit";
}

export function CreateCharacterPage({ mode }: CreateCharacterPageProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const params = useParams({ strict: false }) as { id?: string };
  const editId = mode === "edit" && params.id ? BigInt(params.id) : null;

  const { data: existingCharacter } = useCharacter(editId);
  const createMutation = useCreateCharacter();
  const updateMutation = useUpdateCharacter();

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [traitInput, setTraitInput] = useState("");

  // Populate form for edit mode
  useEffect(() => {
    if (existingCharacter && mode === "edit") {
      setForm({
        name: existingCharacter.name,
        description: existingCharacter.description,
        personality: existingCharacter.personality,
        backstory: existingCharacter.backstory,
        avatarUrl: existingCharacter.avatarUrl || "",
        traits: existingCharacter.traits,
        contentWarnings: existingCharacter.contentWarnings,
        isMature: existingCharacter.isMature,
      });
    }
  }, [existingCharacter, mode]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addTrait = () => {
    const t = traitInput.trim();
    if (t && !form.traits.includes(t)) {
      updateField("traits", [...form.traits, t]);
    }
    setTraitInput("");
  };

  const removeTrait = (trait: string) => {
    updateField(
      "traits",
      form.traits.filter((t) => t !== trait),
    );
  };

  const toggleContentWarning = (warning: string) => {
    if (form.contentWarnings.includes(warning)) {
      updateField(
        "contentWarnings",
        form.contentWarnings.filter((w) => w !== warning),
      );
    } else {
      updateField("contentWarnings", [...form.contentWarnings, warning]);
      // Auto-enable mature if selecting sensitive warnings
      if (!form.isMature) {
        updateField("isMature", true);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error("Please sign in to create a character");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Character name is required");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Description is required");
      return;
    }

    const avatarUrl = form.avatarUrl.trim() || null;

    try {
      if (mode === "edit" && editId !== null) {
        await updateMutation.mutateAsync({
          id: editId,
          name: form.name,
          description: form.description,
          personality: form.personality,
          backstory: form.backstory,
          traits: form.traits,
          contentWarnings: form.contentWarnings,
          isMature: form.isMature,
          avatarUrl,
        });
        toast.success("Character updated successfully!");
        navigate({ to: "/my-characters" });
      } else {
        const created = await createMutation.mutateAsync({
          name: form.name,
          description: form.description,
          personality: form.personality,
          backstory: form.backstory,
          traits: form.traits,
          contentWarnings: form.contentWarnings,
          isMature: form.isMature,
          avatarUrl,
        });
        toast.success(`${form.name} created!`);
        navigate({
          to: "/chat/$characterId",
          params: { characterId: created.id.toString() },
        });
      }
    } catch (error) {
      toast.error("Failed to save character. Please try again.");
      console.error(error);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-4"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            navigate({ to: mode === "edit" ? "/my-characters" : "/" })
          }
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {mode === "edit" ? "Edit Character" : "Create a Character"}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {mode === "edit"
              ? "Update your character's details"
              : "Bring a new character to life"}
          </p>
        </div>
      </motion.div>

      {!identity && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex items-center gap-3 p-4 bg-warning/10 border border-warning/25 rounded-xl"
        >
          <ShieldAlert className="w-5 h-5 text-warning flex-shrink-0" />
          <p className="text-sm text-warning/90">
            You need to sign in to create or edit characters.
          </p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-xl p-6 space-y-5"
        >
          <h2 className="font-semibold text-foreground text-sm uppercase tracking-wider text-primary/80">
            Basic Information
          </h2>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-foreground">
              Name <span className="text-primary">*</span>
            </Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Your character's name"
              className="bg-input border-border focus-visible:ring-primary/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm text-foreground">
              Description <span className="text-primary">*</span>
            </Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Who is this character? What makes them unique?"
              className="bg-input border-border focus-visible:ring-primary/50 min-h-20 resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-foreground">
              Avatar{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <AvatarPicker
              value={form.avatarUrl}
              onChange={(url) => updateField("avatarUrl", url)}
              seed={form.name || "character"}
            />
          </div>
        </motion.div>

        {/* Personality card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-6 space-y-5"
        >
          <h2 className="font-semibold text-foreground text-sm uppercase tracking-wider text-primary/80">
            Personality & Backstory
          </h2>

          <div className="space-y-2">
            <Label htmlFor="personality" className="text-sm text-foreground">
              Personality
            </Label>
            <Textarea
              id="personality"
              value={form.personality}
              onChange={(e) => updateField("personality", e.target.value)}
              placeholder="How do they speak? How do they act? What's their emotional register?"
              className="bg-input border-border focus-visible:ring-primary/50 min-h-24 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="backstory" className="text-sm text-foreground">
              Backstory
            </Label>
            <Textarea
              id="backstory"
              value={form.backstory}
              onChange={(e) => updateField("backstory", e.target.value)}
              placeholder="What shaped this character? What events define them?"
              className="bg-input border-border focus-visible:ring-primary/50 min-h-28 resize-none"
            />
          </div>

          {/* Traits */}
          <div className="space-y-2">
            <Label className="text-sm text-foreground">Traits</Label>
            <div className="flex gap-2">
              <Input
                value={traitInput}
                onChange={(e) => setTraitInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTrait();
                  }
                }}
                placeholder="Add a trait (press Enter)"
                className="bg-input border-border focus-visible:ring-primary/50 flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTrait}
                disabled={!traitInput.trim()}
                className="border-border"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {form.traits.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.traits.map((trait) => (
                  <span
                    key={trait}
                    className="flex items-center gap-1.5 text-sm bg-secondary/60 text-secondary-foreground border border-border px-3 py-1 rounded-full"
                  >
                    {trait}
                    <button
                      type="button"
                      onClick={() => removeTrait(trait)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Content warnings card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-xl p-6 space-y-5"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-warning" />
            <h2 className="font-semibold text-foreground text-sm uppercase tracking-wider text-warning/80">
              Content Warnings
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Select all content warnings that apply. Users will see these before
            chatting with your character.
          </p>

          <div className="flex flex-wrap gap-2">
            {CONTENT_WARNING_PRESETS.map((warning) => {
              const isSelected = form.contentWarnings.includes(warning);
              return (
                <button
                  key={warning}
                  type="button"
                  onClick={() => toggleContentWarning(warning)}
                  className={`text-sm px-3 py-1.5 rounded-lg border transition-all duration-150 ${
                    isSelected
                      ? "bg-warning/20 text-warning border-warning/40 shadow-sm"
                      : "bg-muted/30 text-muted-foreground border-border hover:border-warning/30 hover:text-warning/80"
                  }`}
                >
                  {warning}
                </button>
              );
            })}
          </div>

          {/* Mature toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <p className="text-sm font-medium text-foreground">
                18+ Mature Content
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Mark if this character involves explicit or mature themes
              </p>
            </div>
            <Switch
              checked={form.isMature}
              onCheckedChange={(v) => updateField("isMature", v)}
              className="data-[state=checked]:bg-mature"
            />
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3"
        >
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate({ to: mode === "edit" ? "/my-characters" : "/" })
            }
            className="flex-1 border-border"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !identity}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-glow-sm hover:shadow-glow"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting
              ? "Saving..."
              : mode === "edit"
                ? "Update Character"
                : "Create Character"}
          </Button>
        </motion.div>
      </form>
    </main>
  );
}
