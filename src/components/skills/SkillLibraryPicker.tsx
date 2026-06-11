import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Search, Code, Palette, Briefcase, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Skill {
  id: string;
  name: string;
  category: "tech" | "design" | "business";
  icon: string | null;
}

interface SkillLibraryPickerProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  maxSkills?: number;
}

const categoryIcons = {
  tech: Code,
  design: Palette,
  business: Briefcase,
};

const categoryColors = {
  tech: "bg-blue-100 text-blue-700 border-blue-200",
  design: "bg-purple-100 text-purple-700 border-purple-200",
  business: "bg-amber-100 text-amber-700 border-amber-200",
};

const categoryLabels = {
  tech: "Tech",
  design: "Design",
  business: "Business",
};

export const SkillLibraryPicker = ({ 
  selectedSkills, 
  onSkillsChange,
  maxSkills = 10 
}: SkillLibraryPickerProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [customSkill, setCustomSkill] = useState("");

  const { data: skills = [] } = useQuery({
    queryKey: ["skills-library"],
    queryFn: async (): Promise<Skill[]> => {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("category")
        .order("name");

      if (error) {
        console.error("Error fetching skills:", error);
        return [];
      }
      return data as Skill[];
    },
  });

  const filteredSkills = skills.filter(skill => 
    skill.name.toLowerCase().includes(search.toLowerCase()) &&
    !selectedSkills.includes(skill.name)
  );

  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const handleAddSkill = (skillName: string) => {
    if (selectedSkills.length >= maxSkills) return;
    if (!selectedSkills.includes(skillName)) {
      onSkillsChange([...selectedSkills, skillName]);
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    onSkillsChange(selectedSkills.filter(s => s !== skillName));
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed) && selectedSkills.length < maxSkills) {
      onSkillsChange([...selectedSkills, trimmed]);
      setCustomSkill("");
    }
  };

  return (
    <div className="space-y-3">
      {/* Selected Skills */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSkills.map((skill) => (
            <Badge 
              key={skill} 
              variant="secondary" 
              className="gap-1 pr-1"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="ml-1 hover:text-destructive rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search & Custom Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("skills.searchOrAdd", "Buscar ou adicionar skill...")}
            value={search || customSkill}
            onChange={(e) => {
              setSearch(e.target.value);
              setCustomSkill(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustomSkill();
              }
            }}
            className="pl-9"
          />
        </div>
        <Button 
          type="button" 
          variant="outline" 
          size="icon"
          onClick={handleAddCustomSkill}
          disabled={!customSkill.trim() || selectedSkills.length >= maxSkills}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Skills Counter */}
      <p className="text-xs text-muted-foreground">
        {selectedSkills.length}/{maxSkills} skills
      </p>

      {/* Skills Library */}
      <ScrollArea className="h-48 border rounded-lg p-3">
        <div className="space-y-4">
          {(["tech", "design", "business"] as const).map((category) => {
            const categorySkills = groupedSkills[category];
            if (!categorySkills || categorySkills.length === 0) return null;
            
            const Icon = categoryIcons[category];
            
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {categoryLabels[category]}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {categorySkills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => handleAddSkill(skill.name)}
                      disabled={selectedSkills.length >= maxSkills}
                      className={`px-2 py-1 text-xs rounded-md border transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${categoryColors[skill.category]}`}
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {Object.keys(groupedSkills).length === 0 && search && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("skills.noResults", "Nenhuma skill encontrada. Pressione Enter para adicionar.")}
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};