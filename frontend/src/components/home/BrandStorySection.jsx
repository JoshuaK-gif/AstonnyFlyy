import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function BrandStorySection({ settings }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".bs-heading", { opacity: 0, x: -60 }, {
        opacity: 1, x: 0, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: ".bs-heading", start: "top 80%", once: true }
      });
      gsap.fromTo(".bs-para", { opacity: 0, y: 36 }, {
        opacity: 1, y: 0, duration: 0.85, stagger: 0.15, ease: "power3.out",
        scrollTrigger: { trigger: ".bs-para", start: "top 82%", once: true }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const bgType = settings?.brandStoryBgType || 'color';
  const bgImage = settings?.brandStoryBgImage;

  return (
    <section 
      ref={sectionRef} 
      id="brand-story" 
      className="relative overflow-hidden px-5 py-32 md:px-10 md:py-48 text-white"
    >
      {bgType === 'image' && bgImage && (
        <div className="absolute inset-0 h-full w-full">
          <img src={bgImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}
      {bgType === 'color' && <div className="absolute inset-0 bg-black/60" />}

      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative z-10 mx-auto grid max-w-[1800px] gap-16 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <h2 className="bs-heading font-display text-[clamp(2rem,5vw,6rem)] font-black uppercase leading-[0.82] tracking-[-0.07em] text-center md:text-left">
          This is How<br class="hidden md:block" />we Flyy
          
        </h2>
        <div className="space-y-8 text-lg leading-relaxed md:text-xl text-white/72">
          <p className="bs-para"><span className="text-accent">AstonnyFlyy</span> is a Ugandan streetwear brand based in Kampala.We create timeless pieces inspired by culture,confidence and creativity.our journey started as a way to embrace local creativity and culture.</p>
          <p className="bs-para"><span className="text-accent">Our mission</span> is to produce quality streetwear that empowers young people through creating positive social impact through fashion and community engagement campaigns to inspire the generation.</p>
          <p className="bs-para">We believe in <span className="text-accent">authenticity</span> and every design reflects commitment to quality and respect to culture, this is a movement.<span className="text-accent"> FlyyWithMe</span></p> 
    
        </div>
      </div>
    </section>
  );
}