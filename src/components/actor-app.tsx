import type { CSSProperties, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { BlueskyProfile } from "~/components/bluesky-profile";
import { IdentityCard } from "~/components/identity-card";
import { MasonryGrid } from "~/components/masonry-grid";
import { ProfileSection } from "~/components/profile-section";
import { ProfileSections } from "~/components/profile-sections";
import { resolveMiniDoc } from "~/lib/atproto/mini-doc";
import { hashString } from "~/lib/did-random";
import { getBlueskyProfile } from "~/lib/providers/bluesky";
import { searchBlueskyActors } from "~/lib/providers/bluesky-search";
import { getDidAtmosphere } from "~/lib/theme/did-atmosphere";
import { getDidCardRadius } from "~/lib/theme/did-card-radius";
import { getDidTheme } from "~/lib/theme/did-colors";
import type { BlueskyProfile as BlueskyProfileData } from "~/lib/providers/bluesky";
import type { BlueskyActorSearchResult } from "~/lib/providers/bluesky-search";
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
  const [query, setQuery] = useState("");
  const { actors, isSearching } = useActorSearch(query);
  const { isOpen, openPanel, searchAreaRef } = useSearchPanel();
  const readingLabel = getSigilReadingLabel(query, actors);

  function visitPresence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const identifier = query.trim().replace(/^@/, "");
    if (identifier) {
      window.location.assign(`/${encodeURIComponent(identifier)}`);
    }
  }

  return (
    <main className="home-page min-h-screen p-4 sm:p-8">
      <div className="home-content mx-auto max-w-2xl">
        <p className="home-index-label">haunt.at // an atmosphere compendium</p>

        <section className="home-invocation" aria-labelledby="home-title">
          <div className="home-invocation-sigil">
            <HauntSigil seed={query.trim() || "haunt.at"} />
            <p>{readingLabel}</p>
          </div>

          <h1 id="home-title" className="sr-only">
            Haunt compendium
          </h1>

          <div
            ref={searchAreaRef}
            className="home-search-area"
            aria-busy={isSearching}
          >
            <form onSubmit={visitPresence}>
              <div className="home-search">
                <input
                  id="presence-query"
                  className="home-search-input"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    openPanel();
                  }}
                  onFocus={openPanel}
                  placeholder="summon a presence"
                  autoComplete="off"
                />
              </div>
            </form>

            <SearchResults actors={actors} isOpen={isOpen} />
          </div>
        </section>

        <details className="home-how-it-works">
          <summary>how it works</summary>
          <div className="home-how-it-works-copy">
            <p>
              Enter an AT Protocol handle. Haunt resolves it to a true name
              (DID), then assembles its public traces from across the
              Atmosphere.
            </p>
            <p>
              A true name is stable. It determines a haunt&apos;s form: its
              color, atmosphere, and geometry.
            </p>
          </div>
        </details>
      </div>
    </main>
  );
}

function useSearchPanel() {
  const searchAreaRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function closePanel(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !searchAreaRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", closePanel);
    return () => document.removeEventListener("pointerdown", closePanel);
  }, []);

  return { isOpen, openPanel: () => setIsOpen(true), searchAreaRef };
}

function getSigilReadingLabel(
  query: string,
  actors: BlueskyActorSearchResult[],
): string {
  const identifier = query.trim().replace(/^@/, "");
  const normalizedIdentifier = identifier.toLowerCase();
  const matchingActor = actors.find(
    (actor) =>
      actor.handle.toLowerCase() === normalizedIdentifier ||
      actor.did.toLowerCase() === normalizedIdentifier,
  );

  return matchingActor ? `reading: ${matchingActor.handle}` : "unresolved";
}

type HauntSigilProps = {
  seed: string;
};

function HauntSigil({ seed }: HauntSigilProps) {
  const pattern = getHauntSigilPattern(seed);

  return (
    <svg
      className="home-sigil"
      viewBox="0 0 120 120"
      aria-hidden="true"
      style={{ "--home-sigil-color": pattern.color } as CSSProperties}
    >
      <circle cx="60" cy="60" r="51" strokeDasharray={pattern.dashArray} />
      <circle cx="60" cy="60" r="39" />
      <g transform={`rotate(${pattern.rotation} 60 60)`}>
        <path d="M60 19 91 37v36L60 101 29 73V37Z" />
        <path d="M60 31v58M35 45l50 30M85 45 35 75" />
        <circle className="home-sigil-node" cx="60" cy="60" r="8" />
        <circle className="home-sigil-node" cx="60" cy="19" r="3" />
        <circle className="home-sigil-node" cx="91" cy="73" r="3" />
        <circle className="home-sigil-node" cx="29" cy="73" r="3" />
      </g>
    </svg>
  );
}

function getHauntSigilPattern(seed: string) {
  const hash = hashString(seed);
  const hue = 190 + (hash % 35);

  return {
    color: `hsl(${hue} 38% 76%)`,
    dashArray: `${4 + (hash % 8)} ${3 + ((hash >>> 3) % 8)}`,
    rotation: (hash >>> 6) % 60,
  };
}

type SearchResultsProps = {
  actors: BlueskyActorSearchResult[];
  isOpen: boolean;
};

type LoadActorsOptions = {
  query: string;
  setActors: (actors: BlueskyActorSearchResult[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  signal: AbortSignal;
};

function SearchResults({ actors, isOpen }: SearchResultsProps) {
  if (!isOpen) return null;

  if (actors.length > 0) {
    return (
      <ul className="home-search-results" aria-label="Matching presences">
        {actors.map((actor) => (
          <li key={actor.did}>
            <a
              className="home-search-result"
              href={`/${encodeURIComponent(actor.handle)}`}
            >
              {actor.avatar ? (
                <img
                  className="home-search-avatar"
                  src={actor.avatar}
                  alt=""
                  width={32}
                  height={32}
                />
              ) : (
                <span className="home-search-avatar" aria-hidden="true" />
              )}
              <span className="home-search-copy">
                <span className="home-search-name block truncate">
                  {actor.displayName ?? actor.handle}
                </span>
                <span className="home-search-handle block truncate">
                  @{actor.handle}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return null;
}

function useActorSearch(query: string) {
  const [actors, setActors] = useState<BlueskyActorSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      setActors([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void loadActors({
        query: normalizedQuery,
        signal: controller.signal,
        setActors,
        setIsSearching,
      });
    }, 300);

    setIsSearching(true);
    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  return { actors, isSearching };
}

async function loadActors({
  query,
  signal,
  setActors,
  setIsSearching,
}: LoadActorsOptions) {
  try {
    const actors = await searchBlueskyActors(query, signal);
    if (!signal.aborted) {
      setActors(actors);
      setIsSearching(false);
    }
  } catch {
    if (!signal.aborted) {
      setActors([]);
      setIsSearching(false);
    }
  }
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
