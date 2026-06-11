import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface TestimonialRequest {
  id: string;
  type: "individual" | "partnership";
  status: "pending" | "responded" | "approved" | "rejected" | "expired";
  user_id: string | null;
  match_id: string | null;
  founder_1_id: string | null;
  founder_2_id: string | null;
  project_id: string | null;
  context_message: string | null;
  requested_by: string | null;
  created_at: string;
  expires_at: string | null;
  // Joined data
  user?: { id: string; username: string; avatar_url: string | null; phone: string | null } | null;
  founder_1?: { id: string; username: string; avatar_url: string | null; phone: string | null } | null;
  founder_2?: { id: string; username: string; avatar_url: string | null; phone: string | null } | null;
  project?: { id: string; title: string } | null;
  responses?: TestimonialResponse[];
}

export interface TestimonialResponse {
  id: string;
  request_id: string;
  user_id: string;
  answers: Record<string, string>;
  final_quote: string | null;
  responded_at: string;
  user?: { id: string; username: string; avatar_url: string | null; phone: string | null } | null;
}

export interface PendingTestimonialRequest {
  id: string;
  type: string;
  context_message: string | null;
  partner_username: string | null;
  partner_avatar: string | null;
  project_title: string | null;
  created_at: string;
}

export interface PublishedTestimonial {
  id: string;
  request_id: string | null;
  response_id: string | null;
  user_id: string;
  partner_id: string | null;
  project_id: string | null;
  quote: string;
  partnership_type: string | null;
  is_featured: boolean;
  display_order: number | null;
  display_pages: string[];
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  user?: { id: string; username: string; avatar_url: string | null; archetype: string } | null;
  partner?: { id: string; username: string; avatar_url: string | null; archetype: string } | null;
  project?: { id: string; title: string } | null;
}

// Perguntas do formulário de depoimentos
export const TESTIMONIAL_QUESTIONS = {
  individual: [
    { key: "scenario", label: "Antes de começar a usar a Guilda, qual era o maior desafio ou obstáculo que você enfrentava no seu dia a dia ou no seu negócio?" },
    { key: "turning_point", label: "Como a Guilda ajudou você a superar esse obstáculo? Houve alguma funcionalidade específica, recurso ou conexão que foi decisiva nesse processo?" },
    { key: "result", label: "Quais resultados concretos você alcançou após essa mudança? (Se possível, compartilhe números, tempo economizado ou metas atingidas)." },
    { key: "feeling", label: "Além dos resultados numéricos, como você se sente em relação ao seu trabalho/projeto agora, comparado a antes?" },
    { key: "recommendation", label: "Se você tivesse que descrever a Guilda para um colega que tem o mesmo problema que você tinha, o que você diria?" },
  ],
  partnership: [
    { key: "gap", label: "Antes de se encontrarem na Guilda, o que faltava no projeto de vocês? Qual era a maior dificuldade que vocês sentiam por estarem 'jogando sozinhos'?" },
    { key: "match", label: "O que chamou a atenção no perfil um do outro dentro da plataforma? Como foi o primeiro contato e o momento em que perceberam que a parceria daria certo?" },
    { key: "synergy", label: "Como a união das habilidades complementares (Técnica + Negócios) acelerou o desenvolvimento da startup? O que vocês conseguiram fazer juntos em meses que talvez levasse anos sozinhos?" },
    { key: "milestone", label: "Qual foi o maior marco que vocês atingiram juntos até agora (ex: lançamento do MVP, primeira venda, entrada em aceleradora)?" },
    { key: "future", label: "Agora que o time de fundadores está formado, qual é o próximo grande passo da startup? Como vocês veem o impacto dessa sociedade no futuro do negócio?" },
  ],
};

