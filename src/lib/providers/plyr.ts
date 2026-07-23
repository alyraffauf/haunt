export type PlyrTrack = {
  audioUrl: string;
  artist: string;
  createdAt: string;
  description?: string;
  duration: number;
  imageUrl?: string;
  title: string;
};

type PlyrTrackRecord = PlyrTrack & {
  $type: "fm.plyr.track";
  fileType: string;
};

type ListRecordsResponse = {
  records: Array<{
    value: PlyrTrackRecord;
  }>;
};

const PLYR_TRACK_COLLECTION = "fm.plyr.track";
const MAX_TRACK_COUNT = 4;

export async function getRecentPlyrTracks(
  pds: string,
  did: string,
): Promise<PlyrTrack[]> {
  try {
    const params = new URLSearchParams({
      repo: did,
      collection: PLYR_TRACK_COLLECTION,
      limit: String(MAX_TRACK_COUNT),
      reverse: "true",
    });
    const response = await fetch(
      `${pds.replace(/\/$/, "")}/xrpc/com.atproto.repo.listRecords?${params}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as ListRecordsResponse;

    return data.records
      .map(({ value }) => value)
      .filter((track) => track.audioUrl && track.title && track.artist)
      .sort(
        (firstTrack, secondTrack) =>
          Date.parse(secondTrack.createdAt) - Date.parse(firstTrack.createdAt),
      );
  } catch {
    return [];
  }
}
