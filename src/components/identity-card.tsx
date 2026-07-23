import type { AtprotoMiniIdentity } from "~/lib/atproto/mini-doc";

type IdentityCardProps = {
  identity: AtprotoMiniIdentity;
};

export function IdentityCard({ identity }: IdentityCardProps) {
  return (
    <section className="profile-card border">
      <div>
        <h1 className="profile-name">{identity.handle ?? "Unknown handle"}</h1>
        <p className="profile-metadata mt-2 break-all">{identity.did}</p>
      </div>

      <p className="profile-metadata mt-4 break-all">PDS: {identity.pds}</p>
    </section>
  );
}
