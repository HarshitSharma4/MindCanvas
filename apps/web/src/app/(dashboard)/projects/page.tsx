'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { Plus, FolderKanban, X } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = { idea: '#64748b', planning: '#f59e0b', active: '#6366f1', on_hold: '#ef4444', completed: '#10b981', archived: '#71717a' };

export default function ProjectsPage() {
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [filter, setFilter] = useState('');
  const { data: projects = [], isLoading } = useQuery({ queryKey: ['projects', filter], queryFn: () => api.listProjects(filter ? { status: filter } : {}) });

  const createMut = useMutation({
    mutationFn: (d: any) => api.createProject(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); setShowNew(false); setName(''); },
  });

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Projects</h1><p className="text-sm text-[var(--color-canvas-text-muted)]">Personal project management</p></div>
        <button onClick={() => setShowNew(true)} className="btn-primary"><Plus size={16} /> New Project</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'active', 'planning', 'idea', 'completed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${filter === s ? 'bg-[#6366f1] text-white' : 'bg-[var(--color-canvas-card)] text-[var(--color-canvas-text-secondary)] border border-[var(--color-canvas-border)]'}`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {showNew && (
        <div className="card space-y-3 border-[#6366f1]/30">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Project name..." className="input" autoFocus />
          <div className="flex gap-2">
            <button onClick={() => name && createMut.mutate({ name })} className="btn-primary text-xs" disabled={!name}>Create</button>
            <button onClick={() => setShowNew(false)} className="btn-ghost text-xs"><X size={14} /></button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-36" />)}</div>
      ) : (projects as any[]).length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban size={40} className="mx-auto text-[var(--color-canvas-text-muted)] mb-3 opacity-30" />
          <p className="text-[var(--color-canvas-text-muted)]">No projects yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {(projects as any[]).map((p: any) => (
            <div key={p.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: p.color || '#6366f1' }} />
                  <h3 className="font-semibold">{p.name}</h3>
                </div>
                <span className="badge text-xs" style={{ background: `${STATUS_COLORS[p.status]}20`, color: STATUS_COLORS[p.status] }}>
                  {p.status}
                </span>
              </div>
              {p.description && <p className="text-sm text-[var(--color-canvas-text-muted)] mb-3 line-clamp-2">{p.description}</p>}
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.progress}%` }} /></div>
              <p className="text-xs text-[var(--color-canvas-text-muted)] mt-2">{p.progress}% complete</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
