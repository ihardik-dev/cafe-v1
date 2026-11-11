import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Calendar } from 'lucide-react';

export function ReservationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Table Bookings</h1>
          <p className="text-xs text-content-secondary">
            All times scheduled in Asia/Kolkata (IST)
          </p>
        </div>
        <Link to="/reservations/new">
          <Button variant="primary" size="md">
            Book a Table
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-border-normal bg-surface-primary p-8 text-center shadow-beautiful-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-secondary text-brand-primary mb-3">
          <Calendar className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-content-primary">No Active Reservations</p>
        <p className="mt-1 text-xs text-content-secondary max-w-sm mx-auto">
          Book a table for 1–6 guests. Cancellations are permitted with 24 hours advance notice.
          (Phase 7).
        </p>
      </div>
    </div>
  );
}

export default ReservationsPage;
