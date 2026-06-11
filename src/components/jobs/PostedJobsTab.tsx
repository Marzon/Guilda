import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SkillLibraryPicker } from "@/components/skills/SkillLibraryPicker";
import { 
  Plus, 
  Megaphone, 
  Users, 
  Pencil, 
  Trash2, 
  CheckCircle2,
  Circle,
  FolderOpen,
  AlertCircle,
  Hammer,
  TrendingUp
} from "lucide-react";
import { usePostedJobs, PostedJob } from "@/hooks/usePostedJobs";
import { useMyProjects } from "@/hooks/useMyProjects";
import { formatDistanceToNow } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";

const localeMap = { pt: ptBR, en: enUS, es: es };

const archetypeConfig = {
  BUILDER: { icon: Hammer, label: "Builder", color: "bg-blue-100 text-blue-700 border-blue-200" },
  SELLER: { icon: TrendingUp, label: "Seller", color: "bg-green-100 text-green-700 border-green-200" },
};

export const PostedJobsTab = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { postedJobs, isLoading, addJob, updateJob, deleteJob, toggleJobStatus } = usePostedJobs();
  const { ownedProjects, isLoading: loadingProjects } = useMyProjects();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<PostedJob | null>(null);
  
  // Form state
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [archetype, setArchetype] = useState<"BUILDER" | "SELLER" | "NONE">("NONE");
  const [skills, setSkills] = useState<string[]>([]);

  const currentLocale = localeMap[i18n.language as keyof typeof localeMap] || ptBR;

  const resetForm = () => {
    setSelectedProjectId("");
    setRoleName("");
    setRoleDescription("");
    setArchetype("NONE");
    setSkills([]);
    setEditingJob(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    if (ownedProjects.length === 1) {
      setSelectedProjectId(ownedProjects[0].id);
    }
    setShowCreateDialog(true);
  };

  const handleOpenEdit = (job: PostedJob) => {
    setEditingJob(job);
    setSelectedProjectId(job.project_id);
    setRoleName(job.role_name);
    setRoleDescription(job.role_description || "");
    setArchetype(job.required_archetype as any || "NONE");
    setSkills(job.required_skills || []);
    setShowCreateDialog(true);
  };

  const handleSubmit = async () => {
    if (!selectedProjectId || !roleName.trim()) return;

    if (editingJob) {
      await updateJob.mutateAsync({
        jobId: editingJob.id,
        updates: {
          role_name: roleName,
          role_description: roleDescription || null,
          required_archetype: archetype === "NONE" ? null : archetype,
          required_skills: skills,
        },
      });
    } else {
      await addJob.mutateAsync({
        project_id: selectedProjectId,
        role_name: roleName,
        role_description: roleDescription || undefined,
        required_archetype: archetype === "NONE" ? null : archetype,
        required_skills: skills,
      });
    }

    setShowCreateDialog(false);
    resetForm();
  };

  const handleDelete = async (jobId: string) => {
    if (confirm(t("jobs.confirmDelete", "Tem certeza que deseja excluir esta vaga?"))) {
      await deleteJob.mutateAsync(jobId);
    }
  };

  const handleToggleFilled = async (job: PostedJob) => {
    await toggleJobStatus.mutateAsync({ jobId: job.id, isFilled: !job.is_filled });
  };

  if (isLoading || loadingProjects) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  // Check if user has any projects
  if (ownedProjects.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t("jobs.noProject", "Crie uma startup primeiro")}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {t("jobs.noProjectDesc", "Você precisa ter uma startup cadastrada para publicar vagas.")}
        </p>
        <Button onClick={() => navigate("/create-project")} className="rounded-full">
          <Plus className="w-4 h-4 mr-2" />
          {t("jobs.createStartup", "Criar Startup")}
        </Button>
      </div>
    );
  }

  // Group jobs by project
  const jobsByProject = postedJobs.reduce((acc, job) => {
    const projectId = job.project_id;
    if (!acc[projectId]) {
      acc[projectId] = {
        project: job.project,
        jobs: [],
      };
    }
    acc[projectId].jobs.push(job);
    return acc;
  }, {} as Record<string, { project: PostedJob["project"]; jobs: PostedJob[] }>);

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {t("jobs.postedTitle", "Minhas Vagas")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("jobs.postedSubtitle", "Gerencie as vagas da sua startup")}
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="rounded-full">
          <Plus className="w-4 h-4 mr-2" />
          {t("jobs.createJob", "Nova Vaga")}
        </Button>
      </div>

      {/* Jobs List */}
      {postedJobs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-semibold text-foreground mb-2">
              {t("jobs.noJobs", "Nenhuma vaga publicada")}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              {t("jobs.noJobsDesc", "Publique vagas para encontrar co-fundadores para sua startup.")}
            </p>
            <Button variant="outline" onClick={handleOpenCreate} className="rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              {t("jobs.createFirstJob", "Criar primeira vaga")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.values(jobsByProject).map(({ project, jobs }) => (
            <Card key={project.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-muted-foreground" />
                  {project.title}
                  <Badge variant="secondary" className="ml-auto">
                    {jobs.length} {jobs.length === 1 ? t("jobs.role", "vaga") : t("jobs.roles", "vagas")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {jobs.map(job => (
                  <div 
                    key={job.id} 
                    className={`p-4 rounded-lg border ${job.is_filled ? 'bg-muted/50 border-muted' : 'bg-card border-border'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <button 
                            onClick={() => handleToggleFilled(job)}
                            className="flex-shrink-0"
                            title={job.is_filled ? t("jobs.markOpen", "Marcar como aberta") : t("jobs.markFilled", "Marcar como preenchida")}
                          >
                            {job.is_filled ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                            )}
                          </button>
                          <h4 className={`font-semibold truncate ${job.is_filled ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {job.role_name}
                          </h4>
                          {job.required_archetype && job.required_archetype !== "INVESTOR" && (
                            <Badge variant="outline" className={archetypeConfig[job.required_archetype]?.color}>
                              {archetypeConfig[job.required_archetype]?.label}
                            </Badge>
                          )}
                        </div>
                        {job.role_description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {job.role_description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {formatDistanceToNow(new Date(job.created_at), { 
                              addSuffix: true, 
                              locale: currentLocale 
                            })}
                          </span>
                          {job.pending_applications_count > 0 && (
                            <span className="flex items-center gap-1 text-primary font-medium">
                              <Users className="w-3 h-3" />
                              {job.pending_applications_count} {t("jobs.pendingApps", "pendentes")}
                            </span>
                          )}
                          {job.applications_count > 0 && job.pending_applications_count === 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {job.applications_count} {t("jobs.totalApps", "candidaturas")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {job.pending_applications_count > 0 && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => navigate(`/projeto/${job.project_id}`)}
                            className="rounded-full"
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {t("jobs.reviewApps", "Revisar")}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(job)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(job.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg">
              {editingJob ? t("jobs.editJob", "Editar Vaga") : t("jobs.createJob", "Nova Vaga")}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Project Selector */}
            {ownedProjects.length > 1 && (
              <div className="space-y-1.5">
                <Label className="text-sm">{t("jobs.selectProject", "Startup")} *</Label>
                <Select 
                  value={selectedProjectId} 
                  onValueChange={setSelectedProjectId}
                  disabled={!!editingJob}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={t("jobs.selectProjectPlaceholder", "Selecione a startup")} />
                  </SelectTrigger>
                  <SelectContent>
                    {ownedProjects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Role Name */}
            <div className="space-y-1.5">
              <Label className="text-sm">{t("jobs.roleName", "Nome da Vaga")} *</Label>
              <Input
                placeholder={t("jobs.roleNamePlaceholder", "Ex: CTO, Head de Growth, Designer...")}
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Role Description */}
            <div className="space-y-1.5">
              <Label className="text-sm">{t("jobs.roleDescription", "Descrição")}</Label>
              <Textarea
                placeholder={t("jobs.roleDescPlaceholder", "Descreva as responsabilidades e o perfil ideal...")}
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                className="resize-none min-h-[80px]"
                rows={3}
              />
            </div>

            {/* Archetype */}
            <div className="space-y-1.5">
              <Label className="text-sm">{t("jobs.requiredClass", "Classe Preferida")}</Label>
              <Select value={archetype} onValueChange={(v) => setArchetype(v as any)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">{t("jobs.anyClass", "Qualquer classe")}</SelectItem>
                  <SelectItem value="BUILDER">Builder (Tech/Produto)</SelectItem>
                  <SelectItem value="SELLER">Seller (Negócios/Growth)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skills */}
            <div className="space-y-1.5">
              <Label className="text-sm">{t("jobs.desiredSkills", "Skills Desejadas")}</Label>
              <SkillLibraryPicker
                selectedSkills={skills}
                onSkillsChange={setSkills}
                maxSkills={10}
              />
            </div>
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
              className="w-full sm:w-auto"
            >
              {t("common.cancel", "Cancelar")}
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedProjectId || !roleName.trim() || addJob.isPending || updateJob.isPending}
              className="w-full sm:w-auto"
            >
              {editingJob ? t("common.save", "Salvar") : t("jobs.publish", "Publicar Vaga")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
