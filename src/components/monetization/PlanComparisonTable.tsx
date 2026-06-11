import { Fragment } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Check, X, Infinity, Gift } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FeatureValue = 'check' | 'x' | 'unlimited' | 'limited' | '1/day' | '100/month' | '1';

interface Feature {
  key: string;
  scout: FeatureValue;
  social: FeatureValue;
  founder: FeatureValue;
}

interface Category {
  key: string;
  features: Feature[];
}

const comparisonData: Category[] = [
  {
    key: 'connect',
    features: [
      { key: 'searchCoFounders', scout: 'limited', social: 'unlimited', founder: 'unlimited' },
      { key: 'sendMatches', scout: '1/day', social: 'unlimited', founder: 'unlimited' },
      { key: 'unlimitedChat', scout: '100/month', social: 'unlimited', founder: 'unlimited' },
      { key: 'contactsBeforeAccept', scout: 'x', social: 'check', founder: 'check' },
    ],
  },
  {
    key: 'visibility',
    features: [
      { key: 'profileViewers', scout: 'x', social: 'check', founder: 'check' },
      { key: 'tavernHighlight', scout: 'x', social: 'check', founder: 'check' },
      { key: 'verifiedBadge', scout: 'x', social: 'check', founder: 'check' },
    ],
  },
  {
    key: 'tools',
    features: [
      { key: 'arsenalAccess', scout: 'limited', social: 'check', founder: 'check' },
      { key: 'aiMatchFinder', scout: 'x', social: 'check', founder: 'check' },
      { key: 'unlimitedProjects', scout: '1', social: 'unlimited', founder: 'unlimited' },
    ],
  },
  {
    key: 'acceleration',
    features: [
      { key: 'doOrDie', scout: 'x', social: 'check', founder: 'check' },
      { key: 'aiMentorship', scout: 'x', social: 'check', founder: 'check' },
    ],
  },
];

const ValueCell = ({ value, t }: { value: FeatureValue; t: (key: string) => string }) => {
  switch (value) {
    case 'check':
      return <Check className="w-5 h-5 text-green-500 mx-auto" />;
    case 'x':
      return <X className="w-5 h-5 text-slate-400 mx-auto" />;
    case 'unlimited':
      return (
        <div className="flex items-center justify-center gap-1 text-green-500 font-medium">
          <Infinity className="w-4 h-4" />
        </div>
      );
    case 'limited':
      return <span className="text-slate-500 text-sm">{t('pricing.comparison.values.limited')}</span>;
    case '1/day':
      return <span className="text-slate-500 text-sm">{t('pricing.comparison.values.onePerDay')}</span>;
    case '100/month':
      return <span className="text-slate-500 text-sm">{t('pricing.comparison.values.hundredPerMonth')}</span>;
    case '1':
      return <span className="text-slate-500 text-sm">1</span>;
    default:
      return null;
  }
};

const SocialValueCell = ({ value, t }: { value: FeatureValue; t: (key: string) => string }) => {
  switch (value) {
    case 'check':
      return <Check className="w-5 h-5 text-green-400 mx-auto" />;
    case 'x':
      return <X className="w-5 h-5 text-pink-300 mx-auto" />;
    case 'unlimited':
      return (
        <div className="flex items-center justify-center gap-1 text-green-400 font-medium">
          <Infinity className="w-4 h-4" />
        </div>
      );
    case 'limited':
      return <span className="text-pink-200 text-sm">{t('pricing.comparison.values.limited')}</span>;
    case '1/day':
      return <span className="text-pink-200 text-sm">{t('pricing.comparison.values.onePerDay')}</span>;
    case '100/month':
      return <span className="text-pink-200 text-sm">{t('pricing.comparison.values.hundredPerMonth')}</span>;
    case '1':
      return <span className="text-pink-200 text-sm">1</span>;
    default:
      return null;
  }
};

const FounderValueCell = ({ value, t }: { value: FeatureValue; t: (key: string) => string }) => {
  switch (value) {
    case 'check':
      return <Check className="w-5 h-5 text-green-400 mx-auto" />;
    case 'x':
      return <X className="w-5 h-5 text-slate-600 mx-auto" />;
    case 'unlimited':
      return (
        <div className="flex items-center justify-center gap-1 text-green-400 font-medium">
          <Infinity className="w-4 h-4" />
        </div>
      );
    case 'limited':
      return <span className="text-purple-300 text-sm">{t('pricing.comparison.values.limited')}</span>;
    case '1/day':
      return <span className="text-purple-300 text-sm">{t('pricing.comparison.values.onePerDay')}</span>;
    case '100/month':
      return <span className="text-purple-300 text-sm">{t('pricing.comparison.values.hundredPerMonth')}</span>;
    case '1':
      return <span className="text-purple-300 text-sm">1</span>;
    default:
      return null;
  }
};

export const PlanComparisonTable = () => {
  const { t, currentLanguage } = useLanguage();
  const lang = currentLanguage as 'pt' | 'en' | 'es';

  return (
    <div className="mt-16 mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          {t('pricing.comparison.title')}
        </h2>
        <p className="text-slate-500">
          {t('pricing.comparison.subtitle')}
        </p>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-2/5 font-semibold text-slate-900">
                  {t('pricing.feature')}
                </TableHead>
                <TableHead className="text-center font-semibold text-slate-600 w-1/5">
                  Scout
                  <span className="block text-xs font-normal text-slate-400">R$ 39,90/{lang === 'pt' ? 'mês' : lang === 'es' ? 'mes' : 'mo'}</span>
                </TableHead>
                <TableHead className="text-center font-semibold text-white w-1/5 bg-gradient-to-r from-purple-600 to-pink-600">
                  <div className="flex items-center justify-center gap-1">
                    <Gift className="w-4 h-4" />
                    Social
                  </div>
                  <span className="block text-xs font-normal text-purple-100">R$ 0/6 {lang === 'pt' ? 'meses' : lang === 'es' ? 'meses' : 'months'}</span>
                </TableHead>
                <TableHead className="text-center font-semibold text-purple-600 w-1/5 bg-purple-50">
                  Founder
                  <span className="block text-xs font-normal text-purple-400">R$ 899,90/{lang === 'pt' ? 'sem' : lang === 'es' ? 'sem' : '6mo'}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((category) => (
                <Fragment key={category.key}>
                  {/* Category Header */}
                  <TableRow className="bg-slate-100 hover:bg-slate-100">
                    <TableCell 
                      colSpan={4} 
                      className="font-semibold text-slate-700 py-3 text-sm uppercase tracking-wider"
                    >
                      {t(`pricing.comparison.categories.${category.key}`)}
                    </TableCell>
                  </TableRow>
                  {/* Features */}
                  {category.features.map((feature) => (
                    <TableRow key={feature.key} className="hover:bg-slate-50">
                      <TableCell className="text-slate-700">
                        {t(`pricing.comparison.features.${feature.key}`)}
                      </TableCell>
                      <TableCell className="text-center">
                        <ValueCell value={feature.scout} t={t} />
                      </TableCell>
                      <TableCell className="text-center bg-gradient-to-r from-purple-50 to-pink-50">
                        <SocialValueCell value={feature.social} t={t} />
                      </TableCell>
                      <TableCell className="text-center bg-purple-50/50">
                        <FounderValueCell value={feature.founder} t={t} />
                      </TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
