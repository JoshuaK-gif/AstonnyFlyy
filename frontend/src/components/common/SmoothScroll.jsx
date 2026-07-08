import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

const LenisContext = createContext(null);

export function useLenisScroll() {
  return useContext(LenisContext);
}

export default function SmoothScroll({ children }) {
  const [scrollY, setScrollY] = useState(0);
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    lenisRef.current = lenis;

    lenis.on('scroll', (e) => {
      setScrollY(e.scroll);
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <LenisContext.Provider value={scrollY}>
      {children}
    </LenisContext.Provider>
  );
}
