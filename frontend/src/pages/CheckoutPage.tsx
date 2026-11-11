import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function CheckoutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border-normal bg-surface-primary p-8 shadow-beautiful-sm text-center">
        <h1 className="text-2xl font-bold text-content-primary">Demonstration Checkout</h1>
        <p className="mt-2 text-xs text-content-secondary max-w-md mx-auto">
          Review your items and place a server-verified demo order. (No payment is charged. Wired in
          Phase 4).
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/cart">
            <Button variant="secondary" size="md">
              Return to Cart
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
