'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { Plus, Lightbulb, X } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = { captured: '#64748b', exploring: '#f59e0b', planned: '#6366f1', in_progress: '#0ea5e9', completed: '#10b981', archived: '#71717a' };

export default function IdeasPage() {
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['ideas'], queryFn: () => api.listIdeas() });
  const ideas = data?.ideas || [];

  const createMut = useMutation({
    mutationFn: (d: any) => api.createIdea(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ideas'] }); setShowNew(false); setTitle(''); setDesc(''); },
  });

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Ideas</h1><p className="text-sm text-[var(--color-canvas-text-muted)]">Capture and explore your thoughts</p></div>
        <button onClick={() => setShowNew(true)} className="btn-primary"><Plus size={16} /> Capture Idea</button>
      </div>

      {showNew && (
        <div className="card space-y-3 border-[#f59e0b]/30">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="What's the idea?" className="input" autoFocus />
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe it..." className="textarea min-h-[80px]" />
          <div className="flex gap-2">
            <button onClick={() => title && createMut.mutate({ title, description: desc || undefined })} className="btn-primary text-xs" disabled={!title}>Capture</button>
            <button onClick={() => setShowNew(false)} className="btn-ghost text-xs"><X size={14} /></button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-32" />)}</div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-16">
          <Lightbulb size={40} className="mx-auto text-[var(--color-canvas-text-muted)] mb-3 opacity-30" />
          <p className="text-[var(--color-canvas-text-muted)]">No ideas captured yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea: any) => (
            <div key={idea.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-sm">{idea.title}</h3>
                <span className="badge text-[10px]" style={{ background: `${STATUS_COLORS[idea.status]}20`, color: STATUS_COLORS[idea.status] }}>{idea.status}</span>
              </div>
              {idea.description && <p className="text-xs text-[var(--color-canvas-text-muted)] line-clamp-3">{idea.description}</p>}
              <p className="text-[10px] text-[var(--color-canvas-text-muted)] mt-3">{new Date(idea.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
