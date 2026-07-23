import type { ReactNode } from "react";

type ProfileSectionProps = {
  children: ReactNode;
  source?: {
    href: string;
    name: string;
  };
  title: string;
};

export function ProfileSection({
  title,
  source,
  children,
}: ProfileSectionProps) {
  return (
    <section className="profile-card border">
      {source ? (
        <header className="mb-4">
          <h2 className="profile-section-title">{title}</h2>
        </header>
      ) : (
        <h2 className="sr-only">{title}</h2>
      )}
      {children}
      {source && (
        <footer className="profile-divider mt-4 flex justify-end border-t pt-3">
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
    </section>
  );
}
