import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Rocket, Users, Briefcase, Lightbulb, CheckCircle, TrendingUp, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LandingDarkNavbar } from "@/components/landing/LandingDarkNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useStartupBySlug } from "@/hooks/useStartupsWithRoles";
import { CORE_API } from "@/lib/api-config";
import { Loader2 } from "lucide-react";

const cardGradients = [
  "from-indigo-600 to-purple-500",
  "from-blue-500 to-cyan-500",
  "from-pink-500 to-orange-500",
  "from-green-500 to-emerald-500",
  "from-amber-500 to-yellow-500",
  "from-rose-500 to-red-500",
];

const statusConfig = {
  IDEA: { label: "Ideação", icon: Lightbulb, className: "bg-muted text-muted-foreground border-border" },
  MVP: { label: "MVP Validado", icon: CheckCircle, className: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400" },
  SCALE: { label: "Escalando", icon: TrendingUp, className: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400" },
};

const StartupDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { startup, isLoading } = useStartupBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <LandingDarkNavbar />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <LandingFooter />
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="min-h-screen bg-background">
        <LandingDarkNavbar />
        <main className="container mx-auto px-4 py-12 pt-24 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Rocket className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Startup não encontrada</h1>
          <p className="text-muted-foreground mb-6">Essa startup pode ter sido removida ou o link está incorreto.</p>
          <Link to="/startups">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar para startups
            </Button>
          </Link>
        </main>
        <LandingFooter />
      </div>
    );
  }

  const status = startup.status ? statusConfig[startup.status] : null;
  const gradientIndex = startup.title.length % cardGradients.length;

  return (
    <>
      <Helmet>
        <title>{startup.title} | Guilda — Encontre cofundadores</title>
        <meta name="description" content={startup.description.substring(0, 160)} />
        <link rel="canonical" href={`https://www.guilda.app.br/startups/${startup.slug}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <LandingDarkNavbar />
        
        <main className="container mx-auto px-4 py-12 pt-24 max-w-4xl">
          {/* Back */}
          <Link to="/startups" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar para startups</span>
          </Link>

          {/* Hero */}
          <div className="rounded-2xl overflow-hidden border border-border mb-8">
            {startup.cover_image_url ? (
              <div className="h-48 md:h-64 relative">
                <img src={startup.cover_image_url} alt={startup.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            ) : (
              <div className={`h-48 md:h-64 bg-gradient-to-r ${cardGradients[gradientIndex]} relative`}>
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]" />
              </div>
            )}
            
            <div className="p-6 md:p-8 bg-card">
              <div className="flex flex-wrap items-start gap-3 mb-4">
                {status && (
                  <Badge variant="outline" className={`gap-1 ${status.className}`}>
                    <status.icon className="w-3 h-3" />
                    {status.label}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{startup.title}</h1>
              
              {startup.owner && (
                <p className="text-muted-foreground">
                  por <span className="font-medium text-foreground">{startup.owner.username}</span>
                  {startup.owner.archetype && (
                    <Badge variant="secondary" className="ml-2 text-xs">{startup.owner.archetype}</Badge>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              Sobre o projeto
            </h2>
            <div className="bg-card rounded-xl border border-border p-6">
              <p className="text-foreground/90 whitespace-pre-line leading-relaxed">{startup.description}</p>
            </div>
          </section>

          {/* Open Roles */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Vagas abertas ({startup.roles.length})
            </h2>
            <div className="space-y-4">
              {startup.roles.map((role) => (
                <div key={role.id} className="bg-card rounded-xl border border-border p-6 hover:border-primary/30 transition-colors">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground text-lg">{role.role_name}</h3>
                    {role.required_archetype && (
                      <Badge variant="secondary" className="text-xs">{role.required_archetype}</Badge>
                    )}
                  </div>
                  {role.role_description && (
                    <p className="text-muted-foreground text-sm whitespace-pre-line mb-3">{role.role_description}</p>
                  )}
                  {role.required_skills && role.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {role.required_skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-background border border-primary/20 p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Quer se candidatar?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Crie seu perfil na Guilda e candidate-se diretamente para as vagas deste projeto.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => { window.location.href = CORE_API.app.project(startup.id); }}
              >
                Ver na Plataforma
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => { window.location.href = CORE_API.app.auth; }}
              >
                Criar Perfil Grátis
              </Button>
            </div>
          </section>
        </main>

        <LandingFooter />
      </div>
    </>
  );
};

export default StartupDetail;
