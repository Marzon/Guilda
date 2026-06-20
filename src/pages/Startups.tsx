import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Rocket, Plus, Loader2, Users, ArrowRight } from "lucide-react";
import { useStartupsWithRoles } from "@/hooks/useStartupsWithRoles";
import { useOpenJobs, Job } from "@/hooks/usePlatformStats";
import { StartupCard } from "@/components/startups/StartupCard";
import { JobCard } from "@/components/jobs/JobCard";
import { JobDetailDialog } from "@/components/jobs/JobDetailDialog";
import { LandingDarkNavbar } from "@/components/landing/LandingDarkNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { buildCoreAppUrl } from "@/lib/url-utils";

const APP_URL = 'https://suprema.guilda.app.br';

const Startups = () => {
  const { data, isLoading, error } = useStartupsWithRoles(50);
  const { jobs: openJobs, count: jobsCount, isLoading: jobsLoading } = useOpenJobs();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePublishProject = () => {
    window.location.href = buildCoreAppUrl(APP_URL, '/auth?view=signup');
  };

  return (
    <>
      <Helmet>
        <title>Startups com Vagas Abertas | Guilda - Encontre startups em busca de cofundadores</title>
        <meta
          name="description"
          content="Descubra startups inovadoras com vagas abertas para cofundadores. Encontre projetos que combinam com suas habilidades e faça parte de algo grande."
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        <LandingDarkNavbar />

        <main className="max-w-6xl mx-auto px-4 lg:px-6 py-12 pt-24">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#7610dc]">
              Vitrine de Startups
            </p>

            <h1
              className="text-[1.75rem] sm:text-4xl md:text-6xl font-serif font-thin leading-[0.9] tracking-tight text-black"
              style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
            >
              Startups com vagas abertas
            </h1>

            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Projetos com descrição detalhada e vagas abertas para cofundadores.
              Clique em qualquer startup para ver detalhes e se candidatar.
            </p>

            <Button
              onClick={handlePublishProject}
              size="lg"
              className="gap-2 mt-4 rounded-xl bg-[#7610dc] hover:bg-[#7610dc]/90 text-white"
            >
              <Plus className="w-5 h-5" />
              Publicar meu projeto
            </Button>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#7610dc]" />
            </div>
          ) : error ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl border border-gray-200 flex items-center justify-center">
                <Rocket className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-black">
                Erro ao carregar startups
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Não foi possível carregar os projetos. Tente novamente mais tarde.
              </p>
            </div>
          ) : data && data.length > 0 ? (
            <>
              <p className="text-gray-400 text-center mb-8 text-sm">
                {data.length} startups com vagas abertas
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-16">
                {data.map((project, index) => (
                  <StartupCard key={project.id} project={project} index={index} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl border border-gray-200 flex items-center justify-center">
                <Rocket className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-black">
                Nenhuma startup com vagas abertas
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Seja o primeiro a publicar seu projeto e encontrar cofundadores incríveis!
              </p>
              <Button
                onClick={handlePublishProject}
                className="gap-2 mt-4 rounded-xl bg-[#7610dc] hover:bg-[#7610dc]/90 text-white"
              >
                <Plus className="w-4 h-4" />
                Publicar meu projeto
              </Button>
            </div>
          )}
        </main>

        {/* ── Vagas em Startups ── */}
        <section className="border-t border-gray-100 pt-16 pb-8">
          <div className="text-center mb-10 space-y-4">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#7610dc]">
              Vagas Abertas
            </p>
            <h2
              className="text-[1.75rem] sm:text-4xl md:text-5xl font-serif font-thin leading-[0.9] tracking-tight text-black"
              style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
            >
              Oportunidades em startups
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Encontre o papel ideal para suas habilidades em projetos que estão construindo o futuro
            </p>
          </div>

          {jobsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[240px] rounded-2xl" />
              ))}
            </div>
          ) : openJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-2xl border border-gray-200 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">
                Nenhuma vaga encontrada
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Não há vagas abertas no momento. Cadastre-se para ser notificado quando novas oportunidades surgirem!
              </p>
              <Button onClick={handlePublishProject} size="lg" className="rounded-xl bg-[#7610dc] hover:bg-[#7610dc]/90 text-white">
                Criar Perfil Grátis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6 max-w-6xl mx-auto px-4 lg:px-6">
                <p className="text-gray-400 text-sm">
                  {jobsCount} {jobsCount === 1 ? "vaga aberta" : "vagas abertas"}
                </p>
                <Button onClick={handlePublishProject} variant="outline" className="rounded-xl border-gray-200 text-black hover:bg-gray-50">
                  Publicar Vaga
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-6xl mx-auto px-4 lg:px-6">
                {openJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClick={() => setSelectedJob(job)}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        <JobDetailDialog
          job={selectedJob}
          open={!!selectedJob}
          onOpenChange={(open) => !open && setSelectedJob(null)}
        />

        <FinalCTA />
        <LandingFooter />
      </div>
    </>
  );
};

export default Startups;
