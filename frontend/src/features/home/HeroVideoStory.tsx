import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { siteConfig } from '@/config/site';
import { vibeCards } from '@/data/vibes';
import { VibeCard } from './VibeCard';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { ArrowRight, ChevronDown, MapPin } from 'lucide-react';

export function HeroVideoStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinTargetRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const desktopBlendRef = useRef<HTMLDivElement>(null);
  const mobileBlendRef = useRef<HTMLDivElement>(null);
  const heroOverlayRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const cardElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const progressTicksRef = useRef<(HTMLDivElement | null)[]>([]);

  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Preload video lazily after initial paint so hero text is never blocked
  useEffect(() => {
    if (isReducedMotion) return;

    const timer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isReducedMotion]);

  // GSAP animations via useGSAP with container scope
  useGSAP(
    () => {
      if (isReducedMotion) return;

      const container = containerRef.current;
      const pinTarget = pinTargetRef.current;
      const videoWrapper = videoWrapperRef.current;
      const video = videoRef.current;
      const heroOverlay = heroOverlayRef.current;
      const leftPanel = leftPanelRef.current;
      const cardEls = cardElementsRef.current;
      const tickEls = progressTicksRef.current;
      const scrim = scrimRef.current;

      if (!container || !pinTarget || !videoWrapper || !heroOverlay || !leftPanel) return;

      // Video scrub management: prevent decoder stall by not overlapping seek calls
      let isSeeking = false;
      let queuedTime: number | null = null;

      const performSeek = (targetSec: number) => {
        if (!video || isNaN(video.duration) || video.readyState < 1) return;
        const safeTime = Math.max(0, Math.min(targetSec, (video.duration || 10) - 0.05));

        if (isSeeking) {
          queuedTime = safeTime;
          return;
        }

        if (Math.abs(video.currentTime - safeTime) > 0.03) {
          isSeeking = true;
          video.currentTime = safeTime;
        }
      };

      const handleSeeked = () => {
        isSeeking = false;
        if (queuedTime !== null) {
          const next = queuedTime;
          queuedTime = null;
          performSeek(next);
        }
      };

      video?.addEventListener('seeked', handleSeeked);

      const mm = gsap.matchMedia();

      // Continuous timeline card windows (no dead zones)
      const cardRanges = [
        { start: 0.08, end: 0.23 }, // Card 1
        { start: 0.23, end: 0.38 }, // Card 2
        { start: 0.38, end: 0.53 }, // Card 3
        { start: 0.53, end: 0.68 }, // Card 4
        { start: 0.68, end: 0.83 }, // Card 5
        { start: 0.83, end: 0.97 }, // Card 6
      ];

      const setupStory = (isMobile: boolean) => {
        const blendLayer = isMobile ? mobileBlendRef.current : desktopBlendRef.current;
        const otherBlendLayer = isMobile ? desktopBlendRef.current : mobileBlendRef.current;

        // Reset elements with autoAlpha to preserve layout and avoid flicker
        cardEls.forEach((el) => {
          if (el) {
            gsap.set(el, { autoAlpha: 0, y: 20 });
          }
        });

        tickEls.forEach((el) => {
          if (el) {
            gsap.set(el, { opacity: 0.35, scaleY: 1, backgroundColor: 'currentColor' });
          }
        });

        if (otherBlendLayer) gsap.set(otherBlendLayer, { opacity: 0 });
        if (blendLayer) gsap.set(blendLayer, { opacity: 0 });
        if (scrim) gsap.set(scrim, { opacity: 1 });

        gsap.set(videoWrapper, { scale: 1.04 });
        gsap.set(heroOverlay, { opacity: 1, y: 0, pointerEvents: 'auto' });
        gsap.set(leftPanel, { opacity: 0, pointerEvents: 'none' });

        // Master Timeline (0 to 1 progress)
        const masterTl = gsap.timeline({ paused: true });

        // 1. 0% to 10%: Hero text lifts & fades away, dark scrim fades, page blend fades in
        masterTl.to(
          heroOverlay,
          {
            opacity: 0,
            y: -30,
            pointerEvents: 'none',
            duration: 0.08,
            ease: 'power2.inOut',
          },
          0,
        );

        if (scrim) {
          masterTl.to(
            scrim,
            {
              opacity: 0,
              duration: 0.08,
              ease: 'power2.inOut',
            },
            0,
          );
        }

        // Blend video with page background seamlessly
        if (blendLayer) {
          masterTl.to(
            blendLayer,
            {
              opacity: 1,
              duration: 0.08,
              ease: 'power2.out',
            },
            0.01,
          );
        }

        // Left solid card panel fades in as hero text clears
        masterTl.to(
          leftPanel,
          {
            opacity: 1,
            pointerEvents: 'auto',
            duration: 0.08,
            ease: 'power2.out',
          },
          0.04,
        );

        // 2. Video Scrub Proxy (0.00 to 1.00)
        const videoProxy = { progress: 0 };
        masterTl.to(
          videoProxy,
          {
            progress: 1,
            duration: 1,
            ease: 'none',
            onUpdate: () => {
              if (video) {
                const dur = video.duration || 10;
                performSeek(masterTl.progress() * dur);
              }
            },
          },
          0,
        );

        // Subtle camera zoom-out drift during scrub
        masterTl.to(
          videoWrapper,
          {
            scale: 1.0,
            duration: 1,
            ease: 'none',
          },
          0,
        );

        // 3. Sequential Card Swaps (using autoAlpha + immediateRender: false)
        const fadeDuration = 0.025;

        cardRanges.forEach((range, idx) => {
          const cardEl = cardEls[idx];
          const tickEl = tickEls[idx];
          if (!cardEl) return;

          const exitStart = range.end - fadeDuration;

          // Card In: lift up from +20px to 0, autoAlpha to 1
          masterTl.fromTo(
            cardEl,
            { autoAlpha: 0, y: 20 },
            {
              autoAlpha: 1,
              y: 0,
              duration: fadeDuration,
              ease: 'power2.out',
              immediateRender: false,
            },
            range.start,
          );

          // Active tick highlight
          if (tickEl) {
            masterTl.to(
              tickEl,
              {
                opacity: 1,
                scaleY: 1.25,
                backgroundColor: 'var(--brand-primary)',
                duration: fadeDuration,
              },
              range.start,
            );
          }

          // Card Out: lift up from 0 to -20px, autoAlpha to 0
          masterTl.to(
            cardEl,
            {
              autoAlpha: 0,
              y: -20,
              duration: fadeDuration,
              ease: 'power2.in',
            },
            exitStart,
          );

          // Reset tick highlight
          if (tickEl) {
            masterTl.to(
              tickEl,
              {
                opacity: 0.35,
                scaleY: 1,
                backgroundColor: 'currentColor',
                duration: fadeDuration,
              },
              exitStart,
            );
          }
        });

        // 4. Single ScrollTrigger with pin and smooth scrub
        const st = ScrollTrigger.create({
          trigger: container,
          start: 'top top',
          end: isMobile ? '+=450%' : '+=600%',
          pin: pinTarget,
          pinSpacing: true,
          scrub: 0.6,
          anticipatePin: 1,
          animation: masterTl,
          invalidateOnRefresh: true,
        });

        return () => {
          st.kill();
          masterTl.kill();
        };
      };

      mm.add('(min-width: 768px)', () => setupStory(false));
      mm.add('(max-width: 767px)', () => setupStory(true));

      return () => {
        video?.removeEventListener('seeked', handleSeeked);
        mm.revert();
      };
    },
    { scope: containerRef, dependencies: [isReducedMotion] },
  );

  /* REDUCED MOTION STATIC PRESENTATION */
  if (isReducedMotion) {
    return (
      <div id="about" className="relative w-full">
        {/* Static Full-Viewport Hero */}
        <section className="relative min-h-screen flex items-center justify-center px-4 py-20 text-center">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <img
              src="/video/hero-poster.jpg"
              alt="Artisan coffee beans"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/55" />
          </div>

          <div className="max-w-3xl mx-auto space-y-6 text-white px-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight drop-shadow-md">
              {siteConfig.brandName}
            </h1>
            <p className="text-xl sm:text-2xl font-medium text-white/90 drop-shadow">
              {siteConfig.heroQuote}
            </p>
            <div className="pt-2">
              <Link to="/menu">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Order Now
                </Button>
              </Link>
            </div>
            <p className="flex items-center justify-center gap-1.5 text-xs text-white/80 pt-2">
              <MapPin className="h-3.5 w-3.5" />
              <span>{siteConfig.address}</span>
            </p>
          </div>
        </section>

        {/* Static Vertical List of Vibe Cards */}
        <section className="max-w-4xl mx-auto px-4 py-20 space-y-6">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
              Our Core Experience
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-content-primary">
              The Artisan Coffee Story
            </h2>
          </div>

          <div className="space-y-6">
            {vibeCards.map((card) => (
              <VibeCard key={card.number} card={card} totalCards={vibeCards.length} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  /* BLENDED UNCONTAINED SCROLL STORY */
  return (
    <section id="about" ref={containerRef} className="relative w-full">
      {/* Pinned Stage Container */}
      <div
        ref={pinTargetRef}
        className="relative w-full h-screen overflow-hidden bg-bg-start select-none"
      >
        {/* Uncontained Video Layer (spans screen edge-to-edge, zero container boxes) */}
        <div
          ref={videoWrapperRef}
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
        >
          {/* Static poster is permanently rendered as the solid backdrop so screen NEVER goes blank */}
          <img
            src="/video/hero-poster.jpg"
            alt="Roasted coffee beans"
            className="w-full h-full object-cover md:object-[68%_center]"
          />

          {/* Scrubbing Video sits directly on top of the poster */}
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            poster="/video/hero-poster.jpg"
            className="absolute inset-0 w-full h-full object-cover md:object-[68%_center]"
          >
            <source media="(max-width: 767px)" src="/video/hero-mobile.mp4" type="video/mp4" />
            <source src="/video/hero.mp4" type="video/mp4" />
          </video>
        </div>

        {/* 1. Permanent Top & Bottom Seam Feathering (dissolves video softly into page flow) */}
        <div
          className="absolute inset-0 z-11 pointer-events-none video-blend-vertical"
          aria-hidden="true"
        />

        {/* 2. Hero Dark Contrast Scrim (active 0% to 8% for >= 4.5:1 text contrast) */}
        <div
          ref={scrimRef}
          className="absolute inset-0 z-12 pointer-events-none bg-black/45"
          aria-hidden="true"
        />

        {/* 3. Screen & Page Blending Overlays (feathers video directly into warm page canvas) */}
        {/* Desktop Left-to-Right blend */}
        <div
          ref={desktopBlendRef}
          className="hidden md:block absolute inset-0 z-13 pointer-events-none video-blend-desktop opacity-0"
          aria-hidden="true"
        />
        {/* Mobile Bottom-to-Top blend */}
        <div
          ref={mobileBlendRef}
          className="md:hidden absolute inset-0 z-13 pointer-events-none video-blend-mobile opacity-0"
          aria-hidden="true"
        />

        {/* Hero Content Overlay (0.00 to 0.08) */}
        <div
          ref={heroOverlayRef}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-md leading-[1.05]">
              {siteConfig.brandName}
            </h1>

            <p className="text-lg sm:text-2xl font-medium text-white/95 max-w-xl mx-auto drop-shadow-sm">
              {siteConfig.heroQuote}
            </p>

            <div className="pt-2">
              <Link to="/menu">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="shadow-beautiful-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  Order Now
                </Button>
              </Link>
            </div>

            <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-white/85 pt-1">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
              <span>{siteConfig.address}</span>
            </p>
          </div>

          {/* Scroll Cue */}
          <div className="absolute bottom-8 flex flex-col items-center gap-1.5 text-white/80 animate-pulse pointer-events-none">
            <span className="text-[11px] font-semibold tracking-wider uppercase">
              Scroll to explore story
            </span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {/* Vibe Story Stage (Desktop: Left 50%; Mobile: Bottom 55vh) */}
        <div
          ref={leftPanelRef}
          className="absolute z-20 flex flex-col justify-center px-6 sm:px-12 md:px-14 lg:px-18
            w-full md:w-1/2 h-[55vh] md:h-full bottom-0 md:bottom-auto md:top-0 md:left-0"
        >
          <div className="max-w-md w-full mx-auto flex flex-col">
            {/* Header label above cards */}
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                The Roastery Vibe
              </span>
            </div>

            {/* Stacked Single Grid Cell: All 6 cards occupy the exact same space */}
            <div className="grid grid-cols-1 grid-rows-1 items-center justify-center w-full min-h-[220px] sm:min-h-[250px]">
              {vibeCards.map((card, idx) => (
                <div
                  key={card.number}
                  ref={(el) => {
                    cardElementsRef.current[idx] = el;
                  }}
                  className="col-start-1 row-start-1 w-full"
                  style={{ opacity: 0, visibility: 'hidden' }}
                >
                  <VibeCard card={card} totalCards={vibeCards.length} />
                </div>
              ))}
            </div>

            {/* Six-step progress indicator */}
            <div
              className="mt-6 sm:mt-8 flex items-center gap-2"
              role="progressbar"
              aria-label="Story progression"
            >
              {vibeCards.map((card, i) => (
                <div
                  key={card.number}
                  ref={(el) => {
                    progressTicksRef.current[i] = el;
                  }}
                  title={card.title}
                  className="h-1.5 flex-1 rounded-full bg-border-normal transition-all"
                  style={{ opacity: 0.35 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroVideoStory;
