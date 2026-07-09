import React, { useState, useEffect } from 'react';
import { Search, Save, Loader2, AlertTriangle, Package } from 'lucide-react';
import { fetchProducts, updateProduct } from '@/lib/api';
import { toast } from 'sonner';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modifiedProducts, setModifiedProducts] = useState({});

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  const handleStockChange = (id, field, value) => {
    const product = products.find(p => p.id === id);
    setModifiedProducts(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || product),
        [field]: field === 'stockQuantity' ? parseInt(value, 10) : value
      }
    }));
  };

  const handleSaveAll = async () => {
    const ids = Object.keys(modifiedProducts);
    if (ids.length === 0) return;

    try {
      setSaving(true);
      for (const id of ids) {
        await updateProduct(id, modifiedProducts[id]);
      }
      toast.success(`${ids.length} products updated`);
      setModifiedProducts({});
      loadProducts();
    } catch {
      toast.error("Bulk update failed");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
      </div>
    );
  }

  const hasChanges = Object.keys(modifiedProducts).length > 0;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sticky top-16 z-30 bg-slate-50 py-4">
        <div>
          <h3 className="font-display text-2xl font-black uppercase tracking-tight text-slate-900">Inventory Control</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Manage stock levels and availability</p>
        </div>
        <button 
          onClick={handleSaveAll}
          disabled={!hasChanges || saving}
          className={`flex items-center justify-center gap-2 rounded-full px-8 py-3 text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
            hasChanges 
              ? 'bg-primary text-white hover:bg-accent hover:text-primary' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Apply Changes {hasChanges && `(${Object.keys(modifiedProducts).length})`}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search products by name or SKU..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-11 pr-4 text-sm focus:border-accent focus:outline-none transition-all shadow-sm"
        />
      </div>

      <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm">
        {/* Mobile Card View */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filteredProducts.map((product) => {
            const currentData = modifiedProducts[product.id] || product;
            const isModified = Boolean(modifiedProducts[product.id]);
            const isLowStock = currentData.stockQuantity > 0 && currentData.stockQuantity <= 5;
            const isOutOfStock = currentData.stockQuantity === 0;

            return (
              <div key={product.id} className={`p-4 space-y-3 ${isModified ? 'bg-accent/5' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="h-12 w-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                    <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm leading-tight truncate">{product.name}</p>
                    <p className="text-[10px] font-black uppercase text-slate-400">{product.category}</p>
                    <p className="font-mono text-[10px] font-bold text-slate-400 mt-0.5">SKU: {product.sku}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Qty</p>
                    <div className="flex items-center gap-2">
                      <input type="number" min="0" value={currentData.stockQuantity} onChange={(e) => handleStockChange(product.id, 'stockQuantity', e.target.value)} className={`w-full rounded-xl border px-3 py-2 text-sm font-black text-center focus:outline-none transition-all ${isModified ? 'border-accent bg-white' : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400'}`} />
                      {isLowStock && <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />}
                      {isOutOfStock && <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Status</p>
                    <select value={currentData.stockStatus} onChange={(e) => handleStockChange(product.id, 'stockStatus', e.target.value)} className={`w-full rounded-xl border px-3 py-2 text-xs font-bold focus:outline-none transition-all ${isModified ? 'border-accent bg-white' : 'border-slate-200 bg-slate-50'}`}>
                      <option value="In Stock">In Stock</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Product Detail</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">SKU</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Qty</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Availability</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const currentData = modifiedProducts[product.id] || product;
                const isModified = Boolean(modifiedProducts[product.id]);
                const isLowStock = currentData.stockQuantity > 0 && currentData.stockQuantity <= 5;
                const isOutOfStock = currentData.stockQuantity === 0;

                return (
                  <tr key={product.id} className={`group transition-colors ${isModified ? 'bg-accent/5' : 'hover:bg-slate-50'}`}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                          <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{product.name}</p>
                          <p className="text-[10px] font-black uppercase text-slate-400">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-mono text-xs font-bold text-slate-500">{product.sku}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <input type="number" min="0" value={currentData.stockQuantity} onChange={(e) => handleStockChange(product.id, 'stockQuantity', e.target.value)} className={`w-20 rounded-xl border px-3 py-2 text-sm font-black text-center focus:outline-none transition-all ${isModified ? 'border-accent bg-white' : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400'}`} />
                        {isLowStock && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                        {isOutOfStock && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <select value={currentData.stockStatus} onChange={(e) => handleStockChange(product.id, 'stockStatus', e.target.value)} className={`rounded-xl border px-4 py-2 text-xs font-bold focus:outline-none transition-all appearance-none pr-8 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${isModified ? 'border-accent bg-white' : 'border-slate-200 bg-slate-50'}`}>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tighter ${currentData.stockStatus === 'In Stock' ? 'bg-green-100 text-green-600' : currentData.stockStatus === 'Low Stock' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>{currentData.stockStatus}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-[2rem] bg-slate-900 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center text-primary shadow-lg shadow-accent/20">
            <Package className="h-8 w-8" />
          </div>
          <div>
            <h4 className="text-xl font-black uppercase tracking-tight">Stock Analysis</h4>
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">
              {products.filter(p => p.stockQuantity === 0).length} products currently sold out
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-6 border-r border-white/10">
            <p className="text-2xl font-black">{products.length}</p>
            <p className="text-[10px] text-white/40 font-bold uppercase">Total SKUs</p>
          </div>
          <div className="text-center px-6">
            <p className="text-2xl font-black">{products.reduce((sum, p) => sum + p.stockQuantity, 0)}</p>
            <p className="text-[10px] text-white/40 font-bold uppercase">Total Units</p>
          </div>
        </div>
      </div>
    </div>
  );
}
