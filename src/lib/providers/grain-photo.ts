export type GrainPhoto = {
  createdAt: string;
  aspectRatio: {
    width: number;
    height: number;
  };
  imageUrl: string;
  postUrl?: string;
};

type GrainPhotoRecord = {
  createdAt: string;
  aspectRatio: {
    width: number;
    height: number;
  };
  photo?: {
    ref?: {
      $link?: string;
    };
    mimeType?: string;
  };
};

type GrainGalleryItemRecord = {
  gallery?: string;
  item?: string;
  createdAt?: string;
};

type ListRecordsResponse<T> = {
  records: Array<{
    uri: string;
    value: T;
  }>;
};

const PHOTO_COLLECTION = "social.grain.photo";
const GALLERY_ITEM_COLLECTION = "social.grain.gallery.item";
const MAX_PHOTO_COUNT = 3;

export async function getRecentGrainPhotos(
  pds: string,
  did: string,
): Promise<GrainPhoto[]> {
  const [photoRecords, galleryItems] = await Promise.all([
    listRecords<GrainPhotoRecord>(pds, did, PHOTO_COLLECTION),
    listRecords<GrainGalleryItemRecord>(pds, did, GALLERY_ITEM_COLLECTION),
  ]);
  const galleryByPhotoUri = createGalleryLookup(galleryItems);

  return photoRecords
    .map(({ uri, value }) =>
      createGrainPhoto(uri, value, pds, did, galleryByPhotoUri),
    )
    .filter((photo): photo is GrainPhoto => photo !== null)
    .sort(
      (firstPhoto, secondPhoto) =>
        Date.parse(secondPhoto.createdAt) - Date.parse(firstPhoto.createdAt),
    )
    .slice(0, MAX_PHOTO_COUNT);
}

async function listRecords<T>(
  pds: string,
  did: string,
  collection: string,
): Promise<Array<{ uri: string; value: T }>> {
  try {
    const params = new URLSearchParams({
      repo: did,
      collection,
      limit: "100",
    });
    const response = await fetch(
      `${pds.replace(/\/$/, "")}/xrpc/com.atproto.repo.listRecords?${params}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as ListRecordsResponse<T>;

    return data.records;
  } catch {
    return [];
  }
}

function createGalleryLookup(
  galleryItems: Array<{ uri: string; value: GrainGalleryItemRecord }>,
): Map<string, string> {
  return new Map(
    galleryItems.flatMap(({ value }) => {
      if (!value.item || !value.gallery) {
        return [];
      }

      return [[value.item, value.gallery]] as [string, string][];
    }),
  );
}

function createGrainPhoto(
  uri: string,
  value: GrainPhotoRecord,
  pds: string,
  did: string,
  galleryByPhotoUri: Map<string, string>,
): GrainPhoto | null {
  const cid = value.photo?.ref?.$link;

  if (!cid) {
    return null;
  }

  const galleryUri = galleryByPhotoUri.get(uri);
  const galleryRkey = galleryUri?.split("/").pop();

  return {
    createdAt: value.createdAt,
    aspectRatio: value.aspectRatio,
    imageUrl: `https://cdn.bsky.app/img/feed_fullsize/plain/${did}/${cid}${getImageSuffix(value.photo?.mimeType)}`,
    postUrl: galleryRkey
      ? `https://grain.social/profile/${did}/gallery/${galleryRkey}`
      : undefined,
  };
}

function getImageSuffix(mimeType: string | undefined): string {
  if (!mimeType) {
    return "";
  }

  const format = mimeType.split("/")[1];

  return format ? `@${format}` : "";
}
