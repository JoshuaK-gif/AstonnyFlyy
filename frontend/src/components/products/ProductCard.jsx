import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlist } from "../hooks/useWishlist";
import { getOptimizedImage } from "../lib/utils";

export default function ProductCard({ product, index = 0, isFlipped = false, onHover = () => {}, onLeave = () => {} }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const [imgIndex, setImgIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef(null);
  const totalImages = product.images.length;
  const nextIndex = (imgIndex + 1) % totalImages;
  const showBack = isFlipped || isTransitioning;

  const handleImageClick = (e) => {
    if (totalImages < 2 || isTransitioning) return;
    e.preventDefault();
    setIsTransitioning(true);
    timerRef.current = setTimeout(() => {
      setImgIndex(nextIndex);
      setIsTransitioning(false);
    }, 700);
  };

  return (
    <motion.article 
      initial={{ opacity: 0, y: 36 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-50px" }} 
      transition={{ delay: index * 0.06 }} 
      className="group"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="relative overflow-hidden rounded-xl bg-muted aspect-[4/3]">
        <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`} className="block h-full w-full">
          <div className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${showBack ? "opacity-0" : "opacity-100"}`}
            onClick={handleImageClick}
          >
            <img 
              src={getOptimizedImage(product.images[imgIndex], 600)} 
              alt={product.name} 
              className="h-full w-full object-cover" 
              loading="lazy" 
            />
          </div>

          <div className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${showBack ? "opacity-100" : "opacity-0"}`}
            onClick={handleImageClick}
          >
            <img 
              src={getOptimizedImage(product.images[nextIndex], 600)} 
              alt={`${product.name} alternate view`} 
              className="h-full w-full object-cover" 
              loading="lazy" 
            />
          </div>
        </Link>

        <div className="absolute left-2 top-2 flex gap-1 z-10">
          {product.newArrival && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">New</span>}
          {product.bestseller && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">Best</span>}
        </div>
        
        <button 
          onClick={() => toggleWishlist(product.id)} 
          className="absolute right-2 top-2 rounded-full bg-white/85 p-1.5 backdrop-blur transition hover:bg-white z-10" 
          aria-label="Toggle wishlist"
        >
          <Heart className={`h-3.5 w-3.5 ${wishlisted ? "fill-primary text-primary" : "text-primary"}`} />
        </button>

        <div className="absolute inset-x-2 bottom-2 z-10 translate-y-0 opacity-100 lg:translate-y-4 lg:opacity-0 transition duration-500 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
          <div className="flex justify-end lg:rounded-full lg:bg-white/80 lg:p-1.5 lg:backdrop-blur-xl lg:justify-start lg:gap-1.5">
            <Link to={`/product/${product.id}`} className="flex-1 rounded-full px-3 py-2 text-center text-[10px] font-black uppercase tracking-widest text-primary hover:bg-muted hidden lg:block">Quick View</Link>
            <Link to={`/product/${product.id}`} className="rounded-full bg-primary p-1.5 text-primary-foreground hover:bg-accent hover:text-primary transition-colors flex items-center justify-center lg:flex-none lg:px-3" aria-label="View product"><ShoppingBag className="h-3 w-3" /></Link>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{product.category}</p>
          <Link to={`/product/${product.id}`} className="block text-xs font-black uppercase tracking-tight hover:text-accent lg:text-sm">{product.name}</Link>
        </div>
        <div className="shrink-0 text-right text-sm font-black">
          {product.discountPrice && <p className="text-muted-foreground line-through text-xs">${product.price}</p>}
          <p>${product.discountPrice || product.price}</p>
        </div>
      </div>
    </motion.article>
  );
}