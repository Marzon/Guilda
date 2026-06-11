import { ChevronDown, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLanguage } from "@/hooks/useLanguage";
import { DealTag, DEAL_TAGS } from "@/hooks/useDealFlow";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface QuickTagSelectorProps {
  selectedTags: DealTag[];
  onTagChange: (tag: DealTag) => void; // Changed from onTagToggle - single selection
  size?: "sm" | "md";
}

export const QuickTagSelector = ({
  selectedTags,
  onTagChange,
  size = "sm",
}: QuickTagSelectorProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const currentTag = selectedTags[0]; // Only one tag active

  const handleTagClick = (tag: DealTag) => {
    onTagChange(tag);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Display selected tags as clickable badges */}
      {selectedTags.map((tagValue) => {
        const tag = DEAL_TAGS.find((t) => t.value === tagValue);
        if (!tag) return null;

        return (
          <Popover key={tag.value} open={open && selectedTags[0] === tagValue} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Badge
                variant="default"
                className={cn(
                  tag.color,
                  "text-white cursor-pointer transition-all hover:opacity-80",
                  size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5"
                )}
              >
                {t(tag.labelKey, tag.value)}
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {t("dealFlow.quickTag.changeStatus", "Alterar status")}
                </p>
                {DEAL_TAGS.map((option) => {
                  const isSelected = selectedTags.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                        isSelected
                          ? "bg-muted font-medium"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => {
                        handleTagClick(option.value);
                        setOpen(false);
                      }}
                    >
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          option.color
                        )}
                      />
                      {t(option.labelKey, option.value)}
                      {isSelected && <span className="ml-auto">✓</span>}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        );
      })}

      {/* Add tag button */}
      {selectedTags.length === 0 ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-5 px-1.5 text-[10px] gap-0.5"
            >
              <Plus className="w-3 h-3" />
              {t("dealFlow.quickTag.addTag", "Tag")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {t("dealFlow.quickTag.selectTag", "Selecionar tag")}
              </p>
              {DEAL_TAGS.map((option) => (
                <button
                  key={option.value}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-muted/50"
                  onClick={() => handleTagClick(option.value)}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      option.color
                    )}
                  />
                  {t(option.labelKey, option.value)}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 rounded-full"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {t("dealFlow.quickTag.addMore", "Adicionar tag")}
              </p>
              {DEAL_TAGS.filter(tag => !selectedTags.includes(tag.value)).map((option) => (
                <button
                  key={option.value}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-muted/50"
                  onClick={() => handleTagClick(option.value)}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      option.color
                    )}
                  />
                  {t(option.labelKey, option.value)}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
