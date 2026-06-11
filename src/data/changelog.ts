export interface ChangelogChange {
  type: 'feature' | 'improvement' | 'fix' | 'security';
  titleKey: string; // i18n key
  descriptionKey?: string; // i18n key
}

export interface ChangelogEntry {
  version: string;
  date: string; // YYYY-MM-DD
  highlightKey?: string; // i18n key for summary
  changes: ChangelogChange[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '3.5.0',
    date: '2025-01-23',
    highlightKey: 'changelog.v3_5_0.highlight',
    changes: [
      { type: 'feature', titleKey: 'changelog.v3_5_0.pivoterAgent' },
      { type: 'feature', titleKey: 'changelog.v3_5_0.pivoterDialog' },
      { type: 'feature', titleKey: 'changelog.v3_5_0.accelerationFAQ' },
      { type: 'improvement', titleKey: 'changelog.v3_5_0.faqFormatting' },
      { type: 'improvement', titleKey: 'changelog.v3_5_0.premiumFAQ' },
      { type: 'improvement', titleKey: 'changelog.v3_5_0.socialPaymentDocs' },
      { type: 'fix', titleKey: 'changelog.v3_5_0.pivoterDialogScroll' },
    ]
  },
  {
    version: '3.0.0',
    date: '2025-01-19',
    highlightKey: 'changelog.v3_0_0.highlight',
    changes: [
      { type: 'feature', titleKey: 'changelog.v3_0_0.accelerationProtocol' },
      { type: 'feature', titleKey: 'changelog.v3_0_0.cohortSystem' },
      { type: 'feature', titleKey: 'changelog.v3_0_0.accelerationTab' },
      { type: 'feature', titleKey: 'changelog.v3_0_0.enrollmentPage' },
      { type: 'feature', titleKey: 'changelog.v3_0_0.roleEditing' },
      { type: 'feature', titleKey: 'changelog.v3_0_0.enrichedApplications' },
      { type: 'feature', titleKey: 'changelog.v3_0_0.founderManual' },
      { type: 'feature', titleKey: 'changelog.v3_0_0.interviewGuides' },
      { type: 'improvement', titleKey: 'changelog.v3_0_0.projectTabs' },
      { type: 'improvement', titleKey: 'changelog.v3_0_0.mobileResponsiveness' },
      { type: 'fix', titleKey: 'changelog.v3_0_0.showcaseRolesVisibility' },
    ]
  },
  {
    version: '2.0.0',
    date: '2025-01-15',
    highlightKey: 'changelog.v2_0_0.highlight',
    changes: [
      { type: 'feature', titleKey: 'changelog.v2_0_0.pwaUpdate' },
      { type: 'feature', titleKey: 'changelog.v2_0_0.updatePreferences' },
      { type: 'improvement', titleKey: 'changelog.v2_0_0.versionDisplay' },
      { type: 'feature', titleKey: 'changelog.v2_0_0.changelog' },
    ]
  },
  {
    version: '1.9.0',
    date: '2025-01-10',
    changes: [
      { type: 'feature', titleKey: 'changelog.v1_9_0.aiMatching' },
      { type: 'improvement', titleKey: 'changelog.v1_9_0.performance' },
    ]
  },
];

export const getChangelogForVersion = (version: string): ChangelogEntry | undefined => 
  CHANGELOG.find(c => c.version === version);

export const getLatestChangelog = (): ChangelogEntry | undefined => 
  CHANGELOG[0];

export const getChangesSince = (fromVersion: string): ChangelogEntry[] => {
  const fromIndex = CHANGELOG.findIndex(c => c.version === fromVersion);
  if (fromIndex === -1) return CHANGELOG;
  return CHANGELOG.slice(0, fromIndex);
};
