import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { DealTag, DEAL_TAGS } from "@/hooks/useDealFlow";
import { cn } from "@/lib/utils";

interface DealTagSelectorProps {
  selectedTags: DealTag[];
  onTagChange: (tag: DealTag) => void; // Changed from onTagToggle - single selection
  size?: "sm" | "md";
  showAll?: boolean;
}

export const DealTagSelector = ({
  selectedTags,
  onTagChange,
  size = "md",
  showAll = true,
}: DealTagSelectorProps) => {
  const { t } = useLanguage();

  const tagsToShow = showAll ? DEAL_TAGS : DEAL_TAGS.filter(tag => 
    selectedTags.includes(tag.value)
  );

  const currentTag = selectedTags[0]; // Only one tag active

  return (
    <div className="flex flex-wrap gap-2">
      {tagsToShow.map(tag => {
        const isSelected = tag.value === currentTag;
        return (
          <Badge
            key={tag.value}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all",
              size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1",
              isSelected ? tag.color + " text-white hover:opacity-80" : "hover:bg-muted"
            )}
            onClick={() => onTagChange(tag.value)}
          >
            {t(tag.labelKey, tag.value)}
          </Badge>
        );
      })}
    </div>
  );
};

// Read-only display of tags
export const DealTagsDisplay = ({
  tags,
  size = "sm",
}: {
  tags: DealTag[];
  size?: "sm" | "md";
}) => {
  const { t } = useLanguage();

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map(tagValue => {
        const tag = DEAL_TAGS.find(t => t.value === tagValue);
        if (!tag) return null;
        
        return (
          <Badge
            key={tag.value}
            variant="default"
            className={cn(
              tag.color,
              "text-white",
              size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5"
            )}
          >
            {t(tag.labelKey, tag.value)}
          </Badge>
        );
      })}
    </div>
  );
};
