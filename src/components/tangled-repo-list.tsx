import type { ReactNode } from "react";

import type { TangledRepo } from "~/lib/providers/tangled";
import { ProfileSection } from "~/components/profile-section";

type TangledRepoListProps = {
  repos: TangledRepo[];
};

export function TangledRepoList({ repos }: TangledRepoListProps) {
  return (
    <ProfileSection title="Code">
      <div>
        {repos.map((repo) => (
          <article
            key={repo.repoDid}
            className="profile-divider border-b py-3 last:border-b-0"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="profile-item-title">
                <a
                  className="profile-link"
                  href={repo.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  {repo.name}
                </a>
              </h3>
              <span className="profile-metadata shrink-0 opacity-100">
                ⭐ {repo.stars}
              </span>
            </div>
            <p className="profile-secondary mt-1">
              {renderMarkdownLinks(repo.description ?? "No description")}
            </p>
          </article>
        ))}
      </div>
    </ProfileSection>
  );
}

function renderMarkdownLinks(text: string): ReactNode[] {
  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const renderedParts: ReactNode[] = [];
  let currentIndex = 0;

  for (const match of text.matchAll(linkPattern)) {
    const matchIndex = match.index ?? currentIndex;
    const linkText = match[1];
    const linkUrl = match[2];

    renderedParts.push(text.slice(currentIndex, matchIndex));
    renderedParts.push(
      <a
        className="profile-link"
        key={`${linkUrl}-${matchIndex}`}
        href={linkUrl}
        target="_blank"
        rel="noreferrer"
      >
        {linkText}
      </a>,
    );
    currentIndex = matchIndex + match[0].length;
  }

  renderedParts.push(text.slice(currentIndex));

  return renderedParts;
}
