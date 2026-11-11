import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Package } from 'lucide-react';

export function OrdersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-content-primary">Order History</h1>
        <Link to="/menu">
          <Button variant="primary" size="sm">
            Place New Order
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-border-normal bg-surface-primary p-8 text-center shadow-beautiful-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-secondary text-brand-primary mb-3">
          <Package className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-content-primary">No Previous Orders Yet</p>
        <p className="mt-1 text-xs text-content-secondary">
          Your orders with a 60-second cancellation window will appear here. (Implemented in Phase
          6).
        </p>
      </div>
    </div>
  );
}

export default OrdersPage;
