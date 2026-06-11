import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

export interface Investment {
  id: string;
  investor_id: string;
  startup_name: string;
  website_url: string;
  created_at: string;
}

export const useInvestments = (investorId?: string) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: investments, isLoading } = useQuery({
    queryKey: ["investments", investorId],
    queryFn: async () => {
      if (!investorId) return [];
      
      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .eq("investor_id", investorId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Investment[];
    },
    enabled: !!investorId,
  });

  const addInvestmentMutation = useMutation({
    mutationFn: async ({
      startupName,
      websiteUrl,
    }: {
      startupName: string;
      websiteUrl: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("investments")
        .insert({
          investor_id: user.id,
          startup_name: startupName,
          website_url: websiteUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
    onError: () => {
      toast({
        title: t("common.error", "Erro"),
        description: t("investor.trackRecord.addError", "Erro ao adicionar investimento"),
        variant: "destructive",
      });
    },
  });

  const removeInvestmentMutation = useMutation({
    mutationFn: async (investmentId: string) => {
      const { error } = await supabase
        .from("investments")
        .delete()
        .eq("id", investmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
    onError: () => {
      toast({
        title: t("common.error", "Erro"),
        description: t("investor.trackRecord.removeError", "Erro ao remover investimento"),
        variant: "destructive",
      });
    },
  });

  const bulkAddInvestments = async (
    investmentsList: { startupName: string; websiteUrl: string }[]
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.from("investments").insert(
      investmentsList.map((inv) => ({
        investor_id: user.id,
        startup_name: inv.startupName,
        website_url: inv.websiteUrl,
      }))
    );

    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ["investments"] });
  };

  return {
    investments: investments || [],
    isLoading,
    addInvestment: addInvestmentMutation.mutate,
    removeInvestment: removeInvestmentMutation.mutate,
    bulkAddInvestments,
    isAdding: addInvestmentMutation.isPending,
    isRemoving: removeInvestmentMutation.isPending,
  };
};
