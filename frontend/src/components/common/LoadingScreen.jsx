import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function LoadingScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0, clipPath: "circle(0% at 50% 50%)" }} transition={{ duration: 0.8, ease: "easeInOut" }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-accent">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: [0.8, 1, 16], opacity: [0, 1, 0] }} transition={{ duration: 1.1, times: [0, 0.45, 1] }} className="font-display text-6xl font-black tracking-[-0.08em] pb-4">AstonnyFlyy</motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}