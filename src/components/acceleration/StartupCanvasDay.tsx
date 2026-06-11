import { Check, ExternalLink, FileText, MessageSquare } from "lucide-react";
import { CanvasSubmission } from "@/hooks/useStartupCanvas";
import { useLanguage } from "@/hooks/useLanguage";
import { format } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";

interface StartupCanvasDayProps {
  submission: CanvasSubmission;
}

export const StartupCanvasDay = ({ submission }: StartupCanvasDayProps) => {
  const { t, currentLanguage } = useLanguage();

  const getLocale = () => {
    switch (currentLanguage) {
      case "pt": return ptBR;
      case "es": return es;
      default: return enUS;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy", { locale: getLocale() });
  };

  // Check if file_url is a valid URL
  const isValidUrl = (url: string | null) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-3 h-3 text-black" />
          </div>
          <div>
            <h4 className="font-medium text-white">
              {t("acceleration.timeline.day", "Dia")} {submission.task.day_number}: {submission.task.title}
            </h4>
            <p className="text-xs text-slate-400">
              {formatDate(submission.submitted_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* User's submission */}
        <div className="bg-slate-900/50 rounded p-3">
          <p className="text-sm text-slate-300 whitespace-pre-wrap">
            {submission.content}
          </p>
        </div>

        {/* File/Link if exists */}
        {submission.file_url && isValidUrl(submission.file_url) && (
          <a
            href={submission.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            {submission.file_url.includes(".pdf") ? (
              <FileText className="w-4 h-4" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            {t("canvas.viewAttachment", "Ver anexo")}
          </a>
        )}

        {/* AI Feedback */}
        {submission.ai_feedback && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded p-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-purple-400 uppercase tracking-wide">
                {t("canvas.aiFeedback", "Feedback da IA")}
              </span>
            </div>
            <p className="text-sm text-purple-200/80 whitespace-pre-wrap">
              {submission.ai_feedback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
