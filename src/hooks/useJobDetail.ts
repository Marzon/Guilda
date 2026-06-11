import { useQuery } from "@tanstack/react-query";
import { Job, useOpenJobs } from "@/hooks/usePlatformStats";

export const useJobDetail = (jobId: string | undefined) => {
  const { jobs, isLoading: isLoadingAll } = useOpenJobs();

  const job = jobs.find((j: Job) => j.id === jobId) || null;

  return {
    job,
    isLoading: isLoadingAll,
    isNotFound: !isLoadingAll && !job,
  };
};
