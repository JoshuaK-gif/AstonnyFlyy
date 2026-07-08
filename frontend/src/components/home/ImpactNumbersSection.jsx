import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fetchImpactStats } from "@/lib/api";

gsap.registerPlugin(ScrollTrigger);

function Counter({ value, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: value,
        duration: 2.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 90%",
          once: true,
        },
        onUpdate: () => setCount(Math.floor(obj.val)),
      });
    });
    return () => ctx.revert();
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function ImpactNumbersSection({ settings }) {
  const sectionRef = useRef(null);
  const [impactStats, setImpactStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchImpactStats();
        setImpactStats(data);
      } catch (error) {
        console.error("Failed to load impact stats:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  useEffect(() => {
    if (loading || impactStats.length === 0) return;
    
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".impact-stat",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [loading, impactStats]);

  if (loading || impactStats.length === 0) return null;

  const bgType = settings?.impactNumbersBgType || 'color';
  const bgColor = settings?.impactNumbersBgColor || '#0f172a';
  const bgImage = settings?.impactNumbersBgImage;

  const isLightColor = (color) => {
    if (!color || color.length < 7) return false;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150;
  };
  const isLight = bgType === 'color' ? isLightColor(bgColor) : false;

  return (
    <section
      ref={sectionRef}
      className={`px-5 py-16 transition-colors duration-500 ${isLight ? 'text-slate-900 border-slate-100' : 'text-white border-slate-800'}`}
      style={{ 
        backgroundColor: bgType === 'color' ? bgColor : undefined,
        backgroundImage: bgType === 'image' && bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="mx-auto max-w-[1400px]">

        {/* ── MOBILE & TABLET: 2-col card grid ── */}
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:hidden">
          {impactStats.map((stat) => (
            <div
              key={stat.label}
              className={`impact-stat flex flex-col justify-between overflow-hidden rounded-2xl border p-5 sm:p-6 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5'}`}
            >
              <p
                className={`whitespace-nowrap font-display font-black ${isLight ? 'text-indigo-600' : 'text-accent'}`}
                style={{ fontSize: "clamp(1.4rem, 5.5vw, 2.25rem)" }}
              >
                <Counter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className={`mt-3 text-[10px] font-bold uppercase tracking-[0.18em] sm:text-[11px] ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── DESKTOP: single inline row with dividers ── */}
        <div className={`hidden lg:flex lg:items-stretch lg:divide-x ${isLight ? 'lg:divide-slate-200' : 'lg:divide-white/10'}`}>
          {impactStats.map((stat) => (
            <div
              key={stat.label}
              className="impact-stat flex flex-1 flex-col justify-center min-w-0 overflow-hidden px-8 py-6 first:pl-0 last:pr-0 xl:px-10 xl:py-8"
            >
              <p
                className={`whitespace-nowrap font-display font-black ${isLight ? 'text-indigo-600' : 'text-accent'}`}
                style={{ fontSize: "clamp(1.75rem, 3.8vw, 4.5rem)" }}
              >
                <Counter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className={`mt-3 text-[11px] font-bold uppercase tracking-[0.2em] xl:text-xs ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}