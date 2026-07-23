import { useState } from "react";

import type { BlueskyProfile } from "~/lib/providers/bluesky";

type BlueskyProfileProps = {
  handle: string | null;
  profile: BlueskyProfile;
};

export function BlueskyProfile({ handle, profile }: BlueskyProfileProps) {
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);

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
      </div>

      {profile.description && (
        <p className="profile-copy mt-5 whitespace-pre-wrap">
          {profile.description}
        </p>
      )}
    </section>
  );
}
