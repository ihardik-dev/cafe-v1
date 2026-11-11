import { HeroVideoStory, FeaturedProductsShowcase, VisitBlock } from '@/features/home';

export function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* 4.1 to 4.3: Hero & Scroll-Driven Video Story */}
      <HeroVideoStory />

      {/* 4.4: Pinned Featured Products Showcase */}
      <FeaturedProductsShowcase />

      {/* 4.5: Visit Block (/#visit anchor) */}
      <VisitBlock />
    </div>
  );
}

export default HomePage;
