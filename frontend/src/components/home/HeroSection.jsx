import { motion, useScroll, useTransform } from "framer-motion";
import { getOptimizedImage } from "../lib/utils";

export default function HeroSection({ settings }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, -170]);
  const scale = useTransform(scrollY, [0, 700], [1.08, 1]);

  const bgType = settings?.heroBgType || 'image';
  const bgColor = settings?.heroBgColor || '#0f172a';
  const bgImage = settings?.heroBgImage || "https://media.base44.com/images/public/6a2c25958136d9426eca8288/eeecd1355_generated_8fbbcd65.png";

  const isLightColor = (color) => {
    if (!color || color.length < 7) return false;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150; // threshold for light color
  };

  const isLight = bgType === 'color' && isLightColor(bgColor);

  return (
    <section 
      className={`relative flex min-h-screen items-end overflow-hidden transition-colors duration-500 ${isLight ? 'text-slate-900' : 'text-white'}`}
      id="top"
      style={{ 
        backgroundColor: bgType === 'color' ? bgColor : undefined,
        backgroundImage: bgType === 'image' && bgImage ? `url(${getOptimizedImage(bgImage, 1920)})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className={`absolute right-6 top-28 hidden h-40 w-px md:block ${isLight ? 'bg-slate-300' : 'bg-accent'}`} />
      <motion.div style={{ y }} className="relative z-10 mx-auto w-full px-5 pb-16 pt-8 md:px-10 md:pb-24">
        <motion.p 
          initial={{ opacity: 0, y: 24 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.4 }} 
          className={`mb-5 text-sm tracking-[0.42em] text-pink-500 hidden md:block`}
        >
          FlyyWithMe 
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }} 
          animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }} 
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }} 
          className="max-w-full font-display text-[clamp(3rem,14vw,15rem)] leading-[1] tracking-[-0.08em] sm:text-[clamp(2rem,10vw,12rem)] pb-6"
        >
          AstonnyFlyy
        </motion.h1>
        <div className="mt-2 flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:mt-8">
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className={`max-w-xl text-sm sm:text-lg md:text-2xl ${isLight ? 'text-slate-600' : 'text-white/78'}`}
          >
            Made in Kampala. Worn Everywhere.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-sm tracking-[0.42em] text-pink-500 md:hidden"
          >
            FlyyWithMe
          </motion.p>
        </div>
      </motion.div>
      <div className={`absolute bottom-6 left-1/2 h-16 w-px -translate-x-1/2 overflow-hidden ${isLight ? 'bg-slate-900/20' : 'bg-white/20'}`}>
        <motion.div animate={{ y: ["-100%", "100%"] }} transition={{ repeat: Infinity, duration: 1.6 }} className={`h-full w-full ${isLight ? 'bg-indigo-600' : 'bg-accent'}`} />
      </div>
    </section>
  );
}