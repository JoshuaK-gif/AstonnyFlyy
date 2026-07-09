import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ShoppingBag, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../cart/CartProvider";
import { useLenisScroll } from "../common/SmoothScroll";
import { useTheme } from "next-themes";
import logo from "@/assets/logo.png";


const links = [
  { label: "Shop", to: "/shop" },
  { label: "Lookbook", to: "/lookbook" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" }
];

export default function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showBrandText, setShowBrandText] = useState(true);
  const { items, setIsOpen } = useCart();
  const scrollY = useLenisScroll();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setScrolled(scrollY > 50);
  }, [scrollY]);

  return (
    <header className={`fixed left-0 top-0 z-50 w-full transition-all duration-500 ${scrolled || location.pathname !== '/' ? "bg-black text-white shadow-lg" : "bg-transparent text-white"}`}>
      <div className="mx-auto flex w-full items-center justify-between px-5 py-5 md:px-10">
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            className="flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            onClick={() => setShowBrandText(!showBrandText)}
          >
            <img src={logo} alt="AstonnyFlyy Logo" className="h-10 w-10 cursor-pointer rounded-full object-cover md:h-12 md:w-12" />
            <AnimatePresence mode="wait">
              {showBrandText && (
                <motion.span 
                  initial={{ opacity: 0, x: -10, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: "auto" }}
                  exit={{ opacity: 0, x: -10, width: 0 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className="overflow-hidden whitespace-nowrap font-display text-lg uppercase tracking-tighter md:text-xl pr-1 pb-1"
                  style={{ fontFamily: "'Kaushan Script', cursive" }}
                >
                  AstonnyFlyy
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
        <nav className="hidden items-center gap-10 md:flex">
          {links.map((link) =>
            link.to
              ? <Link key={link.label} to={link.to} className="text-sm uppercase tracking-[0.18em] transition hover:text-accent">{link.label}</Link>
              : <a key={link.label} href={link.href} className="text-sm uppercase tracking-[0.18em] transition hover:text-accent">{link.label}</a>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full p-2 transition hover:bg-accent hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button onClick={() => setIsOpen(true)} className="relative rounded-full p-2 transition hover:bg-accent hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent" aria-label="Open bag">
            <ShoppingBag className="h-5 w-5" />
            {items.length > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary group-hover:bg-primary group-hover:text-accent transition-colors">{items.length}</span>}
          </button>
          <button onClick={() => setOpen(true)} className="rounded-full p-2 md:hidden hover:bg-accent hover:text-primary transition-all" aria-label="Open menu"><Menu className="h-6 w-6" /></button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 !bg-black !text-white md:hidden"
          >
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex items-center justify-between px-5 py-5"
            >
              <motion.img 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                src={logo} alt="AstonnyFlyy Logo" className="h-8 w-8 rounded-full object-cover" 
              />
              <button onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-7 w-7" /></button>
            </motion.div>
            <div className="flex h-[calc(100vh-80px)] flex-col justify-start px-8 pb-12 overflow-y-auto scrollbar-none">
              {links.map((link, index) => {
                const item = link.to
                  ? <Link key={link.label} to={link.to} onClick={() => setOpen(false)}>{link.label}</Link>
                  : <a key={link.label} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>;
                return (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: 80, rotate: 5 }}
                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                    exit={{ opacity: 0, x: -80, rotate: -5 }}
                    transition={{ duration: 0.4, delay: 0.15 + index * 0.08, ease: "circOut" }}
                    className="border-b border-white/10 py-6 font-display text-4xl font-black uppercase overflow-hidden"
                  >
                    {item}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}