import { Card, CardContent } from "@/components/ui/card";
import { SmartAvatar } from "@/components/GuildaAvatar";
import { Rocket, Quote, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SuccessStory } from "@/hooks/useSuccessStories";

interface SuccessStoryCardProps {
  story: SuccessStory;
  onClick?: () => void;
  isFeatured?: boolean;
}

export function SuccessStoryCard({ story, onClick, isFeatured }: SuccessStoryCardProps) {
  const { t } = useTranslation();

  const getPartnershipLabel = (type: string | null) => {
    switch (type) {
      case 'cofounder': return t('successStoriesPage.partnershipTypes.cofounder', 'Co-fundadores');
      case 'contractor': return t('successStoriesPage.partnershipTypes.contractor', 'Contratação');
      case 'advisor': return t('successStoriesPage.partnershipTypes.advisor', 'Advisor');
      case 'investor': return t('successStoriesPage.partnershipTypes.investor', 'Investidor');
      case 'other': return t('successStoriesPage.partnershipTypes.other', 'Parceria');
      default: return t('successStoriesPage.partnershipTypes.other', 'Parceria');
    }
  };

  return (
    <Card 
      className={`bg-background/60 backdrop-blur hover:shadow-lg transition-all cursor-pointer group ${
        isFeatured ? 'ring-2 ring-amber-400/50 shadow-amber-100' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Featured badge */}
        {isFeatured && (
          <div className="flex justify-center mb-3">
            <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              <Star className="h-3 w-3 fill-current" />
              {t('successStoriesPage.featured', 'Destaque')}
            </span>
          </div>
        )}

        {/* Founders avatars */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center">
            <SmartAvatar
              avatarUrl={story.founder_1?.avatar_url}
              name={story.founder_1?.username || ''}
              archetype={story.founder_1?.archetype as "BUILDER" | "SELLER"}
              size="lg"
              className="ring-4 ring-background group-hover:scale-105 transition-transform"
            />
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center -mx-2 z-10 ring-2 ring-background">
              <span className="text-primary-foreground text-sm font-bold">+</span>
            </div>
            <SmartAvatar
              avatarUrl={story.founder_2?.avatar_url}
              name={story.founder_2?.username || ''}
              archetype={story.founder_2?.archetype as "BUILDER" | "SELLER"}
              size="lg"
              className="ring-4 ring-background group-hover:scale-105 transition-transform"
            />
          </div>
        </div>

        {/* Usernames */}
        <div className="text-center mb-4">
          <p className="font-semibold">
            @{story.founder_1?.username}
            <span className="text-muted-foreground mx-2">&</span>
            @{story.founder_2?.username}
          </p>
          {story.project && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
              <Rocket className="h-3.5 w-3.5" />
              {story.project.title}
            </p>
          )}
        </div>

        {/* Result summary */}
        {story.result_summary && (
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Quote className="h-4 w-4 text-primary mx-auto mb-2" />
            <p className="text-sm italic line-clamp-3">"{story.result_summary}"</p>
          </div>
        )}

        {/* Partnership type badge */}
        <div className="flex justify-center mt-4">
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
            {getPartnershipLabel(story.partnership_type)}
          </span>
        </div>

        {/* View details hint */}
        <p className="text-xs text-muted-foreground text-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {t('successStoriesPage.viewDetails', 'Clique para ver detalhes')}
        </p>
      </CardContent>
    </Card>
  );
}
