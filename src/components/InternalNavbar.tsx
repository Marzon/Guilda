// Stub InternalNavbar for marketing site - redirects to core app
import { LandingNavbar } from "@/components/landing/LandingNavbar";

interface InternalNavbarProps {
  userId?: string;
  username?: string;
  avatarUrl?: string | null;
  isPremium?: boolean;
  onLogout?: () => void;
  showSearch?: boolean;
  title?: string;
  archetype?: string;
}

// Marketing site doesn't have logged-in users, so just show LandingNavbar
export const InternalNavbar = (_props: InternalNavbarProps) => {
  return <LandingNavbar />;
};

export default InternalNavbar;
