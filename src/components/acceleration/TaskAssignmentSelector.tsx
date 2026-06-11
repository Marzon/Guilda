import { Hammer, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AssignedTo, AccelerationTeam } from "@/hooks/useAccelerationTeam";
import { useLanguage } from "@/hooks/useLanguage";

interface TaskAssignmentSelectorProps {
  team: AccelerationTeam;
  currentAssignment: AssignedTo;
  onAssign: (assignedTo: AssignedTo) => void;
  disabled?: boolean;
}

export const TaskAssignmentSelector = ({
  team,
  currentAssignment,
  onAssign,
  disabled
}: TaskAssignmentSelectorProps) => {
  const { t } = useLanguage();

  const options: { value: AssignedTo; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'builder',
      label: 'Builder',
      icon: <Hammer className="w-4 h-4" />,
      description: team.builder?.username ? `@${team.builder.username}` : t("acceleration.team.noBuilder", "Não atribuído"),
    },
    {
      value: 'seller',
      label: 'Seller',
      icon: <DollarSign className="w-4 h-4" />,
      description: team.seller?.username ? `@${team.seller.username}` : t("acceleration.team.noSeller", "Não atribuído"),
    },
    {
      value: 'both',
      label: t("acceleration.assignment.both", "Ambos"),
      icon: <Users className="w-4 h-4" />,
      description: t("acceleration.assignment.bothDescription", "Os dois entregam"),
    },
  ];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
      <p className="text-xs font-medium text-slate-500 mb-2">
        {t("acceleration.assignment.whoWillDo", "Quem vai fazer esta tarefa?")}
      </p>
      <div className="flex gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onAssign(option.value)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 h-auto py-2 transition-all",
              currentAssignment === option.value
                ? "border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-200"
                : "hover:border-slate-300"
            )}
          >
            <div className={cn(
              "flex items-center gap-1.5",
              currentAssignment === option.value ? "text-purple-600" : "text-slate-600"
            )}>
              {option.icon}
              <span className="font-medium text-sm">{option.label}</span>
            </div>
            <span className={cn(
              "text-[10px]",
              currentAssignment === option.value ? "text-purple-500" : "text-slate-400"
            )}>
              {option.description}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};
