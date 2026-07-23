const BLUESKY_APPVIEW_URL = "https://public.api.bsky.app";

export type BlueskyActorSearchResult = {
  avatar?: string;
  did: string;
  displayName?: string;
  handle: string;
};

type SearchActorsResponse = {
  actors: BlueskyActorSearchResult[];
};

export async function searchBlueskyActors(
  query: string,
  signal: AbortSignal,
): Promise<BlueskyActorSearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    limit: "8",
  });
  const response = await fetch(
    `${BLUESKY_APPVIEW_URL}/xrpc/app.bsky.actor.searchActors?${params}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("Could not search.");
  }

  const data = (await response.json()) as SearchActorsResponse;
  return data.actors;
}
