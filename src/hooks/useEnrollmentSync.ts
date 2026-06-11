import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrphanedMember {
  subscription_id: string;
  user_id: string;
  cohort_id: string;
  username: string;
  cohort_name: string;
}

interface SyncResult {
  fixed: number;
  orphaned: OrphanedMember[];
}

export function useEnrollmentSync() {
  const [isChecking, setIsChecking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [orphanedCount, setOrphanedCount] = useState(0);
  const [orphanedMembers, setOrphanedMembers] = useState<OrphanedMember[]>([]);

  // Check for subscribed members without enrollment progress
  const checkOrphanedEnrollments = useCallback(async () => {
    setIsChecking(true);
    try {
      // Get all subscriptions with ENROLLED or ACTIVE status
      const { data: subscriptions, error: subError } = await supabase
        .from("subscriptions")
        .select(`
          id,
          user_id,
          cohort_id,
          profile:profiles!subscriptions_user_id_fkey(username),
          cohort:cohorts!subscriptions_cohort_id_fkey(name)
        `)
        .in("member_status", ["ENROLLED", "ACTIVE"])
        .not("cohort_id", "is", null);

      if (subError) throw subError;

      // Get all existing progress records
      const { data: progressRecords, error: progError } = await supabase
        .from("acceleration_user_progress")
        .select("user_id, cohort_id");

      if (progError) throw progError;

      // Create a Set for quick lookup
      const progressSet = new Set(
        (progressRecords || []).map(p => `${p.user_id}-${p.cohort_id}`)
      );

      // Find orphaned members (subscribed but no progress)
      const orphaned: OrphanedMember[] = [];
      
      for (const sub of subscriptions || []) {
        if (!sub.cohort_id) continue;
        
        const key = `${sub.user_id}-${sub.cohort_id}`;
        if (!progressSet.has(key)) {
          const profile = Array.isArray(sub.profile) ? sub.profile[0] : sub.profile;
          const cohort = Array.isArray(sub.cohort) ? sub.cohort[0] : sub.cohort;
          
          orphaned.push({
            subscription_id: sub.id,
            user_id: sub.user_id,
            cohort_id: sub.cohort_id,
            username: profile?.username || "Unknown",
            cohort_name: cohort?.name || "Unknown",
          });
        }
      }

      setOrphanedCount(orphaned.length);
      setOrphanedMembers(orphaned);
      return orphaned;
    } catch (err) {
      console.error("Error checking orphaned enrollments:", err);
      toast.error("Erro ao verificar matrículas");
      return [];
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Sync/fix orphaned enrollments
  const syncEnrollments = useCallback(async (): Promise<SyncResult> => {
    setIsSyncing(true);
    try {
      const orphaned = await checkOrphanedEnrollments();
      
      if (orphaned.length === 0) {
        toast.success("Todas as matrículas estão sincronizadas!");
        return { fixed: 0, orphaned: [] };
      }

      let fixed = 0;
      for (const member of orphaned) {
        const { error } = await supabase
          .from("acceleration_user_progress")
          .insert({
            user_id: member.user_id,
            cohort_id: member.cohort_id,
            current_day: 1,
            status: "ACTIVE",
            started_at: new Date().toISOString(),
          });

        if (!error) {
          fixed++;
        } else {
          console.error(`Failed to enroll ${member.username}:`, error);
        }
      }

      // Refresh count
      await checkOrphanedEnrollments();
      
      toast.success(`${fixed} matrícula${fixed !== 1 ? "s" : ""} sincronizada${fixed !== 1 ? "s" : ""}!`);
      return { fixed, orphaned };
    } catch (err) {
      console.error("Error syncing enrollments:", err);
      toast.error("Erro ao sincronizar matrículas");
      return { fixed: 0, orphaned: [] };
    } finally {
      setIsSyncing(false);
    }
  }, [checkOrphanedEnrollments]);

  return {
    isChecking,
    isSyncing,
    orphanedCount,
    orphanedMembers,
    checkOrphanedEnrollments,
    syncEnrollments,
  };
}
