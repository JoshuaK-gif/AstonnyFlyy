import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCommunityImages, fetchTestimonials } from "@/lib/api";

gsap.registerPlugin(ScrollTrigger);

const fallbackTestimonials = [
  { name: "Maya R.", text: "AstonnyFlyy feels like streetwear stepped into a private gallery." },
  { name: "Jalen T.", text: "The pieces photograph beautifully and still feel effortless every day." },
  { name: "Noor A.", text: "It has that rare-release energy without trying too hard." }
];

const fallbackImages = [
  "https://media.base44.com/images/public/6a2c25958136d9426eca8288/e1e646d8d_generated_bf6ff6a7.png",
  "https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png"
];

export default function CommunitySection({ settings }) {
  const sectionRef = useRef(null);

  const { data: dbImages = [] } = useQuery({ queryKey: ['communityImages'], queryFn: fetchCommunityImages });
  const { data: dbTestimonials = [] } = useQuery({ queryKey: ['testimonials'], queryFn: fetchTestimonials });

  const testimonials = dbTestimonials.length > 0 ? dbTestimonials : fallbackTestimonials;
  const images = dbImages.length > 0 ? dbImages.map(img => img.image) : fallbackImages;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".comm-header", { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: ".comm-header", start: "top 85%", once: true }
      });

      gsap.fromTo(".comm-img", { opacity: 0, scale: 0.9, y: 40 }, {
        opacity: 1, scale: 1, y: 0, duration: 1.2, stagger: 0.2, ease: "power3.out",
        scrollTrigger: { trigger: ".comm-grid", start: "top 80%", once: true }
      });

      gsap.fromTo(".comm-card", { opacity: 0, x: 30 }, {
        opacity: 1, x: 0, duration: 0.8, stagger: 0.15, ease: "power3.out",
        scrollTrigger: { trigger: ".comm-card-container", start: "top 82%", once: true }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [testimonials, images]);

  const bgType = settings?.communityBgType || 'color';
  const bgColor = settings?.communityBgColor || '#ffffff';
  const bgImage = settings?.communityBgImage;

  const isLightColor = (color) => {
    if (!color || color.length < 7) return false;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150;
  };
  const isLight = bgType === 'color' ? isLightColor(bgColor) : true;

  return (
    <section 
      ref={sectionRef} 
      id="community" 
      className={`px-5 py-24 md:px-10 md:py-36 transition-colors duration-500 ${isLight ? 'text-slate-900 border-slate-100' : 'text-white border-slate-800'}`}
      style={{ 
        backgroundColor: bgType === 'color' ? bgColor : undefined,
        backgroundImage: bgType === 'image' && bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="mx-auto max-w-[1800px]">
        <h2 className="comm-header mb-10 font-display text-[clamp(2.5rem,8vw,9rem)] font-black uppercase leading-[0.85] tracking-[-0.06em] md:mb-14">
          The Flyy<br />Community
        </h2>
        <div className="comm-grid grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-5 sm:grid-cols-2">
            {images.slice(0, 2).map((img, i) => (
              <img
                key={i}
                src={img}
                alt="AstonnyFlyy community styling"
                className={`comm-img h-64 w-full rounded-[2rem] object-cover sm:h-[520px] ${i === 1 ? "sm:mt-20" : ""}`}
                loading="lazy"
              />
            ))}
          </div>
          <div className="comm-card-container grid gap-5">
            {testimonials.map((item, i) => (
              <article 
                key={item.id || i} 
                className={`comm-card rounded-[2rem] border p-6 shadow-sm sm:p-8 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5'}`}
              >
                <Quote className={`mb-6 h-7 w-7 sm:mb-8 sm:h-8 sm:w-8 ${isLight ? 'text-indigo-600' : 'text-accent'}`} />
                <p className="text-lg font-bold leading-tight sm:text-2xl">"{item.text}"</p>
                <p className={`mt-5 text-sm font-black uppercase tracking-[0.2em] ${isLight ? 'text-slate-500' : 'text-white/45'}`}>{item.name}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}