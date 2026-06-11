import { useState } from "react";
import { useSkills, useUserSkills, Skill, UserSkill } from "@/hooks/useSkills";
import { useAddUserSkill, useUpdateUserSkill, useRemoveUserSkill } from "@/hooks/useUserSkillsMutation";
import { useLanguage } from "@/hooks/useLanguage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Palette, Briefcase, X, Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillSelectorProps {
  userId: string;
  maxSkills?: number;
}

const categoryIcons = {
  tech: Code,
  design: Palette,
  business: Briefcase,
};

const categoryColors = {
  tech: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  design: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  business: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const proficiencyLabels = {
  1: "Iniciante",
  2: "Básico",
  3: "Intermediário",
  4: "Avançado",
  5: "Expert",
};

export const SkillSelector = ({ userId, maxSkills = 10 }: SkillSelectorProps) => {
  const { t } = useLanguage();
  const { data: skills, isLoading: skillsLoading } = useSkills();
  const { data: userSkills, isLoading: userSkillsLoading } = useUserSkills(userId);
  const addSkill = useAddUserSkill();
  const updateSkill = useUpdateUserSkill();
  const removeSkill = useRemoveUserSkill();
  
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [proficiency, setProficiency] = useState(3);

  const userSkillIds = new Set(userSkills?.map(us => us.skill_id) || []);
  const canAddMore = (userSkills?.length || 0) < maxSkills;

  const handleAddSkill = () => {
    if (!selectedSkill || !canAddMore) return;
    
    addSkill.mutate({
      userId,
      skillId: selectedSkill.id,
      proficiencyLevel: proficiency,
    });
    
    setSelectedSkill(null);
    setProficiency(3);
  };

  const handleUpdateProficiency = (skillId: string, level: number) => {
    updateSkill.mutate({
      userId,
      skillId,
      proficiencyLevel: level,
    });
  };

  const handleRemoveSkill = (skillId: string) => {
    removeSkill.mutate({ userId, skillId });
  };

  const groupedSkills = skills?.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>) || {};

  if (skillsLoading || userSkillsLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Current Skills */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          {t("skills.mySkills")} ({userSkills?.length || 0}/{maxSkills})
        </h3>
        
        {userSkills && userSkills.length > 0 ? (
          <div className="space-y-2">
            {userSkills.map((userSkill) => (
              <div
                key={userSkill.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-card border"
              >
                <Badge className={cn("shrink-0", categoryColors[userSkill.skill?.category || 'tech'])}>
                  {userSkill.skill?.name}
                </Badge>
                
                <div className="flex-1 flex items-center gap-2">
                  <Slider
                    value={[userSkill.proficiency_level]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={([value]) => handleUpdateProficiency(userSkill.skill_id, value)}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-24 text-right">
                    {proficiencyLabels[userSkill.proficiency_level as keyof typeof proficiencyLabels]}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveSkill(userSkill.skill_id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("skills.noSkillsYet")}</p>
        )}
      </div>

      {/* Add Skills */}
      {canAddMore && (
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-3">{t("skills.addSkill")}</h3>
          
          <Tabs defaultValue="tech" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tech" className="flex items-center gap-1">
                <Code className="h-3 w-3" />
                Tech
              </TabsTrigger>
              <TabsTrigger value="design" className="flex items-center gap-1">
                <Palette className="h-3 w-3" />
                Design
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                Business
              </TabsTrigger>
            </TabsList>
            
            {(['tech', 'design', 'business'] as const).map((category) => (
              <TabsContent key={category} value={category}>
                <ScrollArea className="h-32">
                  <div className="flex flex-wrap gap-2 p-1">
                    {groupedSkills[category]?.map((skill) => {
                      const isOwned = userSkillIds.has(skill.id);
                      const isSelected = selectedSkill?.id === skill.id;
                      
                      return (
                        <Badge
                          key={skill.id}
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer transition-all",
                            isOwned && "opacity-50 cursor-not-allowed",
                            isSelected && "ring-2 ring-primary",
                            !isOwned && !isSelected && "hover:bg-accent"
                          )}
                          onClick={() => !isOwned && setSelectedSkill(isSelected ? null : skill)}
                        >
                          {skill.name}
                          {isOwned && " ✓"}
                        </Badge>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
          
          {/* Proficiency Selector */}
          {selectedSkill && (
            <div className="mt-4 p-4 rounded-lg bg-accent/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{selectedSkill.name}</span>
                <Badge className={categoryColors[selectedSkill.category]}>
                  {selectedSkill.category}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  {t("skills.proficiencyLevel")}: {proficiencyLabels[proficiency as keyof typeof proficiencyLabels]}
                </label>
                <Slider
                  value={[proficiency]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={([value]) => setProficiency(value)}
                />
              </div>
              
              <Button
                onClick={handleAddSkill}
                disabled={addSkill.isPending}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("skills.addSkillButton")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
