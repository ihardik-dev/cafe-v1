import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCategories, getMenuItems } from '@/api/menu';
import type { Category, MenuItem } from '@/types/api';
import {
  MenuItemCard,
  CategorySwitcher,
  MenuPageSkeleton,
  MenuErrorState,
  CategoryEmptyState,
} from '@/features/menu';
import { Coffee } from 'lucide-react';

export function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category')?.toLowerCase();

  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  // TanStack Query for categories and menu items
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const {
    data: menuItems = [],
    isLoading: isMenuLoading,
    isError: isMenuError,
    error: menuError,
    refetch: refetchMenu,
  } = useQuery<MenuItem[]>({
    queryKey: ['menu'],
    queryFn: () => getMenuItems(),
  });

  const isLoading = isCategoriesLoading || isMenuLoading;
  const isError = isCategoriesError || isMenuError;

  const handleRetryAll = () => {
    refetchCategories();
    refetchMenu();
  };

  // Group available items by category
  const groupedCategories = useMemo(() => {
    if (!categories.length) return [];

    const map = new Map<string, MenuItem[]>();
    categories.forEach((cat) => map.set(cat.id, []));

    const uncategorized: MenuItem[] = [];

    menuItems.forEach((item) => {
      if (item.categoryId && map.has(item.categoryId)) {
        map.get(item.categoryId)!.push(item);
      } else {
        uncategorized.push(item);
      }
    });

    const result = categories.map((cat) => ({
      category: cat,
      items: map.get(cat.id) || [],
    }));

    if (uncategorized.length > 0) {
      result.push({
        category: { id: 'other', name: 'Other Specialties', createdAt: '', updatedAt: '' },
        items: uncategorized,
      });
    }

    return result;
  }, [categories, menuItems]);

  // Handle URL "?category=" deep link on initial mount or param change
  useEffect(() => {
    if (!categoryParam || !categories.length) return;

    // Match by ID or by name slug
    const matchedCategory = categories.find(
      (c) =>
        c.id.toLowerCase() === categoryParam ||
        c.name.toLowerCase().replace(/\s+/g, '-') === categoryParam ||
        c.name.toLowerCase() === categoryParam,
    );

    if (matchedCategory) {
      setActiveCategoryId(matchedCategory.id);
      const targetElement = document.getElementById(`category-${matchedCategory.id}`);
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [categoryParam, categories]);

  // IntersectionObserver for scroll-spy highlighting
  useEffect(() => {
    if (isLoading || isError || !groupedCategories.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id.replace('category-', '');
            setActiveCategoryId(sectionId);
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      },
    );

    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isLoading, isError, groupedCategories]);

  // Click handler for category chip
  const handleSelectCategory = (categoryId: string) => {
    setActiveCategoryId(categoryId);

    if (categoryId === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const matchedCategory = categories.find((c) => c.id === categoryId);
    if (matchedCategory) {
      const slug = matchedCategory.name.toLowerCase().replace(/\s+/g, '-');
      setSearchParams({ category: slug }, { replace: true });
    }

    const targetElement = document.getElementById(`category-${categoryId}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Page Header */}
      <header className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border-subdued pb-8">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-brand-primary">
                <Coffee className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                Daily Roast & Kitchen
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-content-primary">
              Menu Offerings
            </h1>
            <p className="mt-2 text-sm sm:text-base text-content-secondary max-w-xl">
              Ethically sourced single origins, balanced house espresso blends, handcrafted teas,
              and artisanal bakery specials baked fresh daily.
            </p>
          </div>

          <div className="text-right hidden md:block">
            <span className="text-xs font-medium text-content-tertiary">
              Prices inclusive of applicable taxes in INR
            </span>
          </div>
        </div>
      </header>

      {/* Sticky Category Switcher (segmented control) */}
      {!isLoading && !isError && categories.length > 0 && (
        <CategorySwitcher
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Loading State */}
        {isLoading && <MenuPageSkeleton />}

        {/* Error State */}
        {isError && (
          <MenuErrorState
            message={
              (categoriesError as Error)?.message ||
              (menuError as Error)?.message ||
              'Unable to connect to the backend server. Please verify backend is running on port 4000.'
            }
            onRetry={handleRetryAll}
          />
        )}

        {/* Loaded Menu Sections */}
        {!isLoading && !isError && (
          <div className="space-y-16">
            {groupedCategories.map(({ category, items }) => (
              <section
                key={category.id}
                id={`category-${category.id}`}
                ref={(el) => {
                  if (el) sectionRefs.current.set(category.id, el);
                }}
                className="scroll-mt-36"
                aria-labelledby={`heading-category-${category.id}`}
              >
                {/* Category Header */}
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border-subdued pb-3 mb-6">
                  <h2
                    id={`heading-category-${category.id}`}
                    className="text-2xl sm:text-3xl font-extrabold tracking-tight text-content-primary"
                  >
                    {category.name}
                  </h2>
                  <span className="text-xs font-medium text-content-tertiary font-mono">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Items Grid or Empty State */}
                {items.length === 0 ? (
                  <CategoryEmptyState
                    categoryName={category.name}
                    onResetCategory={() => handleSelectCategory('all')}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MenuPage;
