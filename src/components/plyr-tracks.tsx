import { ProfileArtifact } from "~/components/profile-artifact";
import type { PlyrTrack } from "~/lib/providers/plyr";

export function PlyrTrackArtifact({ track }: { track: PlyrTrack }) {
  const duration = formatDuration(track.duration);

  return (
    <ProfileArtifact>
      <div className="grid grid-cols-[4rem_1fr] items-center gap-3">
        {track.imageUrl ? (
          <img
            src={track.imageUrl}
            alt=""
            width={64}
            height={64}
            className="size-16 object-cover"
          />
        ) : (
          <div className="size-16 border" />
        )}

        <div className="min-w-0">
          <h2 className="profile-item-title">
            <a
              className="profile-link"
              href={track.audioUrl}
              target="_blank"
              rel="noreferrer"
            >
              {track.title}
            </a>
          </h2>
          <p className="profile-secondary mt-0.5">{track.artist}</p>
        </div>
      </div>

      {track.description && (
        <p className="profile-secondary mt-3">{track.description}</p>
      )}

      {duration && <p className="profile-metadata mt-3">{duration}</p>}
    </ProfileArtifact>
  );
}

function formatDuration(duration: number): string | null {
  const parsedDuration = Number(duration);

  if (!Number.isFinite(parsedDuration)) {
    return null;
  }

  const totalSeconds = Math.max(0, Math.round(parsedDuration));
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
