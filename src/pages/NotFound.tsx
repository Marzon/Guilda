import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { LandingDarkNavbar } from "@/components/landing/LandingDarkNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Button } from "@/components/ui/button";
import { Compass, Map, Home, ArrowLeft } from "lucide-react";
import { getLocalizedPath } from "@/lib/localizedRoutes";

const NotFound = () => {
  const location = useLocation();
  const { t, currentLanguage } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#FFFBF7] flex flex-col">
      <LandingDarkNavbar />
      
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 display */}
          <div className="relative mb-8">
            <div className="relative">
              <div className="text-[120px] sm:text-[180px] font-bold text-[#4308B0]/10 leading-none select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[#7610DC] to-[#4308B0] rounded-full flex items-center justify-center shadow-xl">
                  <Compass className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A0B24]">
              {t('notFound.title')}
            </h1>
            <p className="text-[#0A0B24]/60 text-lg max-w-md mx-auto">
              {t('notFound.description')}
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm text-[#0A0B24]/50 border border-[#7610DC]/10">
              <Map className="w-4 h-4" />
              <code className="font-mono">{location.pathname}</code>
            </div>
          </div>

          {/* RPG message */}
          <div className="bg-white border border-[#7610DC]/10 rounded-xl p-6 mb-8 shadow-sm">
            <p className="text-[#0A0B24]/70 italic">
              "{t('notFound.rpgMessage')}"
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-[#F97316] hover:bg-[#F97316]/90 text-white rounded-xl"
            >
              <Link to="/">
                <Home className="w-5 h-5 mr-2" />
                {t('notFound.backHome')}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.history.back()}
              className="border-[#0A0B24]/20 text-[#0A0B24] hover:bg-[#0A0B24]/5 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('notFound.goBack')}
            </Button>
          </div>

          {/* Helpful links */}
          <div className="mt-12 pt-8 border-t border-[#0A0B24]/10">
            <p className="text-sm text-[#0A0B24]/50 mb-4">{t('notFound.helpfulLinks')}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/tavern" className="text-[#7610DC] hover:text-[#4308B0] hover:underline text-sm font-medium">
                {t('notFound.links.tavern')}
              </Link>
              <Link to="/startups" className="text-[#7610DC] hover:text-[#4308B0] hover:underline text-sm font-medium">
                Startups
              </Link>
              <Link to={getLocalizedPath("/tools", currentLanguage)} className="text-[#7610DC] hover:text-[#4308B0] hover:underline text-sm font-medium">
                {t('notFound.links.tools')}
              </Link>
              <Link to="/" className="text-[#7610DC] hover:text-[#4308B0] hover:underline text-sm font-medium">
                {t('notFound.links.pricing')}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default NotFound;
