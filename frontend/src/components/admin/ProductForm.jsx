import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Save, Upload, X, Loader2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchProductById, createProduct, updateProduct, uploadImage, fetchProperties, fetchCollections } from '@/lib/api';
import { toast } from 'sonner';

export default function ProductForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [properties, setProperties] = useState([]);
  const [allCollections, setAllCollections] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    brand: 'AstonnyFlyy',

    description: '',
    price: '',
    discountPrice: '',
    category: '',
    sku: '',
    stockStatus: '',
    stockQuantity: '0',
    newArrival: false,
    featured: false,
    bestseller: false,
    sizes: [],
    colors: [],
    tags: [],
    collections: []
  });

  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);
      const [props, colls] = await Promise.all([
        fetchProperties(),
        fetchCollections()
      ]);
      setProperties(props);
      setAllCollections(colls);

      if (isEditMode) {
        const product = await fetchProductById(id);
        setFormData({
          name: product.name,
          brand: product.brand || 'AstonnyFlyy',
          description: product.description,
          price: product.price.toString(),
          discountPrice: product.discountPrice ? product.discountPrice.toString() : '',
          category: product.category,
          sku: product.sku,
          stockStatus: product.stockStatus,
          stockQuantity: product.stockQuantity.toString(),
          newArrival: product.newArrival || false,
          featured: product.featured || false,
          bestseller: product.bestseller || false,
          sizes: product.sizes || [],
          colors: product.colors || [],
          tags: product.tags || [],
          collections: product.collections || []
        });
        setImages(product.images.map(url => ({ url, isExisting: true })));
      } else {
        // Set defaults from properties if available
        const defaultStatus = props.find(p => p.type === 'stockStatus')?.name || '';
        setFormData(prev => ({ ...prev, stockStatus: defaultStatus }));
      }
    } catch (error) {
      toast.error("Failed to load form data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const categories = properties.filter(p => p.type === 'category');
  const stockStatuses = properties.filter(p => p.type === 'stockStatus');
  
  // Combine public marketing collections and internal settings collection tags
  const uniqueCollections = [];
  const namesSeen = new Set();
  
  allCollections.forEach(c => {
    if (c.title && !namesSeen.has(c.title.toLowerCase())) {
      namesSeen.add(c.title.toLowerCase());
      uniqueCollections.push({ id: c.id, name: c.title, source: 'public' });
    }
  });
  
  properties.filter(p => p.type === 'collection').forEach(p => {
    if (p.name && !namesSeen.has(p.name.toLowerCase())) {
      namesSeen.add(p.name.toLowerCase());
      uniqueCollections.push({ id: p.id, name: p.name, source: 'tag' });
    }
  });

  const collectionProps = uniqueCollections;

  const handleCollectionToggle = (name) => {
    setFormData(prev => {
      const collections = prev.collections.includes(name)
        ? prev.collections.filter(c => c !== name)
        : [...prev.collections, name];
      return { ...prev, collections };
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    if (!newImages[index].isExisting) {
      URL.revokeObjectURL(newImages[index].url);
    }
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const addItem = (field, value, setValue) => {
    if (!value.trim()) return;
    if (formData[field].includes(value.trim())) {
      setValue('');
      return;
    }
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));
    setValue('');
  };

  const removeItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    
    // Improved validation
    const requiredFields = ['name', 'price', 'category', 'description'];
    const missingFields = requiredFields.filter(field => {
      if (field === 'price') return formData[field] === '' || formData[field] === null;
      return !formData[field];
    });

    if (missingFields.length > 0) {
      toast.error('Missing Information', {
        description: `Please fill in: ${missingFields.join(', ')}.`
      });
      return;
    }

    if (images.length === 0) {
      toast.error('Missing Media', {
        description: 'Please upload at least one image.'
      });
      return;
    }

    try {
      setSaving(true);
      
      // 1. Upload new images
      const imageUrls = [];
      for (const img of images) {
        if (img.isExisting) {
          imageUrls.push(img.url);
        } else {
          const uploaded = await uploadImage(img.file);
          imageUrls.push(uploaded.url);
        }
      }

      // 2. Prepare final data
      const finalData = {
        name: formData.name,
        brand: formData.brand || 'AstonnyFlyy',
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        category: formData.category,
        sku: formData.sku || `AF-${Date.now()}`, // Fallback SKU if empty
        stockStatus: formData.stockStatus || 'In Stock',
        stockQuantity: parseInt(formData.stockQuantity, 10) || 0,
        newArrival: Boolean(formData.newArrival),
        featured: Boolean(formData.featured),
        bestseller: Boolean(formData.bestseller),
        images: imageUrls,
        sizes: Array.isArray(formData.sizes) ? formData.sizes : [],
        colors: Array.isArray(formData.colors) ? formData.colors : [],
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        collections: Array.isArray(formData.collections) ? formData.collections : []
      };

      // 3. Save or Update
      const response = isEditMode 
        ? await updateProduct(id, finalData)
        : await createProduct(finalData);
      
      toast.success(isEditMode ? 'Product Updated' : 'Product Published');
      navigate('/admin/products');
    } catch (error) {
      console.error('Save Error:', error);
      
      // Extract specific validation errors from backend
      let detail = error.message;
      if (error.data && error.data.error) {
        const backendError = error.data.error;
        if (Array.isArray(backendError)) {
          detail = backendError.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        } else {
          detail = backendError;
        }
      }
      
      toast.error('Publishing Failed', {
        description: detail || 'Please check all fields and try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sticky top-16 z-30 bg-slate-50 py-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="rounded-full border border-slate-200 bg-white p-2 hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <h3 className="font-display text-2xl font-black uppercase tracking-tight text-slate-900">
            {isEditMode ? 'Edit Product' : 'New Product'}
          </h3>
        </div>
        <button 
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-10 py-4 text-sm font-black uppercase tracking-widest text-primary-foreground hover:bg-accent transition-all shadow-xl active:scale-95 disabled:opacity-70"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEditMode ? 'Update Catalog' : 'Publish Product'}
        </button>
      </div>

      <form onSubmit={handleSave} className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Essential Details</h4>
            <div className="grid gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Product Title *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold focus:border-accent focus:bg-white focus:outline-none transition-all" 
                  placeholder="e.g. Midnight Bomber Jacket" 
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Brand *</label>
                  <input 
                    type="text" 
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold focus:border-accent focus:bg-white focus:outline-none transition-all" 
                    placeholder="AstonnyFlyy"



                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">SKU / Model ID *</label>
                  <input 
                    type="text" 
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold focus:border-accent focus:bg-white focus:outline-none transition-all" 
                    placeholder="AF-2024-001"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Product Description *</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-medium focus:border-accent focus:bg-white focus:outline-none transition-all resize-none" 
                  placeholder="Write a compelling story about this piece..." 
                  required
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Product Media</h4>
              <span className="text-[10px] font-bold text-slate-400 italic">Recommended: 1080x1350px PNG/JPG</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current.click()}
                className="aspect-[3/4] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 hover:border-accent hover:bg-accent/5 transition-all text-slate-400 hover:text-accent group"
              >
                <div className="rounded-full bg-slate-50 p-4 group-hover:bg-white group-hover:shadow-md transition-all">
                  <Upload className="h-6 w-6" />
                </div>
                <span className="mt-3 text-[10px] font-black uppercase tracking-widest">Add Media</span>
              </button>

              {images.map((image, index) => (
                <div key={index} className="aspect-[3/4] relative rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden group shadow-sm">
                  <img src={image.url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="rounded-full bg-white p-2 text-red-600 hover:scale-110 transition-transform shadow-lg"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-md">
                      <span className="text-[8px] font-black uppercase text-white tracking-widest">Primary</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Attributes & Variations</h4>
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500">Available Sizes</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('sizes', newSize, setNewSize))}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold focus:border-accent focus:bg-white focus:outline-none transition-all" 
                    placeholder="e.g. XL, 42, OS" 
                  />
                  <button 
                    type="button"
                    onClick={() => addItem('sizes', newSize, setNewSize)}
                    className="rounded-xl bg-slate-900 px-6 py-3 text-white font-black text-xs uppercase tracking-widest hover:bg-accent hover:text-primary transition-all active:scale-95 shadow-sm border border-slate-900 hover:border-accent flex items-center justify-center shrink-0"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.sizes.map((size, i) => (
                    <span key={i} className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
                      {size}
                      <button type="button" onClick={() => removeItem('sizes', i)} className="text-slate-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500">Color Palette</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('colors', newColor, setNewColor))}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold focus:border-accent focus:bg-white focus:outline-none transition-all" 
                    placeholder="e.g. Onyx Black" 
                  />
                  <button 
                    type="button"
                    onClick={() => addItem('colors', newColor, setNewColor)}
                    className="rounded-xl bg-slate-900 px-6 py-3 text-white font-black text-xs uppercase tracking-widest hover:bg-accent hover:text-primary transition-all active:scale-95 shadow-sm border border-slate-900 hover:border-accent flex items-center justify-center shrink-0"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.colors.map((color, i) => (
                    <span key={i} className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
                      {color}
                      <button type="button" onClick={() => removeItem('colors', i)} className="text-slate-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Pricing & Stock</h4>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Base Price ($) *</label>
                <input 
                  type="number" 
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-black text-xl focus:border-accent focus:bg-white focus:outline-none transition-all" 
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Discount Price ($)</label>
                <input 
                  type="number" 
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-black text-xl text-green-600 focus:border-accent focus:bg-white focus:outline-none transition-all" 
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Inventory Status</label>
                <select 
                  name="stockStatus"
                  value={formData.stockStatus}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold focus:border-accent focus:bg-white focus:outline-none transition-all appearance-none"
                >
                  <option value="">Select Status</option>
                  {stockStatuses.map(status => <option key={status.id} value={status.name}>{status.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Available Quantity</label>
                <input 
                  type="number" 
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold focus:border-accent focus:bg-white focus:outline-none transition-all" 
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Classification</h4>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Category *</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold focus:border-accent focus:bg-white focus:outline-none transition-all appearance-none"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
              <div className="space-y-4 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${formData.newArrival ? 'bg-accent border-accent' : 'border-slate-200 group-hover:border-slate-300'}`}>
                    <input type="checkbox" name="newArrival" checked={formData.newArrival} onChange={handleInputChange} className="hidden" />
                    {formData.newArrival && <X className="h-4 w-4 text-white rotate-45" />}
                  </div>
                  <span className="text-sm font-black uppercase tracking-tight text-slate-700">New Arrival</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${formData.featured ? 'bg-accent border-accent' : 'border-slate-200 group-hover:border-slate-300'}`}>
                    <input type="checkbox" name="featured" checked={formData.featured} onChange={handleInputChange} className="hidden" />
                    {formData.featured && <X className="h-4 w-4 text-white rotate-45" />}
                  </div>
                  <span className="text-sm font-black uppercase tracking-tight text-slate-700">Featured Piece</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${formData.bestseller ? 'bg-accent border-accent' : 'border-slate-200 group-hover:border-slate-300'}`}>
                    <input type="checkbox" name="bestseller" checked={formData.bestseller} onChange={handleInputChange} className="hidden" />
                    {formData.bestseller && <X className="h-4 w-4 text-white rotate-45" />}
                  </div>
                  <span className="text-sm font-black uppercase tracking-tight text-slate-700">Bestseller</span>
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Collection Membership</h4>
            <div className="space-y-3">
              {collectionProps.map(coll => (
                <label key={coll.id} className="flex items-center gap-3 cursor-pointer group p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${formData.collections.includes(coll.name) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-200 group-hover:border-slate-300'}`}>
                    <input 
                      type="checkbox" 
                      checked={formData.collections.includes(coll.name)} 
                      onChange={() => handleCollectionToggle(coll.name)}
                      className="hidden" 
                    />
                    {formData.collections.includes(coll.name) && <X className="h-3 w-3 text-white rotate-45" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-tight text-slate-700">{coll.name}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                      {coll.source === 'public' ? 'Public Collection' : 'Internal Tag'}
                    </span>
                  </div>
                </label>
              ))}
              {collectionProps.length === 0 && (
                <div className="text-center py-6 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No Collections Defined</p>
                  <div className="flex flex-col gap-2">
                    <Link to="/admin/collections" className="text-[10px] font-black uppercase text-indigo-500 hover:underline">Manage Public Collections →</Link>
                    <Link to="/admin/settings" className="text-[10px] font-black uppercase text-accent hover:underline">Manage Settings Tags →</Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500">Search Tags</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('tags', newTag, setNewTag))}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold focus:border-accent focus:bg-white focus:outline-none transition-all" 
                placeholder="e.g. urban, luxury" 
              />
              <button 
                type="button"
                onClick={() => addItem('tags', newTag, setNewTag)}
                className="rounded-xl bg-slate-900 px-6 py-3 text-white font-black text-xs uppercase tracking-widest hover:bg-accent hover:text-primary transition-all active:scale-95 shadow-sm border border-slate-900 hover:border-accent flex items-center justify-center shrink-0"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, i) => (
                <span key={i} className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-black uppercase text-white">
                  #{tag}
                  <button type="button" onClick={() => removeItem('tags', i)} className="ml-2 text-white/50 hover:text-white"><X className="h-2 w-2" /></button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
