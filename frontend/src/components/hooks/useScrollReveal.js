import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Attach GSAP scroll-triggered fade-up to elements matching `selector` inside `containerRef`.
 * @param {string} selector  - CSS selector of children to animate (e.g. ".reveal")
 * @param {object} opts      - optional overrides: { y, duration, stagger, delay, start }
 */
export function useScrollReveal(selector = ".reveal", opts = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const els = containerRef.current?.querySelectorAll(selector);
      if (!els || !els.length) return;

      gsap.fromTo(
        els,
        { opacity: 0, y: opts.y ?? 48 },
        {
          opacity: 1,
          y: 0,
          duration: opts.duration ?? 0.9,
          stagger: opts.stagger ?? 0.1,
          ease: "power3.out",
          delay: opts.delay ?? 0,
          scrollTrigger: {
            trigger: containerRef.current,
            start: opts.start ?? "top 82%",
            once: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return containerRef;
}

/**
 * Animate a single element ref.
 */
export function useSingleReveal(opts = {}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: opts.y ?? 56 },
        {
          opacity: 1,
          y: 0,
          duration: opts.duration ?? 1,
          ease: "power3.out",
          delay: opts.delay ?? 0,
          scrollTrigger: {
            trigger: ref.current,
            start: opts.start ?? "top 82%",
            once: true,
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return ref;
}