import { useState } from "react";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotificationQuickReplyProps {
  recipientId: string;
  recipientUsername: string;
  currentUserId: string;
  onMessageSent: () => void;
}

export const NotificationQuickReply = ({
  recipientId,
  recipientUsername,
  currentUserId,
  onMessageSent,
}: NotificationQuickReplyProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { t } = useLanguage();

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      // 1. Get or create conversation
      const { data: conversationId, error: convError } = await supabase.rpc(
        "get_or_create_conversation",
        { other_user_id: recipientId }
      );

      if (convError || !conversationId) {
        throw new Error("Failed to get conversation");
      }

      // 2. Insert message
      const { error: msgError } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: message.trim(),
      });

      if (msgError) throw msgError;

      // 3. Get current user's username for notification
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", currentUserId)
        .single();

      // 4. Create notification for recipient
      const preview =
        message.length > 50 ? `${message.substring(0, 50)}...` : message;

      await supabase.functions.invoke("create-notification", {
        body: {
          userId: recipientId,
          type: "new_message",
          title: "💬 Nova mensagem!",
          message: `${profile?.username}: ${preview}`,
          relatedUserId: currentUserId,
          sendEmail: true,
        },
      });

      toast.success(t("notifications.messageSent", "Mensagem enviada!"));
      setMessage("");
      setIsExpanded(false);
      onMessageSent();
    } catch (error) {
      console.error("Error sending quick reply:", error);
      toast.error(t("common.error", "Ocorreu um erro"));
    } finally {
      setIsSending(false);
    }
  };

  if (!isExpanded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(true);
        }}
        className="text-xs gap-1.5 h-8"
      >
        <Send className="w-3 h-3" />
        {t("notifications.reply", "Responder")}
      </Button>
    );
  }

  return (
    <div
      className="flex gap-2 mt-2 w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t("notifications.replyPlaceholder", "Mensagem para {{name}}...").replace("{{name}}", recipientUsername)}
        className="text-sm h-8 flex-1"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
          if (e.key === "Escape") {
            setIsExpanded(false);
          }
        }}
        autoFocus
      />
      <Button
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={handleSend}
        disabled={!message.trim() || isSending}
      >
        {isSending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => setIsExpanded(false)}
      >
        ✕
      </Button>
    </div>
  );
};
