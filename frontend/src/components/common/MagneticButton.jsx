import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function MagneticButton({ children, to, href, onClick, variant = "dark", className = "" }) {
  const outer = "inline-block rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";
  const base = "inline-flex items-center justify-center rounded-full px-7 py-4 text-sm font-bold uppercase tracking-[0.18em] transition";
  const styles = variant === "light"
    ? "bg-white text-black hover:bg-accent hover:text-black"
    : variant === "ghost"
      ? "border border-current bg-transparent text-current hover:bg-primary hover:text-primary-foreground"
      : "bg-primary text-primary-foreground hover:bg-accent hover:text-primary";
  const content = <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className={`${base} ${styles} ${className}`}>{children}</motion.span>;

  if (to) return <Link to={to} onClick={onClick} className={outer}>{content}</Link>;
  if (href) return <a href={href} onClick={onClick} className={outer}>{content}</a>;
  return <button onClick={onClick} className={outer}>{content}</button>;
}