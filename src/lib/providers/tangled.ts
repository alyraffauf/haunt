const CONSTELLATION_URL = "https://constellation.microcosm.blue";

export type TangledRepoRecord = {
  repoDid: string;
  name?: string;
  description?: string;
  website?: string;
  source?: string;
  topics?: string[];
};

type TangledRepoRecordWithRkey = TangledRepoRecord & {
  rkey: string;
};

export type TangledRepo = TangledRepoRecordWithRkey & {
  name: string;
  stars: number;
  link: string;
};

const STAR_SOURCE = "sh.tangled.feed.star:subject.did";
const TANGLED_REPO_COLLECTION = "sh.tangled.repo";

type ListRecordsResponse = {
  records: Array<{
    uri: string;
    cid: string;
    value: TangledRepoRecord;
  }>;
};

export async function getMostStarredTangledRepos(
  pds: string,
  did: string,
  handle: string | null,
  limit = 4,
): Promise<TangledRepo[]> {
  const records = await listTangledRepos(pds, did);

  const uniqueRecords = [
    ...new Map(records.map((record) => [record.repoDid, record])).values(),
  ];

  const repos = await Promise.all(
    uniqueRecords.map(async (record) => {
      const stars = await getTangledStars(record.repoDid);
      const owner = handle ?? did;
      const name = record.name ?? record.rkey;

      return {
        ...record,
        name,
        stars,
        link:
          record.website ??
          record.source ??
          `https://tangled.org/${owner}/${name}`,
      };
    }),
  );

  return repos
    .sort((firstRepo, secondRepo) => secondRepo.stars - firstRepo.stars)
    .slice(0, limit);
}

async function listTangledRepos(
  pds: string,
  did: string,
): Promise<TangledRepoRecordWithRkey[]> {
  try {
    const params = new URLSearchParams({
      repo: did,
      collection: TANGLED_REPO_COLLECTION,
      limit: "20",
    });
    const response = await fetch(
      `${pds.replace(/\/$/, "")}/xrpc/com.atproto.repo.listRecords?${params}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as ListRecordsResponse;

    return data.records.map(({ uri, value }) => ({
      ...value,
      rkey: uri.split("/").pop() ?? "unknown-repository",
    }));
  } catch {
    return [];
  }
}

async function getTangledStars(repoDid: string): Promise<number> {
  try {
    const params = new URLSearchParams({
      subject: repoDid,
      source: STAR_SOURCE,
      limit: "1",
    });
    const response = await fetch(
      `${CONSTELLATION_URL}/xrpc/blue.microcosm.links.getBacklinks?${params}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return 0;
    }

    const data = (await response.json()) as { total?: number };

    return data.total ?? 0;
  } catch {
    return 0;
  }
}
