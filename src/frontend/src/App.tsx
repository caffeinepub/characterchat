import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AgeGate } from "./components/AgeGate";
import { Navbar } from "./components/Navbar";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useSaveUserProfile } from "./hooks/useQueries";
import { ChatPage } from "./pages/ChatPage";
import { CreateCharacterPage } from "./pages/CreateCharacterPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { MyCharactersPage } from "./pages/MyCharactersPage";

const AGE_GATE_KEY = "characterchat_age_acknowledged";

// ── Layout component ──────────────────────────────────────────

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <footer className="border-t border-border py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with{" "}
            <span className="text-primary">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── Routes ────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DiscoverPage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat/$characterId",
  component: ChatPage,
});

const createRoute_ = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create",
  component: () => <CreateCharacterPage mode="create" />,
});

const editRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/edit/$id",
  component: () => <CreateCharacterPage mode="edit" />,
});

const myCharactersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-characters",
  component: MyCharactersPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  chatRoute,
  createRoute_,
  editRoute,
  myCharactersRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ── App with age gate ─────────────────────────────────────────

export default function App() {
  const [ageAcknowledged, setAgeAcknowledged] = useState<boolean>(
    () => localStorage.getItem(AGE_GATE_KEY) === "true",
  );
  const { identity } = useInternetIdentity();
  const saveProfile = useSaveUserProfile();

  const handleAgeAccept = useCallback(async () => {
    localStorage.setItem(AGE_GATE_KEY, "true");
    setAgeAcknowledged(true);

    // Save to backend if authenticated
    if (identity) {
      try {
        await saveProfile.mutateAsync({
          displayName: "User",
          bio: "",
          hasAcknowledgedAge: true,
        });
      } catch {
        // Non-blocking
      }
    }
  }, [identity, saveProfile]);

  const handleAgeDecline = useCallback(() => {
    window.location.href = "https://www.google.com";
  }, []);

  // Sync age acknowledgment to backend when identity becomes available
  const saveProfileMutate = saveProfile.mutateAsync;
  useEffect(() => {
    if (identity && ageAcknowledged) {
      saveProfileMutate({
        displayName: "User",
        bio: "",
        hasAcknowledgedAge: true,
      }).catch(() => {});
    }
  }, [identity, ageAcknowledged, saveProfileMutate]);

  if (!ageAcknowledged) {
    return (
      <>
        <AgeGate onAccept={handleAgeAccept} onDecline={handleAgeDecline} />
        <Toaster
          theme="dark"
          toastOptions={{
            classNames: {
              toast: "bg-card border-border text-foreground",
              description: "text-muted-foreground",
            },
          }}
        />
      </>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        theme="dark"
        toastOptions={{
          classNames: {
            toast: "bg-card border-border text-foreground",
            description: "text-muted-foreground",
          },
        }}
      />
    </>
  );
}
