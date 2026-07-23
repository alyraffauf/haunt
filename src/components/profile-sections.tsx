import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { GrainPhotos } from "~/components/grain-photos";
import { ProfileSection } from "~/components/profile-section";
import { RockskyScrobbleList } from "~/components/rocksky-scrobble-list";
import { StandardDocuments } from "~/components/standard-documents";
import { TangledRepoList } from "~/components/tangled-repo-list";
import { getDidSectionOrder } from "~/lib/layout/did-section-order";
import { getRecentGrainPhotos } from "~/lib/providers/grain-photo";
import { getRecentRocksky } from "~/lib/providers/rocksky";
import { getMostStarredTangledRepos } from "~/lib/providers/tangled";
import { getRecentStandardDocuments } from "~/lib/providers/standard-site";

type ProfileSectionsProps = {
  did: string;
  handle: string | null;
  pds: string;
};

type ProfileData = {
  photos: Awaited<ReturnType<typeof getRecentGrainPhotos>>;
  scrobbles: Awaited<ReturnType<typeof getRecentRocksky>>;
  documents: Awaited<ReturnType<typeof getRecentStandardDocuments>>;
  tangledRepos: Awaited<ReturnType<typeof getMostStarredTangledRepos>>;
};

export function ProfileSections({ did, handle, pds }: ProfileSectionsProps) {
  const [data, setData] = useState<ProfileData | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadProfileData() {
      const [photos, scrobbles, documents, tangledRepos] = await Promise.all([
        getRecentGrainPhotos(pds, did),
        getRecentRocksky(pds, did),
        getRecentStandardDocuments(pds, did),
        getMostStarredTangledRepos(pds, did, handle),
      ]);

      if (isCurrent) {
        setData({ photos, scrobbles, documents, tangledRepos });
      }
    }

    void loadProfileData();

    return () => {
      isCurrent = false;
    };
  }, [did, handle, pds]);

  if (!data) {
    return (
      <ProfileSection title="Gathering signals">
        <p className="text-sm">Searching the Atmosphere…</p>
      </ProfileSection>
    );
  }

  const sections: ReactNode[] = [];

  if (data.scrobbles.length > 0) {
    sections.push(
      <RockskyScrobbleList key="rocksky" scrobbles={data.scrobbles} />,
    );
  }

  if (data.tangledRepos.length > 0) {
    sections.push(<TangledRepoList key="tangled" repos={data.tangledRepos} />);
  }

  if (data.documents.length > 0) {
    sections.push(
      <StandardDocuments key="standard" documents={data.documents} />,
    );
  }

  if (data.photos.length > 0) {
    sections.push(<GrainPhotos key="grain" photos={data.photos} />);
  }

  return <>{getDidSectionOrder(did, sections)}</>;
}
