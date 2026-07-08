import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProductCard from "../products/ProductCard";
import { fetchProducts } from "@/lib/api";
import { productCategories } from "@/data/products";
import MagneticButton from "../common/MagneticButton";
import { StaggerContainer, StaggerItem, StaggerHeader } from "../common/StaggerAnim";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedProductsSection() {
  const sectionRef = useRef(null);
  const [activeHoverId, setActiveHoverId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".fp-header", { opacity: 0, y: 50 }, {
          opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: ".fp-header", start: "top 82%", once: true }
        });
      }, sectionRef);
      return () => ctx.revert();
    }
  }, [products]);

  if (loading) return null;

  return (
    <section ref={sectionRef} id="featured-products" className="bg-background px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-12 grid gap-8 md:grid-cols-[0.85fr_1fr] md:items-end">
          <h2 className="fp-header font-display text-[clamp(3rem,8vw,9rem)] font-black uppercase leading-[0.85] tracking-[-0.06em]">Featured<br />Products</h2>
          <div className="fp-header">
            <p className="max-w-2xl text-lg text-muted-foreground">Designed to adapt across the full fashion universe: outerwear, dresses, footwear, accessories, tailoring, sportswear, kids, men, women, and unisex collections.</p>
            <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
              {productCategories.slice(0, 14).map((category) => <span key={category} className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">{category}</span>)}
            </div>
          </div>
        </div>
        <StaggerContainer className="grid gap-x-3 gap-y-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <StaggerItem key={product.id}>
              <ProductCard 
                product={product} 
                index={index} 
                isFlipped={activeHoverId === product.id}
                onHover={() => setActiveHoverId(product.id)}
                onLeave={() => setActiveHoverId((prev) => prev === product.id ? null : prev)}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
        <StaggerHeader className="mt-16 text-center">
          <MagneticButton to="/shop">View All Products</MagneticButton>
        </StaggerHeader>
      </div>
    </section>
  );
}
