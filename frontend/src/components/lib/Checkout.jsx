import React, { useState, useCallback } from 'react';
import { useCart } from '../cart/CartProvider';
import { ShieldCheck, Truck, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { createOrder } from '@/lib/api';
import SEO from '@/components/common/SEO';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Checkout() {
  const { items, subtotal: cartTotal } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const initiatePesapal = useCallback(async () => {
    try {
      setLoading(true);
      const orderData = {
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`,
        totalAmount: cartTotal,
        items: items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.discountPrice || item.product.price,
          size: item.size,
          color: item.color
        }))
      };
      const createdOrder = await createOrder(orderData);
      const orderNumber = createdOrder.orderNumber;
      const res = await fetch(`${API_URL}/pesapal/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          totalAmount: cartTotal,
          currency: 'USD',
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate payment');
      window.location.href = data.redirectUrl;
    } catch (error) {
      toast.error('Payment Initiation Failed', { description: error.message });
      setLoading(false);
    }
  }, [formData, cartTotal, items]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    await initiatePesapal();
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <h2 className="text-2xl font-black uppercase mb-4">Your bag is empty</h2>
        <Link to="/shop" className="text-accent underline font-bold uppercase tracking-widest text-sm">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <SEO title="Secure Checkout" description="Complete your purchase at AstonnyFlyy. Secure checkout with multiple payment options." />
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2">
        {/* Left Column: Form */}
        <div className="p-6 md:p-12 lg:p-20">
          <Link to="/shop" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-12 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Shop</span>
          </Link>

          <div className="mb-12">
            <h1 className="font-display text-4xl font-black uppercase tracking-tight mb-4">Checkout</h1>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
              <span className={step === 1 ? 'text-primary' : 'text-slate-300'}>Shipping</span>
              <ChevronRight className="h-3 w-3 text-slate-300" />
              <span className={step === 2 ? 'text-primary' : 'text-slate-300'}>Payment</span>
            </div>
          </div>

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handlePlaceOrder} className="space-y-8">
            {step === 1 ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="grid gap-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Contact Information</h3>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address" 
                    required 
                    className="w-full rounded-xl border border-slate-200 bg-white p-4 focus:border-accent focus:outline-none transition-colors" 
                  />
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number (Optional)" 
                    className="w-full rounded-xl border border-slate-200 bg-white p-4 focus:border-accent focus:outline-none transition-colors" 
                  />
                </div>
                
                <div className="grid gap-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Shipping Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First Name" 
                      required 
                      className="rounded-xl border border-slate-200 bg-white p-4 focus:border-accent focus:outline-none" 
                    />
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last Name" 
                      required 
                      className="rounded-xl border border-slate-200 bg-white p-4 focus:border-accent focus:outline-none" 
                    />
                  </div>
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Address" 
                    required 
                    className="w-full rounded-xl border border-slate-200 bg-white p-4 focus:border-accent focus:outline-none" 
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <input 
                      type="text" 
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City" 
                      required 
                      className="rounded-xl border border-slate-200 bg-white p-4 focus:border-accent focus:outline-none" 
                    />
                    <input 
                      type="text" 
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State" 
                      required 
                      className="rounded-xl border border-slate-200 bg-white p-4 focus:border-accent focus:outline-none" 
                    />
                    <input 
                      type="text" 
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      placeholder="ZIP" 
                      required 
                      className="rounded-xl border border-slate-200 bg-white p-4 focus:border-accent focus:outline-none" 
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-slate-900 text-white rounded-full py-5 font-black uppercase tracking-widest text-xs hover:bg-accent hover:text-primary transition-all shadow-xl">
                  Continue to Payment
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Payment</h3>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center gap-4">
                    <img src="https://pesapal.com/favicon.ico" alt="Pesapal" className="h-8 w-8 rounded" onError={(e) => e.target.style.display = 'none'} />
                    <div className="flex-1">
                      <p className="font-bold text-sm">Pay with Pesapal</p>
                      <p className="text-xs text-slate-500 mt-0.5">Mobile Money, Visa, Mastercard & more</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center gap-4">
                    <ShieldCheck className="h-8 w-8 text-green-500 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Secure Checkout via Pesapal</p>
                      <p className="text-xs text-slate-500 mt-1">You will be redirected to Pesapal to complete payment.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setStep(1)} disabled={loading} className="border border-slate-200 text-slate-900 rounded-full py-5 font-black uppercase tracking-widest text-xs hover:bg-white transition-all disabled:opacity-50">
                    Go Back
                  </button>
                  <button type="submit" disabled={loading} className="bg-primary text-white rounded-full py-5 font-black uppercase tracking-widest text-xs hover:bg-accent hover:text-primary transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting...</> : 'Pay with Pesapal'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="bg-white border-l border-slate-200 p-6 md:p-12 lg:p-20 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10">Order Summary</h2>
          
          <div className="space-y-6 mb-10">
            {items.map((item) => (
              <div key={item.key} className="flex gap-4">
                <div className="h-20 w-16 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                  <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-slate-900">{item.product.name}</h4>
                    <span className="text-sm font-black">${((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mt-1">{item.size} / {item.color}</p>
                  <p className="text-[10px] font-bold text-slate-400">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-8 space-y-4">
            <div className="flex justify-between text-sm font-bold text-slate-500 uppercase tracking-widest">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-500 uppercase tracking-widest">
              <span>Shipping</span>
              <span className="text-green-600">FREE</span>
            </div>
            <div className="flex justify-between items-end pt-6 border-t border-slate-100">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Total Amount</p>
                <p className="text-4xl font-display font-black uppercase leading-none tracking-tighter text-slate-900">${cartTotal.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Includes Taxes</p>
                <div className="flex items-center gap-1.5 text-primary">
                  <Truck className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">Fast Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
