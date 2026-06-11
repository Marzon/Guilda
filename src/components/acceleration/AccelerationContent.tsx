import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Loader2, ChevronRight, ChevronLeft, Menu, Building2, Play, CheckCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAccelerationPhases, AccelerationPhase, AccelerationTask } from "@/hooks/useAccelerationSchedule";
import { useAccelerationProgress } from "@/hooks/useAccelerationProgress";
import { useAccelerationTeam } from "@/hooks/useAccelerationTeam";
import { useTestMode } from "@/hooks/useTestMode";
import { useBatchManagerAccess } from "@/hooks/useBatchManagerAccess";
import { useFounderVideos } from "@/hooks/useCohortVideos";
import { Timeline } from "./Timeline";
import { MissionArea } from "./MissionArea";
import { CommanderTerminal } from "./CommanderTerminal";
import { TestModeBar } from "./TestModeBar";
import { BatchManagerBar } from "./BatchManagerBar";
import { TeamHeader } from "./TeamHeader";
import { TaskAssignmentSelector } from "./TaskAssignmentSelector";
import { FounderManual } from "./FounderManual";
import { CountdownBanner } from "./CountdownBanner";
import { WaitingMessage } from "./WaitingMessage";
import { PivoterDialog } from "./pivoter/PivoterDialog";
import { VideoOverlay, VideoRewatchButton } from "./VideoOverlay";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { CohortSelector, type CohortOption } from "./CohortSelector";
import { getCurrentSaoPauloDate } from "@/lib/timezone";
// Day number for "O Veredito" task that triggers the Pivoter analysis
const VEREDITO_DAY = 15;

interface AccelerationContentProps {
  cohortId: string;
  cohortName?: string | null;
  cohortStartDate?: string | null;
  userId: string;
  // NEW: Props for cohort navigation
  availableCohorts?: CohortOption[];
  onCohortChange?: (cohortId: string) => void;
}

