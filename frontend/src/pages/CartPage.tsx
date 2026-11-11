import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/features/cart/cartStore';

export function CartPage() {
  const { itemCount } = useCartStore();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-content-primary mb-6">Your Shopping Cart</h1>

      {itemCount === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" />}
          title="Your Cart is Empty"
          description="Looks like you haven't added any coffees or pastries yet."
          actionLabel="Explore Our Menu"
          onAction={() => (window.location.href = '/menu')}
        />
      ) : (
        <div className="rounded-2xl border border-border-normal bg-surface-primary p-6 shadow-beautiful-sm space-y-4">
          <p className="text-sm text-content-secondary">
            You have {itemCount} item(s) in your cart. (Cart checkout flow wired in Phase 4).
          </p>
          <div className="pt-4 flex justify-end gap-3">
            <Link to="/checkout">
              <Button variant="primary" size="md">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
