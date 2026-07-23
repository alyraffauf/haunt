import type { RockskyScrobbleRecord } from "~/lib/providers/rocksky";
import { ProfileArtifact } from "~/components/profile-artifact";

type RockskyScrobbleProps = Pick<
  RockskyScrobbleRecord,
  "album" | "albumArtUrl" | "artist" | "createdAt" | "spotifyLink" | "title"
>;

function formatRelativeTime(createdAt: string): string {
  const elapsedMinutes = Math.round(
    (Date.now() - new Date(createdAt).getTime()) / 60000,
  );

  if (elapsedMinutes < 1) return "just now";
  if (elapsedMinutes < 60) return `${elapsedMinutes} min ago`;

  const elapsedHours = Math.round(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} hr ago`;

  return `${Math.round(elapsedHours / 24)} days ago`;
}

export function RockskyScrobble({
  title,
  artist,
  album,
  createdAt,
  spotifyLink,
  albumArtUrl,
}: RockskyScrobbleProps) {
  return (
    <ProfileArtifact source={{ name: "rocksky", href: "https://rocksky.app" }}>
      <a
        className="profile-external-link grid grid-cols-[3rem_1fr] items-center gap-3"
        href={spotifyLink}
        target="_blank"
        rel="noreferrer"
      >
        {albumArtUrl ? (
          <img
            src={albumArtUrl}
            alt={`${album} album art`}
            width={48}
            height={48}
            className="size-12 object-cover"
          />
        ) : (
          <div className="size-12 border" />
        )}

        <div className="min-w-0">
          <h2 className="profile-item-title">{title}</h2>
          <p className="profile-secondary mt-0.5">
            {artist} · {album}
          </p>
        </div>
      </a>
      <p className="profile-metadata mt-3">{formatRelativeTime(createdAt)}</p>
    </ProfileArtifact>
  );
}
