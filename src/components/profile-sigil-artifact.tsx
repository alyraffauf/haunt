import { HauntSigil } from "~/components/haunt-sigil";
import { ProfileArtifact } from "~/components/profile-artifact";

export function ProfileSigilArtifact({ did }: { did: string }) {
  return (
    <ProfileArtifact kind="sigil">
      <HauntSigil
        className="profile-sigil-artifact"
        color="var(--profile-accent)"
        seed={did}
      />
    </ProfileArtifact>
  );
}
