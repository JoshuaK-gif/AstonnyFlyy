import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import SEO from '@/components/common/SEO';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <>
      <SEO title="Order Confirmed" description="Your payment has been confirmed. Thank you for your order at AstonnyFlyy." />
      <Header />
      <main className="min-h-screen bg-background px-5 pt-40 pb-24 md:px-10 flex flex-col items-center justify-center text-center">
        <div className="mx-auto max-w-lg">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="font-display text-5xl font-black uppercase tracking-tight">Payment Successful!</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Thank you for your order. Your payment has been confirmed.
          </p>
          {orderNumber && (
            <p className="mt-4 text-sm font-mono font-bold text-accent">
              Order Reference: {orderNumber}
            </p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            We will notify you when your items ship.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop" className="rounded-full bg-primary text-primary-foreground px-8 py-4 font-black uppercase tracking-widest text-xs hover:bg-accent hover:text-primary transition-all">
              Continue Shopping
            </Link>
            <Link to="/" className="rounded-full border border-border px-8 py-4 font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-primary-foreground transition-all">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
