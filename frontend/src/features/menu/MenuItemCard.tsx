import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { MenuItem } from '@/types/api';
import { formatINR } from '@/lib/money';
import { getProductImageUrl } from '@/lib/productImage';
import { useCartStore } from '@/features/cart/cartStore';
import { Button } from '@/components/ui/Button';
import { Stepper } from '@/components/ui/Stepper';
import { Plus, Check } from 'lucide-react';

export interface MenuItemCardProps {
  item: MenuItem;
  className?: string;
}

export function MenuItemCard({ item, className = '' }: MenuItemCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const cartItem = useCartStore((state) => state.items.find((i) => i.menuItemId === item.id));
  const add = useCartStore((state) => state.add);
  const setQuantity = useCartStore((state) => state.setQuantity);

  const isAvailable = item.availability === 'AVAILABLE';
  const resolvedImageUrl = getProductImageUrl(item.name, item.image);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAvailable) return;
    add({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      image: resolvedImageUrl,
      categoryName: item.category?.name,
    });
  };

  const handleQuantityChange = (newQty: number) => {
    setQuantity(item.id, newQty);
  };

  return (
    <article
      aria-label={`${item.name}, ${formatINR(item.price)}`}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border-normal bg-surface-primary shadow-beautiful-sm transition-all duration-300 hover:shadow-beautiful-md hover:-translate-y-0.5 ${
        !isAvailable ? 'opacity-75' : ''
      } ${className}`}
    >
      <div>
        {/* Clickable Image Container linking to /menu/:id */}
        <Link
          to={`/menu/${item.id}`}
          className="relative block aspect-[16/11] w-full overflow-hidden bg-surface-secondary outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          {/* Skeleton placeholder while loading image */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-surface-secondary animate-pulse" />
          )}

          <img
            src={imageError ? '/products/placeholder.svg' : resolvedImageUrl}
            alt={item.name}
            width={400}
            height={275}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              !imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {/* Availability badge */}
          {!isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
              <span className="rounded-full bg-surface-primary px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-content-primary shadow-beautiful-sm">
                Sold Out
              </span>
            </div>
          )}

          {/* In-cart indicator chip */}
          {cartItem && isAvailable && (
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-brand-primary text-white text-xs font-bold px-2.5 py-1 shadow-beautiful-sm">
              <Check className="h-3 w-3" />
              <span>{cartItem.quantity} in cart</span>
            </div>
          )}
        </Link>

        {/* Content details */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-bold tracking-tight text-content-primary group-hover:text-brand-primary transition-colors line-clamp-1">
              <Link to={`/menu/${item.id}`} className="outline-none focus-visible:underline">
                {item.name}
              </Link>
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-content-secondary line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
            {item.description}
          </p>
        </div>
      </div>

      {/* Footer: Price + Cart Controls */}
      <div className="flex items-center justify-between gap-3 border-t border-border-subdued px-5 py-4 bg-surface-secondary/20">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium uppercase tracking-wider text-content-tertiary">
            Price
          </span>
          <span className="font-mono text-base sm:text-lg font-extrabold text-content-primary">
            {formatINR(item.price)}
          </span>
        </div>

        {/* Action: Stepper if in cart, otherwise Add button */}
        {isAvailable ? (
          cartItem ? (
            <Stepper
              value={cartItem.quantity}
              onChange={handleQuantityChange}
              min={0}
              max={10}
              size="sm"
              ariaLabel={`Quantity of ${item.name}`}
            />
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddToCart}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              className="shadow-beautiful-sm"
              aria-label={`Add ${item.name} to cart`}
            >
              Add
            </Button>
          )
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled
            className="cursor-not-allowed opacity-60 text-xs"
          >
            Unavailable
          </Button>
        )}
      </div>
    </article>
  );
}

export default MenuItemCard;
