import type { ReactNode } from "react";

type ProfileSectionProps = {
  children: ReactNode;
  title: string;
};

export function ProfileSection({ title, children }: ProfileSectionProps) {
  return (
    <section className="profile-card border">
      <h2 className="sr-only">{title}</h2>
      {children}
    </section>
  );
}
