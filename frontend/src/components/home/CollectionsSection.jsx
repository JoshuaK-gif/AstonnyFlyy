import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { fetchCollections } from "@/lib/api";

export default function CollectionsSection({ settings }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCollections() {
      try {
        const data = await fetchCollections();
        setCollections(data);
      } catch (error) {
        console.error("Failed to load collections:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCollections();
  }, []);

  if (loading || collections.length === 0) return null;

  const bgType = settings?.collectionsBgType || 'color';
  const bgColor = settings?.collectionsBgColor || '#ffffff';
  const bgImage = settings?.collectionsBgImage;

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
      id="collections" 
      className={`px-5 py-24 md:px-10 md:py-36 transition-colors duration-500 ${isLight ? 'text-slate-900 border-slate-100' : 'text-white border-slate-800'}`}
      style={{ 
        backgroundColor: bgType === 'color' ? bgColor : undefined,
        backgroundImage: bgType === 'image' && bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="mx-auto max-w-[1800px]">
        <h2 className="mb-12 font-display text-[clamp(3rem,8vw,9rem)] font-black uppercase leading-[0.85] tracking-[-0.06em]">Collections</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {collections.slice(0, 3).map((collection, i) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
            >
              <Link 
                to={collection.href} 
                className="group relative block aspect-[3/4] overflow-hidden rounded-xl bg-muted"
              >
                <img 
                  src={collection.image} 
                  alt={collection.title} 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:bg-black/40" />
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-sm font-bold uppercase tracking-widest">{collection.tag}</p>
                  <h3 className="font-display text-3xl font-black uppercase leading-tight tracking-tight">{collection.title}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <Link
              to="/shop"
              className="group relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl bg-accent/10 transition-all duration-500 hover:bg-accent/20"
            >
              <div className="flex flex-col items-center gap-4">
                <ArrowRight className="h-16 w-16 text-accent transition-transform duration-500 group-hover:translate-x-2" strokeWidth={1.5} />
                <span className={`text-sm font-bold uppercase tracking-[0.22em] transition-colors ${isLight ? 'text-slate-600' : 'text-white/70'}`}>
                  View All
                </span>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
