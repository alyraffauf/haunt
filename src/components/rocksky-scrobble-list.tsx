import type { RockskyScrobbleRecord } from "~/lib/providers/rocksky";
import { ProfileSection } from "~/components/profile-section";

type RockskyScrobbleListProps = {
  scrobbles: RockskyScrobbleRecord[];
};

type RockskyScrobbleProps = Pick<
  RockskyScrobbleRecord,
  "album" | "albumArtUrl" | "artist" | "createdAt" | "spotifyLink" | "title"
>;

export function RockskyScrobbleList({ scrobbles }: RockskyScrobbleListProps) {
  return (
    <ProfileSection
      title="Music"
      source={{ name: "rocksky", href: "https://rocksky.app" }}
    >
      <div className="max-w-3xl">
        {scrobbles.map((scrobble) => (
          <RockskyScrobble
            key={`${scrobble.createdAt}-${scrobble.mbid}`}
            album={scrobble.album}
            albumArtUrl={scrobble.albumArtUrl}
            artist={scrobble.artist}
            createdAt={scrobble.createdAt}
            spotifyLink={scrobble.spotifyLink}
            title={scrobble.title}
          />
        ))}
      </div>
    </ProfileSection>
  );
}

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

function RockskyScrobble({
  title,
  artist,
  album,
  createdAt,
  spotifyLink,
  albumArtUrl,
}: RockskyScrobbleProps) {
  return (
    <a
      href={spotifyLink}
      target="_blank"
      rel="noreferrer"
      className="profile-external-link profile-divider grid grid-cols-[3rem_1fr_auto] items-center gap-3 border-b py-2.5 last:border-b-0"
    >
      {albumArtUrl ? (
        <img
          src={albumArtUrl}
          alt={`${album} album art`}
          width={40}
          height={40}
          className="size-10 object-cover"
        />
      ) : (
        <div className="size-10 border" />
      )}

      <div className="min-w-0">
        <h3 className="profile-item-title">{title}</h3>
        <p className="profile-secondary mt-0.5">
          {artist} · {album}
        </p>
      </div>

      <span className="profile-metadata whitespace-nowrap">
        {formatRelativeTime(createdAt)}
      </span>
    </a>
  );
}
