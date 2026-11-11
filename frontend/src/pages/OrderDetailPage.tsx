import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/orders"
        className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-medium text-content-secondary hover:text-brand-primary mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Orders</span>
      </Link>
      <div className="rounded-2xl border border-border-normal bg-surface-primary p-8 shadow-beautiful-sm text-center">
        <h1 className="text-xl font-bold text-content-primary">Order Receipt</h1>
        <p className="mt-2 text-xs text-content-secondary">
          Order ID: <code className="bg-surface-secondary px-1.5 py-0.5 rounded">{id}</code>
        </p>
        <p className="mt-4 text-xs text-content-tertiary">
          (Order snapshot and cancellation countdown will be activated in Phase 6).
        </p>
      </div>
    </div>
  );
}

export default OrderDetailPage;
