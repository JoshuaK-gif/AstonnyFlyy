import { Link, useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import SEO from "@/components/common/SEO";
import PageNotFound from "./PageNotFound";

const sections = {
  faq: {
    title: "FAQ",
    items: [
      { q: "What payment methods do you accept?", a: "We accept Visa, Mastercard, American Express, and Mobile Money(Airtel and MTN). All transactions are processed securely." },
      { q: "How long does shipping take?", a: "Domestic orders are delivered within 1–5 business days. International shipping takes 10–14 business days. Expedited options are available at checkout." },
      { q: "What is your return policy?", a: "We offer a 14-day return window for unworn, unwashed items with tags intact. Return shipping is free for domestic orders. Refunds are processed within 5–7 business days after we receive the item." },
      { q: "How do I find my size?", a: "Refer to our Size Guide on each product page. If you're between sizes, we recommend sizing up for a relaxed fit. Contact us for personalized sizing advice." },
      { q: "Do you ship internationally?", a: "Yes, we ship to over 30 countries worldwide. Duties and taxes are calculated at checkout and are the responsibility of the customer." },
      { q: "How do I care for my AstonnyFlyy pieces?", a: "Each garment includes care instructions on the tag. Generally, we recommend cold wash, hang dry, and avoid bleach to preserve fabric quality and color." },
      { q: "Can I cancel or modify my order?", a: "Orders can be cancelled or modified within 1 hour of placement. Contact us immediately at livingstonetwinamatsiko2@gmail.com and we'll do our best to accommodate." },
      { q: "When do new collections drop?", a: "New collections drop seasonally. Follow us on Instagram and TikTok for exclusive previews and drop announcements." },
    ]
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
      { heading: "", text: "AstonnyFlyy is committed to protecting your privavcy and ensuring that your personal information is handled responsibly. This privacy policy explains how we collect, use,store, and protect your information when you visit our websites, create an account or purchase our products. " },
      { heading: "Information We Collect", text: "when you interact with our websites, we may collect the following information:personal, technical, and optional information" },
      { heading: "How We Use Your Information", text: "We use your information to process and fulfill your orders, deliver products to your preffered address, verify payments and prevent fraudulent transactions and provide customer support." },
      { heading: "Data Security", text: "Protecting your information is a priority. We use appropriate technical security measures to safeguard your personal information against unauthorised access, alteration, disclosure or destruction. These measures include: securing website encryption, payment processing, restricted access to customer information and regular security monitoring and updates. While we strive to protect your data, no method of internet transmission or electronic storage is completely secure. We therefore cannot guarantee absolute security." },
      { heading: "Cookies", text: "Our website uses cookies and similar technologies to improve your browsing your browsing experience. Cookies helpus remember your preferences, keep items in your shopping cart, understand how visitors use our website, improve website performance and provide a more personalized shopping experience. You can manage or disable cookies through your browser settings. Please note that dsiabling cookies may affect certain features of the website." },
      { heading: "Third-Party Services", text: "To operate our business efficiently, we may use trusted third-party services providers, including payment gateways, shipping and delivery partners, website hosting providers, analytics services and email marketing platforms" },
      { heading: "Your Rights", text: "Depending on applicable laws, you may have the right to access the personal information we hold about you, request corrections to inaccurate or incomplete information and request deletion of your personal information where legally permitted." },
      { heading: "Updates", text: "We may update this privacy policy from time to time to reflect changes in our business practices, technology or legal requirements. Any updates will be posted on this page with a revised Effective Date. We encourage you to review this privacy policy periodically to stay informed about how we protect your information. By using the AstonnyFlyy website, you acknpwledge that you have read and understood this privacy policy and agree to the collection and use of your information as described above." },
    ]
  },
  terms: {
    title: "Terms & Conditions",
    sections: [
      { heading: "Acceptance", text: "By using AstonnyFlyy.com, you agree to these terms. If you do not agree, please refrain from using our services." },
      { heading: "Products & Pricing", text: "All prices are listed in USD and are subject to change without notice. We reserve the right to modify or discontinue products at any time. Product images are for illustration; actual colors may vary slightly." },
      { heading: "Orders", text: "Placing an order constitutes an offer to purchase. We reserve the right to accept or decline orders for any reason, including stock limitations or payment issues. Order confirmations are sent via email." },
      { heading: "Payments", text: "Payment is due at the time of purchase. We accept major credit cards and mobile money (Airtel and MTN). All transactions are processed securely via trusted payment gateways." },
      { heading: "Shipping & Delivery", text: "Shipping times are estimates and not guaranteed. We are not responsible for delays caused by carriers, customs, or force majeure. Risk of loss passes to you upon delivery." },
      { heading: "Returns & Refunds", text: "Returns are accepted within 14 days of delivery for unworn, unwashed items in original packaging. Refunds are issued to the original payment method. See our FAQ for full details." },
      { heading: "Intellectual Property", text: "All content on this site — including logos, designs, text, and images — is the property of AstonnyFlyy and may not be reproduced without written permission." },
      { heading: "Limitation of Liability", text: "AstonnyFlyy is not liable for indirect or incidental damages arising from the use of our products or website, to the fullest extent permitted by law." },
      { heading: "Governing Law", text: "These terms are governed by the laws of Uganda. Any disputes shall be resolved in the courts of Kampala, Uganda." }
    ]
  }
};

function FaqPage() {
  const page = sections.faq;
  return (
    <div className="space-y-6">
      {page.items.map((item, i) => (
        <details key={i} className="group rounded-2xl border border-border p-6 open:bg-card transition-all">
          <summary className="flex cursor-pointer items-center justify-between font-bold text-lg">
            {item.q}
            <span className="text-2xl transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-4 text-muted-foreground leading-relaxed">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

function ContentPage({ page }) {
  return (
    <div className="space-y-10">
      {page.sections.map((s, i) => (
        <div key={i}>
          <h2 className="text-xl font-black uppercase tracking-tight mb-3">{s.heading}</h2>
          <p className="text-lg leading-relaxed text-muted-foreground">{s.text}</p>
        </div>
      ))}
    </div>
  );
}

export default function InfoPage() {
  const { slug } = useParams();
  if (!sections[slug]) return <PageNotFound />;
  const page = sections[slug];
  
  const desc = slug === 'faq' ? 'Frequently asked questions about AstonnyFlyy — shipping, returns, sizing, and more.' : undefined;

  return (
    <>
      <SEO title={page.title} description={desc} />
      <Header />
      <main className="min-h-screen bg-background px-5 pb-24 pt-40 md:px-10">
        <section className="mx-auto max-w-5xl">
          <Link to="/" className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">Back to AstonnyFlyy</Link>
          <h1 className={`mt-10 font-display font-black uppercase leading-[0.82] tracking-[-0.07em] ${slug === 'terms' ? 'text-[clamp(1.8rem,4vw,3.5rem)]' : 'text-[clamp(2.5rem,6vw,5rem)]'}`}>{page.title}</h1>
          <div className="mt-14">
            {slug === 'faq' ? <FaqPage /> : <ContentPage page={page} />}
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
