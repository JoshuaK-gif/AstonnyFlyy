import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <motion.div style={{ scaleX, transformOrigin: "0%" }} className="fixed left-0 top-0 z-[90] h-1 w-full bg-accent" />;
}