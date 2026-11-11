import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register ScrollTrigger and useGSAP once across the application
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);

  // Default cinematic easing as defined in motion system
  gsap.defaults({
    ease: 'power3.out',
    duration: 0.85,
  });

  // Respect prefers-reduced-motion
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mediaQuery.matches) {
    gsap.globalTimeline.timeScale(100); // Fast-forward/instant
  }
}

export { gsap, ScrollTrigger, useGSAP };
