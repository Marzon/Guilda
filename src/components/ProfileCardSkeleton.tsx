import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProfileCardSkeleton = () => {
  return (
    <Card className="glass border-2 border-border p-6">
      {/* Avatar & Level Badge */}
      <div className="relative mb-4">
        <Skeleton className="w-20 h-20 mx-auto rounded-full" />
        <Skeleton className="absolute top-0 right-1/4 w-12 h-6 rounded-full" />
      </div>

      {/* Username & Archetype */}
      <div className="text-center mb-4">
        <Skeleton className="h-6 w-32 mx-auto mb-2" />
        <Skeleton className="h-5 w-20 mx-auto" />
      </div>

      {/* Bio */}
      <div className="mb-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mx-auto" />
        <Skeleton className="h-4 w-4/6 mx-auto" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center">
          <Skeleton className="w-4 h-4 mx-auto mb-1" />
          <Skeleton className="h-3 w-10 mx-auto mb-1" />
          <Skeleton className="h-4 w-6 mx-auto" />
        </div>
        <div className="text-center">
          <Skeleton className="w-4 h-4 mx-auto mb-1" />
          <Skeleton className="h-3 w-10 mx-auto mb-1" />
          <Skeleton className="h-4 w-6 mx-auto" />
        </div>
        <div className="text-center">
          <Skeleton className="w-4 h-4 mx-auto mb-1" />
          <Skeleton className="h-3 w-12 mx-auto mb-1" />
          <Skeleton className="h-4 w-6 mx-auto" />
        </div>
      </div>

      {/* Connect Button */}
      <Skeleton className="h-10 w-full" />
    </Card>
  );
};
