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
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Edit2,
  Loader2,
  LogIn,
  MessageCircle,
  PlusCircle,
  ShieldAlert,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllCharacters, useDeleteCharacter } from "../hooks/useQueries";

export function MyCharactersPage() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: allCharacters, isLoading } = useAllCharacters();
  const deleteMutation = useDeleteCharacter();

  const myCharacters =
    allCharacters?.filter(
      (c) => c.createdBy.toString() === identity?.getPrincipal().toString(),
    ) ?? [];

  const handleDelete = async (id: bigint, name: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`${name} deleted`);
    } catch {
      toast.error("Failed to delete character");
    }
  };

  if (!identity) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Users className="w-9 h-9 text-primary/60" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-foreground">
              My Characters
            </h1>
            <p className="text-muted-foreground">
              Sign in to create and manage your characters.
            </p>
          </div>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-glow-sm"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {isLoggingIn ? "Signing in..." : "Sign In"}
          </Button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            My Characters
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {myCharacters.length} character
            {myCharacters.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link to="/create">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-glow-sm hover:shadow-glow">
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Create Character</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </Link>
      </motion.div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : myCharacters.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 space-y-5"
        >
          <div className="w-20 h-20 rounded-2xl bg-muted/30 border border-border flex items-center justify-center mx-auto">
            <Users className="w-9 h-9 text-muted-foreground/50" />
          </div>
          <div className="space-y-2">
            <p className="text-foreground font-medium text-lg">
              No characters yet
            </p>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Create your first character and start exploring conversations with
              them.
            </p>
          </div>
          <Link to="/create">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 mt-2 shadow-glow-sm">
              <PlusCircle className="w-4 h-4" />
              Create Your First Character
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {myCharacters.map((character, i) => (
            <motion.div
              key={character.id.toString()}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex gap-4 items-center bg-card border border-border rounded-xl p-4 hover:border-border/80 transition-colors"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {character.avatarUrl ? (
                  <img
                    src={character.avatarUrl}
                    alt={character.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="font-display text-base font-bold text-primary/70">
                    {character.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-display font-semibold text-foreground truncate">
                    {character.name}
                  </h3>
                  {character.isMature && (
                    <span className="text-[10px] bg-mature/20 text-mature border border-mature/30 px-1.5 py-0 rounded uppercase tracking-wider font-bold flex-shrink-0">
                      18+
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {character.description}
                </p>
                {/* Content warning indicators */}
                {character.contentWarnings.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <ShieldAlert className="w-3 h-3 text-warning/70" />
                    <div className="flex flex-wrap gap-1">
                      {character.contentWarnings.slice(0, 3).map((w) => (
                        <Badge
                          key={w}
                          className="text-[10px] px-1.5 py-0 bg-warning/10 text-warning/80 border-warning/25"
                        >
                          {w}
                        </Badge>
                      ))}
                      {character.contentWarnings.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{character.contentWarnings.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    navigate({
                      to: "/chat/$characterId",
                      params: { characterId: character.id.toString() },
                    })
                  }
                  className="h-9 w-9 text-muted-foreground hover:text-primary"
                  title="Chat"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    navigate({
                      to: "/edit/$id",
                      params: { id: character.id.toString() },
                    })
                  }
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      title="Delete"
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete {character.name}?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This will permanently delete this character and all chat
                        history. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-border">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          handleDelete(character.id, character.name)
                        }
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