export const AccelerationContent = ({ 
  cohortId, 
  cohortName, 
  cohortStartDate, 
  userId,
  availableCohorts,
  onCohortChange,
}: AccelerationContentProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { phases, isLoading: phasesLoading } = useAccelerationPhases(cohortId);
  const { 
    progress, 
    submissions,
    progressLoading, 
    initializeProgress,
    submitTask,
    cancelSubmission,
    isInitialized 
  } = useAccelerationProgress(userId, cohortId);

  // Team hook
  const {
    team,
    teamLoading,
    hasTeam,
    updateStartupName,
    updateMemorandum,
    updateChecklistProgress,
    assignTask,
    getTaskAssignment,
    isUserAssigned,
  } = useAccelerationTeam(userId, cohortId);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [mobileTimelineOpen, setMobileTimelineOpen] = useState(false);
  const [pivoterDialogOpen, setPivoterDialogOpen] = useState(false);
  const [videoOverlayOpen, setVideoOverlayOpen] = useState(false);
  const [activeVideoDay, setActiveVideoDay] = useState<number | null>(null);
  
  // Track if we've already shown the Pivoter dialog for this session
  const hasShownPivoterDialog = useRef(false);
  // Track which videos we've auto-shown this session
  const shownVideosDays = useRef<Set<number>>(new Set());

  // Video hooks
  const {
    getVideoForDay,
    getUnwatchedVideoForDay,
    hasWatchedVideo,
    markWatched,
  } = useFounderVideos(userId, cohortId);

  // Check if program has started (using São Paulo timezone)
  const isProgramStarted = useMemo(() => {
    if (!cohortStartDate) return true; // Default to started if no date
    
    // Parse the date string as a local date (not UTC)
    const [year, month, day] = cohortStartDate.split('-').map(Number);
    const startDate = new Date(year, month - 1, day, 0, 0, 0);
    const now = getCurrentSaoPauloDate();
    
    return now >= startDate;
  }, [cohortStartDate]);

  // Test mode for admins/batch managers
  const { canUseTestMode, isAdmin, skipTask, goToDay } = useTestMode(userId, cohortId);
  
  // Batch manager access
  const { 
    isBatchManager, 
    hasTestProgress, 
    startTestMode 
  } = useBatchManagerAccess(userId, cohortId);

  // Initialize progress if not exists
  useEffect(() => {
    if (!progressLoading && !isInitialized && userId && cohortId) {
      initializeProgress.mutate();
    }
  }, [progressLoading, isInitialized, userId, cohortId]);

  // Get all tasks sorted by day and order
  const allTasks = useMemo(() => {
    const tasks: (AccelerationTask & { phaseName: string; phaseColor: string })[] = [];
    for (const phase of phases) {
      for (const task of phase.tasks || []) {
        tasks.push({ ...task, phaseName: phase.name, phaseColor: phase.color });
      }
    }
    return tasks.sort((a, b) => 
      a.day_number === b.day_number 
        ? a.order_index - b.order_index 
        : a.day_number - b.day_number
    );
  }, [phases]);

  // Build submissions map by task ID
  const submissionsByTask = useMemo(() => {
    const map = new Map<string, 'APPROVED' | 'REJECTED' | 'PENDING' | null>();
    for (const submission of submissions) {
      map.set(submission.task_id, submission.status as 'APPROVED' | 'REJECTED' | 'PENDING');
    }
    return map;
  }, [submissions]);

  // Set selected task to first incomplete task of current day when progress loads
  useEffect(() => {
    if (progress?.current_day && selectedTaskId === null && allTasks.length > 0) {
      // Find first incomplete task for the current day
      const currentDayTasks = allTasks.filter(t => t.day_number === progress.current_day);
      const incompleteTask = currentDayTasks.find(t => {
        const status = submissionsByTask.get(t.id);
        return !status || status === 'REJECTED';
      });
      
      // If all tasks are done, just select the first task of current day
      const taskToSelect = incompleteTask || currentDayTasks[0] || allTasks[0];
      if (taskToSelect) {
        setSelectedTaskId(taskToSelect.id);
      }
    }
  }, [progress?.current_day, selectedTaskId, allTasks, submissionsByTask]);

  // Get current task based on selected task ID
  const currentTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return allTasks.find(t => t.id === selectedTaskId) || null;
  }, [selectedTaskId, allTasks]);

  // Get current submission for selected task
  const currentSubmission = useMemo(() => {
    if (!selectedTaskId) return null;
    return submissions.find(s => s.task_id === selectedTaskId) || null;
  }, [selectedTaskId, submissions]);

  // Get previous attempts (all except latest)
  const previousAttempts = useMemo(() => {
    if (!currentTask) return [];
    return submissions
      .filter(s => s.task_id === currentTask.id && s.id !== currentSubmission?.id)
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }, [currentTask, submissions, currentSubmission]);

  // Terminal status
  const terminalStatus = useMemo(() => {
    if (!currentSubmission) return 'idle';
    switch (currentSubmission.status) {
      case 'APPROVED': return 'approved';
      case 'REJECTED': return 'rejected';
      case 'PENDING': return 'pending';
      default: return 'idle';
    }
  }, [currentSubmission]);

  // Check if Veredito (day 15) task is approved
  const vereditoTask = useMemo(() => {
    return allTasks.find(t => t.day_number === VEREDITO_DAY);
  }, [allTasks]);

  const isVereditoApproved = useMemo(() => {
    if (!vereditoTask) return false;
    return submissionsByTask.get(vereditoTask.id) === 'APPROVED';
  }, [vereditoTask, submissionsByTask]);

  // Auto-open Pivoter dialog when "O Veredito" (day 15) task is approved
  // This triggers both on status change AND on initial load if already approved
  useEffect(() => {
    if (
      currentTask?.day_number === VEREDITO_DAY &&
      terminalStatus === 'approved' &&
      !hasShownPivoterDialog.current
    ) {
      // Small delay to let the user see the approval first
      const timer = setTimeout(() => {
        setPivoterDialogOpen(true);
        hasShownPivoterDialog.current = true;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentTask?.day_number, terminalStatus]);

  // Auto-show unwatched videos when user enters a new day
  useEffect(() => {
    if (!currentTask || !progress?.current_day) return;
    
    const dayToCheck = currentTask.day_number;
    
    // Check welcome video (day 0) only on first day
    if (dayToCheck === 1 && !shownVideosDays.current.has(0)) {
      const welcomeVideo = getUnwatchedVideoForDay(0);
      if (welcomeVideo) {
        setActiveVideoDay(0);
        setVideoOverlayOpen(true);
        shownVideosDays.current.add(0);
        return;
      }
    }
    
    // Check daily video
    if (!shownVideosDays.current.has(dayToCheck)) {
      const dailyVideo = getUnwatchedVideoForDay(dayToCheck);
      if (dailyVideo) {
        setActiveVideoDay(dayToCheck);
        setVideoOverlayOpen(true);
        shownVideosDays.current.add(dayToCheck);
      }
    }
  }, [currentTask?.day_number, progress?.current_day, getUnwatchedVideoForDay]);

  // Get current day's video for rewatch button
  const currentDayVideo = useMemo(() => {
    if (!currentTask) return null;
    return getVideoForDay(currentTask.day_number);
  }, [currentTask, getVideoForDay]);

  const welcomeVideo = useMemo(() => getVideoForDay(0), [getVideoForDay]);

  const handleWatchVideo = (dayNumber: number) => {
    setActiveVideoDay(dayNumber);
    setVideoOverlayOpen(true);
  };

  const handleVideoWatched = (videoId: string, completed: boolean, durationSeconds?: number) => {
    markWatched.mutate({ videoId, completed, durationSeconds });
  };

  const activeVideo = activeVideoDay !== null ? getVideoForDay(activeVideoDay) : null;

  // Handle task submission
  const handleSubmit = (content: string, fileUrl?: string) => {
    if (!currentTask) return;
    submitTask.mutate({ taskId: currentTask.id, content, fileUrl });
  };

  // Handle cancel submission
  const handleCancelSubmission = (submissionId: string) => {
    cancelSubmission.mutate(submissionId);
  };

  // Handle task click from timeline
  const handleTaskClick = (task: AccelerationTask) => {
    setSelectedTaskId(task.id);
    setMobileTimelineOpen(false);
  };

  // Navigation helpers
  const totalDays = phases.length > 0 ? Math.max(...phases.map(p => p.end_day)) : 15;
  // Cap currentDay at totalDays for display (when completed, current_day is totalDays + 1)
  const currentDay = Math.min(progress?.current_day || 1, totalDays);
  
  // Find current task index in allTasks
  const currentTaskIndex = currentTask ? allTasks.findIndex(t => t.id === currentTask.id) : -1;
  
  // Can navigate to previous task if it's within accessible days
  const canGoBack = currentTaskIndex > 0 && allTasks[currentTaskIndex - 1]?.day_number <= currentDay;
  const canGoForward = currentTaskIndex >= 0 && currentTaskIndex < allTasks.length - 1 && 
    allTasks[currentTaskIndex + 1]?.day_number <= currentDay;

  const handlePrevTask = () => {
    if (canGoBack && currentTaskIndex > 0) {
      setSelectedTaskId(allTasks[currentTaskIndex - 1].id);
    }
  };

  const handleNextTask = () => {
    if (canGoForward && currentTaskIndex < allTasks.length - 1) {
      setSelectedTaskId(allTasks[currentTaskIndex + 1].id);
    }
  };

  // Cohort selector header - shown even during loading/empty states for navigation
  const cohortSelectorHeader = availableCohorts && availableCohorts.length > 1 && onCohortChange ? (
    <div className="bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white mb-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
          <h2 className="text-xl sm:text-2xl font-bold truncate">
            {cohortName 
              ? t("acceleration.welcomeMessage", "Bem-vindo ao programa {{cohortName}}!").replace("{{cohortName}}", cohortName)
              : t("acceleration.welcome", "Bem-vindo ao programa de Aceleração!")
            }
          </h2>
        </div>
        <CohortSelector
          cohorts={availableCohorts}
          selectedCohortId={cohortId}
          onCohortChange={onCohortChange}
        />
      </div>
    </div>
  ) : null;

  if (phasesLoading || progressLoading || teamLoading) {
    return (
      <div className="space-y-4">
        {cohortSelectorHeader}
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  if (phases.length === 0) {
    return (
      <div className="space-y-4">
        {cohortSelectorHeader}
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <GraduationCap className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-600">
            {t("acceleration.noPhases", "Programa ainda não configurado")}
          </h3>
          <p className="text-sm text-slate-400 mt-2">
            {t("acceleration.noPhasesDescription", "O cronograma do programa será disponibilizado em breve.")}
          </p>
        </div>
      </div>
    );
  }

  const timelineComponent = (
    <Timeline
      currentDay={currentDay}
      phases={phases}
      submissionsByTask={submissionsByTask}
      onTaskClick={handleTaskClick}
      selectedTaskId={selectedTaskId}
    />
  );

  // Pre-program state - show countdown and expanded manual
  if (!isProgramStarted && cohortStartDate) {
    return (
      <div className="space-y-4">
        {/* Batch selector for admin/batch managers */}
        {cohortSelectorHeader}
        
        <CountdownBanner startDate={cohortStartDate} />
        
        <FounderManual
          isProgramStarted={false}
          team={team}
          onUpdateName={(name) => updateStartupName.mutate(name)}
          onUpdateMemorandum={(memo) => updateMemorandum.mutate(memo)}
          onUpdateChecklist={(checklist) => updateChecklistProgress.mutate(checklist)}
          isUpdatingName={updateStartupName.isPending}
          isUpdatingMemorandum={updateMemorandum.isPending}
        />
        
        <WaitingMessage />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Batch Manager Bar - Only for batch managers testing the journey */}
      {isBatchManager && (
        <BatchManagerBar userId={userId} cohortId={cohortId} />
      )}
      
      {/* Test Mode Bar - Only for admins/batch managers */}
      {canUseTestMode && (
        <TestModeBar
          currentDay={currentDay}
          totalDays={totalDays}
          currentTaskId={selectedTaskId}
          onSkipTask={() => {
            if (selectedTaskId) {
              skipTask.mutate({ taskId: selectedTaskId, currentDay });
            }
          }}
          onGoToDay={(day) => goToDay.mutate(day)}
          isSkipping={skipTask.isPending}
          isChangingDay={goToDay.isPending}
          isAdmin={isAdmin}
        />
      )}

      {/* Welcome header */}
      <div className="bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold truncate">
              {cohortName 
                ? t("acceleration.welcomeMessage", "Bem-vindo ao programa {{cohortName}}!").replace("{{cohortName}}", cohortName)
                : t("acceleration.welcome", "Bem-vindo ao programa de Aceleração!")
              }
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Cohort Selector for batch managers and admins */}
            {availableCohorts && availableCohorts.length > 1 && onCohortChange && (
              <CohortSelector
                cohorts={availableCohorts}
                selectedCohortId={cohortId}
                onCohortChange={onCohortChange}
              />
            )}
            {/* Welcome video rewatch button */}
            {welcomeVideo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleWatchVideo(0)}
                className="text-purple-100 hover:text-white hover:bg-white/10 gap-1.5"
              >
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">{t("acceleration.video.intro", "Intro")}</span>
                {hasWatchedVideo(welcomeVideo.id) && <CheckCircle className="w-3 h-3" />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.startupCanvas)}
              className="text-purple-100 hover:text-white hover:bg-white/10 gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t("canvas.viewCanvas", "Ver Construção")}</span>
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-purple-100 opacity-90 text-sm sm:text-base">
            {t("acceleration.dayProgress", "Dia {{current}} de {{total}}")
              .replace("{{current}}", currentDay.toString())
              .replace("{{total}}", totalDays.toString())}
          </p>
          {/* Daily video rewatch button */}
          {currentDayVideo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleWatchVideo(currentTask?.day_number || 1)}
              className="text-purple-100 hover:text-white hover:bg-white/10 gap-1.5 text-xs"
            >
              <Play className="w-3.5 h-3.5" />
              {t("acceleration.video.todayVideo", "Vídeo do dia")}
              {hasWatchedVideo(currentDayVideo.id) && <CheckCircle className="w-3 h-3" />}
            </Button>
          )}
        </div>
      </div>

      {/* Founder Manual - Collapsed after program starts */}
      <FounderManual
        isProgramStarted={true}
        team={team}
        onUpdateName={(name) => updateStartupName.mutate(name)}
        onUpdateMemorandum={(memo) => updateMemorandum.mutate(memo)}
        onUpdateChecklist={(checklist) => updateChecklistProgress.mutate(checklist)}
        isUpdatingName={updateStartupName.isPending}
        isUpdatingMemorandum={updateMemorandum.isPending}
      />

      {/* Main content */}
      <div className="lg:grid lg:grid-cols-[280px,1fr] lg:gap-6">
        {/* Desktop Timeline - Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-4">
            {timelineComponent}
          </div>
        </div>

        {/* Mobile Timeline Toggle + Navigation */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center gap-2">
            <Sheet open={mobileTimelineOpen} onOpenChange={setMobileTimelineOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex-shrink-0">
                  <Menu className="w-4 h-4 mr-2" />
                  {t("acceleration.timeline.title", "Progresso")}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] p-4 overflow-y-auto">
                <div className="mt-6">
                  {timelineComponent}
                </div>
              </SheetContent>
            </Sheet>

            {/* Task navigation */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              <Button
                variant="ghost"
                size="icon"
                disabled={!canGoBack}
                onClick={handlePrevTask}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[80px] text-center">
                {currentTask ? (
                  <>
                    {t("acceleration.timeline.day", "Dia")} {currentTask.day_number}
                  </>
                ) : (
                  t("acceleration.timeline.day", "Dia") + " " + currentDay
                )}
              </span>
              <Button
                variant="ghost"
                size="icon"
                disabled={!canGoForward}
                onClick={handleNextTask}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="space-y-3 sm:space-y-6 pb-24 lg:pb-0">
          {/* Team Header - Show if user has a team */}
          {hasTeam && team && (
            <TeamHeader
              team={team}
              onUpdateName={(name) => updateStartupName.mutate(name)}
              isUpdating={updateStartupName.isPending}
              currentUserId={userId}
            />
          )}

          {/* Task Assignment Selector - Show if user has a team */}
          {hasTeam && team && currentTask && (
            <TaskAssignmentSelector
              team={team}
              currentAssignment={getTaskAssignment(currentTask.id)}
              onAssign={(assignedTo) => assignTask.mutate({ taskId: currentTask.id, assignedTo })}
              disabled={!!currentSubmission && currentSubmission.status !== 'REJECTED'}
            />
          )}

          {/* Mission Area */}
          <MissionArea
            task={currentTask}
            phaseName={currentTask?.phaseName}
            phaseColor={currentTask?.phaseColor}
            onSubmit={handleSubmit}
            onCancelSubmission={handleCancelSubmission}
            isSubmitting={submitTask.isPending}
            isCancelling={cancelSubmission.isPending}
            previousAttempts={previousAttempts}
            currentSubmission={currentSubmission}
            isUserAssigned={currentTask ? isUserAssigned(currentTask.id) : true}
          />

          {/* Commander Terminal */}
          <CommanderTerminal
            feedback={currentSubmission?.ai_feedback || null}
            status={terminalStatus}
            isLoading={submitTask.isPending}
            taskTitle={currentTask?.title}
          />

          {/* Button to open Pivoter if Veredito is approved */}
          {isVereditoApproved && (
            <Button
              onClick={() => setPivoterDialogOpen(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <span className="mr-2">✨</span>
              {t("acceleration.pivoter.openAnalysis", "Ver Análise do Guilda Pivoter")}
            </Button>
          )}
        </div>
      </div>

      {/* Pivoter Dialog - Opens after "O Veredito" task is approved */}
      <PivoterDialog
        open={pivoterDialogOpen}
        onOpenChange={setPivoterDialogOpen}
        userId={userId}
        cohortId={cohortId}
        submissionId={currentSubmission?.id}
      />

      {/* Video Overlay - For daily videos and welcome video */}
      <VideoOverlay
        video={activeVideo}
        open={videoOverlayOpen}
        onOpenChange={setVideoOverlayOpen}
        onWatched={handleVideoWatched}
        autoPlay={true}
      />
    </div>
  );
};
