export type BlueskyProfile = {
  displayName?: string;
  description?: string;
  pronouns?: string;
  website?: string;
  avatarUrl?: string;
  avatarFallbackUrl?: string;
  createdAt?: string;
};

type BlueskyProfileRecord = {
  displayName?: string;
  description?: string;
  pronouns?: string;
  website?: string;
  avatar?: BlueskyBlob;
  createdAt?: string;
};

type BlueskyBlob = {
  ref?: {
    $link?: string;
  };
  mimeType?: string;
};

type GetRecordResponse = {
  value: BlueskyProfileRecord;
};

export async function getBlueskyProfile(
  pds: string,
  did: string,
): Promise<BlueskyProfile | null> {
  try {
    const params = new URLSearchParams({
      repo: did,
      collection: "app.bsky.actor.profile",
      rkey: "self",
    });
    const response = await fetch(
      `${pds.replace(/\/$/, "")}/xrpc/com.atproto.repo.getRecord?${params}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as GetRecordResponse;
    const profile = data.value;
    const avatarCid = profile.avatar?.ref?.$link;

    return {
      displayName: profile.displayName,
      description: profile.description,
      pronouns: profile.pronouns,
      website: profile.website,
      createdAt: profile.createdAt,
      avatarUrl: avatarCid
        ? `https://cdn.bsky.app/img/avatar/plain/${did}/${avatarCid}@webp`
        : undefined,
      avatarFallbackUrl: avatarCid
        ? `${pds.replace(/\/$/, "")}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(avatarCid)}`
        : undefined,
    };
  } catch {
    return null;
  }
}
