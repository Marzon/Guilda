import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/useLanguage";
import { useProfiles } from "@/hooks/useProfiles";
import { useFounderIntroductions } from "@/hooks/useFounderIntroductions";
import { SmartAvatar } from "@/components/GuildaAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Users, Briefcase, Loader2, Check, Code, Megaphone, Circle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ProjectRole {
  id: string;
  role_name: string;
  is_filled: boolean;
}

interface CreateIntroductionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  preselectedIntroducedId?: string;
  preselectedRecipientId?: string;
}

export const CreateIntroductionModal = ({
  open,
  onOpenChange,
  currentUserId,
  preselectedIntroducedId,
  preselectedRecipientId,
}: CreateIntroductionModalProps) => {
  const { t } = useLanguage();
  const { data: profiles, isLoading: loadingProfiles } = useProfiles();
  const { createIntroduction, isCreating, introductions } = useFounderIntroductions(currentUserId);

  const [searchIntroduced, setSearchIntroduced] = useState("");
  const [searchRecipient, setSearchRecipient] = useState("");
  const [introducedId, setIntroducedId] = useState<string | null>(preselectedIntroducedId || null);
  const [recipientId, setRecipientId] = useState<string | null>(preselectedRecipientId || null);
  const [message, setMessage] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [archetypeFilterIntroduced, setArchetypeFilterIntroduced] = useState<"ALL" | "BUILDER" | "SELLER">("ALL");
  const [archetypeFilterRecipient, setArchetypeFilterRecipient] = useState<"ALL" | "BUILDER" | "SELLER">("ALL");

  // Check if an introduction already exists between these 3 users
  const introductionExists = useMemo(() => {
    if (!introducedId || !recipientId) return false;
    
    return introductions.some(intro => {
      const participants = [intro.introducer_id, intro.introduced_id, intro.recipient_id];
      return (
        participants.includes(currentUserId) &&
        participants.includes(introducedId) &&
        participants.includes(recipientId)
      );
    });
  }, [introductions, currentUserId, introducedId, recipientId]);

  // Fetch all projects where any of the 3 participants are involved
  const participantIds = useMemo(() => 
    [currentUserId, introducedId, recipientId].filter(Boolean) as string[],
    [currentUserId, introducedId, recipientId]
  );

  const { data: relevantProjects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["introduction-projects", participantIds],
    queryFn: async () => {
      if (participantIds.length === 0) return [];
      
      // Fetch owned projects by any participant
      const { data: ownedProjects, error: ownedError } = await supabase
        .from("projects")
        .select("id, title, owner_id")
        .in("owner_id", participantIds)
        .eq("is_showcase", false);
      
      if (ownedError) {
        console.error("Error fetching owned projects:", ownedError);
        return [];
      }

      // Fetch projects where any participant is a member
      const { data: memberships, error: memberError } = await supabase
        .from("project_members")
        .select("project_id")
        .in("user_id", participantIds)
        .eq("status", "ACTIVE");

      if (memberError) {
        console.error("Error fetching memberships:", memberError);
        return ownedProjects || [];
      }

      const memberProjectIds = memberships?.map(m => m.project_id) || [];
      
      if (memberProjectIds.length === 0) {
        return ownedProjects || [];
      }

      // Fetch member projects details
      const { data: memberProjects, error: memberProjectError } = await supabase
        .from("projects")
        .select("id, title, owner_id")
        .in("id", memberProjectIds)
        .eq("is_showcase", false);

      if (memberProjectError) {
        console.error("Error fetching member projects:", memberProjectError);
        return ownedProjects || [];
      }

      // Combine and deduplicate
      const allProjects = [...(ownedProjects || []), ...(memberProjects || [])];
      const uniqueProjects = allProjects.filter((project, index, self) =>
        index === self.findIndex(p => p.id === project.id)
      );

      return uniqueProjects;
    },
    enabled: participantIds.length > 0,
  });

  // Fetch roles for selected project
  const { data: projectRoles } = useQuery({
    queryKey: ["project-roles", selectedProjectId],
    queryFn: async (): Promise<ProjectRole[]> => {
      if (!selectedProjectId) return [];
      const { data, error } = await supabase
        .from("project_roles")
        .select("id, role_name, is_filled")
        .eq("project_id", selectedProjectId)
        .eq("is_filled", false);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedProjectId,
  });

  // Filter out current user and already selected users, apply archetype filter, sort by MOST RECENT first
  const availableForIntroduced = useMemo(() => {
    if (!profiles) return [];
    return profiles
      .filter(p => 
        p.id !== currentUserId && 
        p.id !== recipientId &&
        p.username.toLowerCase().includes(searchIntroduced.toLowerCase()) &&
        (archetypeFilterIntroduced === "ALL" || p.archetype === archetypeFilterIntroduced)
      )
      .sort((a, b) => {
        // Most recent first (by created_at)
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
  }, [profiles, currentUserId, recipientId, searchIntroduced, archetypeFilterIntroduced]);

  const availableForRecipient = useMemo(() => {
    if (!profiles) return [];
    return profiles
      .filter(p => 
        p.id !== currentUserId && 
        p.id !== introducedId &&
        p.username.toLowerCase().includes(searchRecipient.toLowerCase()) &&
        (archetypeFilterRecipient === "ALL" || p.archetype === archetypeFilterRecipient)
      )
      .sort((a, b) => {
        // Most recent first (by created_at)
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
  }, [profiles, currentUserId, introducedId, searchRecipient, archetypeFilterRecipient]);

  const totalProfilesCount = profiles?.filter(p => p.id !== currentUserId).length || 0;

  const introducedProfile = useMemo(() => 
    profiles?.find(p => p.id === introducedId),
    [profiles, introducedId]
  );

  const recipientProfile = useMemo(() => 
    profiles?.find(p => p.id === recipientId),
    [profiles, recipientId]
  );

  const selectedProject = useMemo(() => 
    relevantProjects?.find(p => p.id === selectedProjectId),
    [relevantProjects, selectedProjectId]
  );

  // Pre-fill message when both profiles are selected
  useEffect(() => {
    if (introducedProfile && recipientProfile && !message && step === 3) {
      const getRole = (archetype: string) => {
        if (archetype === 'BUILDER') {
          return t("archetypes.builderRole", "desenvolvedor");
        }
        return t("archetypes.sellerRole", "profissional de negócios");
      };

      const introducedBio = introducedProfile.bio ? ` - ${introducedProfile.bio.slice(0, 50)}${introducedProfile.bio.length > 50 ? '...' : ''}` : '';
      const recipientBio = recipientProfile.bio ? ` - ${recipientProfile.bio.slice(0, 50)}${recipientProfile.bio.length > 50 ? '...' : ''}` : '';
      
      const suggestedMessage = t("introductions.suggestedMessageTemplate", {
        introduced: introducedProfile.username,
        introducedRole: getRole(introducedProfile.archetype),
        introducedBio,
        recipient: recipientProfile.username,
        recipientRole: getRole(recipientProfile.archetype),
        recipientBio,
      });
      
      setMessage(suggestedMessage);
    }
  }, [introducedProfile, recipientProfile, step, t]);

  const handleSubmit = async () => {
    if (!introducedId || !recipientId) return;

    try {
      await createIntroduction({
        introducedId,
        recipientId,
        message: message.trim() || undefined,
        projectId: selectedProjectId || undefined,
        roleId: selectedRoleId || undefined,
      });
      
      // Reset and close
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating introduction:", error);
    }
  };

  const resetForm = () => {
    setIntroducedId(preselectedIntroducedId || null);
    setRecipientId(preselectedRecipientId || null);
    setMessage("");
    setSelectedProjectId(null);
    setSelectedRoleId(null);
    setSearchIntroduced("");
    setSearchRecipient("");
    setStep(1);
    setArchetypeFilterIntroduced("ALL");
    setArchetypeFilterRecipient("ALL");
  };

  const canProceedStep1 = !!introducedId;
  const canProceedStep2 = !!recipientId && !introductionExists;
  const canSubmit = !!introducedId && !!recipientId && !introductionExists;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {t("introductions.createTitle", "Apresentar Fundadores")}
          </DialogTitle>
          <DialogDescription>
            {t("introductions.createDescription", "Conecte dois fundadores que podem se beneficiar mutuamente.")}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : step > s
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>

        <div className="space-y-4 py-2">
          {/* Step 1: Select who to introduce */}
          {step === 1 && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                {t("introductions.selectIntroduced", "Quem você quer apresentar?")}
              </Label>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("introductions.searchUser", "Buscar usuário...")}
                  value={searchIntroduced}
                  onChange={(e) => setSearchIntroduced(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Archetype Filter */}
              <ToggleGroup
                type="single"
                value={archetypeFilterIntroduced}
                onValueChange={(v) => v && setArchetypeFilterIntroduced(v as "ALL" | "BUILDER" | "SELLER")}
                className="justify-start"
              >
                <ToggleGroupItem value="ALL" size="sm" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {t("introductions.filterAll", "Todos")}
                </ToggleGroupItem>
                <ToggleGroupItem value="BUILDER" size="sm" className="text-xs">
                  <Code className="w-3 h-3 mr-1" />
                  Builders
                </ToggleGroupItem>
                <ToggleGroupItem value="SELLER" size="sm" className="text-xs">
                  <Megaphone className="w-3 h-3 mr-1" />
                  Sellers
                </ToggleGroupItem>
              </ToggleGroup>

              {introducedId && introducedProfile && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-3">
                  <SmartAvatar
                    avatarUrl={introducedProfile.avatar_url}
                    name={introducedProfile.username}
                    archetype={introducedProfile.archetype as "BUILDER" | "SELLER"}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{introducedProfile.username}</p>
                    <Badge variant="outline" className="text-xs">
                      {introducedProfile.archetype}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIntroducedId(null)}
                  >
                    {t("common.change", "Alterar")}
                  </Button>
                </div>
              )}

              {!introducedId && (
                <>
                  <p className="text-xs text-muted-foreground">
                    {t("introductions.showingResults", "Mostrando {{count}} de {{total}} usuários", {
                      count: availableForIntroduced.length,
                      total: totalProfilesCount
                    })}
                  </p>
                  <div className="max-h-64 overflow-y-auto space-y-1 border rounded-lg p-1">
                    {loadingProfiles ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : availableForIntroduced.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center p-4">
                        {t("introductions.noUsersFound", "Nenhum usuário encontrado")}
                      </p>
                    ) : (
                      availableForIntroduced.map((profile) => (
                        <button
                          key={profile.id}
                          onClick={() => setIntroducedId(profile.id)}
                          className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <div className="relative">
                            <SmartAvatar
                              avatarUrl={profile.avatar_url}
                              name={profile.username}
                              archetype={profile.archetype as "BUILDER" | "SELLER"}
                              size="sm"
                            />
                            {profile.is_online && (
                              <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-green-500 text-green-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{profile.username}</p>
                            <p className="text-xs text-muted-foreground">{profile.archetype} · Lv{profile.xp_level || 1}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Select recipient */}
          {step === 2 && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                {t("introductions.selectRecipient", "Para quem você quer apresentar?")}
              </Label>

              {introducedProfile && (
                <p className="text-sm text-muted-foreground">
                  {t("introductions.introducingTo", "Apresentando {{name}} para:", { name: introducedProfile.username })}
                </p>
              )}
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("introductions.searchUser", "Buscar usuário...")}
                  value={searchRecipient}
                  onChange={(e) => setSearchRecipient(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Archetype Filter */}
              <ToggleGroup
                type="single"
                value={archetypeFilterRecipient}
                onValueChange={(v) => v && setArchetypeFilterRecipient(v as "ALL" | "BUILDER" | "SELLER")}
                className="justify-start"
              >
                <ToggleGroupItem value="ALL" size="sm" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {t("introductions.filterAll", "Todos")}
                </ToggleGroupItem>
                <ToggleGroupItem value="BUILDER" size="sm" className="text-xs">
                  <Code className="w-3 h-3 mr-1" />
                  Builders
                </ToggleGroupItem>
                <ToggleGroupItem value="SELLER" size="sm" className="text-xs">
                  <Megaphone className="w-3 h-3 mr-1" />
                  Sellers
                </ToggleGroupItem>
              </ToggleGroup>

              {recipientId && recipientProfile && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-3">
                  <SmartAvatar
                    avatarUrl={recipientProfile.avatar_url}
                    name={recipientProfile.username}
                    archetype={recipientProfile.archetype as "BUILDER" | "SELLER"}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{recipientProfile.username}</p>
                    <Badge variant="outline" className="text-xs">
                      {recipientProfile.archetype}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRecipientId(null)}
                  >
                    {t("common.change", "Alterar")}
                  </Button>
                </div>
              )}

              {/* Warning when introduction already exists */}
              {introductionExists && recipientId && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">
                    {t("introductions.alreadyExists", "Você já fez essa apresentação anteriormente.")}
                  </p>
                </div>
              )}

              {!recipientId && (
                <>
                  <p className="text-xs text-muted-foreground">
                    {t("introductions.showingResults", "Mostrando {{count}} de {{total}} usuários", {
                      count: availableForRecipient.length,
                      total: totalProfilesCount
                    })}
                  </p>
                  <div className="max-h-64 overflow-y-auto space-y-1 border rounded-lg p-1">
                    {loadingProfiles ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : availableForRecipient.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center p-4">
                        {t("introductions.noUsersFound", "Nenhum usuário encontrado")}
                      </p>
                    ) : (
                      availableForRecipient.map((profile) => (
                        <button
                          key={profile.id}
                          onClick={() => setRecipientId(profile.id)}
                          className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <div className="relative">
                            <SmartAvatar
                              avatarUrl={profile.avatar_url}
                              name={profile.username}
                              archetype={profile.archetype as "BUILDER" | "SELLER"}
                              size="sm"
                            />
                            {profile.is_online && (
                              <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-green-500 text-green-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{profile.username}</p>
                            <p className="text-xs text-muted-foreground">{profile.archetype} · Lv{profile.xp_level || 1}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Add context */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  {t("introductions.summary", "Resumo da apresentação:")}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-primary">{introducedProfile?.username}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-semibold text-primary">{recipientProfile?.username}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("introductions.messageLabel", "Mensagem de apresentação (opcional)")}</Label>
                <Textarea
                  placeholder={t("introductions.messagePlaceholder", "Ex: Acho que vocês deveriam se conhecer! O João tem experiência em marketing digital e a Maria está montando um marketplace...")}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {t("introductions.linkProject", "Vincular a projeto (opcional)")}
                </Label>
                <Select
                  value={selectedProjectId || "none"}
                  onValueChange={(v) => {
                    setSelectedProjectId(v === "none" ? null : v);
                    setSelectedRoleId(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("introductions.selectProject", "Selecionar projeto")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("common.none", "Nenhum")}</SelectItem>
                    {relevantProjects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProjectId && projectRoles && projectRoles.length > 0 && (
                <div className="space-y-2">
                  <Label>{t("introductions.linkRole", "Vincular a vaga (opcional)")}</Label>
                  <Select
                    value={selectedRoleId || "none"}
                    onValueChange={(v) => setSelectedRoleId(v === "none" ? null : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("introductions.selectRole", "Selecionar vaga")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("common.none", "Nenhum")}</SelectItem>
                      {projectRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.role_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              disabled={isCreating}
            >
              {t("common.back", "Voltar")}
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
            >
              {t("common.next", "Próximo")}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isCreating}
              className="gap-2"
            >
              {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
              <Users className="w-4 h-4" />
              {t("introductions.createButton", "Criar Apresentação")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
