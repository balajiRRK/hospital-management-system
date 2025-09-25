import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyAppointmentsListSkeleton() {
  return (
    <Card className="h-full self-start">
      <CardContent className="p-6">
        {/* Skeleton for title */}
        <Skeleton className="mb-4 h-6 w-48 rounded-md" />

        {/* Skeletons for the list of appointments */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-11/12 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
