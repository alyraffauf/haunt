import type { GrainPhoto } from "~/lib/providers/grain-photo";
import { ProfileArtifact } from "~/components/profile-artifact";
export function GrainPhotoArtifact({ photo }: { photo: GrainPhoto }) {
  return (
    <ProfileArtifact>
      {photo.postUrl ? (
        <a href={photo.postUrl} target="_blank" rel="noreferrer">
          <PhotoImage photo={photo} />
        </a>
      ) : (
        <PhotoImage photo={photo} />
      )}
    </ProfileArtifact>
  );
}

function PhotoImage({ photo }: { photo: GrainPhoto }) {
  return (
    <img
      src={photo.imageUrl}
      alt=""
      width={photo.aspectRatio.width}
      height={photo.aspectRatio.height}
      className="h-auto w-full object-cover"
    />
  );
}
