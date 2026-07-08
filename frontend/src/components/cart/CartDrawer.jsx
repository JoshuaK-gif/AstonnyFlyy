import React from 'react';
import { useCart } from './CartProvider';
import { ShoppingBag, X, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal } = useCart();
  const freeShippingThreshold = 500;
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remaining = freeShippingThreshold - subtotal;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-black uppercase tracking-tight">Your Bag</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">{items.length}</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-full p-2 hover:bg-accent hover:text-primary transition-colors group">
                <X className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="bg-slate-50 px-6 py-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  <Truck className="h-3 w-3" /> 
                  {remaining > 0 ? `Spend $${remaining.toFixed(2)} more for free shipping` : 'You qualify for free shipping!'}
                </p>
                <span className="text-[10px] font-black text-primary">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {items.length > 0 ? (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.key} className="flex gap-4 group">
                      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-100">
                        <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                      </div>
                      <div className="flex flex-1 flex-col justify-between py-0.5">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-bold text-slate-900 leading-tight">{item.product.name}</h3>
                            <button onClick={() => removeItem(item.key)} className="text-slate-300 hover:text-accent transition-colors">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mt-1 text-[10px] font-black uppercase tracking-tighter text-slate-400">
                            {item.size} / {item.color}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center rounded-lg border border-slate-200 p-1">
                            <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="p-1 hover:bg-accent hover:text-primary rounded transition-all disabled:opacity-30" disabled={item.quantity <= 1}>
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="p-1 hover:bg-accent hover:text-primary rounded transition-all">
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="font-black text-slate-900">${((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center opacity-40">
                  <ShoppingBag className="mb-4 h-12 w-12" />
                  <p className="font-display text-lg font-black uppercase italic">Your bag is empty</p>
                  <button onClick={() => setIsOpen(false)} className="mt-4 text-xs font-black uppercase underline tracking-widest hover:text-accent transition-colors">Start Shopping</button>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-slate-100 p-6 space-y-4 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <span>Shipping</span>
                    <span>{remaining <= 0 ? 'FREE' : 'Calculated at checkout'}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-100">
                    <span className="text-lg font-black uppercase tracking-tight">Total</span>
                    <span className="text-lg font-black text-primary">${subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Link 
                    to="/checkout" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-full bg-primary py-4 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-accent hover:text-primary transition-all active:scale-[0.98]"
                  >
                    Checkout <ArrowRight className="h-4 w-4" />
                  </Link>
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <ShieldCheck className="h-3 w-3" /> Secure SSL Encryption
                  </div>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
