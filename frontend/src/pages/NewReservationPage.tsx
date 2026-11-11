import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export function NewReservationPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/reservations"
        className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-medium text-content-secondary hover:text-brand-primary mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Reservations</span>
      </Link>
      <div className="rounded-2xl border border-border-normal bg-surface-primary p-8 shadow-beautiful-sm text-center">
        <h1 className="text-xl font-bold text-content-primary">Reserve a Table</h1>
        <p className="mt-2 text-xs text-content-secondary">
          Select date, time in Asia/Kolkata, and party size (1 to 6 guests). (Form and validation
          wired in Phase 7).
        </p>
        <div className="mt-6">
          <Link to="/reservations">
            <Button variant="secondary" size="md">
              Cancel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NewReservationPage;
