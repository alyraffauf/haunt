import type { ReactNode } from "react";

type ProfileArtifactProps = {
  children: ReactNode;
  kind?: "sigil";
};

export function ProfileArtifact({ children, kind }: ProfileArtifactProps) {
  return (
    <article
      className={`profile-artifact ${kind ? `profile-artifact--${kind}` : ""} profile-card border`}
    >
      {children}
    </article>
  );
}
