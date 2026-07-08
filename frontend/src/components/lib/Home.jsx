import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import LoadingScreen from "@/components/common/LoadingScreen";
import ScrollProgress from "@/components/common/ScrollProgress";
import HeroSection from "@/components/home/HeroSection";
import CollectionsSection from "@/components/home/CollectionsSection";
import BrandStorySection from "@/components/home/BrandStorySection";
import LookbookSection from "@/components/home/LookbookSection";
import ImpactNumbersSection from "@/components/home/ImpactNumbersSection";
import CommunitySection from "@/components/home/CommunitySection";
import NewsletterSection from "@/components/home/NewsletterSection";
import { useQuery } from '@tanstack/react-query';
import { fetchSiteSettings } from '@/lib/api';
import SEO from '@/components/common/SEO';

export default function Home() {
  const { data: settings } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: fetchSiteSettings
  });

  return (
    <>
      <SEO title="Home" description="Discover AstonnyFlyy — premium street luxury fashion. Explore bold collections, lookbooks, and the latest drops." />
      <LoadingScreen />
      <ScrollProgress />
      <Header />
      <main>
        <HeroSection settings={settings} />
        <CollectionsSection settings={settings} />
        <BrandStorySection settings={settings} />
        <LookbookSection settings={settings} />
        <ImpactNumbersSection settings={settings} />
        <CommunitySection settings={settings} />
        <NewsletterSection settings={settings} />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
