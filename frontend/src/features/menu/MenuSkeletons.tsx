import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertCircle, RotateCcw, Coffee } from 'lucide-react';

export function MenuPageSkeleton() {
  return (
    <div className="w-full space-y-12 animate-pulse py-8">
      {/* Category switcher skeleton */}
      <div className="flex items-center gap-3 overflow-hidden py-3">
        <Skeleton variant="rounded" width={90} height={36} />
        <Skeleton variant="rounded" width={110} height={36} />
        <Skeleton variant="rounded" width={130} height={36} />
        <Skeleton variant="rounded" width={100} height={36} />
        <Skeleton variant="rounded" width={120} height={36} />
      </div>

      {/* Category section 1 */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton variant="text" width={180} height={32} />
          <Skeleton variant="text" width={260} height={18} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-border-normal bg-surface-primary p-4 space-y-4"
            >
              <Skeleton variant="rounded" height={180} className="w-full" />
              <div className="space-y-2">
                <Skeleton variant="text" width="70%" height={24} />
                <Skeleton variant="text" width="90%" height={16} />
              </div>
              <div className="flex justify-between items-center pt-2">
                <Skeleton variant="text" width={60} height={20} />
                <Skeleton variant="rounded" width={70} height={32} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category section 2 */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton variant="text" width={150} height={32} />
          <Skeleton variant="text" width={220} height={18} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-border-normal bg-surface-primary p-4 space-y-4"
            >
              <Skeleton variant="rounded" height={180} className="w-full" />
              <div className="space-y-2">
                <Skeleton variant="text" width="70%" height={24} />
                <Skeleton variant="text" width="90%" height={16} />
              </div>
              <div className="flex justify-between items-center pt-2">
                <Skeleton variant="text" width={60} height={20} />
                <Skeleton variant="rounded" width={70} height={32} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export interface MenuErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function MenuErrorState({
  message = 'We could not load the cafe menu right now.',
  onRetry,
}: MenuErrorStateProps) {
  return (
    <div className="py-20 flex justify-center px-4">
      <div className="max-w-md w-full rounded-3xl border border-border-normal bg-surface-primary p-8 sm:p-10 shadow-beautiful-md text-center flex flex-col items-center">
        <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-content-primary mb-2">Unable to Load Menu</h2>
        <p className="text-sm text-content-secondary leading-relaxed mb-6">{message}</p>
        <Button
          variant="primary"
          size="md"
          onClick={onRetry}
          leftIcon={<RotateCcw className="h-4 w-4" />}
          className="shadow-beautiful-sm"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}

export function CategoryEmptyState({
  categoryName,
  onResetCategory,
}: {
  categoryName?: string;
  onResetCategory?: () => void;
}) {
  return (
    <EmptyState
      icon={<Coffee className="h-8 w-8 text-brand-primary" />}
      title="No items in this category yet"
      description={
        categoryName
          ? `We are currently crafting new specialty recipes for ${categoryName}. Check back soon or view all other offerings.`
          : 'No items found matching your criteria.'
      }
      action={
        onResetCategory ? (
          <Button variant="secondary" size="sm" onClick={onResetCategory}>
            View All Categories
          </Button>
        ) : undefined
      }
      className="py-16"
    />
  );
}
