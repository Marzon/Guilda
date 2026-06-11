import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "@/components/jobs/JobCard";
import { JobDetailDialog } from "@/components/jobs/JobDetailDialog";
import { Users } from "lucide-react";
import { useOpenJobs, Job } from "@/hooks/usePlatformStats";

export const JobsBoardTab = () => {
  const { t } = useTranslation();
  const { jobs, count, isLoading } = useOpenJobs();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[200px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t("jobs.empty", "Nenhuma vaga encontrada")}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t("jobs.emptyDescription", "Não há vagas abertas no momento. Volte mais tarde!")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">
          {count} {count === 1 ? t("jobs.openRole", "vaga aberta") : t("jobs.openRoles", "vagas abertas")}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <JobCard 
            key={job.id} 
            job={job} 
            onClick={() => setSelectedJob(job)}
          />
        ))}
      </div>

      <JobDetailDialog
        job={selectedJob}
        open={!!selectedJob}
        onOpenChange={(open) => !open && setSelectedJob(null)}
      />
    </div>
  );
};
