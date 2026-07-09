import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchProducts, deleteProduct, fetchProperties } from '@/lib/api';
import { toast } from 'sonner';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [productsData, props] = await Promise.all([
        fetchProducts(),
        fetchProperties()
      ]);
      setProducts(productsData);
      setCategories(props.filter(p => p.type === 'category'));
    } catch (error) {
      toast.error("Failed to load store data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id, name) => {
    toast.error(`Delete "${name}"?`, {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
            toast.success("Product Deleted", {
              description: `"${name}" has been removed from your store.`
            });
          } catch {
            toast.error("Failed to delete product");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
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
          Managed Products ({filteredProducts.length})
        </h3>
        <Link 
          to="/admin/products/new"
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-black uppercase tracking-widest text-primary-foreground hover:bg-accent transition-all shadow-lg active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search products by name or SKU..." 
            value={searchQuery}
            onChange={(e) => setSearchSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm focus:border-accent focus:outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button 
            onClick={() => setActiveCategory('All')}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
              activeCategory === 'All' 
                ? 'bg-slate-900 text-white' 
                : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                activeCategory === cat.name
                  ? 'bg-slate-900 text-white' 
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Mobile Card View */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filteredProducts.map((product) => (
            <div key={product.id} className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 rounded-lg bg-slate-100 overflow-hidden border border-slate-100 shrink-0">
                  <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm leading-tight truncate">{product.name}</p>
                  <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400 mt-0.5">SKU: {product.sku}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-tighter text-slate-600">{product.category}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase ${product.stockStatus === 'In Stock' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${product.stockStatus === 'In Stock' ? 'bg-green-500' : 'bg-amber-500'}`} />
                      {product.stockStatus}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-lg">${product.discountPrice || product.price}</span>
                <div className="flex items-center gap-1">
                  <Link to={`/product/${product.id}`} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="View Storefront">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <Link to={`/admin/products/edit/${product.id}`} className="p-2 text-slate-400 hover:text-green-600 transition-colors" title="Edit Product">
                    <Edit2 className="h-4 w-4" />
                  </Link>
                  <button onClick={() => handleDelete(product.id, product.name)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Delete Product">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="px-6 py-20 text-center">
              <div className="flex flex-col items-center">
                <Search className="h-10 w-10 text-slate-200 mb-4" />
                <p className="text-slate-500 font-bold">No products found matching your criteria.</p>
                <button onClick={() => {setSearchSearchQuery(''); setActiveCategory('All');}} className="mt-2 text-accent text-sm font-black uppercase underline">Clear Filters</button>
              </div>
            </div>
          )}
        </div>
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Product</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Category</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Price</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Stock</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-100">
                        <img src={product.images[0]} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{product.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400 mt-1">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-tighter text-slate-600">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">${product.discountPrice || product.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${product.stockStatus === 'In Stock' ? 'bg-green-500' : 'bg-amber-500'}`} />
                      <span className="text-xs font-bold text-slate-600">{product.stockStatus}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 transition-opacity lg:group-hover:opacity-100">
                      <Link to={`/product/${product.id}`} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="View Storefront"><ExternalLink className="h-4 w-4" /></Link>
                      <Link to={`/admin/products/edit/${product.id}`} className="p-2 text-slate-400 hover:text-green-600 transition-colors" title="Edit Product"><Edit2 className="h-4 w-4" /></Link>
                      <button onClick={() => handleDelete(product.id, product.name)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Delete Product"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <Search className="h-10 w-10 text-slate-200 mb-4" />
                      <p className="text-slate-500 font-bold">No products found matching your criteria.</p>
                      <button onClick={() => {setSearchSearchQuery(''); setActiveCategory('All');}} className="mt-2 text-accent text-sm font-black uppercase underline">Clear Filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
