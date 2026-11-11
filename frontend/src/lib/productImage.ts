/**
 * Product Image Resolution Utility
 *
 * Implements the resolution hierarchy defined in AGENT_CONTEXT Section 5 (Phase 4):
 * 1. Check if the backend provides an image URL or path in `item.image` or `item.imageUrl`.
 * 2. If missing or placeholder string, map the menu item name to a local asset in `/products/` by slug.
 * 3. Fall back gracefully to the neutral SVG placeholder `/products/placeholder.svg`.
 */

export function getProductImageUrl(name: string, backendImage?: string | null): string {
  // 1. Backend image field takes top priority if valid
  if (
    backendImage &&
    typeof backendImage === 'string' &&
    backendImage.trim().length > 0 &&
    backendImage !== '[IMAGE]' &&
    backendImage !== 'placeholder'
  ) {
    return backendImage;
  }

  // 2. Derive normalized slug from item name
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Known slug aliases mapping to high-resolution product photography in public/products/
  const knownAssets: Record<string, string> = {
    'artisan-espresso': '/products/espresso.jpg',
    espresso: '/products/espresso.jpg',
    'single-origin-espresso': '/products/espresso.jpg',
    'double-espresso': '/products/espresso.jpg',
    americano: '/products/espresso.jpg',

    'silky-cappuccino': '/products/cappuccino.jpg',
    cappuccino: '/products/cappuccino.jpg',
    'silky-flat-white': '/products/cappuccino.jpg',
    'flat-white': '/products/cappuccino.jpg',
    'cafe-latte': '/products/cappuccino.jpg',
    latte: '/products/cappuccino.jpg',

    '16h-cold-brew': '/products/cold-brew.jpg',
    '16-hour-cold-brew': '/products/cold-brew.jpg',
    'cold-brew': '/products/cold-brew.jpg',
    'nitro-cold-brew': '/products/cold-brew.jpg',
    'iced-coffee': '/products/cold-brew.jpg',

    'pour-over-reserve': '/products/pour-over.jpg',
    'single-origin-pour-over': '/products/pour-over.jpg',
    'pour-over': '/products/pour-over.jpg',
    'ethiopian-pour-over': '/products/pour-over.jpg',
    chemex: '/products/pour-over.jpg',

    'caramel-affogato': '/products/caramel-affogato.jpg',
    affogato: '/products/caramel-affogato.jpg',
    'espresso-con-panna': '/products/caramel-affogato.jpg',
  };

  if (knownAssets[slug]) {
    return knownAssets[slug];
  }

  // 3. Fallback to neutral SVG placeholder
  return '/products/placeholder.svg';
}
