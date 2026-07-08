import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSubscribers, deleteSubscriber } from '@/lib/api';
import { Trash2, Loader2, Users, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';

export default function Subscribers() {
  const queryClient = useQueryClient();

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['subscribers'],
    queryFn: fetchSubscribers
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubscriber,
    onSuccess: () => {
      queryClient.invalidateQueries(['subscribers']);
      toast.success('Subscriber removed');
    },
    onError: () => toast.error('Failed to remove subscriber')
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight text-slate-900">Community</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Newsletter Subscribers & Community Members</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl border border-slate-200 shadow-sm">
          <div className="rounded-2xl bg-indigo-500/10 p-3">
            <Users className="h-6 w-6 text-indigo-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{subscribers.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Members</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Mobile Card View */}
        <div className="sm:hidden divide-y divide-slate-50">
          {subscribers.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between p-4 group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="rounded-xl bg-slate-100 p-2 text-slate-400 shrink-0"><Mail className="h-4 w-4" /></div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-700 text-sm truncate">{sub.email}</p>
                  <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5"><Calendar className="h-3 w-3" />{moment(sub.createdAt).format('MMM DD, YYYY')}</p>
                </div>
              </div>
              <button onClick={() => deleteMutation.mutate(sub.id)} className="rounded-xl p-2.5 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all shrink-0"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {subscribers.length === 0 && (
            <div className="px-8 py-20 text-center"><p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">No one has joined the movement yet</p></div>
          )}
        </div>
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Joined Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-slate-100 p-2 text-slate-400 group-hover:bg-white transition-colors"><Mail className="h-4 w-4" /></div>
                      <span className="font-bold text-slate-700">{sub.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 opacity-40" />{moment(sub.createdAt).format('MMM DD, YYYY')}</div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => deleteMutation.mutate(sub.id)} className="rounded-xl p-2.5 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="h-5 w-5" /></button>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr><td colSpan="3" className="px-8 py-20 text-center"><p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">No one has joined the movement yet</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
