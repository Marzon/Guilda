import { memo } from 'react';
import type { Archetype } from '@/types/archetype';
import { CompanyBuildingTrack } from './CompanyBuildingTrack';
import { LearningGuideTrack } from './LearningGuideTrack';

interface RecommendationsTabProps {
  archetype: Archetype | undefined;
  hasProjects: boolean;
  projectStatus?: 'IDEA' | 'MVP' | 'SCALE';
}

export const RecommendationsTab = memo(function RecommendationsTab({
  archetype,
  hasProjects,
  projectStatus,
}: RecommendationsTabProps) {
  if (hasProjects) {
    return (
      <CompanyBuildingTrack 
        archetype={archetype} 
        projectStatus={projectStatus}
      />
    );
  }

  return <LearningGuideTrack archetype={archetype} />;
});
