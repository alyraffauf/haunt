import type { StandardDocument } from "~/lib/providers/standard-site";
import { ProfileArtifact } from "~/components/profile-artifact";
export function StandardDocumentArtifact({
  document,
}: {
  document: StandardDocument;
}) {
  return (
    <ProfileArtifact>
      <h2 className="profile-item-title">
        {document.link ? (
          <a
            className="profile-link"
            href={document.link}
            target="_blank"
            rel="noreferrer"
          >
            {document.title}
          </a>
        ) : (
          document.title
        )}
      </h2>

      {document.description && (
        <p className="profile-secondary mt-2">{document.description}</p>
      )}

      {document.publishedAt && (
        <time
          className="profile-metadata mt-3 block"
          dateTime={document.publishedAt}
        >
          {formatPublishedAt(document.publishedAt)}
        </time>
      )}
    </ProfileArtifact>
  );
}

function formatPublishedAt(publishedAt: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(publishedAt));
}
