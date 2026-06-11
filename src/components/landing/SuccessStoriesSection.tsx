import { useTranslation } from "react-i18next";
import { useSuccessStories } from "@/hooks/useSuccessStories";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { Card, CardContent } from "@/components/ui/card";
import { SmartAvatar } from "@/components/GuildaAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Rocket, Quote } from "lucide-react";
import { Link } from "react-router-dom";

export function SuccessStoriesSection() {
  const { t } = useTranslation();
  const { featuredStories, isLoadingFeatured } = useSuccessStories();
  const { data: stats, isLoading: isLoadingStats } = usePlatformStats();

  const showMetricsFallback = !isLoadingFeatured && featuredStories.length === 0;

  if (isLoadingFeatured || isLoadingStats) {
    return (
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (showMetricsFallback) {
    return null;
  }

  return (
    <section className="py-10 sm:py-24 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 border border-black/10 text-[#7610DC] px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Trophy className="h-4 w-4" />
            {t('landing.successStories.badge', 'Histórias de Sucesso')}
          </div>
          <h2
            className="text-[1.75rem] sm:text-4xl md:text-5xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-4"
            style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
          >
            {t('landing.successStories.title', 'Fundadores que se encontraram na Guilda')}
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-[1.6]">
            {t('landing.successStories.subtitle', 'Co-fundadores, parceiros e times que nasceram de conexões feitas aqui')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredStories.map((story) => (
            <Card key={story.id} className="bg-white border border-black/10 hover:border-[#7610DC]/30 transition-colors duration-300 shadow-none">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center">
                    <div className="relative">
                      <SmartAvatar
                        avatarUrl={story.founder_1?.avatar_url}
                        name={story.founder_1?.username || ''}
                        archetype={story.founder_1?.archetype as "BUILDER" | "SELLER"}
                        size="lg"
                        className="ring-4 ring-white"
                      />
                    </div>
                    <div className="w-8 h-8 bg-[#7610DC] rounded-full flex items-center justify-center -mx-2 z-10 ring-2 ring-white">
                      <span className="text-white text-sm font-bold">+</span>
                    </div>
                    <div className="relative">
                      <SmartAvatar
                        avatarUrl={story.founder_2?.avatar_url}
                        name={story.founder_2?.username || ''}
                        archetype={story.founder_2?.archetype as "BUILDER" | "SELLER"}
                        size="lg"
                        className="ring-4 ring-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className="font-semibold text-black">
                    @{story.founder_1?.username}
                    <span className="text-gray-400 mx-2">&</span>
                    @{story.founder_2?.username}
                  </p>
                  {story.project && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
                      <Rocket className="h-3.5 w-3.5" />
                      {story.project.title}
                    </p>
                  )}
                </div>

                {story.result_summary && (
                  <div className="border border-black/10 rounded-2xl p-4 text-center">
                    <Quote className="h-4 w-4 text-[#7610DC] mx-auto mb-2" />
                    <p className="text-sm italic text-gray-500">"{story.result_summary}"</p>
                  </div>
                )}

                <div className="flex justify-center mt-4">
                  <span className="text-xs border border-black/10 text-[#7610DC] px-3 py-1 rounded-full">
                    {story.partnership_type === 'cofounder' && 'Co-fundadores'}
                    {story.partnership_type === 'contractor' && 'Contratação'}
                    {story.partnership_type === 'advisor' && 'Advisor'}
                    {story.partnership_type === 'investor' && 'Investimento'}
                    {story.partnership_type === 'other' && 'Parceria'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 space-y-3">
          <Link
            to="/success-stories"
            className="inline-flex items-center gap-2 text-[#7610DC] hover:underline font-medium"
          >
            {t('landing.successStories.viewAll', 'Ver todas as histórias')} →
          </Link>
          <div>
            <Link
              to="/auth?view=signup"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-[#7610DC] transition-colors text-sm"
            >
              {t('landing.successStories.cta', 'Encontre seu co-fundador também')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
