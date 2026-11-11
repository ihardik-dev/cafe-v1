// DEMO DATA: replace later

export interface FeaturedProduct {
  number: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  menuSlug?: string;
}

export const featuredProducts: FeaturedProduct[] = [
  {
    number: '01',
    title: 'Artisan Espresso',
    description:
      'Extracted under nine bars of pressure for a dense, golden crema with lingering notes of dark chocolate and roasted hazelnut.',
    image: '/products/espresso.jpg',
    alt: 'Freshly extracted single-origin espresso with a thick golden crema',
    menuSlug: 'artisan-espresso',
  },
  {
    number: '02',
    title: 'Silky Flat White',
    description:
      'Double ristretto folded into steamed micro-textured whole milk, creating an impossibly smooth mouthfeel with subtle caramel sweetness.',
    image: '/products/cappuccino.jpg',
    alt: 'Velvety flat white with delicate hand-poured latte art',
    menuSlug: 'silky-flat-white',
  },
  {
    number: '03',
    title: '16-Hour Cold Brew',
    description:
      'Steeped slowly in cold filtered water for sixteen hours to highlight crisp stone-fruit aromatics with near-zero acidity.',
    image: '/products/cold-brew.jpg',
    alt: 'Slow-dripped amber cold brew poured over clear hand-cut ice',
    menuSlug: '16h-cold-brew',
  },
  {
    number: '04',
    title: 'Single-Origin Pour-Over',
    description:
      'Hand-brewed through bleached ceramic filters at precisely 93°C, releasing bright floral jasmine highlights and a clean tea-like finish.',
    image: '/products/pour-over.jpg',
    alt: 'Hand-poured filter coffee served in a glass carafe',
    menuSlug: 'single-origin-pour-over',
  },
  {
    number: '05',
    title: 'Caramel Affogato',
    description:
      'A generous scoop of Tahitian vanilla bean gelato drowned in a steaming shot of fresh espresso and dusted with raw cocoa nibs.',
    image: '/products/caramel-affogato.jpg',
    alt: 'Hot espresso poured over creamy vanilla gelato with cocoa nibs',
    menuSlug: 'caramel-affogato',
  },
];
