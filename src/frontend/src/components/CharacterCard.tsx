import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { MessageCircle, ShieldAlert, User } from "lucide-react";
import { motion } from "motion/react";
import type { Character } from "../backend.d";

interface CharacterCardProps {
  character: Character;
  index?: number;
}

export function CharacterCard({ character, index = 0 }: CharacterCardProps) {
  const initials = character.name.slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group"
    >
      <Link
        to="/chat/$characterId"
        params={{ characterId: character.id.toString() }}
      >
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card card-glow transition-all duration-300 cursor-pointer h-full flex flex-col">
          {/* Avatar / image area */}
          <div className="relative h-40 bg-gradient-to-br from-muted/80 to-muted/20 overflow-hidden flex-shrink-0">
            {character.avatarUrl ? (
              <img
                src={character.avatarUrl}
                alt={character.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <span className="font-display text-2xl font-bold text-primary/70">
                    {initials}
                  </span>
                </div>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

            {/* Badges overlay */}
            <div className="absolute top-3 right-3 flex flex-wrap gap-1 justify-end">
              {character.isMature && (
                <span className="bg-mature/90 text-mature-foreground text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  18+
                </span>
              )}
            </div>

            {/* Chat indicator */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-primary/90 rounded-full p-2 shadow-glow-sm">
                <MessageCircle className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex-1 flex flex-col gap-3">
            {/* Name */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display font-semibold text-lg text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                {character.name}
              </h3>
              {!character.avatarUrl && (
                <User className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
              {character.description}
            </p>

            {/* Traits */}
            {character.traits.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {character.traits.slice(0, 3).map((trait) => (
                  <Badge
                    key={trait}
                    variant="secondary"
                    className="text-[11px] px-2 py-0 bg-secondary/60 text-secondary-foreground border-border/50"
                  >
                    {trait}
                  </Badge>
                ))}
                {character.traits.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="text-[11px] px-2 py-0 bg-secondary/40 text-muted-foreground"
                  >
                    +{character.traits.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Content warnings */}
            {character.contentWarnings.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <ShieldAlert className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" />
                {character.contentWarnings.slice(0, 2).map((warning) => (
                  <Badge
                    key={warning}
                    className="text-[10px] px-1.5 py-0 bg-warning/15 text-warning border-warning/30 font-medium"
                  >
                    {warning}
                  </Badge>
                ))}
                {character.contentWarnings.length > 2 && (
                  <Badge className="text-[10px] px-1.5 py-0 bg-warning/10 text-warning/80 border-warning/20">
                    +{character.contentWarnings.length - 2} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
