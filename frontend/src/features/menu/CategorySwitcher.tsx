import { useEffect, useRef } from 'react';
import type { Category } from '@/types/api';

export interface CategorySwitcherProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  className?: string;
}

export function CategorySwitcher({
  categories,
  activeCategoryId,
  onSelectCategory,
  className = '',
}: CategorySwitcherProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll the active chip into view inside the horizontal switcher
  useEffect(() => {
    if (activeBtnRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const btn = activeBtnRef.current;
      const btnLeft = btn.offsetLeft;
      const btnWidth = btn.offsetWidth;
      const containerWidth = container.offsetWidth;
      const targetScroll = btnLeft - containerWidth / 2 + btnWidth / 2;

      if (typeof container.scrollTo === 'function') {
        container.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: 'smooth',
        });
      } else {
        container.scrollLeft = Math.max(0, targetScroll);
      }
    }
  }, [activeCategoryId]);

  const allCategories = [{ id: 'all', name: 'All Items' }, ...categories];

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % allCategories.length;
      onSelectCategory(allCategories[nextIndex]!.id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + allCategories.length) % allCategories.length;
      onSelectCategory(allCategories[prevIndex]!.id);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onSelectCategory(allCategories[0]!.id);
    } else if (e.key === 'End') {
      e.preventDefault();
      onSelectCategory(allCategories[allCategories.length - 1]!.id);
    }
  };

  return (
    <nav
      aria-label="Menu categories"
      className={`sticky top-16 z-30 w-full border-b border-border-normal bg-surface-translucent backdrop-blur-md transition-all ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={scrollContainerRef}
          role="tablist"
          aria-label="Filter menu by category"
          className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {allCategories.map((cat, idx) => {
            const isActive = activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                ref={isActive ? activeBtnRef : null}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onSelectCategory(cat.id)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`flex-shrink-0 rounded-full px-4 py-2 font-medium text-xs sm:text-sm transition-all duration-200 outline-none select-none min-h-touch flex items-center justify-center
                  focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2
                  ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-beautiful-sm font-semibold scale-100'
                      : 'bg-surface-secondary/70 text-content-secondary hover:bg-surface-secondary hover:text-content-primary active:scale-95'
                  }
                `}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default CategorySwitcher;
