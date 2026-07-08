import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import LoadingScreen from "@/components/common/LoadingScreen";
import ScrollProgress from "@/components/common/ScrollProgress";
import BrandStorySection from "@/components/home/BrandStorySection";
import ImpactNumbersSection from "@/components/home/ImpactNumbersSection";
import CommunitySection from "@/components/home/CommunitySection";
import NewsletterSection from "@/components/home/NewsletterSection";
import { useEffect } from "react";
import SEO from "@/components/common/SEO";
import { useQuery } from '@tanstack/react-query';
import { fetchSiteSettings } from '@/lib/api';

export default function About() {
  const { data: settings } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: fetchSiteSettings
  });

  // Ensure we start at the top of the page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEO title="About Us" description="Learn the story behind AstonnyFlyy — modern street luxury redefining urban fashion." />
      <LoadingScreen />
      <ScrollProgress />
      <Header />
      <main>
        <h1 className="sr-only">About AstonnyFlyy — Modern Street Luxury</h1>
        <BrandStorySection settings={settings} />
        <ImpactNumbersSection />
        <CommunitySection />
        <NewsletterSection />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
