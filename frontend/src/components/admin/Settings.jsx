import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchProperties, createProperty, deleteProperty,
  fetchImpactStats, createImpactStat, deleteImpactStat,
  fetchSiteSettings, updateSiteSettings, uploadImage
} from '@/lib/api';
import { Plus, Trash2, Loader2, Tags, Boxes, FolderPlus, BarChart3, Edit3, Check, X as CloseIcon, Paintbrush, Upload, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const queryClient = useQueryClient();
  
  // Property States
  const [newCategory, setNewCategory] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newCollection, setNewCollection] = useState('');

  // Impact Stat States
  const [newStat, setNewStat] = useState({ value: '', suffix: '', label: '' });

  // Queries
  const { data: properties = [], isLoading: loadingProps } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties
  });

  const { data: impactStats = [], isLoading: loadingStats } = useQuery({
    queryKey: ['impactStats'],
    queryFn: fetchImpactStats
  });

  const [editingId, setEditingId] = useState(null);
  const [editStat, setEditStat] = useState({ value: '', suffix: '', label: '' });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Attribute added successfully');
    },
    onError: () => toast.error('Failed to add attribute')
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Attribute removed');
    },
    onError: () => toast.error('Failed to remove attribute')
  });

  const createStatMutation = useMutation({
    mutationFn: createImpactStat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impactStats'] });
      toast.success('Impact stat added');
      setNewStat({ value: '', suffix: '', label: '' });
    },
    onError: () => toast.error('Failed to add impact stat')
  });

  const updateStatMutation = useMutation({
    mutationFn: ({ id, data }) => updateImpactStat(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impactStats'] });
      toast.success('Impact stat updated');
      setEditingId(null);
    },
    onError: () => toast.error('Failed to update impact stat')
  });

  const deleteStatMutation = useMutation({
    mutationFn: deleteImpactStat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impactStats'] });
      toast.success('Impact stat removed');
    },
    onError: () => toast.error('Failed to remove impact stat')
  });

  // Site Settings Queries & Mutations
  const { data: siteSettings, isLoading: loadingSettings } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: fetchSiteSettings
  });

  const updateSettingsMutation = useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
      toast.success('Section backgrounds updated successfully');
    },
    onError: () => toast.error('Failed to update section backgrounds')
  });

  const handleAddProperty = (type, value, setter) => {
    if (!value.trim()) return;
    createMutation.mutate({ type, name: value, value: value.toLowerCase().replace(/\s+/g, '-') });
    setter('');
  };

  const handleAddStat = (e) => {
    e.preventDefault();
    if (!newStat.value || !newStat.label) {
      toast.error("Value and Label are required");
      return;
    }
    createStatMutation.mutate({
      ...newStat,
      value: parseInt(newStat.value, 10)
    });
  };

  const handleStartEdit = (stat) => {
    setEditingId(stat.id);
    setEditStat({ value: stat.value, suffix: stat.suffix, label: stat.label });
  };

  const handleUpdateStat = (e) => {
    e.preventDefault();
    updateStatMutation.mutate({
      id: editingId,
      data: {
        ...editStat,
        value: parseInt(editStat.value, 10)
      }
    });
  };

  const categories = properties.filter(p => p.type === 'category');
  const statuses = properties.filter(p => p.type === 'stockStatus');
  const collections = properties.filter(p => p.type === 'collection');

  if (loadingProps || loadingStats || loadingSettings) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Category Management */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-accent/10 p-3">
              <Tags className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-display text-xl font-black uppercase tracking-tight text-slate-900">Categories</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Taxonomy</p>
            </div>
          </div>

          <div className="space-y-3">
            <input 
              type="text" 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Streetwear"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold focus:border-accent focus:bg-white focus:outline-none transition-all"
            />
            <button 
              onClick={() => handleAddProperty('category', newCategory, setNewCategory)}
              disabled={createMutation.isPending}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-white font-black uppercase text-sm tracking-widest hover:bg-accent transition-all shadow-md active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" /> Add Category
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100 group">
                <span className="font-bold text-slate-700">{cat.name}</span>
                <button 
                  onClick={() => deleteMutation.mutate(cat.id)}
                  className="rounded-xl p-2 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {categories.length === 0 && <p className="text-center py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">No categories</p>}
          </div>
        </div>

        {/* Collection Property Management */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-500/10 p-3">
              <FolderPlus className="h-6 w-6 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-display text-xl font-black uppercase tracking-tight text-slate-900">Collection Tags</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Internal Filters</p>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-4">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider leading-relaxed">
              Note: Use the "Collections" tab in the sidebar to create public collections with images that appear on the Home and Shop pages.
            </p>
          </div>

          <div className="space-y-3">
            <input 
              type="text" 
              value={newCollection}
              onChange={(e) => setNewCollection(e.target.value)}
              placeholder="e.g. Summer 2026"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold focus:border-accent focus:bg-white focus:outline-none transition-all"
            />
            <button 
              onClick={() => handleAddProperty('collection', newCollection, setNewCollection)}
              disabled={createMutation.isPending}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-white font-black uppercase text-sm tracking-widest hover:bg-accent transition-all shadow-md active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" /> Add Tag
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {collections.map(coll => (
              <div key={coll.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100 group">
                <span className="font-bold text-slate-700">{coll.name}</span>
                <button 
                  onClick={() => deleteMutation.mutate(coll.id)}
                  className="rounded-xl p-2 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {collections.length === 0 && <p className="text-center py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">No collection tags</p>}
          </div>
        </div>

        {/* Stock Status Management */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3">
              <Boxes className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl font-black uppercase tracking-tight text-slate-900">Inventory Status</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Label Management</p>
            </div>
          </div>

          <div className="space-y-3">
            <input 
              type="text" 
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              placeholder="e.g. In Stock"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold focus:border-accent focus:bg-white focus:outline-none transition-all"
            />
            <button 
              onClick={() => handleAddProperty('stockStatus', newStatus, setNewStatus)}
              disabled={createMutation.isPending}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-white font-black uppercase text-sm tracking-widest hover:bg-accent transition-all shadow-md active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" /> Add Status
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {statuses.map(status => (
              <div key={status.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100 group">
                <span className="font-bold text-slate-700">{status.name}</span>
                <button 
                  onClick={() => deleteMutation.mutate(status.id)}
                  className="rounded-xl p-2 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {statuses.length === 0 && <p className="text-center py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">No statuses</p>}
          </div>
        </div>
      </div>

      {/* Impact Stats Management */}
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm space-y-8">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-green-500/10 p-4">
            <BarChart3 className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-black uppercase tracking-tight text-slate-900">Impact Metrics</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Numbers that define our story</p>
          </div>
        </div>

        <form onSubmit={handleAddStat} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Value</label>
            <input 
              type="number" 
              value={newStat.value}
              onChange={(e) => setNewStat({...newStat, value: e.target.value})}
              placeholder="e.g. 50000"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 font-bold focus:border-accent focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Suffix</label>
            <input 
              type="text" 
              value={newStat.suffix}
              onChange={(e) => setNewStat({...newStat, suffix: e.target.value})}
              placeholder="e.g. +, %"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 font-bold focus:border-accent focus:outline-none transition-all"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Label</label>
            <input 
              type="text" 
              value={newStat.label}
              onChange={(e) => setNewStat({...newStat, label: e.target.value})}
              placeholder="e.g. Members"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 font-bold focus:border-accent focus:outline-none transition-all"
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              disabled={createStatMutation.isPending}
              className="w-full rounded-xl bg-slate-900 py-3 text-white font-black uppercase text-xs tracking-widest hover:bg-accent transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Metric
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {impactStats.map(stat => (
            <div key={stat.id} className="relative group rounded-2xl border border-slate-100 bg-slate-50 p-6 hover:bg-white hover:shadow-lg transition-all border-l-4 border-l-green-500">
              {editingId === stat.id ? (
                <form onSubmit={handleUpdateStat} className="space-y-3">
                  <input 
                    type="number" 
                    value={editStat.value}
                    onChange={(e) => setEditStat({...editStat, value: e.target.value})}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm font-bold"
                  />
                  <input 
                    type="text" 
                    value={editStat.suffix}
                    onChange={(e) => setEditStat({...editStat, suffix: e.target.value})}
                    placeholder="Suffix"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  />
                  <input 
                    type="text" 
                    value={editStat.label}
                    onChange={(e) => setEditStat({...editStat, label: e.target.value})}
                    placeholder="Label"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 rounded-lg bg-green-500 p-1.5 text-white hover:bg-green-600">
                      <Check className="h-4 w-4 mx-auto" />
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="flex-1 rounded-lg bg-slate-200 p-1.5 text-slate-600 hover:bg-slate-300">
                      <CloseIcon className="h-4 w-4 mx-auto" />
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => handleStartEdit(stat)}
                      className="rounded-lg p-1.5 text-slate-300 hover:bg-indigo-50 hover:text-indigo-500 transition-all"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deleteStatMutation.mutate(stat.id)}
                      className="rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-2xl font-black text-slate-900">{stat.value}{stat.suffix}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{stat.label}</p>
                </>
              )}
            </div>
          ))}
          {impactStats.length === 0 && (
            <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No metrics defined</p>
            </div>
          )}
        </div>
      </div>

      {/* Section Backgrounds Editor */}
      <SectionBackgroundsEditor 
        settings={siteSettings} 
        onSave={(data) => updateSettingsMutation.mutate(data)} 
        isSaving={updateSettingsMutation.isPending} 
      />
    </div>
  );
}

function SectionBackgroundsEditor({ settings, onSave, isSaving }) {
  const [form, setForm] = useState(settings);
  const [uploadingSection, setUploadingSection] = useState(null);

  useEffect(() => {
    if (settings) {
      // Remove Prisma generated metadata to avoid schema validation errors on update
      const { id, updatedAt, ...rest } = settings;
      setForm(rest);
    }
  }, [settings]);

  if (!form) return null;

  const handleUpload = async (file, section) => {
    try {
      setUploadingSection(section);
      const { url } = await uploadImage(file);
      setForm(prev => ({
        ...prev,
        [`${section}BgImage`]: url,
        [`${section}BgType`]: 'image'
      }));
      toast.success(`${section} background image uploaded!`);
    } catch (e) {
      toast.error('Upload failed');
    } finally {
      setUploadingSection(null);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const sections = [
    { key: 'hero', name: 'Hero Banner' },
    { key: 'collections', name: 'Collections' },
    { key: 'featured', name: 'Featured Products' },
    { key: 'brandStory', name: 'Brand Story' },
    { key: 'lookbook', name: 'Lookbook' },
    { key: 'impactNumbers', name: 'Impact Numbers' },
    { key: 'community', name: 'Community Section' },
    { key: 'newsletter', name: 'Newsletter Section' },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm space-y-8">
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-indigo-500/10 p-4">
          <Paintbrush className="h-8 w-8 text-indigo-500" />
        </div>
        <div>
          <h3 className="font-display text-2xl font-black uppercase tracking-tight text-slate-900">Section Backgrounds</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customize styling of homepage sections</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map(({ key, name }) => {
            const bgType = form[`${key}BgType`] || 'color';
            const bgColor = form[`${key}BgColor`] || '#ffffff';
            const bgImage = form[`${key}BgImage`];

            return (
              <div key={key} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 space-y-4 shadow-sm hover:bg-white hover:shadow-md transition-all">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h4 className="font-black text-sm uppercase text-slate-800 tracking-wider">{name}</h4>
                  <div className="flex bg-slate-200 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => handleChange(`${key}BgType`, 'color')}
                      className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${bgType === 'color' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      Color
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange(`${key}BgType`, 'image')}
                      className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${bgType === 'image' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      Image
                    </button>
                  </div>
                </div>

                {bgType === 'color' ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl border border-slate-200 shadow-inner shrink-0" style={{ backgroundColor: bgColor }} />
                    <div className="flex-1 space-y-1">
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Background Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => handleChange(`${key}BgColor`, e.target.value)}
                          className="w-10 h-10 border-0 p-0 rounded cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={bgColor}
                          onChange={(e) => handleChange(`${key}BgColor`, e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-700 uppercase focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Background Image</label>
                    <div className="group relative aspect-video overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-100 transition-all hover:border-indigo-500 flex items-center justify-center">
                      {bgImage ? (
                        <>
                          <img src={bgImage} className="h-full w-full object-cover" alt="Background" />
                          <button
                            type="button"
                            onClick={() => handleChange(`${key}BgImage`, null)}
                            className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg"
                          >
                            <CloseIcon className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center">
                          {uploadingSection === key ? (
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                          ) : (
                            <>
                              <Upload className="h-6 w-6 text-slate-400 group-hover:text-indigo-500 transition-all" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Bg Image</span>
                            </>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            disabled={uploadingSection !== null}
                            onChange={(e) => handleUpload(e.target.files[0], key)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-white font-black uppercase text-sm tracking-widest hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-md active:scale-95"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            Save Section Backgrounds
          </button>
        </div>
      </form>
    </div>
  );
}
