import { useState } from "react";
import { IdentitySubStep } from "./IdentitySubStep";
import { ProfileDetailsSubStep } from "./ProfileDetailsSubStep";
import type { Archetype } from "@/types/archetype";

interface Stats {
  code: number;
  design: number;
  marketing: number;
}

interface ProfileStepProps {
  username: string;
  setUsername: (value: string) => void;
  usernameError?: string;
  bio: string;
  setBio: (value: string) => void;
  stats: Stats;
  setStats: (value: Stats) => void;
  avatarUrl: string | null;
  setAvatarUrl: (value: string | null) => void;
  avatarFile: File | null;
  setAvatarFile: (value: File | null) => void;
  archetype?: Archetype | null;
}

export const ProfileStep = ({
  username,
  setUsername,
  usernameError,
  bio,
  setBio,
  stats,
  setStats,
  avatarUrl,
  setAvatarFile,
  archetype,
}: ProfileStepProps) => {
  const [subStep, setSubStep] = useState<'identity' | 'profile'>('identity');

  if (subStep === 'identity') {
    return (
      <IdentitySubStep
        username={username}
        setUsername={setUsername}
        usernameError={usernameError}
        avatarUrl={avatarUrl}
        setAvatarFile={setAvatarFile}
        onContinue={() => setSubStep('profile')}
      />
    );
  }

  return (
    <ProfileDetailsSubStep
      archetype={archetype ?? null}
      bio={bio}
      setBio={setBio}
      stats={stats}
      setStats={setStats}
    />
  );
};
