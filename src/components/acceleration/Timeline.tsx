import { Check, Lock, AlertCircle, Clock, Trophy, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { AccelerationPhase, AccelerationTask } from "@/hooks/useAccelerationSchedule";
import { ROUTES } from "@/lib/routes";

interface TimelineProps {
  currentDay: number;
  phases: AccelerationPhase[];
  submissionsByTask: Map<string, 'APPROVED' | 'REJECTED' | 'PENDING' | null>;
  onTaskClick?: (task: AccelerationTask) => void;
  selectedTaskId?: string | null;
}

export const Timeline = ({ currentDay, phases, submissionsByTask, onTaskClick, selectedTaskId }: TimelineProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const getTaskStatus = (task: AccelerationTask) => {
    if (task.day_number > currentDay) return 'locked';
    const submission = submissionsByTask.get(task.id);
    if (!submission && task.day_number < currentDay) return 'skipped';
    if (!submission && task.day_number === currentDay) return 'current';
    return submission?.toLowerCase() || 'current';
  };

  // Group tasks by day for display
  const getTasksGroupedByDay = () => {
    const allTasks: { task: AccelerationTask; phase: AccelerationPhase }[] = [];
    
    for (const phase of phases) {
      for (const task of phase.tasks || []) {
        allTasks.push({ task, phase });
      }
    }
    
    // Sort by day_number, then order_index
    allTasks.sort((a, b) => 
      a.task.day_number === b.task.day_number 
        ? a.task.order_index - b.task.order_index 
        : a.task.day_number - b.task.day_number
    );
    
    return allTasks;
  };

  const allTasks = getTasksGroupedByDay();
  
  // Get unique days for phase headers
  const getPhaseForDay = (day: number) => {
    return phases.find(p => day >= p.start_day && day <= p.end_day);
  };

  // Track which phases and days we've already shown headers for
  let lastPhaseId: string | null = null;
  let lastDayNumber: number | null = null;

  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
      <h3 className="text-sm font-mono text-green-400 mb-4 uppercase tracking-wider">
        {t("acceleration.timeline.title", "PROGRESSO")}
      </h3>
      
      <div className="space-y-1">
        {allTasks.map(({ task, phase }) => {
          const status = getTaskStatus(task);
          const isFirstOfPhase = lastPhaseId !== phase.id;
          const isFirstOfDay = lastDayNumber !== task.day_number;
          const isSelected = selectedTaskId === task.id;
          
          // Count tasks in this day
          const tasksInDay = allTasks.filter(t => t.task.day_number === task.day_number);
          const hasMultipleTasks = tasksInDay.length > 1;
          const taskIndexInDay = tasksInDay.findIndex(t => t.task.id === task.id) + 1;
          
          lastPhaseId = phase.id;
          lastDayNumber = task.day_number;
          
          return (
            <div key={task.id}>
              {/* Phase header */}
              {isFirstOfPhase && (
                <div 
                  className="py-2 px-2 mt-2 mb-1 rounded text-xs font-bold uppercase tracking-wide"
                  style={{ 
                    backgroundColor: `${phase.color || '#6366f1'}20`,
                    color: phase.color || '#6366f1',
                    borderLeft: `3px solid ${phase.color || '#6366f1'}`,
                  }}
                >
                  {phase.name}
                </div>
              )}
              
              {/* Task item */}
              <button
                onClick={() => status !== 'locked' && onTaskClick?.(task)}
                disabled={status === 'locked'}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded transition-all font-mono text-sm",
                  status === 'locked' && "opacity-40 cursor-not-allowed",
                  status === 'approved' && "bg-green-500/10 text-green-400 hover:bg-green-500/20",
                  status === 'rejected' && "bg-red-500/10 text-red-400 hover:bg-red-500/20 animate-pulse",
                  status === 'pending' && "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20",
                  status === 'current' && "bg-purple-500/20 text-purple-300 border border-purple-500/50 hover:bg-purple-500/30",
                  status === 'skipped' && "bg-slate-800/50 text-slate-500",
                  status !== 'locked' && "cursor-pointer",
                  isSelected && "ring-2 ring-purple-400 ring-offset-1 ring-offset-slate-900"
                )}
              >
                {/* Status icon */}
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0",
                  status === 'locked' && "bg-slate-700 text-slate-500",
                  status === 'approved' && "bg-green-500 text-black",
                  status === 'rejected' && "bg-red-500 text-white",
                  status === 'pending' && "bg-yellow-500 text-black",
                  status === 'current' && "bg-purple-500 text-white",
                  status === 'skipped' && "bg-slate-700 text-slate-500"
                )}>
                  {status === 'locked' && <Lock className="w-3 h-3" />}
                  {status === 'approved' && <Check className="w-3 h-3" />}
                  {status === 'rejected' && <AlertCircle className="w-3 h-3" />}
                  {status === 'pending' && <Clock className="w-3 h-3" />}
                  {status === 'current' && task.day_number}
                  {status === 'skipped' && task.day_number}
                </div>

                {/* Task label */}
                <div className="flex-1 text-left">
                  <span className="block">
                    {t("acceleration.timeline.day", "Dia")} {task.day_number}
                    {hasMultipleTasks && (
                      <span className="text-xs opacity-70 ml-1">
                        ({taskIndexInDay}/{tasksInDay.length})
                      </span>
                    )}
                  </span>
                  {hasMultipleTasks && (
                    <span className="text-xs opacity-70 truncate block max-w-[150px]">
                      {task.title}
                    </span>
                  )}
                </div>

                {/* Status label */}
                <span className="text-xs opacity-70">
                  {status === 'locked' && "🔒"}
                  {status === 'approved' && "✓"}
                  {status === 'rejected' && "!"}
                  {status === 'pending' && "⏳"}
                  {status === 'current' && "→"}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Completion indicator */}
      {currentDay > 15 && (
        <div className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-500/50 flex items-center gap-2 text-green-400">
          <Trophy className="w-5 h-5" />
          <span className="font-bold text-sm">
            {t("acceleration.timeline.completed", "PROGRAMA CONCLUÍDO!")}
          </span>
        </div>
      )}

      {/* Canvas link */}
      <button
        onClick={() => navigate(ROUTES.startupCanvas)}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors text-sm font-medium"
      >
        <Building2 className="w-4 h-4" />
        {t("canvas.viewConstruction", "Ver Construção")}
      </button>
    </div>
  );
};
