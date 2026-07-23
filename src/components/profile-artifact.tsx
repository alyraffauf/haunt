import type { ReactNode } from "react";

type ProfileArtifactProps = {
  children: ReactNode;
  kind?: "sigil";
  source?: {
    href: string;
    name: string;
  };
};

export function ProfileArtifact({
  children,
  kind,
  source,
}: ProfileArtifactProps) {
  return (
    <article
      className={`profile-artifact ${kind ? `profile-artifact--${kind}` : ""} profile-card border`}
    >
      {children}
      {source && (
        <footer className="profile-artifact-source">
          <a
            className="profile-source-link"
            href={source.href}
            target="_blank"
            rel="noreferrer"
          >
            {source.name}
          </a>
        </footer>
      )}
    </article>
  );
}
