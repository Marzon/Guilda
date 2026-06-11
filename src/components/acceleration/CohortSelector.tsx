import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CohortOption {
  id: string;
  name: string;
  status: string;
}

interface CohortSelectorProps {
  cohorts: CohortOption[];
  selectedCohortId: string;
  onCohortChange: (cohortId: string) => void;
}

export function CohortSelector({ cohorts, selectedCohortId, onCohortChange }: CohortSelectorProps) {
  const { t } = useLanguage();

  if (cohorts.length <= 1) {
    return null;
  }

  const selectedCohort = cohorts.find(c => c.id === selectedCohortId);

  return (
    <Select value={selectedCohortId} onValueChange={onCohortChange}>
      <SelectTrigger 
        className="w-auto min-w-[140px] bg-white/10 border-white/20 text-white hover:bg-white/20 focus:ring-white/30"
      >
        <SelectValue>
          {selectedCohort?.name || t("acceleration.selectBatch", "Selecionar batch")}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="z-[250]">
        {cohorts.map((cohort) => (
          <SelectItem key={cohort.id} value={cohort.id}>
            {cohort.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
