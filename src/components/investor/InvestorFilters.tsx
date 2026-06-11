import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface InvestorFiltersProps {
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  selectedSectors: string[];
  setSelectedSectors: (sectors: string[]) => void;
  onlyOnline: boolean;
  setOnlyOnline: (value: boolean) => void;
}

const INVESTOR_TYPES = [
  { value: "ANGEL", labelKey: "investor.type.ANGEL" },
  { value: "SEED", labelKey: "investor.type.SEED" },
  { value: "SERIES_A", labelKey: "investor.type.SERIES_A" },
  { value: "SERIES_B_PLUS", labelKey: "investor.type.SERIES_B_PLUS" },
  { value: "MULTI_STAGE", labelKey: "investor.type.MULTI_STAGE" },
];

const INVESTOR_SECTORS = [
  { value: "FINTECH", labelKey: "investor.sector.FINTECH" },
  { value: "SAAS", labelKey: "investor.sector.SAAS" },
  { value: "HEALTHTECH", labelKey: "investor.sector.HEALTHTECH" },
  { value: "EDTECH", labelKey: "investor.sector.EDTECH" },
  { value: "ECOMMERCE", labelKey: "investor.sector.ECOMMERCE" },
  { value: "LOGISTICS", labelKey: "investor.sector.LOGISTICS" },
  { value: "AGTECH", labelKey: "investor.sector.AGTECH" },
  { value: "OTHER", labelKey: "investor.sector.OTHER" },
];

export const InvestorFilters = ({
  selectedTypes,
  setSelectedTypes,
  selectedSectors,
  setSelectedSectors,
  onlyOnline,
  setOnlyOnline,
}: InvestorFiltersProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = selectedTypes.length + selectedSectors.length + (onlyOnline ? 1 : 0);

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleSectorToggle = (sector: string) => {
    if (selectedSectors.includes(sector)) {
      setSelectedSectors(selectedSectors.filter((s) => s !== sector));
    } else {
      setSelectedSectors([...selectedSectors, sector]);
    }
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedSectors([]);
    setOnlyOnline(false);
  };

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 h-auto"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="font-medium">
                {t("investor.filters.title", "Filtros")}
              </span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            {isOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="px-4 pb-4">
          <div className="space-y-4 pt-2 border-t">
            {/* Online toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="only-online" className="cursor-pointer">
                {t("investor.filters.onlyOnline", "Apenas online")}
              </Label>
              <Switch
                id="only-online"
                checked={onlyOnline}
                onCheckedChange={setOnlyOnline}
              />
            </div>

            {/* Investor Types */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t("investor.filters.type", "Tipo de Investidor")}
              </Label>
              <div className="flex flex-wrap gap-2">
                {INVESTOR_TYPES.map((type) => (
                  <Badge
                    key={type.value}
                    variant={selectedTypes.includes(type.value) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => handleTypeToggle(type.value)}
                  >
                    {t(type.labelKey, type.value)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sectors */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t("investor.filters.sectors", "Setores")}
              </Label>
              <div className="flex flex-wrap gap-2">
                {INVESTOR_SECTORS.map((sector) => (
                  <Badge
                    key={sector.value}
                    variant={selectedSectors.includes(sector.value) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => handleSectorToggle(sector.value)}
                  >
                    {t(sector.labelKey, sector.value)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="w-full text-muted-foreground"
              >
                <X className="w-4 h-4 mr-2" />
                {t("investor.filters.clear", "Limpar filtros")}
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
