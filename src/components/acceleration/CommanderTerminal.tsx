import { useEffect, useState } from "react";
import { Skull, CheckCircle, Terminal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface CommanderTerminalProps {
  feedback: string | null;
  status: 'idle' | 'pending' | 'approved' | 'rejected';
  isLoading?: boolean;
  taskTitle?: string;
}

export const CommanderTerminal = ({ 
  feedback, 
  status, 
  isLoading = false,
  taskTitle 
}: CommanderTerminalProps) => {
  const { t } = useLanguage();
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Typing effect for feedback
  useEffect(() => {
    if (!feedback) {
      setDisplayedText("");
      return;
    }

    setIsTyping(true);
    setDisplayedText("");
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < feedback.length) {
        setDisplayedText(feedback.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 15); // Speed of typing

    return () => clearInterval(interval);
  }, [feedback]);

  const getBorderColor = () => {
    switch (status) {
      case 'approved':
        return 'border-green-500';
      case 'rejected':
        return 'border-red-500';
      case 'pending':
        return 'border-yellow-500';
      default:
        return 'border-slate-700';
    }
  };

  const getHeaderColor = () => {
    switch (status) {
      case 'approved':
        return 'text-green-400';
      case 'rejected':
        return 'text-red-400';
      case 'pending':
        return 'text-yellow-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div 
      className={cn(
        "bg-[#0a0a0a] rounded-xl border-2 overflow-hidden font-mono transition-colors duration-300",
        getBorderColor()
      )}
    >
      {/* Terminal header */}
      <div className={cn(
        "px-3 sm:px-4 py-2 sm:py-3 border-b border-slate-800 flex items-center gap-2",
        getHeaderColor()
      )}>
        <Terminal className="w-4 h-4" />
        <span className="text-sm font-bold uppercase tracking-wider">
          COMMANDER {">>"} {t("acceleration.terminal.evaluation", "AVALIAÇÃO")}
        </span>
        
        {/* Status indicator */}
        <div className="ml-auto flex items-center gap-2">
          {status === 'approved' && (
            <span className="flex items-center gap-1 text-green-400 text-xs">
              <CheckCircle className="w-3 h-3" />
              PASSED
            </span>
          )}
          {status === 'rejected' && (
            <span className="flex items-center gap-1 text-red-400 text-xs">
              <Skull className="w-3 h-3" />
              REJECTED
            </span>
          )}
          {status === 'pending' && (
            <span className="flex items-center gap-1 text-yellow-400 text-xs animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              ANALYZING
            </span>
          )}
        </div>
      </div>

      {/* Terminal content */}
      <div className="p-3 sm:p-4 min-h-[120px] sm:min-h-[200px] max-h-[250px] sm:max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[150px] gap-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-green-400 text-sm animate-pulse">
              {t("acceleration.terminal.analyzing", "ANALISANDO SUBMISSÃO...")}
            </span>
          </div>
        ) : status === 'idle' && !feedback ? (
          <div className="text-slate-500 text-sm">
            <p className="mb-2">{">"} {t("acceleration.terminal.waiting", "Aguardando submissão...")}</p>
            <p className="text-xs opacity-50">
              {t("acceleration.terminal.hint", "Submeta sua tarefa para receber feedback do Commander.")}
            </p>
          </div>
        ) : (
          <div>
            {/* Task context */}
            {taskTitle && (
              <div className="mb-3 pb-3 border-b border-slate-800">
                <span className="text-slate-500 text-xs">
                  {">"} TASK: <span className="text-slate-300">{taskTitle}</span>
                </span>
              </div>
            )}

            {/* Status message */}
            <div className={cn(
              "mb-3 text-sm font-bold",
              status === 'approved' && "text-green-400",
              status === 'rejected' && "text-red-400"
            )}>
              {status === 'approved' && (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {t("acceleration.terminal.approved", "PASSOU. PRÓXIMO!")}
                </span>
              )}
              {status === 'rejected' && (
                <span className="flex items-center gap-2">
                  <Skull className="w-4 h-4" />
                  {t("acceleration.terminal.rejected", "REJEITADO. TENTE NOVAMENTE.")}
                </span>
              )}
            </div>

            {/* Feedback content */}
            <div className={cn(
              "text-sm leading-relaxed whitespace-pre-wrap",
              status === 'approved' && "text-green-300",
              status === 'rejected' && "text-red-300",
              status === 'pending' && "text-yellow-300"
            )}>
              {displayedText}
              {isTyping && <span className="animate-pulse">▌</span>}
            </div>
          </div>
        )}
      </div>

      {/* Terminal footer */}
      <div className="px-3 sm:px-4 py-1.5 sm:py-2 border-t border-slate-800 text-xs text-slate-600">
        <span className="opacity-50">COMMANDER v1.0 | BUILDUP PROTOCOL</span>
      </div>
    </div>
  );
};
