import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, ArrowRight, ArrowUpRight, Loader2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchDashboardStats } from '@/lib/api';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const statsCards = stats ? [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Orders', value: stats.activeOrders, icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Inquiries', value: stats.unreadMessages, icon: Mail, color: 'text-rose-600', bg: 'bg-rose-100' },
    { label: 'Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-100' },
  ] : [];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, i) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-display text-xl font-black uppercase tracking-tight">Revenue Analytics</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Last 7 days performance</p>
            </div>
          </div>
          
          <div className="h-64 flex items-end gap-3 px-2">
            {stats && stats.revenueHistory && stats.revenueHistory.map((item, i) => {
              const maxAmount = Math.max(...stats.revenueHistory.map(h => h.amount), 1);
              const height = (item.amount / maxAmount) * 100;
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                  <div className="relative w-full">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 5)}%` }}
                      transition={{ delay: 0.5 + (i * 0.1), duration: 1, ease: "circOut" }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${i === 6 ? 'bg-primary' : 'bg-slate-100 group-hover/bar:bg-slate-200'}`}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded whitespace-nowrap z-10">
                      ${item.amount.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="mb-6 font-display text-xl font-black uppercase tracking-tight">Quick Actions</h3>
          <div className="grid gap-4">
            <Link to="/admin/products/new" className="group flex items-center justify-between rounded-xl border border-slate-100 p-4 text-left hover:border-accent hover:bg-accent/5 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-accent group-hover:bg-white transition-colors">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">Add Product</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">New collection item</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-accent transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/admin/orders" className="group flex items-center justify-between rounded-xl border border-slate-100 p-4 text-left hover:border-accent hover:bg-accent/5 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-accent group-hover:bg-white transition-colors">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">Manage Orders</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Customer purchases</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-accent transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Latest Storefront View</h4>
            <Link to="/" target="_blank" className="relative block group overflow-hidden rounded-xl bg-slate-900 aspect-video">
              <div className="absolute inset-0 flex items-center justify-center text-white/20 font-display text-4xl font-black italic group-hover:scale-110 transition-transform">FLY</div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <span className="text-[10px] font-black uppercase text-white flex items-center gap-2">
                  View Live Site <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
