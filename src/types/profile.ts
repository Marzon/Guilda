import type { Archetype } from "./archetype";

export interface ProfileForPreview {
  id: string;
  username: string;
  archetype: Archetype;
  bio: string | null;
  stats: any;
  xp_level: number;
  avatar_url: string | null;
  referralsCount?: number;
}
