import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMenuItem } from '@/api/menu';
import type { MenuItem } from '@/types/api';
import { formatINR } from '@/lib/money';
import { getProductImageUrl } from '@/lib/productImage';
import { useCartStore } from '@/features/cart/cartStore';
import { useToast } from '@/components/ui/ToastContext';
import { Button } from '@/components/ui/Button';
import { Stepper } from '@/components/ui/Stepper';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ArrowLeft, ShoppingBag, Check, AlertCircle, Coffee, ShieldCheck } from 'lucide-react';

export function MenuItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState<number>(1);
  const [imageError, setImageError] = useState<boolean>(false);

  const cartItem = useCartStore((state) =>
    id ? state.items.find((i) => i.menuItemId === id) : undefined,
  );
  const add = useCartStore((state) => state.add);
  const setStoreQuantity = useCartStore((state) => state.setQuantity);

  const {
    data: item,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MenuItem>({
    queryKey: ['menuItem', id],
    queryFn: () => getMenuItem(id!),
    enabled: !!id,
  });

  const isAvailable = item?.availability === 'AVAILABLE';
  const resolvedImageUrl = item ? getProductImageUrl(item.name, item.image) : '';

  const handleAddToCart = () => {
    if (!item || !isAvailable) return;
    add(
      {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        image: resolvedImageUrl,
        categoryName: item.category?.name,
      },
      quantity,
    );

    showToast(`${quantity} × ${item.name} added to your order`, 'success');
  };

  const handleUpdateCartQuantity = (newQty: number) => {
    if (!item) return;
    setStoreQuantity(item.id, newQty);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Skeleton variant="text" width={120} height={24} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
          <Skeleton variant="rounded" height={400} className="w-full rounded-3xl" />
          <div className="space-y-6">
            <Skeleton variant="text" width="60%" height={36} />
            <Skeleton variant="text" width="30%" height={28} />
            <Skeleton variant="text" width="100%" height={80} />
            <div className="pt-6">
              <Skeleton variant="rounded" width="50%" height={48} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found / Error State
  if (isError || !item) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={<AlertCircle className="h-10 w-10 text-destructive" />}
          title="Item Not Found"
          description={
            (error as Error)?.message ||
            'The requested menu item does not exist or is currently unavailable.'
          }
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/menu">
                <Button variant="primary" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Back to Menu
                </Button>
              </Link>
              <Button variant="secondary" size="md" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-xs font-medium text-content-secondary">
          <li>
            <Link to="/" className="hover:text-brand-primary min-h-touch flex items-center">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-content-tertiary">
            /
          </li>
          <li>
            <Link to="/menu" className="hover:text-brand-primary min-h-touch flex items-center">
              Menu
            </Link>
          </li>
          {item.category?.name && (
            <>
              <li aria-hidden="true" className="text-content-tertiary">
                /
              </li>
              <li>
                <Link
                  to={`/menu?category=${item.category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="hover:text-brand-primary min-h-touch flex items-center"
                >
                  {item.category.name}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true" className="text-content-tertiary">
            /
          </li>
          <li aria-current="page" className="font-bold text-content-primary truncate max-w-[200px]">
            {item.name}
          </li>
        </ol>
      </nav>

      {/* Main Product Presentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Large Product Image */}
        <div className="relative aspect-[16/11] sm:aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border-normal bg-surface-secondary shadow-beautiful-lg">
          <img
            src={imageError ? '/products/placeholder.svg' : resolvedImageUrl}
            alt={item.name}
            width={800}
            height={600}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-102"
          />

          {!isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px]">
              <span className="rounded-full bg-surface-primary px-4 py-1.5 font-mono text-sm font-bold uppercase tracking-wider text-content-primary shadow-beautiful-md">
                Currently Unavailable
              </span>
            </div>
          )}

          {item.category?.name && (
            <span className="absolute top-4 left-4 rounded-full bg-surface-primary/90 backdrop-blur-md border border-border-normal px-3 py-1 text-xs font-bold text-content-primary shadow-beautiful-sm">
              {item.category.name}
            </span>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="flex flex-col space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-light text-brand-primary">
                <Coffee className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                Fresh Roast Selection
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-content-primary leading-tight">
              {item.name}
            </h1>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-content-primary">
                {formatINR(item.price)}
              </span>
              <span className="text-xs text-content-tertiary font-medium">
                inclusive of all taxes
              </span>
            </div>
          </div>

          <div className="border-t border-b border-border-subdued py-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-content-tertiary mb-2">
              Description & Notes
            </h2>
            <p className="text-sm sm:text-base text-content-secondary leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Cart Control Section */}
          <div className="space-y-4 pt-2">
            {isAvailable ? (
              <div className="space-y-4">
                {cartItem ? (
                  <div className="rounded-2xl border border-border-normal bg-brand-light/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-primary flex items-center gap-1.5">
                        <Check className="h-4 w-4" />
                        <span>Item in your cart</span>
                      </span>
                      <span className="font-mono text-xs font-semibold text-content-secondary">
                        {cartItem.quantity} of 10
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-content-secondary">Adjust quantity:</span>
                      <Stepper
                        value={cartItem.quantity}
                        onChange={handleUpdateCartQuantity}
                        min={0}
                        max={10}
                        size="md"
                        ariaLabel={`Quantity of ${item.name} in cart`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <span className="text-xs font-medium text-content-secondary sm:hidden">
                        Quantity:
                      </span>
                      <Stepper
                        value={quantity}
                        onChange={setQuantity}
                        min={1}
                        max={10}
                        size="md"
                        ariaLabel="Order quantity"
                      />
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleAddToCart}
                      leftIcon={<ShoppingBag className="h-4 w-4" />}
                      className="w-full sm:flex-1 shadow-beautiful-md hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Add to Cart ({quantity})
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-content-tertiary pt-2">
                  <ShieldCheck className="h-4 w-4 text-brand-primary" />
                  <span>Maximum 10 items per order line for quality control</span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border-normal bg-surface-secondary/60 p-5 text-center space-y-2">
                <span className="text-sm font-bold text-content-primary">Temporarily Sold Out</span>
                <p className="text-xs text-content-secondary max-w-sm mx-auto">
                  Our roastery is preparing fresh batches. Please explore our other specialty brews.
                </p>
                <div className="pt-2">
                  <Link to="/menu">
                    <Button variant="secondary" size="sm">
                      View Available Items
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuItemDetailPage;
