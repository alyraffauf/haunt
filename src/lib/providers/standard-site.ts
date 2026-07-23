import { resolveDidDocument } from "~/lib/atproto/did";

export type StandardDocument = {
  title: string;
  description?: string;
  path?: string;
  publishedAt?: string;
  tags?: string[];
  link?: string;
};

type StandardDocumentRecord = Omit<StandardDocument, "link"> & {
  site?: string;
  textContent?: string;
};

type StandardPublicationRecord = {
  url?: string;
};

type ListRecordsResponse = {
  records: Array<{
    uri: string;
    value: StandardDocumentRecord;
  }>;
};

const DOCUMENT_COLLECTION = "site.standard.document";
const PUBLICATION_COLLECTION = "site.standard.publication";
const MAX_DOCUMENT_COUNT = 3;

export async function getRecentStandardDocuments(
  pds: string,
  did: string,
  handle: string | null,
): Promise<StandardDocument[]> {
  const documents = await listStandardDocuments(pds, did);

  const recentDocuments = documents
    .sort(compareByPublishedAt)
    .slice(0, MAX_DOCUMENT_COUNT);

  return Promise.all(
    recentDocuments.map(async (document) => {
      const publicationUrl = await getPublicationUrl(document.site);

      return {
        ...document,
        link:
          getDocumentLink(document.path, publicationUrl) ??
          getDocumentLink(document.path, handle),
      };
    }),
  );
}

async function listStandardDocuments(
  pds: string,
  did: string,
): Promise<StandardDocumentRecord[]> {
  try {
    const params = new URLSearchParams({
      repo: did,
      collection: DOCUMENT_COLLECTION,
      limit: "100",
    });
    const response = await fetch(
      `${pds.replace(/\/$/, "")}/xrpc/com.atproto.repo.listRecords?${params}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as ListRecordsResponse;

    return data.records.map(({ value }) => value);
  } catch {
    return [];
  }
}

function compareByPublishedAt(
  firstDocument: StandardDocumentRecord,
  secondDocument: StandardDocumentRecord,
): number {
  return (
    getTimestamp(secondDocument.publishedAt) -
    getTimestamp(firstDocument.publishedAt)
  );
}

function getTimestamp(dateString: string | undefined): number {
  if (!dateString) {
    return 0;
  }

  const timestamp = Date.parse(dateString);

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getDocumentLink(
  path: string | undefined,
  baseUrl: string | null | undefined,
): string | undefined {
  if (!path?.startsWith("/") || !baseUrl) {
    return undefined;
  }

  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

async function getPublicationUrl(
  publicationUri: string | undefined,
): Promise<string | undefined> {
  if (!publicationUri) {
    return undefined;
  }

  if (publicationUri.startsWith("https://")) {
    return publicationUri.replace(/\/$/, "");
  }

  const publicationReference = parsePublicationUri(publicationUri);
  if (!publicationReference) {
    return undefined;
  }

  try {
    const document = await resolveDidDocument(publicationReference.did);
    const pds = document.service.find(
      (service) =>
        service.type === "AtprotoPersonalDataServer" &&
        service.id.endsWith("#atproto_pds"),
    )?.serviceEndpoint;

    if (!pds) {
      return undefined;
    }

    const params = new URLSearchParams({
      repo: publicationReference.did,
      collection: PUBLICATION_COLLECTION,
      rkey: publicationReference.rkey,
    });
    const response = await fetch(
      `${pds.replace(/\/$/, "")}/xrpc/com.atproto.repo.getRecord?${params}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return undefined;
    }

    const data = (await response.json()) as {
      value?: StandardPublicationRecord;
    };
    return data.value?.url?.replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

function parsePublicationUri(
  publicationUri: string,
): { did: string; rkey: string } | undefined {
  const match = /^at:\/\/([^/]+)\/site\.standard\.publication\/([^/]+)$/.exec(
    publicationUri,
  );

  if (!match) {
    return undefined;
  }

  const [, did, rkey] = match;
  if (!did || !rkey) {
    return undefined;
  }

  return { did, rkey };
}
