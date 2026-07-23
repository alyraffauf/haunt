import type { StandardDocument } from "~/lib/providers/standard-site";
import { ProfileSection } from "~/components/profile-section";
type StandardDocumentsProps = {
  documents: StandardDocument[];
};

export function StandardDocuments({ documents }: StandardDocumentsProps) {
  return (
    <ProfileSection
      title="Writing"
      source={{ name: "standard.site", href: "https://standard.site" }}
    >
      <div>
        {documents.map((document) => (
          <article
            key={`${document.path}-${document.publishedAt}`}
            className="profile-divider border-b py-3 last:border-b-0"
          >
            <h3 className="profile-item-title">
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
            </h3>

            {document.description && (
              <p className="profile-secondary mt-1">{document.description}</p>
            )}

            <div className="profile-metadata mt-2">
              {document.publishedAt && (
                <time dateTime={document.publishedAt}>
                  {formatPublishedAt(document.publishedAt)}
                </time>
              )}
            </div>
          </article>
        ))}
      </div>
    </ProfileSection>
  );
}

function formatPublishedAt(publishedAt: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(publishedAt));
}
