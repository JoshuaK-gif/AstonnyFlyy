import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Minus, Plus, ShieldCheck, Truck, Loader2, Star, Send } from "lucide-react";
import { useWishlist } from "@/components/hooks/useWishlist";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import ScrollProgress from "@/components/common/ScrollProgress";
import MagneticButton from "@/components/common/MagneticButton";
import ProductCard from "@/components/products/ProductCard";
import { useCart } from "@/components/cart/CartProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProductById, fetchProducts, fetchReviews, submitReview } from "@/lib/api";
import SEO from "@/components/common/SEO";
import { toast } from "sonner";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    enabled: !!id
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts()
  });

  const related = useMemo(() => {
    if (!product) return [];
    return allProducts.filter((item) => item.id !== product.id).slice(0, 3);
  }, [allProducts, product]);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [lens, setLens] = useState({ x: 50, y: 50 });
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const queryClient = useQueryClient();

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => fetchReviews(id),
    enabled: !!id
  });

  const [reviewForm, setReviewForm] = useState({ name: "", email: "", rating: 5, comment: "" });
  const reviewMutation = useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      toast.success("Review submitted successfully!");
      setReviewForm({ name: "", email: "", rating: 5, comment: "" });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit review");
    }
  });

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    reviewMutation.mutate({ ...reviewForm, productId: id });
  };

  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      }
    }
  }, [product]);

  if (isLoading) {
    return (
      <>
        <ScrollProgress />
        <Header />
        <main className="bg-background pt-28 min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loading Product Details...</p>
        </main>
        <Footer />
        <CartDrawer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <ScrollProgress />
        <Header />
        <main className="bg-background pt-28 min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <p className="text-lg font-bold text-red-500">Failed to load product</p>
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to shop
          </Link>
        </main>
        <Footer />
        <CartDrawer />
      </>
    );
  }

  const productJsonLd = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images?.[0],
    "sku": product.sku,
    "brand": { "@type": "Brand", "name": product.brand },
    "offers": {
      "@type": "Offer",
      "price": product.discountPrice || product.price,
      "priceCurrency": "USD",
      "availability": product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  } : null;

  return (
    <>
      <SEO
        title={product?.name}
        description={product?.description}
        image={product?.images?.[0]}
        url={`https://astonnyflyy.com/product/${id}`}
        type="product"
        jsonLd={productJsonLd}
      />
      <ScrollProgress />
      <Header />
      <main className="bg-background pt-12">
        <section className="mx-auto grid max-w-[900px] gap-3 px-3 pb-4 md:grid-cols-2 md:px-4">
          <aside className="top-28 h-fit md:sticky order-2 md:order-1">
            <button onClick={() => navigate('/shop')} className="mb-4 hidden md:inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-accent transition-colors cursor-pointer"><ArrowLeft className="h-4 w-4" /> Back to shop</button>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-accent">{product.category}</p>
            <h1 className="mt-4 font-display text-[clamp(3rem,7vw,7rem)] font-black uppercase leading-[0.82] tracking-[-0.07em]">{product.name}</h1>
            <div className="mt-6 flex items-center gap-4 text-3xl font-black">
              {product.discountPrice && <span className="text-muted-foreground line-through">${product.price}</span>}
              <span>${product.discountPrice || product.price}</span>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            <div className="mt-3 space-y-3 rounded-xl border border-border bg-card p-3">
              <div>
                <p className="mb-3 text-sm font-black uppercase tracking-[0.2em]">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes?.map((size) => <button key={size} onClick={() => setSelectedSize(size)} className={`rounded-full border px-3 py-1.5 text-sm font-bold transition-all ${selectedSize === size ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent hover:text-primary hover:border-accent"}`}>{size}</button>)}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-black uppercase tracking-[0.2em]">Color</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors?.map((color) => <button key={color} onClick={() => setSelectedColor(color)} className={`rounded-full border px-5 py-3 font-bold transition-all ${selectedColor === color ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent hover:text-primary hover:border-accent"}`}>{color}</button>)}
                </div>
              </div>
              <div className="flex items-center justify-between gap-5">
                <div className="flex items-center rounded-full border border-border">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-4 hover:bg-accent hover:text-primary rounded-l-full transition-all"><Minus className="h-4 w-4" /></button>
                  <span className="px-4 font-black">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-4 hover:bg-accent hover:text-primary rounded-r-full transition-all"><Plus className="h-4 w-4" /></button>
                </div>
                <button onClick={() => toggleWishlist(product.id)} className={`rounded-full border p-4 transition-all ${isWishlisted(product.id) ? "bg-red-500/10 border-red-500 text-red-500" : "border-border hover:bg-accent hover:text-primary"}`} aria-label="Toggle wishlist"><Heart className={`h-5 w-5 ${isWishlisted(product.id) ? "fill-current" : ""}`} /></button>
              </div>
              <MagneticButton onClick={() => addItem(product, { size: selectedSize, color: selectedColor, quantity })} className="w-full">Add To Bag</MagneticButton>
              <div className="grid gap-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Truck className="h-4 w-4 text-accent" /> Complimentary shipping information area</p>
                <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> Secure product support and authenticity promise</p>
              </div>

              <div className="border-t border-border pt-6 mt-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-primary">Specifications</h4>
                <div className="grid grid-cols-2 gap-y-3.5 text-xs">
                  <span className="font-bold text-muted-foreground uppercase tracking-wider">Brand</span>
                  <span className="font-black text-right uppercase text-primary">{product.brand || 'AstonnyFlyy'}</span>
                  
                  <span className="font-bold text-muted-foreground uppercase tracking-wider">Category</span>
                  <span className="font-black text-right uppercase text-primary">{product.category}</span>
                  
                  <span className="font-bold text-muted-foreground uppercase tracking-wider">SKU</span>
                  <span className="font-mono font-bold text-right text-primary">{product.sku}</span>
                  
                  <span className="font-bold text-muted-foreground uppercase tracking-wider">Availability</span>
                  <span className={`font-black text-right uppercase ${product.stockStatus === 'In Stock' ? 'text-green-600' : 'text-amber-600'}`}>{product.stockStatus}</span>
                  
                  {product.sizes && product.sizes.length > 0 && (
                    <>
                      <span className="font-bold text-muted-foreground uppercase tracking-wider">Sizes</span>
                      <span className="font-black text-right uppercase text-primary">{product.sizes.join(', ')}</span>
                    </>
                  )}
                  
                  {product.colors && product.colors.length > 0 && (
                    <>
                      <span className="font-bold text-muted-foreground uppercase tracking-wider">Colors</span>
                      <span className="font-black text-right uppercase text-primary">{product.colors.join(', ')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </aside>
          <div className="space-y-5 order-1 md:order-2">
            {product.images.map((image, index) => (
              <div key={image} onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setLens({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
              }} className="group relative overflow-hidden rounded-2xl bg-muted aspect-[4/3] max-w-sm">
                <img src={image} alt={`${product.name} gallery image ${index + 1}`} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" loading={index === 0 ? "eager" : "lazy"} />
                <div className="pointer-events-none absolute h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 bg-white/10 opacity-0 backdrop-blur-sm transition lg:group-hover:opacity-100 hidden lg:block" style={{ left: `${lens.x}%`, top: `${lens.y}%` }} />
              </div>
            ))}

          </div>
        </section>
        <section className="px-3 pb-4 md:px-4">
          <div className="mx-auto max-w-[900px]">
            <h2 className="mb-4 font-display text-3xl font-black uppercase tracking-[-0.06em] md:text-4xl">Customer Reviews</h2>
            <div className="grid gap-4 lg:grid-cols-[1fr_350px]">
              <div className="rounded-xl border border-border p-4">
                <div className="flex flex-col gap-6">
                  {reviews.length > 0 ? (
                    reviews.map((review, i) => (
                      <div key={review.id} className="border-b border-border pb-6 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1,2,3,4,5].map((s) => (
                              <Star key={s} className={`h-4 w-4 ${s <= review.rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                            ))}
                          </div>
                          <span className="text-sm font-bold uppercase tracking-wide">{review.name}</span>
                          <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-lg text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-[2rem] border border-border p-8 bg-card h-fit sticky top-28">
                <h3 className="text-xl font-black uppercase tracking-[-0.03em] mb-6">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-5">
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Name *</label>
                    <input type="text" required value={reviewForm.name} onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent transition-colors" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Email</label>
                    <input type="email" value={reviewForm.email} onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent transition-colors" placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Rating *</label>
                    <div className="mt-2 flex gap-1">
                      {[1,2,3,4,5].map((s) => (
                        <button type="button" key={s} onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                          <Star className={`h-7 w-7 ${s <= reviewForm.rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Review *</label>
                    <textarea required value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} rows={4} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent transition-colors resize-none" placeholder="Share your thoughts..." />
                  </div>
                  <button type="submit" disabled={reviewMutation.isPending} className="w-full rounded-full bg-primary py-4 text-sm font-black uppercase tracking-[0.2em] text-primary-foreground transition-all hover:bg-accent hover:text-primary disabled:opacity-50 flex items-center justify-center gap-2">
                    {reviewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
        <section className="px-5 pb-28 md:px-10">
          <div className="mx-auto max-w-[1800px]">
            <h2 className="mb-6 font-display text-3xl font-black uppercase tracking-[-0.06em] md:text-4xl">Related Products</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{related.map((item, index) => <ProductCard key={item.id} product={item} index={index} />)}</div>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
