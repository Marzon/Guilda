import { Skeleton } from "@/components/ui/skeleton";

export const PageSkeleton = () => {
  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="glass p-6 rounded-xl mb-8 border-2 border-primary/20">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass p-6 rounded-xl border-2 border-primary/20">
              <div className="relative mb-4">
                <Skeleton className="w-20 h-20 rounded-full mx-auto" />
                <Skeleton className="absolute top-0 right-1/4 h-6 w-12 rounded-full" />
              </div>
              <div className="text-center mb-4 space-y-2">
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-5 w-20 mx-auto" />
              </div>
              <div className="space-y-2 mb-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5 mx-auto" />
                <Skeleton className="h-4 w-3/5 mx-auto" />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
