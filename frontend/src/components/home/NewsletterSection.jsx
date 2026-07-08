import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "../common/MagneticButton";
import { createSubscriber } from "@/lib/api";
import { toast } from "sonner";

gsap.registerPlugin(ScrollTrigger);

export default function NewsletterSection({ settings }) {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".news-content > *", { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out",
        scrollTrigger: { trigger: ".news-content", start: "top 85%", once: true }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      await createSubscriber({ email });
      setJoined(true);
      setEmail("");
      toast.success("Welcome to the movement!");
    } catch (error) {
      toast.error(error.message || "Failed to join community");
    } finally {
      setLoading(false);
    }
  };

  const bgType = settings?.newsletterBgType || 'color';
  const bgColor = settings?.newsletterBgColor || '#f8fafc';
  const bgImage = settings?.newsletterBgImage;

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
      id="newsletter" 
      className={`px-5 py-24 md:px-10 md:py-36 transition-colors duration-500 ${isLight ? 'text-slate-900 border-slate-100' : 'text-white border-slate-800'}`}
      style={{ 
        backgroundColor: bgType === 'color' ? bgColor : undefined,
        backgroundImage: bgType === 'image' && bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="news-content mx-auto max-w-[1200px] rounded-[2rem] bg-primary p-6 text-center text-primary-foreground sm:rounded-[2.5rem] sm:p-8 md:p-16">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.36em] text-accent">Exclusive Access</p>
        <h2 className="font-display text-[clamp(1.8rem,5vw,4rem)] font-black uppercase leading-[0.85] tracking-[-0.06em]">Join The Flyy Movement</h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/70">Get early collection drops, lookbook releases, and private product previews before the rest of the world catches up.</p>
        <form onSubmit={submit} className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <input 
            value={email} 
            onChange={(event) => setEmail(event.target.value)} 
            type="email" 
            required 
            placeholder="Email Address" 
            disabled={loading}
            className="min-h-14 flex-1 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-6 text-primary-foreground placeholder:text-primary-foreground/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:opacity-50" 
          />
          <MagneticButton variant="light" disabled={loading}>
            {loading ? "Joining..." : "Subscribe"}
          </MagneticButton>
        </form>
        {joined && <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-accent">You're in. Welcome to the movement.</p>}
      </div>
    </section>
  );
}