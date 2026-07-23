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

      <div className="mt-4">
        {profile.description && (
          <p className="profile-copy max-w-[42rem] whitespace-pre-wrap">
            {profile.description}
          </p>
        )}

        {/* {profile.website && (
          <p className="mt-5">
            <a
              className="profile-link font-semibold"
              href={profile.website}
              target="_blank"
              rel="noreferrer"
            >
              {formatWebsiteLabel(profile.website)}
            </a>
          </p>
        )} */}
      </div>
    </section>
  );
}

function formatWebsiteLabel(website: string): string {
  try {
    const url = new URL(website);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return website;
  }
}
