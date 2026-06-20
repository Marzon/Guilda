import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/JobCard";
import { JobDetailDialog } from "@/components/jobs/JobDetailDialog";
import { Users, Briefcase, ArrowRight } from "lucide-react";
import { useOpenJobs, Job } from "@/hooks/usePlatformStats";
import { LandingDarkNavbar } from "@/components/landing/LandingDarkNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { buildCoreAppUrl } from "@/lib/url-utils";

const APP_URL = 'https://suprema.guilda.app.br';

const Jobs = () => {
  const { t } = useTranslation();
  const { jobs, count, isLoading } = useOpenJobs();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleApply = () => {
    window.location.href = buildCoreAppUrl(APP_URL, '/auth?view=signup');
  };

  return (
    <>
      <Helmet>
        <title>{t("jobs.pageTitle", "Vagas em Startups")} | Guilda</title>
        <meta name="description" content={t("jobs.pageDescription", "Encontre vagas em startups e projetos inovadores. Conecte-se com founders e faça parte de times extraordinários.")} />
        <link rel="canonical" href="https://www.guilda.app.br/vagas" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <LandingDarkNavbar />

        <main className="max-w-6xl mx-auto px-4 lg:px-6 py-12 pt-24">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#7610dc]">
              {t("jobs.badge", "Vagas Abertas")}
            </p>

            <h1
              className="text-[1.75rem] sm:text-4xl md:text-6xl font-serif font-thin leading-[0.9] tracking-tight text-black"
              style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
            >
              {t("jobs.title", "Encontre seu lugar em uma startup")}
            </h1>

            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              {t("jobs.subtitle", "Vagas para Builders e Sellers em projetos que estão construindo o futuro")}
            </p>
          </div>

          {/* Jobs Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[240px] rounded-2xl" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-2xl border border-gray-200 flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">
                {t("jobs.empty", "Nenhuma vaga encontrada")}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {t("jobs.emptyDescription", "Não há vagas abertas no momento. Cadastre-se para ser notificado quando novas oportunidades surgirem!")}
              </p>
              <Button onClick={handleApply} size="lg" className="rounded-xl bg-[#7610dc] hover:bg-[#7610dc]/90 text-white">
                {t("jobs.createProfile", "Criar Perfil Grátis")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-400 text-sm">
                  {count} {count === 1 ? t("jobs.openRole", "vaga aberta") : t("jobs.openRoles", "vagas abertas")}
                </p>
                <Button onClick={handleApply} variant="outline" className="rounded-xl border-gray-200 text-black hover:bg-gray-50">
                  {t("jobs.postJob", "Publicar Vaga")}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClick={() => setSelectedJob(job)}
                  />
                ))}
              </div>
            </>
          )}
        </main>

        <FinalCTA />

        <JobDetailDialog
          job={selectedJob}
          open={!!selectedJob}
          onOpenChange={(open) => !open && setSelectedJob(null)}
        />

        <LandingFooter />
      </div>
    </>
  );
};

export default Jobs;
