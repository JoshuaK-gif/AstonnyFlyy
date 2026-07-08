import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMessages, updateMessageStatus, deleteMessage } from '@/lib/api';
import { Mail, Search, Filter, Trash2, Loader2, X, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminMessages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: fetchMessages,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateMessageStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-messages']);
      toast.success('Message status updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-messages']);
      toast.success('Message deleted');
      setSelectedMessage(null);
    },
  });

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (msg.subject && msg.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || msg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenMessage = (msg) => {
    setSelectedMessage(msg);
    if (msg.status === 'Unread') {
      updateStatusMutation.mutate({ id: msg.id, status: 'Read' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Inquiries</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Manage customer messages</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm font-bold outline-none focus:border-primary"
          >
            <option value="All">All Status</option>
            <option value="Unread">Unread</option>
            <option value="Read">Read</option>
            <option value="Replied">Replied</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Messages List */}
        <div className="space-y-3">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleOpenMessage(msg)}
                className={`group relative flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-all hover:shadow-md ${
                  selectedMessage?.id === msg.id 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-slate-200 bg-white'
                } ${msg.status === 'Unread' ? 'border-l-4 border-l-primary' : ''}`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  msg.status === 'Unread' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`truncate text-sm font-black uppercase tracking-tight ${
                      msg.status === 'Unread' ? 'text-slate-900' : 'text-slate-600'
                    }`}>
                      {msg.name}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400">
                      {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className={`truncate text-xs font-bold mb-2 ${
                    msg.status === 'Unread' ? 'text-primary' : 'text-slate-500'
                  }`}>
                    {msg.subject || 'No Subject'}
                  </p>
                  <p className="line-clamp-1 text-xs text-slate-400">
                    {msg.message}
                  </p>
                </div>
                {msg.status === 'Unread' && (
                  <div className="absolute top-5 right-2 h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Mail className="h-8 w-8" />
              </div>
              <p className="font-display text-xl font-black uppercase italic text-slate-300">No Messages Found</p>
            </div>
          )}
        </div>

        {/* Message Detail View */}
        <div className="relative">
          <div className="sticky top-24 space-y-6">
            {selectedMessage ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                    selectedMessage.status === 'Unread' ? 'bg-primary/10 text-primary' :
                    selectedMessage.status === 'Read' ? 'bg-slate-100 text-slate-500' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {selectedMessage.status}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => deleteMutation.mutate(selectedMessage.id)}
                      className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => setSelectedMessage(null)}
                      className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 leading-tight mb-2">
                      {selectedMessage.subject || 'General Inquiry'}
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(selectedMessage.createdAt), 'MMMM d, yyyy @ h:mm a')}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-slate-900">{selectedMessage.name}</p>
                        <p className="text-[10px] font-bold text-primary">{selectedMessage.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Message Content</p>
                    <p className="text-sm font-bold leading-relaxed text-slate-600 whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex gap-3">
                    <a 
                      href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'AstonnyFlyy Inquiry'}`}
                      onClick={() => updateStatusMutation.mutate({ id: selectedMessage.id, status: 'Replied' })}
                      className="flex-1 flex items-center justify-center gap-2 rounded-full bg-primary py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-accent hover:text-primary transition-all shadow-lg"
                    >
                      <Mail className="h-4 w-4" /> Reply via Email
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
                <p className="text-xs font-black uppercase tracking-widest text-slate-300">Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
