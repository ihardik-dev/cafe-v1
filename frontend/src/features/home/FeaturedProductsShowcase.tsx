import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { featuredProducts } from '@/data/featuredProducts';
import { Button } from '@/components/ui/Button';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { ArrowRight, Sparkles } from 'lucide-react';

export function FeaturedProductsShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinTargetRef = useRef<HTMLDivElement>(null);
  const textElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imageElementsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Preload first featured product image
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = featuredProducts[0]?.image || '/products/espresso.jpg';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useGSAP(
    () => {
      if (isReducedMotion) return;

      const container = containerRef.current;
      const pinTarget = pinTargetRef.current;
      const textEls = textElementsRef.current;
      const imageEls = imageElementsRef.current;

      if (!container || !pinTarget || textEls.length === 0 || imageEls.length === 0) return;

      const mm = gsap.matchMedia();

      const setupShowcase = (isMobile: boolean) => {
        // Initial setup for images and text
        imageEls.forEach((el, idx) => {
          if (!el) return;
          if (idx === 0) {
            gsap.set(el, { yPercent: 0, scale: 1, opacity: 1, zIndex: 10 });
          } else {
            gsap.set(el, { yPercent: 100, scale: 1, opacity: 1, zIndex: 10 + idx });
          }
        });

        textEls.forEach((el, idx) => {
          if (!el) return;
          if (idx === 0) {
            gsap.set(el, { autoAlpha: 1, y: 0 });
          } else {
            gsap.set(el, { autoAlpha: 0, y: 24 });
          }
        });

        // Timeline: total duration = (products.length - 1)
        const totalTransitions = featuredProducts.length - 1;
        const tl = gsap.timeline({ paused: true });

        for (let i = 0; i < totalTransitions; i++) {
          const currentImg = imageEls[i];
          const nextImg = imageEls[i + 1];
          const currentText = textEls[i];
          const nextText = textEls[i + 1];

          const tStart = i;

          // Next image slides up over current image (yPercent 100 -> 0)
          if (nextImg) {
            tl.fromTo(
              nextImg,
              { yPercent: 100 },
              {
                yPercent: 0,
                duration: 1,
                ease: 'power2.inOut',
              },
              tStart,
            );
          }

          // Current image scales down slightly and dims
          if (currentImg) {
            tl.to(
              currentImg,
              {
                scale: 0.94,
                opacity: 0.45,
                duration: 1,
                ease: 'power2.inOut',
              },
              tStart,
            );
          }

          // Current text crossfades and lifts up out
          if (currentText) {
            tl.to(
              currentText,
              {
                autoAlpha: 0,
                y: -24,
                duration: 0.45,
                ease: 'power2.in',
              },
              tStart,
            );
          }

          // Next text slides up from below and fades in
          if (nextText) {
            tl.fromTo(
              nextText,
              { autoAlpha: 0, y: 24 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.45,
                ease: 'power2.out',
                immediateRender: false,
              },
              tStart + 0.4,
            );
          }
        }

        // Single ScrollTrigger with pin, scrub, and snapping to each product
        const st = ScrollTrigger.create({
          trigger: container,
          pin: pinTarget,
          start: 'top top',
          end: isMobile ? '+=350%' : '+=450%',
          scrub: 0.8,
          anticipatePin: 1,
          pinSpacing: true,
          snap: {
            snapTo: 1 / totalTransitions,
            duration: { min: 0.25, max: 0.5 },
            delay: 0.1,
            ease: 'power1.inOut',
          },
          animation: tl,
          invalidateOnRefresh: true,
        });

        return () => {
          st.kill();
          tl.kill();
        };
      };

      mm.add('(min-width: 768px)', () => setupShowcase(false));
      mm.add('(max-width: 767px)', () => setupShowcase(true));

      return () => {
        mm.revert();
      };
    },
    { scope: containerRef, dependencies: [isReducedMotion] },
  );

  /* REDUCED MOTION STATIC PRESENTATION */
  if (isReducedMotion) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
            Curated Collection
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-content-primary">
            Featured Specialties
          </h2>
          <p className="mt-3 text-base text-content-secondary leading-relaxed">
            Carefully roasted and calibrated daily. Each offering highlights distinct regional
            terroir and craftsmanship.
          </p>
        </div>

        <div className="space-y-12">
          {featuredProducts.map((product) => (
            <article
              key={product.number}
              className="flex flex-col md:flex-row items-center gap-8 rounded-3xl border border-border-normal bg-surface-primary p-6 sm:p-8 shadow-beautiful-md overflow-hidden"
            >
              <div className="relative aspect-[16/10] w-full md:w-1/2 rounded-2xl overflow-hidden bg-surface-secondary">
                <img
                  src={product.image}
                  alt={product.alt}
                  width={1024}
                  height={572}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-primary bg-brand-light px-3 py-1 rounded-full w-fit">
                  {product.number} / {String(featuredProducts.length).padStart(2, '0')}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-content-primary">
                  {product.title}
                </h3>
                <p className="text-sm sm:text-base text-content-secondary leading-relaxed">
                  {product.description}
                </p>
                <div className="pt-2">
                  <Link
                    to="/menu"
                    className="inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-hover min-h-touch group"
                  >
                    <span>View in menu</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link to="/menu">
            <Button variant="secondary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              View all products
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  /* PINNED SHOWCASE WITH SLIDE-OVER STACK */
  return (
    <section ref={containerRef} className="relative w-full">
      {/* Pinned Stage Container */}
      <div
        ref={pinTargetRef}
        className="relative w-full h-screen overflow-hidden bg-surface-secondary/40 select-none flex flex-col justify-between"
      >
        {/* Top Header Label */}
        <div className="pt-8 sm:pt-12 px-6 lg:px-12 max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
              Featured Specialties
            </span>
          </div>
          <span className="text-xs text-content-tertiary font-medium hidden sm:inline">
            Scroll to discover collection
          </span>
        </div>

        {/* Main Split Showcase */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full my-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Desktop Left / Mobile Bottom: Text Stack */}
            <div className="order-2 md:order-1 flex flex-col justify-center">
              <div className="grid grid-cols-1 grid-rows-1 items-center w-full min-h-[220px] sm:min-h-[260px]">
                {featuredProducts.map((product, idx) => (
                  <div
                    key={product.number}
                    ref={(el) => {
                      textElementsRef.current[idx] = el;
                    }}
                    className="col-start-1 row-start-1 w-full flex flex-col justify-center"
                    style={{
                      opacity: idx === 0 ? 1 : 0,
                      visibility: idx === 0 ? 'visible' : 'hidden',
                    }}
                  >
                    <div className="mb-3">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-primary bg-brand-light px-3 py-1 rounded-full">
                        {product.number} / {String(featuredProducts.length).padStart(2, '0')}
                      </span>
                    </div>

                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-content-primary mb-4 leading-tight">
                      {product.title}
                    </h3>

                    <p className="text-sm sm:text-base lg:text-lg text-content-secondary leading-relaxed max-w-lg mb-6">
                      {product.description}
                    </p>

                    <div>
                      <Link
                        to="/menu"
                        className="inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-hover min-h-touch group focus-visible:ring-2 focus-visible:ring-brand-primary rounded-lg"
                      >
                        <span>View in menu</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Right / Mobile Top: Image Stack */}
            <div className="order-1 md:order-2 flex items-center justify-center">
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full max-w-xl rounded-3xl overflow-hidden shadow-beautiful-lg border border-border-normal bg-surface-secondary">
                {featuredProducts.map((product, idx) => (
                  <div
                    key={product.number}
                    ref={(el) => {
                      imageElementsRef.current[idx] = el;
                    }}
                    className="absolute inset-0 w-full h-full overflow-hidden"
                    style={{
                      zIndex: 10 + idx,
                      transform: idx === 0 ? 'none' : 'translate(0, 100%)',
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.alt}
                      width={1024}
                      height={572}
                      className="w-full h-full object-cover"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none"
                      aria-hidden="true"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Pinned Footer Bar */}
        <div className="pb-8 sm:pb-12 px-6 lg:px-12 max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            {featuredProducts.map((p) => (
              <span
                key={p.number}
                className="h-1.5 w-6 rounded-full bg-border-normal transition-all"
                title={p.title}
              />
            ))}
          </div>

          <Link to="/menu">
            <Button
              variant="secondary"
              size="sm"
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              className="text-xs"
            >
              View all products
            </Button>
          </Link>
        </div>
      </div>

      {/* Unpinned View All Products Callout (shown after unpinning) */}
      <div className="py-16 text-center bg-surface-secondary/30 border-b border-border-subdued px-4">
        <h3 className="text-xl sm:text-2xl font-bold text-content-primary mb-2">
          Ready to explore our complete roast selection?
        </h3>
        <p className="text-sm text-content-secondary max-w-md mx-auto mb-6">
          From single origins to seasonal pastries, view our full menu and order directly.
        </p>
        <Link to="/menu">
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="h-4 w-4" />}
            className="shadow-beautiful-md hover:scale-[1.02] active:scale-[0.98]"
          >
            View all products
          </Button>
        </Link>
      </div>
    </section>
  );
}

export default FeaturedProductsShowcase;
