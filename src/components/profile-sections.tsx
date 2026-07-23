import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { GrainPhotoArtifact } from "~/components/grain-photos";
import { MasonryGrid } from "~/components/masonry-grid";
import { PlyrTrackArtifact } from "~/components/plyr-tracks";
import { ProfileArtifact } from "~/components/profile-artifact";
import { RockskyScrobble } from "~/components/rocksky-scrobble-list";
import { StandardDocumentArtifact } from "~/components/standard-documents";
import { TangledRepoArtifact } from "~/components/tangled-repo-list";
import { getDidSectionOrder } from "~/lib/layout/did-section-order";
import { getRecentGrainPhotos } from "~/lib/providers/grain-photo";
import { getRecentPlyrTracks } from "~/lib/providers/plyr";
import { getRecentRocksky } from "~/lib/providers/rocksky";
import { getMostStarredTangledRepos } from "~/lib/providers/tangled";
import { getRecentStandardDocuments } from "~/lib/providers/standard-site";

type ProfileSectionsProps = {
  children: ReactNode;
  did: string;
  handle: string | null;
  pds: string;
};

type ProfileData = {
  photos: Awaited<ReturnType<typeof getRecentGrainPhotos>>;
  plyrTracks: Awaited<ReturnType<typeof getRecentPlyrTracks>>;
  scrobbles: Awaited<ReturnType<typeof getRecentRocksky>>;
  documents: Awaited<ReturnType<typeof getRecentStandardDocuments>>;
  tangledRepos: Awaited<ReturnType<typeof getMostStarredTangledRepos>>;
};

export function ProfileSections({
  children,
  did,
  handle,
  pds,
}: ProfileSectionsProps) {
  const [data, setData] = useState<ProfileData | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadProfileData() {
      const [photos, plyrTracks, scrobbles, documents, tangledRepos] =
        await Promise.all([
          getRecentGrainPhotos(pds, did),
          getRecentPlyrTracks(pds, did),
          getRecentRocksky(pds, did),
          getRecentStandardDocuments(pds, did),
          getMostStarredTangledRepos(pds, did, handle),
        ]);

      if (isCurrent) {
        setData({ photos, plyrTracks, scrobbles, documents, tangledRepos });
      }
    }

    void loadProfileData();

    return () => {
      isCurrent = false;
    };
  }, [did, handle, pds]);

  if (!data) {
    return (
      <MasonryGrid>
        {children}
        <ProfileArtifact>
          <h2 className="profile-item-title">Gathering signals</h2>
          <p className="text-sm">Searching the Atmosphere…</p>
        </ProfileArtifact>
      </MasonryGrid>
    );
  }

  const artifacts = [
    ...data.plyrTracks.map((track) => (
      <PlyrTrackArtifact
        key={`plyr-${track.createdAt}-${track.audioUrl}`}
        track={track}
      />
    )),
    ...data.scrobbles.map((scrobble) => (
      <RockskyScrobble
        key={`rocksky-${scrobble.createdAt}-${scrobble.mbid}`}
        album={scrobble.album}
        albumArtUrl={scrobble.albumArtUrl}
        artist={scrobble.artist}
        createdAt={scrobble.createdAt}
        spotifyLink={scrobble.spotifyLink}
        title={scrobble.title}
      />
    )),
    ...data.tangledRepos.map((repo) => (
      <TangledRepoArtifact key={`tangled-${repo.repoDid}`} repo={repo} />
    )),
    ...data.documents.map((document) => (
      <StandardDocumentArtifact
        key={`standard-${document.path}-${document.publishedAt}`}
        document={document}
      />
    )),
    ...data.photos.map((photo) => (
      <GrainPhotoArtifact
        key={`grain-${photo.createdAt}-${photo.imageUrl}`}
        photo={photo}
      />
    )),
  ];

  return (
    <MasonryGrid>
      {children}
      {getDidSectionOrder(did, artifacts)}
    </MasonryGrid>
  );
}
