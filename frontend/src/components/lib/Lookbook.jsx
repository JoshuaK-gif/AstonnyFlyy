import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import LoadingScreen from "@/components/common/LoadingScreen";
import ScrollProgress from "@/components/common/ScrollProgress";
import LookbookSection from "@/components/home/LookbookSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import { useEffect } from "react";
import SEO from "@/components/common/SEO";

export default function Lookbook() {
  // Ensure we start at the top of the page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEO title="Lookbook" description="Explore the AstonnyFlyy lookbook — curated visual stories from our latest collections." />
      <LoadingScreen />
      <ScrollProgress />
      <Header />
      <main>
        <h1 className="sr-only">AstonnyFlyy Lookbook</h1>
        <LookbookSection />
        <NewsletterSection />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
