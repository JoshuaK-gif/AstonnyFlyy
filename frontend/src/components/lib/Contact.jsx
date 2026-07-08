import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import LoadingScreen from "@/components/common/LoadingScreen";
import ScrollProgress from "@/components/common/ScrollProgress";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import MagneticButton from "@/components/common/MagneticButton";
import { submitMessage } from "@/lib/api";
import { toast } from "sonner";
import SEO from "@/components/common/SEO";

export default function Contact() {
  const pageRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await submitMessage(formData);
      toast.success("Message sent successfully!", {
        description: "We'll get back to you as soon as possible."
      });
      setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
    } catch (error) {
      toast.error("Failed to send message", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const ctx = gsap.context(() => {
      gsap.fromTo(".contact-hero-text", { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power3.out", delay: 0.5
      });
      
      gsap.fromTo(".contact-card", { opacity: 0, x: -30 }, {
        opacity: 1, x: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.8
      });
      
      gsap.fromTo(".contact-form", { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 1
      });
    }, pageRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef}>
      <SEO title="Contact Us" description="Get in touch with AstonnyFlyy. Reach out for inquiries, collaborations, or just to say hello." />
      <LoadingScreen />
      <ScrollProgress />
      <Header />
      
      <main>
        {/* Contact Hero */}
        <section className="relative overflow-hidden bg-primary px-5 pb-24 pt-36 text-primary-foreground md:px-10 md:pb-32 md:pt-48">
          <div className="absolute inset-0 h-full w-full">
            <img 
              src="https://media.base44.com/images/public/6a2c25958136d9426eca8288/eeecd1355_generated_8fbbcd65.png" 
              alt="" 
              className="h-full w-full object-cover opacity-20" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary/80 to-primary" />
          </div>
          
          <div className="relative z-10 mx-auto max-w-[1800px]">
            <p className="contact-hero-text mb-4 text-sm font-bold uppercase tracking-[0.42em] text-accent">Get In Touch</p>
            <h1 className="contact-hero-text font-display text-[clamp(3.5rem,10vw,12rem)] font-black uppercase leading-[0.82] tracking-[-0.07em]">
              Connect<br />With The<br /><span className="text-accent">Movement</span>
            </h1>
          </div>
        </section>

        {/* Contact Content */}
        <section className="bg-background px-5 py-24 md:px-10 md:py-36">
          <div className="mx-auto max-w-[1800px]">
            <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
              {/* Info Column */}
              <div className="space-y-12">
                <div className="contact-card">
                  <h3 className="mb-6 text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">General Inquiries</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <p className="text-xl font-bold">livingstonetwinamatsiko2@gmail.com</p>
                  </div>
                </div>
                
                <div className="contact-card">
                  <h3 className="mb-6 text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Call Us</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary">
                      <Phone className="h-5 w-5" />
                    </div>
                    <p className="text-xl font-bold">+256-788-251-036</p>
                  </div>
                </div>
                
                <div className="contact-card">
                  <h3 className="mb-6 text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Studio Location</h3>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <p className="text-xl font-bold leading-tight">
                      Kampala-Uganda
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Column */}
              <div className="contact-form rounded-[2.5rem] border border-border bg-card p-8 md:p-14">
                <form onSubmit={handleSubmit} className="grid gap-8">
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="John Doe" 
                        className="w-full border-b border-border bg-transparent py-3 text-lg font-bold outline-none focus:border-primary transition-colors" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="john@example.com" 
                        className="w-full border-b border-border bg-transparent py-3 text-lg font-bold outline-none focus:border-primary transition-colors" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Subject</label>
                    <select 
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full border-b border-border bg-transparent py-3 text-lg font-bold outline-none focus:border-primary transition-colors appearance-none"
                    >
                      <option>General Inquiry</option>
                      <option>Order Support</option>
                      <option>Collaboration</option>
                      <option>Press</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Message</label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      placeholder="How can we help?" 
                      rows={4} 
                      className="w-full border-b border-border bg-transparent py-3 text-lg font-bold outline-none focus:border-primary transition-colors resize-none" 
                    />
                  </div>
                  
                  <div className="pt-4">
                    <MagneticButton type="submit" disabled={loading} className="w-full md:w-auto">
                      <span className="flex items-center gap-2">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Message"} 
                        {!loading && <Send className="h-4 w-4" />}
                      </span>
                    </MagneticButton>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <CartDrawer />
    </div>
  );
}
