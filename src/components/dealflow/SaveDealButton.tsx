import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface SaveDealButtonProps {
  isSaved: boolean;
  onSave: () => void;
  onOpen?: () => void;
  isLoading?: boolean;
  size?: "sm" | "md";
  className?: string;
  dataTour?: string;
}

export const SaveDealButton = ({
  isSaved,
  onSave,
  onOpen,
  isLoading = false,
  size = "md",
  className,
  dataTour,
}: SaveDealButtonProps) => {
  const { t } = useLanguage();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved && onOpen) {
      onOpen();
    } else if (!isSaved) {
      onSave();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            disabled={isLoading}
            data-tour={dataTour}
            className={cn(
              "transition-all",
              size === "sm" ? "h-7 w-7" : "h-9 w-9",
              isSaved && "text-primary",
              className
            )}
          >
            {isLoading ? (
              <Loader2 className={cn("animate-spin", size === "sm" ? "h-4 w-4" : "h-5 w-5")} />
            ) : isSaved ? (
              <BookmarkCheck className={cn(size === "sm" ? "h-4 w-4" : "h-5 w-5", "fill-current")} />
            ) : (
              <Bookmark className={cn(size === "sm" ? "h-4 w-4" : "h-5 w-5")} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isSaved 
            ? t('dealFlow.actions.viewDeal', 'Ver no pipeline')
            : t('dealFlow.actions.save', 'Salvar no Pipeline')
          }
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
