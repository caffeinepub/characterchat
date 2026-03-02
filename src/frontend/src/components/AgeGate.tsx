import { Button } from "@/components/ui/button";
import { LogOut, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

interface AgeGateProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function AgeGate({ onAccept, onDecline }: AgeGateProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 max-w-lg w-full mx-4"
      >
        <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          {/* Red warning strip */}
          <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

          <div className="p-8 space-y-6">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-primary" />
              </div>
            </motion.div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h1 className="font-display text-3xl font-bold text-gradient-crimson">
                18+ Content Platform
              </h1>
              <p className="text-muted-foreground text-sm">
                Age Verification Required
              </p>
            </div>

            {/* Warning text */}
            <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-3">
              <p className="text-foreground/90 text-sm leading-relaxed">
                This platform contains{" "}
                <strong className="text-foreground">18+ mature content</strong>{" "}
                including:
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {[
                  "Sexual content and explicit adult material",
                  "Eating disorders and body image topics",
                  "Mental health and self-harm themes",
                  "Substance use and addiction narratives",
                  "Trauma, abuse, and violence depictions",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-center text-sm text-muted-foreground leading-relaxed">
              By entering, you confirm you are{" "}
              <strong className="text-foreground">
                18 years of age or older
              </strong>{" "}
              and consent to viewing{" "}
              <strong className="text-foreground">
                sexual content and other mature themes
              </strong>
              . All characters and stories are fictional.
            </p>

            {/* Buttons */}
            <div className="space-y-3">
              <Button
                onClick={onAccept}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl text-base transition-all duration-200 shadow-glow-sm hover:shadow-glow"
              >
                I am 18 or older — Enter
              </Button>
              <Button
                variant="ghost"
                onClick={onDecline}
                className="w-full text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Exit
              </Button>
            </div>
          </div>
        </div>

        {/* Legal note */}
        <p className="text-center text-xs text-muted-foreground mt-4 px-4">
          CharacterChat is a fictional roleplay platform. All characters,
          scenarios, and conversations are works of fiction.
        </p>
      </motion.div>
    </div>
  );
}
