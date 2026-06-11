import { useState, useMemo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useSkills } from "@/hooks/useSkills";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Palette, TrendingUp, Plus, X, Star, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Archetype } from "@/types/archetype";

interface SelectedSkill {
  skillId: string;
  skillName: string;
  category: "tech" | "design" | "business" | "investor";
  proficiency: number;
}

interface SkillsStepProps {
  selectedSkills: SelectedSkill[];
  setSelectedSkills: (skills: SelectedSkill[]) => void;
  maxSkills?: number;
  archetype?: Archetype | null;
}

const categoryIcons = {
  tech: Code,
  design: Palette,
  business: TrendingUp,
  investor: DollarSign,
};

const categoryColors = {
  tech: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/30",
  design: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/30",
  business: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/30",
  investor: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30",
};

const getProficiencyLabel = (level: number, t: (key: string) => string): string => {
  const labels: Record<number, string> = {
    1: t('skills.proficiency.beginner'),
    2: t('skills.proficiency.basic'),
    3: t('skills.proficiency.intermediate'),
    4: t('skills.proficiency.advanced'),
    5: t('skills.proficiency.expert'),
  };
  return labels[level] || '';
};

export const SkillsStep = ({ selectedSkills, setSelectedSkills, maxSkills = 5, archetype }: SkillsStepProps) => {
  const { t } = useLanguage();
  const { data: skills, isLoading } = useSkills();
  const [pendingSkill, setPendingSkill] = useState<{ id: string; name: string; category: "tech" | "design" | "business" | "investor" } | null>(null);
  const [pendingProficiency, setPendingProficiency] = useState(3);

  const isInvestor = archetype === "INVESTOR";

  const groupedSkills = useMemo(() => {
    if (!skills) return { tech: [], design: [], business: [], investor: [] };
    return {
      tech: skills.filter(s => s.category === "tech"),
      design: skills.filter(s => s.category === "design"),
      business: skills.filter(s => s.category === "business"),
      investor: skills.filter(s => s.category === "investor"),
    };
  }, [skills]);

  const selectedSkillIds = useMemo(() => new Set(selectedSkills.map(s => s.skillId)), [selectedSkills]);

  const handleSelectSkill = (skill: { id: string; name: string; category: "tech" | "design" | "business" | "investor" }) => {
    if (selectedSkillIds.has(skill.id)) return;
    setPendingSkill(skill);
    setPendingProficiency(3);
  };

  const handleAddSkill = () => {
    if (!pendingSkill) return;
    setSelectedSkills([
      ...selectedSkills,
      {
        skillId: pendingSkill.id,
        skillName: pendingSkill.name,
        category: pendingSkill.category,
        proficiency: pendingProficiency,
      },
    ]);
    setPendingSkill(null);
  };

  const handleRemoveSkill = (skillId: string) => {
    setSelectedSkills(selectedSkills.filter(s => s.skillId !== skillId));
  };

  const handleUpdateProficiency = (skillId: string, proficiency: number) => {
    setSelectedSkills(
      selectedSkills.map(s => (s.skillId === skillId ? { ...s, proficiency } : s))
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{t('onboarding.skillsTitle')}</h2>
        <p className="text-sm sm:text-base text-muted-foreground">{t('onboarding.skillsDescription')}</p>
      </div>

      {/* Selected Skills */}
      {selectedSkills.length > 0 && (
        <div className="space-y-2 sm:space-y-3">
          <h3 className="font-medium text-xs sm:text-sm text-muted-foreground">
            {t('skills.mySkills')} ({selectedSkills.length}/{maxSkills})
          </h3>
          <div className="space-y-1.5 sm:space-y-2">
            {selectedSkills.map((skill) => {
              const Icon = categoryIcons[skill.category];
              return (
                <div
                  key={skill.skillId}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50 border"
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium flex-1 text-sm sm:text-base truncate min-w-0">{skill.skillName}</span>
                  {/* Desktop: Slider */}
                  <div className="hidden sm:flex items-center gap-2 flex-1">
                    <Slider
                      value={[skill.proficiency]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={([value]) => handleUpdateProficiency(skill.skillId, value)}
                      className="w-24"
                    />
                    <span className="text-xs text-muted-foreground w-20">
                      {getProficiencyLabel(skill.proficiency, t)}
                    </span>
                  </div>
                  {/* Mobile: Tappable stars for inline proficiency */}
                  <div className="flex sm:hidden items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleUpdateProficiency(skill.skillId, i + 1)}
                        className="p-0.5 touch-manipulation"
                      >
                        <Star
                          className={`h-4 w-4 transition-colors ${i < skill.proficiency ? "fill-primary text-primary" : "text-muted hover:text-muted-foreground"}`}
                        />
                      </button>
                    ))}
                  </div>
                  {/* Desktop: Display stars */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < skill.proficiency ? "fill-primary text-primary" : "text-muted"}`}
                      />
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0"
                    onClick={() => handleRemoveSkill(skill.skillId)}
                  >
                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add new skill */}
      {selectedSkills.length < maxSkills && (
        <div className="space-y-2 sm:space-y-4">
          <h3 className="font-medium text-xs sm:text-sm text-muted-foreground">
            {t('skills.addSkill')}
          </h3>
          
          {isInvestor ? (
            /* Investor-only tabs */
            <Tabs defaultValue="investor" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="investor" className="flex items-center gap-1 text-sm">
                  <DollarSign className="h-3 w-3" />
                  <span>{t('skills.categories.investor', 'Investimentos')}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="investor" className="mt-2 sm:mt-4">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {groupedSkills.investor.map((skill) => {
                    const isSelected = selectedSkillIds.has(skill.id);
                    const isPending = pendingSkill?.id === skill.id;
                    return (
                      <Badge
                        key={skill.id}
                        variant="outline"
                        className={`cursor-pointer transition-all text-xs sm:text-sm ${
                          isSelected
                            ? "opacity-50 cursor-not-allowed"
                            : isPending
                            ? `${categoryColors.investor} ring-2 ring-primary`
                            : categoryColors.investor
                        }`}
                        onClick={() => !isSelected && handleSelectSkill({ id: skill.id, name: skill.name, category: "investor" })}
                      >
                        {skill.name}
                        {isSelected && " ✓"}
                      </Badge>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            /* Builder/Seller tabs */
            <Tabs defaultValue="tech" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tech" className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
                  <Code className="h-3 w-3 flex-shrink-0" />
                  <span className="sm:hidden">Tech</span>
                  <span className="hidden sm:inline">Tech</span>
                </TabsTrigger>
                <TabsTrigger value="design" className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
                  <Palette className="h-3 w-3 flex-shrink-0" />
                  <span className="sm:hidden">Design</span>
                  <span className="hidden sm:inline">Design</span>
                </TabsTrigger>
                <TabsTrigger value="business" className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
                  <TrendingUp className="h-3 w-3 flex-shrink-0" />
                  <span className="sm:hidden">Biz</span>
                  <span className="hidden sm:inline">Business</span>
                </TabsTrigger>
              </TabsList>

              {(["tech", "design", "business"] as const).map((category) => (
                <TabsContent key={category} value={category} className="mt-2 sm:mt-4">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {groupedSkills[category].map((skill) => {
                      const isSelected = selectedSkillIds.has(skill.id);
                      const isPending = pendingSkill?.id === skill.id;
                      return (
                        <Badge
                          key={skill.id}
                          variant="outline"
                          className={`cursor-pointer transition-all text-xs sm:text-sm ${
                            isSelected
                              ? "opacity-50 cursor-not-allowed"
                              : isPending
                              ? `${categoryColors[category]} ring-2 ring-primary`
                              : categoryColors[category]
                          }`}
                          onClick={() => !isSelected && handleSelectSkill({ id: skill.id, name: skill.name, category })}
                        >
                          {skill.name}
                          {isSelected && " ✓"}
                        </Badge>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}

          {/* Proficiency selector for pending skill */}
          {pendingSkill && (
            <div className="p-2 sm:p-4 rounded-lg bg-muted/50 border space-y-2 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm sm:text-base">{pendingSkill.name}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5 sm:h-6 sm:w-6" onClick={() => setPendingSkill(null)}>
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </Button>
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">{t('skills.proficiencyLevel')}</span>
                  <span className="text-xs sm:text-sm font-medium">{getProficiencyLabel(pendingProficiency, t)}</span>
                </div>
                <Slider
                  value={[pendingProficiency]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={([value]) => setPendingProficiency(value)}
                />
                <div className="flex justify-center gap-0.5 sm:gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 sm:h-4 sm:w-4 ${i < pendingProficiency ? "fill-primary text-primary" : "text-muted"}`}
                    />
                  ))}
                </div>
              </div>

              <Button onClick={handleAddSkill} className="w-full text-sm" size="sm">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t('skills.addSkill')}
              </Button>
            </div>
          )}
        </div>
      )}

      {selectedSkills.length === 0 && (
        <p className="text-center text-xs sm:text-sm text-muted-foreground">
          {t('onboarding.skillsOptional')}
        </p>
      )}
    </div>
  );
};
