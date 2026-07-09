import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Search, Download, ExternalLink, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchOrders, updateOrderStatus } from '@/lib/api';
import moment from 'moment';

const STATUS_OPTIONS = [
  { label: 'Pending', color: 'text-amber-600 bg-amber-100' },
  { label: 'Processing', color: 'text-blue-600 bg-blue-100' },
  { label: 'Shipped', color: 'text-purple-600 bg-purple-100' },
  { label: 'Delivered', color: 'text-green-600 bg-green-100' },
  { label: 'Cancelled', color: 'text-red-600 bg-red-100' }
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to fetch customer orders");
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      setUpdating(true);
      await updateOrderStatus(id, status);
      toast.success(`Order status updated to ${status}`);
      // Refresh local state
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(prev => ({ ...prev, status }));
      }
    } catch {
      toast.error("Status update failed");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    return STATUS_OPTIONS.find(s => s.label === status)?.color || 'text-slate-600 bg-slate-100';
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadCSV = () => {
    toast.promise(
      new Promise((resolve) => {
        const headers = ['Order #', 'Customer', 'Date', 'Total', 'Status'];
        const csvContent = [
          headers.join(','),
          ...orders.map(order => [
            order.orderNumber,
            order.customerName,
            moment(order.createdAt).format('ll'),
            order.totalAmount,
            order.status
          ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `astonny_flyy_orders_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        
        setTimeout(() => {
          link.click();
          document.body.removeChild(link);
          resolve();
        }, 800);
      }),
      {
        loading: 'Preparing order export...',
        success: 'Orders exported successfully!',
        error: 'Export failed. Please try again.',
      }
    );
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-display text-2xl font-black uppercase tracking-tight text-slate-900">
          Customer Orders ({filteredOrders.length})
        </h3>
        <div className="flex gap-2">
           <button 
            onClick={loadOrders}
            className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            Refresh
          </button>
          <button 
            onClick={downloadCSV}
            className="flex items-center justify-center gap-2 rounded-full bg-slate-900 text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-accent hover:text-primary transition-all shadow-sm active:scale-95"
          >
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by Order # or Customer Name..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm focus:border-accent focus:outline-none transition-colors shadow-sm"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Mobile Card View */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filteredOrders.map((order) => (
            <div key={order.id} onClick={() => setSelectedOrder(order)} className="p-4 space-y-2 cursor-pointer active:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary text-sm">{order.orderNumber}</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-tighter ${getStatusColor(order.status)}`}>
                  {order.status === 'Delivered' && <CheckCircle className="h-3 w-3" />}
                  {['Pending', 'Processing'].includes(order.status) && <Clock className="h-3 w-3" />}
                  {order.status === 'Shipped' && <Package className="h-3 w-3" />}
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                  <p className="text-[9px] text-slate-400 uppercase font-black">{order.customerEmail}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900">${order.totalAmount.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-400 font-bold">{moment(order.createdAt).format('ll')}</p>
                </div>
              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-bold">No orders found matching your search.</div>
          )}
        </div>
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Order #</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Customer</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Date</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} onClick={() => setSelectedOrder(order)} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 font-bold text-primary">{order.orderNumber}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">{order.customerEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tighter ${getStatusColor(order.status)}`}>
                      {order.status === 'Delivered' && <CheckCircle className="h-3 w-3" />}
                      {['Pending', 'Processing'].includes(order.status) && <Clock className="h-3 w-3" />}
                      {order.status === 'Shipped' && <Package className="h-3 w-3" />}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{moment(order.createdAt).format('ll')}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className="font-black text-slate-900">${order.totalAmount.toLocaleString()}</span>
                      <ExternalLink className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold">No orders found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
              >
                <div className="bg-slate-900 p-8 text-white">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-accent text-xs font-black uppercase tracking-[0.2em] mb-1">Order Details</p>
                      <h4 className="text-3xl font-display font-black uppercase leading-none">{selectedOrder.orderNumber}</h4>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="text-white/40 hover:text-white transition-colors">
                      <XCircle className="h-8 w-8" />
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Customer</p>
                      <p className="font-bold">{selectedOrder.customerName}</p>
                      <p className="text-[10px] text-white/60">{selectedOrder.customerEmail}</p>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Status</p>
                      <p className={`font-black uppercase text-xs px-2 py-1 rounded-full inline-block mt-1 ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <div>
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Purchased Items</h5>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">ITEM</div>
                            <div>
                               <p className="font-bold text-slate-800 text-sm leading-tight">{item.name}</p>
                               <p className="text-[9px] font-black uppercase text-slate-400">{item.size} / {item.color}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-slate-900">${item.price.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400 font-bold">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Shipping Information</h5>
                    <p className="text-sm font-bold text-slate-600 leading-relaxed">{selectedOrder.shippingAddress}</p>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-bold">Subtotal</span>
                      <span className="text-slate-900 font-bold">${selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-slate-100">
                      <span className="text-lg font-black uppercase tracking-tight">Total Paid</span>
                      <span className="text-lg font-black text-primary">${selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Update Order Status</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status.label}
                          onClick={() => handleUpdateStatus(selectedOrder.id, status.label)}
                          disabled={updating || selectedOrder.status === status.label}
                          className={`rounded-xl py-3 px-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                            selectedOrder.status === status.label 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                              : 'bg-white border border-slate-200 hover:border-accent hover:bg-accent/5'
                          }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

