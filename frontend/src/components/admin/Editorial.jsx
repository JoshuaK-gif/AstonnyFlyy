import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchLookbook, createLookbookItem, deleteLookbookItem,
  fetchCommunityImages, createCommunityImage, deleteCommunityImage,
  fetchTestimonials, createTestimonial, deleteTestimonial,
  uploadImage
} from '@/lib/api';
import { Trash2, Loader2, Image as ImageIcon, LayoutGrid, MessageSquare, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Editorial() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  // Lookbook State
  const [newLook, setNewLook] = useState({ title: '', size: 'base', image: '' });
  // Community State
  const [newCommImage, setNewCommImage] = useState({ alt: '', image: '' });
  // Testimonial State
  const [newTestimonial, setNewTestimonial] = useState({ name: '', text: '' });

  // Queries
  const { data: lookbook = [], isLoading: loadingLB } = useQuery({ queryKey: ['lookbook'], queryFn: fetchLookbook });
  const { data: commImages = [], isLoading: loadingComm } = useQuery({ queryKey: ['communityImages'], queryFn: fetchCommunityImages });
  const { data: testimonials = [], isLoading: loadingTest } = useQuery({ queryKey: ['testimonials'], queryFn: fetchTestimonials });

  // Mutations
  const createLBMutation = useMutation({
    mutationFn: createLookbookItem,
    onSuccess: () => {
      queryClient.invalidateQueries(['lookbook']);
      toast.success('Lookbook item added');
      setNewLook({ title: '', size: 'base', image: '' });
    },
    onError: () => toast.error('Failed to add lookbook item')
  });

  const deleteLBMutation = useMutation({
    mutationFn: deleteLookbookItem,
    onSuccess: () => {
      queryClient.invalidateQueries(['lookbook']);
      toast.success('Item removed');
    }
  });

  const createCommMutation = useMutation({
    mutationFn: createCommunityImage,
    onSuccess: () => {
      queryClient.invalidateQueries(['communityImages']);
      toast.success('Community image added');
      setNewCommImage({ alt: '', image: '' });
    }
  });

  const deleteCommMutation = useMutation({
    mutationFn: deleteCommunityImage,
    onSuccess: () => {
      queryClient.invalidateQueries(['communityImages']);
      toast.success('Image removed');
    }
  });

  const createTestMutation = useMutation({
    mutationFn: createTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries(['testimonials']);
      toast.success('Testimonial added');
      setNewTestimonial({ name: '', text: '' });
    }
  });

  const deleteTestMutation = useMutation({
    mutationFn: deleteTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries(['testimonials']);
      toast.success('Testimonial removed');
    }
  });

  const handleImageUpload = async (file, type) => {
    try {
      setUploading(true);
      const { url } = await uploadImage(file);
      if (type === 'lookbook') setNewLook(prev => ({ ...prev, image: url }));
      if (type === 'community') setNewCommImage(prev => ({ ...prev, image: url }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loadingLB || loadingComm || loadingTest) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      <header>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight text-slate-900">Editorial & Content</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage brand visuals and community storytelling</p>
      </header>

      {/* --- LOOKBOOK MANAGEMENT --- */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3">
            <LayoutGrid className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight">Lookbook Grid</h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm h-fit space-y-6">
            <h3 className="font-bold text-slate-900">Add New Look</h3>
            <div className="space-y-4">
              <div className="group relative aspect-video overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-accent">
                {newLook.image ? (
                  <>
                    <img src={newLook.image} className="h-full w-full object-cover" alt="Preview" />
                    <button onClick={() => setNewLook({ ...newLook, image: '' })} className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg"><X className="h-4 w-4" /></button>
                  </>
                ) : (
                  <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2">
                    <Upload className="h-8 w-8 text-slate-300 transition-colors group-hover:text-accent" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Upload Image</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0], 'lookbook')} />
                  </label>
                )}
              </div>

              <input 
                type="text" 
                placeholder="Look Title (e.g. Concrete Motion)" 
                value={newLook.title}
                onChange={(e) => setNewLook({ ...newLook, title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 font-bold focus:border-accent focus:outline-none"
              />

              <select 
                value={newLook.size}
                onChange={(e) => setNewLook({ ...newLook, size: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 font-bold focus:border-accent focus:outline-none"
              >
                <option value="base">Standard (1x1)</option>
                <option value="lg">Large (2x2)</option>
                <option value="wide">Wide (2x1)</option>
                <option value="tall">Tall (1x2)</option>
              </select>

              <button 
                onClick={() => createLBMutation.mutate(newLook)}
                disabled={!newLook.image || !newLook.title || uploading}
                className="w-full rounded-xl bg-slate-900 py-4 text-white font-black uppercase text-xs tracking-widest hover:bg-accent disabled:opacity-50 transition-all"
              >
                Add to Lookbook
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {lookbook.map(item => (
              <div key={item.id} className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                <img src={item.image} className="h-full w-full object-cover transition-transform group-hover:scale-110" alt={item.title} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                  <p className="text-white text-xs font-black uppercase tracking-widest mb-2">{item.title}</p>
                  <span className="bg-accent text-primary px-2 py-0.5 rounded text-[8px] font-black uppercase mb-4">{item.size}</span>
                  <button onClick={() => deleteLBMutation.mutate(item.id)} className="rounded-full bg-red-500/90 p-2 text-white hover:bg-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- COMMUNITY CONTENT --- */}
      <div className="grid gap-12 lg:grid-cols-2">
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-500/10 p-3">
              <ImageIcon className="h-6 w-6 text-indigo-500" />
            </div>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight">Community Images</h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 items-start bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-32 shrink-0 aspect-square overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-indigo-500">
                {newCommImage.image ? (
                  <div className="relative h-full w-full">
                    <img src={newCommImage.image} className="h-full w-full object-cover" alt="Preview" />
                    <button onClick={() => setNewCommImage({ ...newCommImage, image: '' })} className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 hover:opacity-100 transition-opacity"><X className="h-5 w-5" /></button>
                  </div>
                ) : (
                  <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1">
                    <Upload className="h-5 w-5 text-slate-300" />
                    <span className="text-[8px] font-black uppercase text-slate-400">Upload</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0], 'community')} />
                  </label>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <input 
                  type="text" 
                  placeholder="Alt Text (SEO)" 
                  value={newCommImage.alt}
                  onChange={(e) => setNewCommImage({ ...newCommImage, alt: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold focus:border-indigo-500 focus:outline-none"
                />
                <button 
                  onClick={() => createCommMutation.mutate(newCommImage)}
                  disabled={!newCommImage.image || uploading}
                  className="w-full rounded-xl bg-slate-900 py-2.5 text-white font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 transition-all"
                >
                  Add Community Image
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {commImages.map(item => (
                <div key={item.id} className="relative group aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={item.image} className="h-full w-full object-cover" alt="Comm" />
                  <button onClick={() => deleteCommMutation.mutate(item.id)} className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-500/10 p-3">
              <MessageSquare className="h-6 w-6 text-amber-500" />
            </div>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight">Testimonials</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <input 
                type="text" 
                placeholder="Customer Name" 
                value={newTestimonial.name}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 font-bold focus:border-amber-500 focus:outline-none"
              />
              <textarea 
                placeholder="What did they say about Flyy?" 
                value={newTestimonial.text}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 font-medium text-sm h-24 focus:border-amber-500 focus:outline-none"
              />
              <button 
                onClick={() => createTestMutation.mutate(newTestimonial)}
                disabled={!newTestimonial.name || !newTestimonial.text}
                className="w-full rounded-xl bg-slate-900 py-4 text-white font-black uppercase text-xs tracking-widest hover:bg-amber-500 transition-all"
              >
                Publish Testimonial
              </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {testimonials.map(item => (
                <div key={item.id} className="relative group bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <button onClick={() => deleteTestMutation.mutate(item.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-4 w-4" /></button>
                  <p className="font-bold italic text-slate-700 leading-tight">"{item.text}"</p>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
