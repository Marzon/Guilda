import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MessageCircle, 
  Briefcase,
  Undo2,
  Building2,
  ExternalLink
} from "lucide-react";
import { useProjectApplications, ProjectApplication } from "@/hooks/useProjectApplications";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";

const localeMap = { pt: ptBR, en: enUS, es: es };

export const MyApplicationsTab = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { myApplications, isLoading, withdrawApplication } = useProjectApplications();
  
  const [selectedApplication, setSelectedApplication] = useState<ProjectApplication | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            {t("applications.pending", "Pendente")}
          </Badge>
        );
      case "ACCEPTED":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {t("applications.accepted", "Aceito")}
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            {t("applications.rejected", "Recusado")}
          </Badge>
        );
      case "WITHDRAWN":
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">
            <Undo2 className="w-3 h-3 mr-1" />
            {t("applications.withdrawn", "Retirado")}
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    if (confirm(t("applications.confirmWithdraw", "Tem certeza que deseja retirar esta candidatura?"))) {
      withdrawApplication.mutate(applicationId);
      setSelectedApplication(null);
    }
  };

  const currentLocale = localeMap[i18n.language as keyof typeof localeMap] || ptBR;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (myApplications.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t("applications.noApplications", "Nenhuma candidatura ainda")}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {t("applications.noApplicationsDesc", "Explore as vagas no Mural e candidate-se para encontrar sua próxima oportunidade.")}
        </p>
      </div>
    );
  }

  // Group applications by status
  const pending = myApplications.filter(a => a.status === "PENDING");
  const accepted = myApplications.filter(a => a.status === "ACCEPTED");
  const rejected = myApplications.filter(a => a.status === "REJECTED");
  const withdrawn = myApplications.filter(a => a.status === "WITHDRAWN");

  const sections = [
    { title: t("applications.pendingSection", "Pendentes"), items: pending, color: "amber" },
    { title: t("applications.acceptedSection", "Aceitas"), items: accepted, color: "emerald" },
    { title: t("applications.rejectedSection", "Recusadas"), items: rejected, color: "red" },
    { title: t("applications.withdrawnSection", "Retiradas"), items: withdrawn, color: "slate" },
  ].filter(s => s.items.length > 0);

  return (
    <div className="space-y-8">
      {sections.map(section => (
        <div key={section.title}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            {section.title} ({section.items.length})
          </h3>
          <div className="space-y-3">
            {section.items.map(application => (
              <Card 
                key={application.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedApplication(application)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground truncate">
                          {application.role?.role_name}
                        </h4>
                        {getStatusBadge(application.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {application.project?.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("applications.appliedAt", "Candidatou-se")} {formatDistanceToNow(new Date(application.created_at), { 
                          addSuffix: true, 
                          locale: currentLocale 
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedApplication(application);
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg">{selectedApplication?.role?.role_name}</DialogTitle>
            <DialogDescription className="text-sm">{selectedApplication?.project?.title}</DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex justify-center py-2">
                {getStatusBadge(selectedApplication.status)}
              </div>

              <Separator />

              {/* Details */}
              <div className="space-y-4">
                {selectedApplication.role?.role_description && (
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      {t("jobs.description", "Descrição da Vaga")}
                    </Label>
                    <p className="mt-1.5 text-sm text-foreground">
                      {selectedApplication.role.role_description}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    {t("applications.sentAt", "Data da Candidatura")}
                  </Label>
                  <p className="mt-1.5 text-sm text-foreground">
                    {format(new Date(selectedApplication.created_at), "PPP 'às' HH:mm", { locale: currentLocale })}
                  </p>
                </div>

                {selectedApplication.message && (
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      {t("applications.yourMessage", "Sua Mensagem")}
                    </Label>
                    <p className="mt-1.5 text-sm text-foreground bg-muted/50 p-3 rounded-lg">
                      {selectedApplication.message}
                    </p>
                  </div>
                )}

                {selectedApplication.responded_at && (
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      {t("applications.respondedAt", "Resposta em")}
                    </Label>
                    <p className="mt-1.5 text-sm text-foreground">
                      {format(new Date(selectedApplication.responded_at), "PPP 'às' HH:mm", { locale: currentLocale })}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedApplication(null)}
                  className="w-full sm:w-auto"
                >
                  {t("common.close", "Fechar")}
                </Button>
                
                {selectedApplication.status === "PENDING" && (
                  <Button
                    variant="destructive"
                    className="w-full sm:flex-1"
                    onClick={() => handleWithdraw(selectedApplication.id)}
                    disabled={withdrawApplication.isPending}
                  >
                    <Undo2 className="w-4 h-4 mr-2" />
                    {t("applications.withdraw", "Retirar Candidatura")}
                  </Button>
                )}

                {selectedApplication.status === "ACCEPTED" && (
                  <Button
                    className="w-full sm:flex-1"
                    onClick={() => {
                      navigate(`/messages?user=${selectedApplication.project?.owner_id}`);
                      setSelectedApplication(null);
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {t("applications.messageOwner", "Enviar Mensagem")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
