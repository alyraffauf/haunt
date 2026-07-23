import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

import { BlueskyProfile } from "~/components/bluesky-profile";
import { IdentityCard } from "~/components/identity-card";
import { MasonryGrid } from "~/components/masonry-grid";
import { ProfileSection } from "~/components/profile-section";
import { ProfileSections } from "~/components/profile-sections";
import { resolveMiniDoc } from "~/lib/atproto/mini-doc";
import { getBlueskyProfile } from "~/lib/providers/bluesky";
import { getDidAtmosphere } from "~/lib/theme/did-atmosphere";
import { getDidCardRadius } from "~/lib/theme/did-card-radius";
import { getDidTheme } from "~/lib/theme/did-colors";
import type { BlueskyProfile as BlueskyProfileData } from "~/lib/providers/bluesky";
import type { AtprotoMiniIdentity } from "~/lib/atproto/mini-doc";

export function ActorApp() {
  const pathname = useBrowserPathname();
  const identifier = getPathIdentifier(pathname);
  const [identity, setIdentity] = useState<AtprotoMiniIdentity | null>(null);
  const [profile, setProfile] = useState<BlueskyProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!identifier) {
      setIdentity(null);
      setProfile(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const actorIdentifier = identifier;

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    async function loadActor() {
      try {
        const resolvedIdentity = await resolveMiniDoc(
          actorIdentifier,
          controller.signal,
        );
        const resolvedProfile = await getBlueskyProfile(
          resolvedIdentity.pds,
          resolvedIdentity.did,
        );

        if (!controller.signal.aborted) {
          setIdentity(resolvedIdentity);
          setProfile(resolvedProfile);
          setIsLoading(false);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not resolve this profile.",
          );
          setIsLoading(false);
        }
      }
    }

    void loadActor();

    return () => controller.abort();
  }, [identifier]);

  if (pathname === null) {
    return <LoadingPage />;
  }

  if (!identifier) {
    return <Home />;
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error || !identity) {
    return <ErrorPage message={error ?? "Could not resolve this profile."} />;
  }

  const theme = getDidTheme(identity.did).css;
  const atmosphere = getDidAtmosphere(identity.did);
  const cardRadius = getDidCardRadius(identity.did);

  return (
    <main
      className="profile-page min-h-screen p-4 sm:p-8"
      style={
        {
          "--profile-background": theme.background,
          "--profile-card": theme.card,
          "--profile-border": theme.border,
          "--profile-accent": theme.accent,
          "--profile-card-radius": cardRadius,
          "--profile-atmosphere": atmosphere.backgroundImage,
        } as CSSProperties
      }
    >
      <MasonryGrid>
        {profile ? (
          <BlueskyProfile
            did={identity.did}
            handle={identity.handle}
            profile={profile}
          />
        ) : (
          <IdentityCard identity={identity} />
        )}

        <ProfileSections
          did={identity.did}
          handle={identity.handle}
          pds={identity.pds}
        />
      </MasonryGrid>
    </main>
  );
}

function useBrowserPathname(): string | null {
  const [pathname, setPathname] = useState<string | null>(null);

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  return pathname;
}

function getPathIdentifier(pathname: string | null): string | null {
  if (!pathname || pathname === "/") {
    return null;
  }

  const path = pathname.replace(/^\/+|\/+$/g, "");
  return path ? decodeURIComponent(path) : null;
}

function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <h1 className="text-3xl font-bold">haunt</h1>
        <p>Try visiting an atproto profile.</p>
        <a className="w-fit border px-3 py-2" href="/atproto.com">
          View an example profile →
        </a>
      </div>
    </main>
  );
}

function LoadingPage() {
  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <ProfileSection title="Resolving identity">
          <p className="text-sm">Scanning the Atmosphere…</p>
        </ProfileSection>
      </div>
    </main>
  );
}

function ErrorPage({ message }: { message: string }) {
  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <ProfileSection title="Could not resolve profile">
          <p className="text-sm">{message}</p>
        </ProfileSection>
      </div>
    </main>
  );
}
