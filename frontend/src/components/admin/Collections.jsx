import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Loader2, Save, X, Upload, Grid } from 'lucide-react';
import { fetchCollections, createCollection, updateCollection, deleteCollection, uploadImage } from '@/lib/api';
import { toast } from 'sonner';

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ title: '', tag: '', image: '', href: '', type: 'category' });

  useEffect(() => {
    loadCollections();
  }, []);

  async function loadCollections() {
    setLoading(true);
    try {
      const data = await fetchCollections();
      setCollections(data);
    } catch (error) {
      toast.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const data = await uploadImage(file);
      setFormData(prev => ({ ...prev, image: data.url }));
      toast.success("Image uploaded");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    let finalData = { ...formData };

    if (!finalData.href && finalData.title) {
      finalData.href = `/shop?collection=${encodeURIComponent(finalData.title)}`;
    }

    if (!finalData.title || !finalData.tag || !finalData.image || !finalData.href) {
      toast.error("Please fill all fields (Title, Tag, Image)");
      return;
    }

    try {
      if (editingId) {
        await updateCollection(editingId, finalData);
        toast.success("Collection updated");
        setEditingId(null);
      } else {
        await createCollection(finalData);
        toast.success("Collection created");
      }
      setFormData({ title: '', tag: '', image: '', href: '', type: 'category' });
      loadCollections();
    } catch (error) {
      toast.error("Failed to save collection");
      console.error(error);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setFormData({ title: c.title, tag: c.tag, image: c.image, href: c.href, type: c.type });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteCollection(id);
      toast.success("Collection deleted");
      loadCollections();
    } catch (error) {
      toast.error("Failed to delete collection");
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-slate-300" /></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-accent/10 p-3">
          <Grid className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h3 className="font-display text-2xl font-black uppercase tracking-tight text-slate-900">Collections</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage public collection categories</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
        <h4 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
          {editingId ? <><Edit2 className="h-4 w-4" /> Edit Collection</> : <><Plus className="h-4 w-4" /> Add New Collection</>}
        </h4>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Title</label>
            <input placeholder="e.g. Flight Pack" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-sm focus:border-accent focus:bg-white focus:outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tag</label>
            <input placeholder="e.g. Just Landed" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-sm focus:border-accent focus:bg-white focus:outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Image</label>
            <div className="flex items-center gap-3">
              <div className="group relative flex-1 h-12 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden hover:border-accent transition-all cursor-pointer">
                {formData.image ? (
                  <div className="relative h-full w-full">
                    <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setFormData({...formData, image: ''})} className="absolute top-1 right-1 rounded-full bg-red-500 p-0.5 text-white shadow"><X className="h-3 w-3" /></button>
                  </div>
                ) : (
                  <label className="flex h-full w-full cursor-pointer items-center justify-center gap-2">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : <Upload className="h-4 w-4 text-slate-400 group-hover:text-accent transition-colors" />}
                    <span className="text-[9px] font-black uppercase text-slate-400">Upload</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={handleSubmit} className="flex-1 rounded-xl bg-primary py-3 text-white font-black uppercase text-xs tracking-widest hover:bg-accent hover:text-primary transition-all shadow-md active:scale-95">
              {editingId ? 'Update Collection' : 'Create Collection'}
            </button>
            {editingId && (
              <button onClick={() => {setEditingId(null); setFormData({ title: '', tag: '', image: '', href: '', type: 'category' })}} className="rounded-xl border border-slate-200 p-3 text-slate-400 hover:bg-slate-50 transition-all">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
        <h4 className="font-black text-sm uppercase tracking-wider text-slate-800">Existing Collections ({collections.length})</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          {collections.map(c => (
            <div key={c.id} className="group flex flex-col sm:flex-row items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:bg-white hover:shadow-md transition-all">
              <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-slate-200 border border-slate-100 shrink-0">
                <img src={c.image} alt={c.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              </div>
              <div className="flex-1 min-w-0 w-full">
                <p className="font-bold text-slate-900 truncate">{c.title}</p>
                <p className="text-xs font-bold text-accent uppercase tracking-wider">{c.tag}</p>
                <p className="text-[9px] text-slate-400 font-mono mt-1 truncate">{c.href}</p>
              </div>
              <div className="flex gap-1 w-full sm:w-auto justify-end">
                <button onClick={() => startEdit(c)} className="rounded-xl p-2 text-slate-400 hover:bg-accent hover:text-primary transition-all" title="Edit"><Edit2 className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(c.id)} className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all" title="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {collections.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No collections yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}