export function useTestimonialRequests() {
  const { data: authData } = useAuth();
  const user = authData?.user;
  const queryClient = useQueryClient();

  // Fetch all requests (admin)
  const { data: requests, isLoading: loadingRequests, refetch: refetchRequests } = useQuery({
    queryKey: ["testimonial-requests"],
    queryFn: async () => {
      // Use explicit relationship hints for ambiguous foreign keys
      const { data, error } = await supabase
        .from("testimonial_requests")
        .select(`
          *,
          user:profiles!testimonial_requests_user_id_fkey(id, username, avatar_url, phone),
          founder_1:profiles!testimonial_requests_founder_1_id_fkey(id, username, avatar_url, phone),
          founder_2:profiles!testimonial_requests_founder_2_id_fkey(id, username, avatar_url, phone),
          project:projects(id, title),
          responses:testimonial_responses(
            id, request_id, user_id, answers, final_quote, responded_at,
            user:profiles(id, username, avatar_url, phone)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as TestimonialRequest[];
    },
    enabled: !!user,
  });

  // Fetch pending request for current user (to show dialog)
  const { data: pendingRequest, isLoading: loadingPending, refetch: refetchPending } = useQuery({
    queryKey: ["my-pending-testimonial"],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .rpc("get_pending_testimonial_request", { p_user_id: user.id });

      if (error) throw error;
      return (data && data.length > 0 ? data[0] : null) as PendingTestimonialRequest | null;
    },
    enabled: !!user,
  });

  // Fetch published testimonials
  const { data: publishedTestimonials, isLoading: loadingPublished } = useQuery({
    queryKey: ["published-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("published_testimonials")
        .select(`
          *,
          user:profiles!published_testimonials_user_id_fkey(id, username, avatar_url, archetype),
          partner:profiles!published_testimonials_partner_id_fkey(id, username, avatar_url, archetype),
          project:projects(id, title)
        `)
        .order("display_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as PublishedTestimonial[];
    },
  });

  // Create testimonial request (admin)
  const createRequest = useMutation({
    mutationFn: async (input: {
      type: "individual" | "partnership";
      user_id?: string;
      founder_1_id?: string;
      founder_2_id?: string;
      match_id?: string;
      project_id?: string;
      context_message?: string;
    }) => {
      const { data, error } = await supabase
        .from("testimonial_requests")
        .insert({
          ...input,
          requested_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonial-requests"] });
      toast.success("Solicitação de depoimento enviada!");
    },
    onError: (error) => {
      toast.error("Erro ao criar solicitação: " + error.message);
    },
  });

  // Submit response (user)
  const submitResponse = useMutation({
    mutationFn: async (input: { request_id: string; answers: Record<string, string> }) => {
      const { data, error } = await supabase
        .from("testimonial_responses")
        .insert({
          request_id: input.request_id,
          user_id: user?.id,
          answers: input.answers,
        })
        .select()
        .single();

      if (error) throw error;

      // Check if all responses are in for partnership
      const { data: request } = await supabase
        .from("testimonial_requests")
        .select("type, founder_1_id, founder_2_id")
        .eq("id", input.request_id)
        .single();

      if (request) {
        const { data: responses } = await supabase
          .from("testimonial_responses")
          .select("id")
          .eq("request_id", input.request_id);

        const expectedResponses = request.type === "individual" ? 1 : 2;
        const newStatus = (responses?.length || 0) >= expectedResponses ? "responded" : "pending";

        await supabase
          .from("testimonial_requests")
          .update({ status: newStatus })
          .eq("id", input.request_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-pending-testimonial"] });
      queryClient.invalidateQueries({ queryKey: ["testimonial-requests"] });
      toast.success("Obrigado pelo seu depoimento!");
    },
    onError: (error) => {
      toast.error("Erro ao enviar resposta: " + error.message);
    },
  });

  // Approve and publish testimonial (admin)
  const publishTestimonial = useMutation({
    mutationFn: async (input: {
      request_id: string;
      response_id: string;
      user_id: string;
      partner_id?: string;
      project_id?: string;
      quote: string;
      partnership_type?: string;
      display_pages: string[];
      is_featured?: boolean;
      partner_username?: string;
      partner_avatar_url?: string;
      project_title?: string;
    }) => {
      const { data, error } = await supabase
        .from("published_testimonials")
        .insert({
          request_id: input.request_id,
          response_id: input.response_id,
          user_id: input.user_id,
          partner_id: input.partner_id,
          project_id: input.project_id,
          quote: input.quote,
          partnership_type: input.partnership_type,
          display_pages: input.display_pages,
          is_featured: input.is_featured,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update request status
      await supabase
        .from("testimonial_requests")
        .update({ status: "approved" })
        .eq("id", input.request_id);

      // Send automatic email notification
      try {
        await supabase.functions.invoke("send-testimonial-published", {
          body: {
            testimonial_id: data.id,
            user_id: input.user_id,
            quote: input.quote,
            partner_username: input.partner_username,
            partner_avatar_url: input.partner_avatar_url,
            project_title: input.project_title,
          },
        });
      } catch (emailError) {
        console.error("Failed to send testimonial email:", emailError);
        // Don't fail the mutation if email fails
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonial-requests"] });
      queryClient.invalidateQueries({ queryKey: ["published-testimonials"] });
      toast.success("Depoimento publicado e email enviado!");
    },
    onError: (error) => {
      toast.error("Erro ao publicar: " + error.message);
    },
  });

  // Reject request (admin)
  const rejectRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from("testimonial_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonial-requests"] });
      toast.success("Solicitação rejeitada");
    },
  });

  // Delete published testimonial (admin)
  const unpublishTestimonial = useMutation({
    mutationFn: async (testimonialId: string) => {
      const { error } = await supabase
        .from("published_testimonials")
        .delete()
        .eq("id", testimonialId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["published-testimonials"] });
      toast.success("Depoimento removido");
    },
  });

  // Delete testimonial request (admin) - only for unpublished requests
  const deleteRequest = useMutation({
    mutationFn: async (requestId: string) => {
      // First delete any associated responses
      await supabase
        .from("testimonial_responses")
        .delete()
        .eq("request_id", requestId);

      // Then delete the request
      const { error } = await supabase
        .from("testimonial_requests")
        .delete()
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonial-requests"] });
      toast.success("Solicitação removida");
    },
    onError: (error) => {
      toast.error("Erro ao remover: " + error.message);
    },
  });

  return {
    // Data
    requests,
    pendingRequest,
    publishedTestimonials,
    
    // Loading states
    loadingRequests,
    loadingPending,
    loadingPublished,
    
    // Refetch
    refetchRequests,
    refetchPending,
    
    // Mutations
    createRequest,
    submitResponse,
    publishTestimonial,
    rejectRequest,
    unpublishTestimonial,
    deleteRequest,
    
    // Mutation states
    isCreating: createRequest.isPending,
    isSubmitting: submitResponse.isPending,
    isPublishing: publishTestimonial.isPending,
    isDeleting: deleteRequest.isPending,
  };
}
