import { useState } from "react";
import { useSkills, Skill } from "@/hooks/useSkills";
import { useLanguage } from "@/hooks/useLanguage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Code, Palette, Briefcase, Filter, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SkillFilterState {
  skillIds: string[];
  minProficiency: number;
}

interface SkillFilterProps {
  value: SkillFilterState;
  onChange: (value: SkillFilterState) => void;
}

const categoryColors = {
  tech: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  design: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  business: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export const SkillFilter = ({ value, onChange }: SkillFilterProps) => {
  const { t } = useLanguage();
  const { data: skills } = useSkills();
  const [open, setOpen] = useState(false);

  const toggleSkill = (skillId: string) => {
    const newSkillIds = value.skillIds.includes(skillId)
      ? value.skillIds.filter(id => id !== skillId)
      : [...value.skillIds, skillId];
    onChange({ ...value, skillIds: newSkillIds });
  };

  const clearFilters = () => {
    onChange({ skillIds: [], minProficiency: 1 });
  };

  const groupedSkills = skills?.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>) || {};

  const selectedSkills = skills?.filter(s => value.skillIds.includes(s.id)) || [];
  const hasFilters = value.skillIds.length > 0 || value.minProficiency > 1;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={hasFilters ? "default" : "outline"} 
          size="sm"
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          {t("skills.filterBySkills")}
          {hasFilters && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {value.skillIds.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{t("skills.filterBySkills")}</h4>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-3 w-3 mr-1" />
                {t("common.clear")}
              </Button>
            )}
          </div>

          {/* Selected Skills */}
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedSkills.map(skill => (
                <Badge 
                  key={skill.id}
                  className={cn("cursor-pointer", categoryColors[skill.category])}
                  onClick={() => toggleSkill(skill.id)}
                >
                  {skill.name}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}

          {/* Skill Selection */}
          <Tabs defaultValue="tech" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-8">
              <TabsTrigger value="tech" className="text-xs px-2">
                <Code className="h-3 w-3 mr-1" />
                Tech
              </TabsTrigger>
              <TabsTrigger value="design" className="text-xs px-2">
                <Palette className="h-3 w-3 mr-1" />
                Design
              </TabsTrigger>
              <TabsTrigger value="business" className="text-xs px-2">
                <Briefcase className="h-3 w-3 mr-1" />
                Business
              </TabsTrigger>
            </TabsList>
            
            {(['tech', 'design', 'business'] as const).map((category) => (
              <TabsContent key={category} value={category} className="mt-2">
                <ScrollArea className="h-32">
                  <div className="flex flex-wrap gap-1.5 p-1">
                    {groupedSkills[category]?.map((skill) => {
                      const isSelected = value.skillIds.includes(skill.id);
                      
                      return (
                        <Badge
                          key={skill.id}
                          variant="outline"
                          className={cn(
                            "cursor-pointer transition-all text-xs",
                            isSelected && categoryColors[category],
                            !isSelected && "hover:bg-accent"
                          )}
                          onClick={() => toggleSkill(skill.id)}
                        >
                          {isSelected && <Check className="h-3 w-3 mr-1" />}
                          {skill.name}
                        </Badge>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>

          {/* Minimum Proficiency */}
          <div className="space-y-2 pt-2 border-t">
            <label className="text-sm text-muted-foreground">
              {t("skills.minProficiency")}: {value.minProficiency}+
            </label>
            <Slider
              value={[value.minProficiency]}
              min={1}
              max={5}
              step={1}
              onValueChange={([level]) => onChange({ ...value, minProficiency: level })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>5</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
