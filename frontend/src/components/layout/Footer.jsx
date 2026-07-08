import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const footerLinks = [
  { label: "Shop", to: "/shop" },
  { label: "Lookbook", to: "/lookbook" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "FAQ", to: "/faq" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms & Conditions", to: "/terms" }
];

const socials = [
  { label: "Instagram", url: "https://www.instagram.com/astonny_flyy?igsh=YnR3NWx2YWFsbHZi&utm_source=qr" },
  { label: "TikTok", url: "https://www.tiktok.com/@astonnyflyy?_r=1&_t=ZS-97nkEyjS3bZ" },
  { label: "YouTube", url: "https://youtube.com" },
  { label: "X", url: "https://x.com/astonnyflyy?s=11" }
];

export default function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".footer-item", { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: footerRef.current, start: "top 90%", once: true }
      });
    }, footerRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="bg-black px-5 py-14 text-white md:px-10">
      <div className="mx-auto max-w-[1800px]">
        <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-[1fr_1.2fr]">
          <div className="footer-item">
            <h2 className="font-display text-5xl font-black leading-none tracking-[-0.06em] md:text-7xl">AstonnyFlyy</h2>
            <p className="mt-5 text-sm font-bold  tracking-[0.28em] text-accent">FlyyWithMe</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="footer-item">
              <h3 className="mb-5 text-sm font-black uppercase tracking-[0.24em] text-white/50">Navigation</h3>
              <div className="grid gap-3">
                {footerLinks.map((link) => link.to ? <Link key={link.label} to={link.to} className="text-lg text-white/75 hover:text-accent">{link.label}</Link> : <a key={link.label} href={link.href} className="text-lg text-white/75 hover:text-accent">{link.label}</a>)}
              </div>
            </div>
            <div className="footer-item">
              <h3 className="mb-5 text-sm font-black uppercase tracking-[0.24em] text-white/50">Social</h3>
              <div className="grid gap-3">
                {socials.map((social) => <a key={social.label} href={social.url} target="_blank" rel="noreferrer" className="text-lg text-white/75 hover:text-accent">{social.label}</a>)}
              </div>
            </div>
          </div>
        </div>
        <p className="footer-item pt-8 text-sm uppercase tracking-[0.2em] text-white/45">© 2026 AstonnyFlyy. All rights reserved.</p>
      </div>
    </footer>
  );
}