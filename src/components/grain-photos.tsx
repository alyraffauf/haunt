import type { GrainPhoto } from "~/lib/providers/grain-photo";
import { ProfileSection } from "~/components/profile-section";
type GrainPhotosProps = {
  photos: GrainPhoto[];
};

export function GrainPhotos({ photos }: GrainPhotosProps) {
  return (
    <ProfileSection
      title="Photos"
      source={{ name: "grain", href: "https://grain.social" }}
    >
      <div className="grid gap-3 md:grid-cols-3">
        {photos.map((photo) =>
          photo.postUrl ? (
            <a
              key={`${photo.createdAt}-${photo.imageUrl}`}
              href={photo.postUrl}
              target="_blank"
              rel="noreferrer"
            >
              <PhotoImage photo={photo} />
            </a>
          ) : (
            <PhotoImage
              key={`${photo.createdAt}-${photo.imageUrl}`}
              photo={photo}
            />
          ),
        )}
      </div>
    </ProfileSection>
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
