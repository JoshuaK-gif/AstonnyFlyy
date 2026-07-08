import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useQuery } from "@tanstack/react-query";
import { fetchLookbook } from "@/lib/api";
import { getOptimizedImage } from "../lib/utils";

gsap.registerPlugin(ScrollTrigger);

const fallbackLooks = [
  { image: "https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png", title: "Concrete Motion", size: "lg" },
  { image: "https://media.base44.com/images/public/6a2c25958136d9426eca8288/e1e646d8d_generated_bf6ff6a7.png", title: "Rooftop Circle", size: "wide" },
  { image: "https://media.base44.com/images/public/6a2c25958136d9426eca8288/6aa52fe63_generated_19cea5a8.png", title: "Studio Edge", size: "tall" },
  { image: "https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png", title: "Velocity Fit", size: "base" }
];

export default function LookbookSection({ settings }) {
  const sectionRef = useRef(null);

  const { data: dbLooks = [] } = useQuery({
    queryKey: ['lookbook'],
    queryFn: fetchLookbook
  });

  const looks = dbLooks.length > 0 ? dbLooks : fallbackLooks;

  useEffect(() => {
    if (looks.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(".lb-header", { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: ".lb-header", start: "top 82%", once: true }
      });
      gsap.fromTo(".lb-figure", { opacity: 0, clipPath: "inset(100% 0 0 0)" }, {
        opacity: 1, clipPath: "inset(0% 0 0 0)", duration: 0.9, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".lb-grid", start: "top 78%", once: true }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [looks]);

  const bgType = settings?.lookbookBgType || 'color';
  const bgColor = settings?.lookbookBgColor || '#0f172a';
  const bgImage = settings?.lookbookBgImage;

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
      id="lookbook" 
      className={`px-5 py-24 md:px-10 md:py-36 transition-colors duration-500 ${isLight ? 'text-slate-900' : 'text-white'}`}
      style={{ 
        backgroundColor: bgType === 'color' ? bgColor : undefined,
        backgroundImage: bgType === 'image' && bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="lb-header font-display text-[clamp(3rem,8vw,9rem)] font-black uppercase leading-[0.85] tracking-[-0.06em]">Lookbook</h2>
          <p className={`lb-header max-w-lg text-lg ${isLight ? 'text-slate-600' : 'text-white/65'}`}>Campaign visuals, styling inspiration, and lifestyle energy arranged as a living editorial archive.</p>
        </div>
        <div className="lb-grid grid auto-rows-[200px] grid-cols-2 gap-4 md:grid-cols-4 md:auto-rows-[260px]">
          {looks.map((look, i) => (
            <figure key={look.id || i} className={`lb-figure group relative overflow-hidden rounded-[2rem] ${look.size === "lg" ? "md:col-span-2 md:row-span-2" : look.size === "wide" ? "md:col-span-2" : look.size === "tall" ? "md:row-span-2" : ""}`}>
              <img src={getOptimizedImage(look.image, look.size === 'lg' ? 1200 : 800)} alt={`${look.title} AstonnyFlyy lookbook`} className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-105 group-hover:opacity-100" loading="lazy" />
              <figcaption className="absolute bottom-3 left-3 rounded-xl bg-black/70 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg backdrop-blur-md">{look.title}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}