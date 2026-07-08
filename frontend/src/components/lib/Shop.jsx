import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Search, X, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import ScrollProgress from "@/components/common/ScrollProgress";
import ProductCard from "@/components/products/ProductCard";
import { fetchProducts, fetchCollections } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/common/SEO";
import { StaggerContainer, StaggerItem } from "../common/StaggerAnim";

gsap.registerPlugin(ScrollTrigger);

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialCollection = searchParams.get("collection") || "";
  
  const pageTitle = initialCollection ? `${initialCollection} Collection` : 'Shop';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("featured");
  const [activeHoverId, setActiveHoverId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const heroRef = useRef(null);
  const searchTimeout = useRef(null);

  const handleSearch = useCallback((value) => {
    setSearchInput(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchQuery(value);
      setSearchParams(prev => {
        if (value) prev.set("q", value);
        else prev.delete("q");
        return prev;
      });
    }, 300);
  }, [setSearchParams]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', activeCategory, initialCollection],
    queryFn: () => fetchProducts({ 
      category: activeCategory !== 'All' ? activeCategory : undefined,
      collection: initialCollection 
    })
  });

  const { data: collections = [] } = useQuery({
    queryKey: ['collections'],
    queryFn: fetchCollections,
  });

  // GSAP hero entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".shop-hero-text",
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: "power3.out", delay: 0.1 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, [initialCollection]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)) ||
        p.sku?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "price-asc") list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    if (sortBy === "price-desc") list.sort((b, a) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    if (sortBy === "new") list = list.filter((p) => p.newArrival).concat(list.filter((p) => !p.newArrival));
    
    return list;
  }, [products, sortBy, searchQuery]);

  const handleCollectionChange = (collTitle) => {
    setActiveCategory("All"); // Reset category when changing collection
    setSearchParams(prev => {
      if (collTitle === "All") prev.delete("collection");
      else prev.set("collection", collTitle);
      return prev;
    });
  };

  const clearFilters = () => {
    setActiveCategory("All");
    setSearchParams({});
  };

  return (
    <>
      <SEO
        title={pageTitle}
        description={initialCollection ? `Browse the ${initialCollection} collection at AstonnyFlyy. Exclusive street luxury pieces.` : 'Shop the latest collections at AstonnyFlyy. Discover premium streetwear, luxury fashion, and bold new drops.'}
      />
      <ScrollProgress />
      <Header />
      <main className="bg-background">
        {/* Hero Banner */}
        <section ref={heroRef} className="relative overflow-hidden bg-primary px-5 pb-20 pt-36 text-primary-foreground md:px-10 md:pb-28 md:pt-48">
          <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-accent/8 blur-3xl pointer-events-none" />
          <div className="mx-auto max-w-[1800px]">
            <p className="shop-hero-text mb-4 text-sm font-bold uppercase tracking-[0.42em] text-accent">
              {initialCollection || "The Collection"}
            </p>
            <h1 className="shop-hero-text font-display text-[clamp(4rem,12vw,13rem)] font-black uppercase leading-[0.8] tracking-[-0.08em]">
              {initialCollection || "The Collection"}
            </h1>
            <p className="shop-hero-text mt-8 max-w-lg text-lg text-white/65 md:text-xl">
              {initialCollection 
                ? `Exclusive pieces from our ${initialCollection} collection. Curated for the bold.`
                : "Every piece, every statement. Discover the full AstonnyFlyy universe."}
            </p>
          </div>
        </section>

        {/* Toolbar */}
        <div className="sticky top-[69px] z-30 border-b border-border bg-background/90 backdrop-blur-xl px-4 md:px-10">
          <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pr-2 scrollbar-none">
              <button
                onClick={() => handleCollectionChange("All")}
                className={`shrink-0 rounded-full px-5 py-2 text-sm font-bold uppercase tracking-wider transition ${
                  !initialCollection
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:bg-accent hover:text-primary hover:border-accent"
                }`}
              >
                All
              </button>
              {collections.map((coll) => (
                <button
                  key={coll.id}
                  onClick={() => handleCollectionChange(coll.title)}
                  className={`shrink-0 rounded-full px-5 py-2 text-sm font-bold uppercase tracking-wider transition ${
                    initialCollection === coll.title
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:bg-accent hover:text-primary hover:border-accent"
                  }`}
                >
                  {coll.title}
                </button>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="relative hidden sm:block">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-48 rounded-full border border-border bg-transparent py-2 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-accent transition-colors"
                />
                {searchInput && (
                  <button onClick={() => { setSearchInput(""); setSearchQuery(""); setSearchParams(prev => { prev.delete("q"); return prev; }); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-full border border-border bg-transparent px-4 py-2 text-sm font-bold uppercase tracking-wide focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="new">New Arrivals</option>
                <option value="price-asc">Price: Low–High</option>
                <option value="price-desc">Price: High–Low</option>
              </select>
            </div>
          </div>
          <div className="relative mx-auto max-w-[1800px] px-4 pb-4 sm:hidden">
            <Search className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-border bg-transparent py-2 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-accent transition-colors"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(""); setSearchQuery(""); setSearchParams(prev => { prev.delete("q"); return prev; }); }} className="absolute right-7 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <section className="px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-[1800px]">
            <div className="flex items-center justify-between mb-10">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">
                {filteredProducts.length} {filteredProducts.length === 1 ? "Item" : "Items"}
              </p>
              {(activeCategory !== "All" || initialCollection || searchQuery) && (
                <button onClick={() => { clearFilters(); setSearchInput(""); setSearchQuery(""); }} className="text-xs font-black uppercase tracking-widest text-accent hover:text-primary transition-colors flex items-center gap-2">
                  <X className="h-3 w-3" /> Clear All
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-accent" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Synchronizing Inventory...</p>
              </div>
            ) : collections.length > 0 && !initialCollection && activeCategory === 'All' ? (
              <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {collections.map((collection) => (
                  <StaggerItem key={collection.id}>
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
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : filteredProducts.length > 0 ? (
              <StaggerContainer className="grid gap-x-6 gap-y-10 grid-cols-2 sm:gap-x-7 sm:gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product, index) => (
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
            ) : (
              <div className="flex flex-col items-center gap-5 py-32 text-center">
                <p className="font-display text-5xl font-black uppercase tracking-tight opacity-20">No Items</p>
                <p className="text-muted-foreground">No products found in this selection yet.</p>
                <button onClick={clearFilters} className="mt-2 flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition">
                  <X className="h-4 w-4" /> Clear Filter
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
