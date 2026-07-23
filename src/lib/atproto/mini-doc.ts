const SLINGSHOT_URL = "https://slingshot.microcosm.blue";

export type AtprotoMiniIdentity = {
  did: string;
  handle: string | null;
  pds: string;
};

type MiniDocResponse = {
  did: string;
  handle: string;
  pds: string;
};

export async function resolveMiniDoc(
  identifier: string,
  signal?: AbortSignal,
): Promise<AtprotoMiniIdentity> {
  const params = new URLSearchParams({ identifier });
  const response = await fetch(
    `${SLINGSHOT_URL}/xrpc/blue.microcosm.identity.resolveMiniDoc?${params}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error(`Could not resolve identifier: ${identifier}`);
  }

  const data = (await response.json()) as MiniDocResponse;

  return {
    did: data.did,
    handle: data.handle === "handle.invalid" ? null : data.handle,
    pds: data.pds,
  };
}
