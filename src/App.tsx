// Build optimization: consolidated chunks for better CI/CD performance - 2026-01-19
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { I18nextProvider } from "react-i18next";
import { HelmetProvider } from "react-helmet-async";
import i18n from "@/i18n";
import { PageSkeleton } from "@/components/PageSkeleton";
import { ThemeProvider } from "@/components/ThemeProvider";
import { buildCoreAppUrl } from "@/lib/url-utils";
import { ToolsRedirect } from "@/components/routing/ToolsRedirect";
import { ScrollToTop } from "@/components/ScrollToTop";

const APP_URL = 'https://suprema.guilda.app.br';

// Lazy load non-critical UI components
const Toaster = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));
const GoogleAnalytics = lazy(() => import("@/components/GoogleAnalytics").then(m => ({ default: m.GoogleAnalytics })));
const PageviewTracker = lazy(() => import("@/components/PageviewTracker").then(m => ({ default: m.PageviewTracker })));

// Eager load critical routes
import Index from "./pages/Index";

// Lazy load marketing routes
const LP2 = lazy(() => import("./pages/LP2"));
const Pricing = lazy(() => import("./pages/Pricing"));
const DoOrDie = lazy(() => import("./pages/DoOrDie"));
const Aceleracao2 = lazy(() => import("./pages/Aceleracao2"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const Builders = lazy(() => import("./pages/Builders"));
const Sellers = lazy(() => import("./pages/Sellers"));
const Starters = lazy(() => import("./pages/Starters"));
const Investors = lazy(() => import("./pages/Investors"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SuccessStoriesPage = lazy(() => import("./pages/SuccessStories"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Manifesto = lazy(() => import("./pages/Manifesto"));
const SocialPaymentCallback = lazy(() => import("./pages/SocialPaymentCallback"));

// Tools (public, no auth needed)
const Tools = lazy(() => import("./pages/Tools"));
const EquityCalculator = lazy(() => import("./pages/EquityCalculator"));
const RunwayCalculator = lazy(() => import("./pages/RunwayCalculator"));
const ContractGenerator = lazy(() => import("./pages/ContractGenerator"));
const ArchetypeQuiz = lazy(() => import("./pages/ArchetypeQuiz"));
const UnitEconomicsCalculator = lazy(() => import("./pages/UnitEconomicsCalculator"));
const ValuationCalculator = lazy(() => import("./pages/ValuationCalculator"));
const CapTableSimulator = lazy(() => import("./pages/CapTableSimulator"));
const BurnRateOptimizer = lazy(() => import("./pages/BurnRateOptimizer"));
const BusinessModelCanvas = lazy(() => import("./pages/BusinessModelCanvas"));
const TamSamSomCalculator = lazy(() => import("./pages/TamSamSomCalculator"));
const EmpathyMapGenerator = lazy(() => import("./pages/EmpathyMapGenerator"));
const SwotAnalysis = lazy(() => import("./pages/SwotAnalysis"));
const CustomerDevelopment = lazy(() => import("./pages/CustomerDevelopment"));
const LgpdGuide = lazy(() => import("./pages/LgpdGuide"));
const RecruitingGuide = lazy(() => import("./pages/RecruitingGuide"));
const DataRoomGuide = lazy(() => import("./pages/DataRoomGuide"));
const MvpVibecoding = lazy(() => import("./pages/MvpVibecoding"));
const KnowledgeRoadmap = lazy(() => import("./pages/KnowledgeRoadmap"));
const GuildaIaMvpBuilder = lazy(() => import("./pages/GuildaIaMvpBuilder"));
const CrieSeuMvp = lazy(() => import("./pages/CrieSeuMvp"));
const ColdOutreachGenerator = lazy(() => import("./pages/ColdOutreachGenerator"));
const MarkupCalculator = lazy(() => import("./pages/MarkupCalculator"));
const CardFeeSimulator = lazy(() => import("./pages/CardFeeSimulator"));
const BreakevenCalculator = lazy(() => import("./pages/BreakevenCalculator"));
const RoiCalculator = lazy(() => import("./pages/RoiCalculator"));
const ProposalGenerator = lazy(() => import("./pages/ProposalGenerator"));
const BusinessHealthQuiz = lazy(() => import("./pages/BusinessHealthQuiz"));
const CompanyOpeningChecklist = lazy(() => import("./pages/CompanyOpeningChecklist"));
const Links = lazy(() => import("./pages/Links"));
const QuizEmpreendedor = lazy(() => import("./pages/QuizEmpreendedor"));
const AceleracaoThankYou = lazy(() => import("./pages/AceleracaoThankYou"));
const GuildaPro = lazy(() => import("./pages/GuildaPro"));

// Jobs pages (public listing)
const Jobs = lazy(() => import("./pages/Jobs"));
const JobDetail = lazy(() => import("./pages/JobDetail"));


// Startups pages (public showcase)
const Startups = lazy(() => import("./pages/Startups"));
const StartupDetail = lazy(() => import("./pages/StartupDetail"));

// Admin pages (protected)
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const BlogAdmin = lazy(() => import("./pages/admin/BlogAdmin"));
const BlogEditor = lazy(() => import("./pages/admin/BlogEditor"));
const SitemapAdmin = lazy(() => import("./pages/admin/SitemapAdmin"));
const SEOAdmin = lazy(() => import("./pages/admin/SEOAdmin"));
const TrackingAdmin = lazy(() => import("./pages/admin/TrackingAdmin"));
const BannersAdmin = lazy(() => import("./pages/admin/BannersAdmin"));
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 minute - data considered fresh
      gcTime: 5 * 60_000, // 5 minutes garbage collection
      retry: 1,
    },
  },
});

// Component to redirect to the core app
const RedirectToApp = ({ path }: { path: string }) => {
  if (typeof window !== 'undefined') {
    window.location.href = buildCoreAppUrl(APP_URL, path);
  }
  return <div className="flex items-center justify-center min-h-screen">Redirecionando...</div>;
};

// Redirect /api/jobs-feed.xml to the edge function
const RedirectToJobsFeed = () => {
  if (typeof window !== 'undefined') {
    window.location.href = `${import.meta.env.VITE_SUPABASE_URL || 'https://api.guilda.app.br'}/functions/v1/jobs-feed-xml`;
  }
  return <div className="flex items-center justify-center min-h-screen">Redirecionando...</div>;
};

const App = () => (
  <HelmetProvider>
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Suspense fallback={null}>
              <Toaster />
              <Sonner />
            </Suspense>
            <BrowserRouter>
              <ScrollToTop />
              <Suspense fallback={null}>
                <GoogleAnalytics />
                <PageviewTracker />
              </Suspense>
              <Suspense fallback={<PageSkeleton />}>
                <Routes>
                  {/* Marketing Pages */}
                  <Route path="/" element={<Index />} />
                  <Route path="/backup" element={<Navigate to="/" replace />} />
                  <Route path="/lp2" element={<LP2 />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/builder-vs-seller-qual-seu-perfil" element={<Navigate to="/blog/builder-ou-seller-cofundador" replace />} />
                  <Route path="/blog/:slug" element={<BlogArticle />} />
                  <Route path="/aceleracao-old" element={<DoOrDie />} />
                  <Route path="/aceleracao" element={<Aceleracao2 />} />
                  <Route path="/aceleracaoty" element={<AceleracaoThankYou />} />
                  <Route path="/aceleracao2" element={<Navigate to="/aceleracao" replace />} />
                  <Route path="/do-or-die" element={<Navigate to="/aceleracao" replace />} />
                  <Route path="/success-stories" element={<SuccessStoriesPage />} />
                  <Route path="/historias-de-sucesso" element={<Navigate to="/success-stories" replace />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/manifesto" element={<Manifesto />} />
                  
                  {/* Persona Pages */}
                  <Route path="/builders" element={<Builders />} />
                  <Route path="/sellers" element={<Sellers />} />
                  <Route path="/starters" element={<Starters />} />
                  <Route path="/iniciantes" element={<Navigate to="/starters" replace />} />
                  <Route path="/investors" element={<Investors />} />
                  <Route path="/desenvolvedores" element={<Navigate to="/builders" replace />} />
                  <Route path="/vendedores" element={<Navigate to="/sellers" replace />} />
                  <Route path="/investidores" element={<Navigate to="/investors" replace />} />
                  
                  {/* Legal */}
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  
                  {/* Tools (Public) */}
                  <Route path="/ferramentas-empreendedores" element={<Tools />} />
                  <Route path="/tools" element={<Navigate to="/ferramentas-empreendedores" replace />} />
                  <Route path="/tools/*" element={<ToolsRedirect />} />
                  <Route path="/calculadora-de-equity" element={<EquityCalculator />} />
                  <Route path="/ferramentas-empreendedores/equity-calculator" element={<Navigate to="/calculadora-de-equity" replace />} />
                  <Route path="/ferramentas-empreendedores/runway-calculator" element={<RunwayCalculator />} />
                  <Route path="/ferramentas-empreendedores/contract-generator" element={<ContractGenerator />} />
                  <Route path="/ferramentas-empreendedores/archetype-quiz" element={<ArchetypeQuiz />} />
                  <Route path="/ferramentas-empreendedores/unit-economics" element={<UnitEconomicsCalculator />} />
                  <Route path="/ferramentas-empreendedores/valuation-calculator" element={<ValuationCalculator />} />
                  <Route path="/ferramentas-empreendedores/cap-table" element={<CapTableSimulator />} />
                  <Route path="/ferramentas-empreendedores/burn-rate-optimizer" element={<BurnRateOptimizer />} />
                  <Route path="/ferramentas-empreendedores/business-model" element={<BusinessModelCanvas />} />
                  <Route path="/ferramentas-empreendedores/tam-sam-som" element={<TamSamSomCalculator />} />
                  <Route path="/ferramentas-empreendedores/empathy-map" element={<EmpathyMapGenerator />} />
                  <Route path="/ferramentas-empreendedores/swot" element={<SwotAnalysis />} />
                  <Route path="/ferramentas-empreendedores/customer-dev" element={<CustomerDevelopment />} />
                  <Route path="/ferramentas-empreendedores/lgpd-guide" element={<LgpdGuide />} />
                  <Route path="/ferramentas-empreendedores/recruiting-guide" element={<RecruitingGuide />} />
                  <Route path="/ferramentas-empreendedores/dataroom-guide" element={<DataRoomGuide />} />
                  <Route path="/ferramentas-empreendedores/mvp-vibecoding" element={<MvpVibecoding />} />
                  <Route path="/ferramentas-empreendedores/knowledge-roadmap" element={<KnowledgeRoadmap />} />
                  <Route path="/ferramentas-empreendedores/guilda-ia-mvp" element={<GuildaIaMvpBuilder />} />
                  <Route path="/crie-seu-mvp" element={<CrieSeuMvp />} />
                  <Route path="/ferramentas-empreendedores/cold-outreach" element={<ColdOutreachGenerator />} />
                  <Route path="/ferramentas-empreendedores/markup-calculator" element={<MarkupCalculator />} />
                  <Route path="/ferramentas-empreendedores/card-fee-simulator" element={<CardFeeSimulator />} />
                  <Route path="/ferramentas-empreendedores/breakeven-calculator" element={<BreakevenCalculator />} />
                  <Route path="/ferramentas-empreendedores/roi-calculator" element={<RoiCalculator />} />
                  <Route path="/ferramentas-empreendedores/proposal-generator" element={<ProposalGenerator />} />
                  <Route path="/ferramentas-empreendedores/business-health-quiz" element={<BusinessHealthQuiz />} />
                  <Route path="/ferramentas-empreendedores/company-opening-checklist" element={<CompanyOpeningChecklist />} />
                  
                  {/* Short URL redirects */}
                  <Route path="/swot" element={<Navigate to="/ferramentas-empreendedores/swot" replace />} />
                  <Route path="/canvas" element={<Navigate to="/ferramentas-empreendedores/business-model" replace />} />
                  <Route path="/equity" element={<Navigate to="/calculadora-de-equity" replace />} />
                  <Route path="/runway" element={<Navigate to="/ferramentas-empreendedores/runway-calculator" replace />} />
                  <Route path="/contrato" element={<Navigate to="/ferramentas-empreendedores/contract-generator" replace />} />
                  
                  {/* Marketing Admin Console - MUST be before /admin/* redirect */}
                  <Route path="/mkt-admin/login" element={<AdminLogin />} />
                  <Route path="/mkt-admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="blog" element={<BlogAdmin />} />
                    <Route path="blog/new" element={<BlogEditor />} />
                    <Route path="blog/:id" element={<BlogEditor />} />
                    <Route path="sitemap" element={<SitemapAdmin />} />
                    <Route path="seo" element={<SEOAdmin />} />
                    <Route path="tracking" element={<TrackingAdmin />} />
                    <Route path="banners" element={<BannersAdmin />} />
                  </Route>
                  
                  {/* Social Payment Callback - handles magic link from marketing signup */}
                  <Route path="/social-payment-callback" element={<SocialPaymentCallback />} />
                  
                  {/* Redirect auth/app routes to Core App */}
                  <Route path="/auth" element={<RedirectToApp path="/auth" />} />
                  <Route path="/tavern" element={<RedirectToApp path="/tavern" />} />
                  <Route path="/taverna" element={<RedirectToApp path="/tavern" />} />
                  <Route path="/messages" element={<RedirectToApp path="/messages" />} />
                  <Route path="/profile/*" element={<RedirectToApp path="/tavern" />} />
                  <Route path="/settings" element={<RedirectToApp path="/settings" />} />
                  <Route path="/projects/*" element={<RedirectToApp path="/tavern" />} />
                  <Route path="/admin/*" element={<RedirectToApp path="/admin" />} />
                  <Route path="/onboarding" element={<RedirectToApp path="/onboarding" />} />
                  <Route path="/aceleracao/aplicar" element={<RedirectToApp path="/aceleracao/aplicar" />} />
                  <Route path="/aceleracao/inscrever" element={<RedirectToApp path="/aceleracao/inscrever" />} />
                  
                  {/* Jobs page - public listing */}
                  <Route path="/vagas" element={<Jobs />} />
                  <Route path="/vagas/:id" element={<JobDetail />} />
                  <Route path="/jobs" element={<Navigate to="/vagas" replace />} />
                  
                  
                  {/* Startups page - public showcase */}
                  <Route path="/startups" element={<Startups />} />
                  <Route path="/startups/:slug" element={<StartupDetail />} />
                  <Route path="/projetos" element={<RedirectToApp path="/tavern" />} />
                  
                  {/* Link in bio */}
                  <Route path="/links" element={<Links />} />
                  
                  {/* Guilda PRO - redirect to core app */}
                  <Route path="/pro" element={<RedirectToApp path="" />} />
                  
                  {/* Quiz Empreendedor */}
                  <Route path="/quiz-empreendedor" element={<QuizEmpreendedor />} />
                  <Route path="/quiz-cofundador" element={<Navigate to="/quiz-empreendedor" replace />} />
                  
                  {/* Jobs Feed XML redirect */}
                  <Route path="/api/jobs-feed.xml" element={<RedirectToJobsFeed />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </I18nextProvider>
  </HelmetProvider>
);

export default App;
