import { useState } from "react";

import { HauntSigil } from "~/components/haunt-sigil";
import type { BlueskyProfile } from "~/lib/providers/bluesky";

type BlueskyProfileProps = {
  did: string;
  handle: string | null;
  profile: BlueskyProfile;
};

export function BlueskyProfile({ did, handle, profile }: BlueskyProfileProps) {
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const profileIdentifier = handle ?? did;

  return (
    <section className="bluesky-profile profile-card border">
      <div className="profile-identity-header">
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt=""
            width={64}
            height={64}
            className="size-16 object-cover"
            onError={() => {
              if (profile.avatarFallbackUrl) {
                setAvatarUrl(profile.avatarFallbackUrl);
              }
            }}
          />
        )}

        <div className="min-w-0">
          <h1 className="profile-name">
            {profile.displayName ?? handle ?? "Unnamed account"}
          </h1>

          {handle && <p className="profile-secondary mt-1">@{handle}</p>}

          {profile.pronouns && (
            <p className="profile-metadata mt-1 tracking-wide">
              {profile.pronouns}
            </p>
          )}
        </div>

        <HauntSigil
          className="profile-sigil"
          color="var(--profile-accent)"
          seed={did}
        />
      </div>

      {profile.description && (
        <p className="profile-copy mt-5 whitespace-pre-wrap">
          {profile.description}
        </p>
      )}

      <footer className="profile-divider mt-4 flex justify-end border-t pt-3">
        <a
          className="profile-source-link"
          href={`https://bsky.app/profile/${profileIdentifier}`}
          target="_blank"
          rel="noreferrer"
        >
          bsky
        </a>
      </footer>
    </section>
  );
}
