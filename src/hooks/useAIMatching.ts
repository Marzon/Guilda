import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AIMatch {
  id: string;
  score: number;
  reason: string;
  profile: {
    id: string;
    username: string;
    archetype: string;
    bio: string | null;
    stats: { code?: number; design?: number; marketing?: number };
    skills: { name: string; category: string; proficiency: number }[];
    avatar_url?: string | null;
  };
}

export const useAIMatching = (userId: string | null, existingMatchUserIds: string[] = []) => {
  const [matches, setMatches] = useState<AIMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAIMatches = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // Use algorithmic matching (no AI, no credits needed)
      // Pass existing connections to exclude them from results
      const { data, error: fnError } = await supabase.functions.invoke("algorithmic-match-profiles", {
        body: { 
          userId,
          excludeIds: existingMatchUserIds 
        },
      });

      if (fnError) throw fnError;

      if (data.error) {
        throw new Error(data.error);
      }

      setMatches(data.matches || []);
    } catch (err: any) {
      console.error("Matching error:", err);
      const message = err.message || "Erro ao buscar sugestões";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    matches,
    loading,
    error,
    fetchAIMatches,
  };
};
