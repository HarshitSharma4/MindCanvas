'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { Plus, CheckSquare, Circle, CheckCircle2, Clock, X } from 'lucide-react';

const PRIORITY_COLORS: Record<string, string> = { urgent: '#ef4444', high: '#f59e0b', medium: '#6366f1', low: '#64748b' };

export default function TasksPage() {
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [filter, setFilter] = useState('');
  const { data: tasks = [], isLoading } = useQuery({ queryKey: ['tasks', filter], queryFn: () => api.listTasks(filter ? { status: filter } : {}) });

  const createMut = useMutation({
    mutationFn: (data: any) => api.createTask(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); setShowNew(false); setNewTitle(''); },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateTask(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-sm text-[var(--color-canvas-text-muted)]">Stay on top of everything</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary"><Plus size={16} /> New Task</button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['', 'todo', 'in_progress', 'completed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${filter === s ? 'bg-[#6366f1] text-white' : 'bg-[var(--color-canvas-card)] text-[var(--color-canvas-text-secondary)] border border-[var(--color-canvas-border)]'}`}>
            {s ? s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All'}
          </button>
        ))}
      </div>

      {/* New task form */}
      {showNew && (
        <div className="card space-y-3 border-[#6366f1]/30">
          <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Task title..." className="input" autoFocus />
          <div className="flex items-center gap-2">
            <select value={newPriority} onChange={e => setNewPriority(e.target.value)} className="input w-auto text-sm">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
            </select>
            <button onClick={() => newTitle && createMut.mutate({ title: newTitle, priority: newPriority })} className="btn-primary text-xs" disabled={!newTitle}>Create</button>
            <button onClick={() => setShowNew(false)} className="btn-ghost text-xs"><X size={14} /></button>
          </div>
        </div>
      )}

      {/* Task list */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14" />)}</div>
      ) : (tasks as any[]).length === 0 ? (
        <div className="text-center py-16">
          <CheckSquare size={40} className="mx-auto text-[var(--color-canvas-text-muted)] mb-3 opacity-30" />
          <p className="text-[var(--color-canvas-text-muted)]">No tasks yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(tasks as any[]).map((t: any) => (
            <div key={t.id} className="card flex items-center gap-3 py-3">
              <button onClick={() => toggleMut.mutate({ id: t.id, status: t.status === 'completed' ? 'todo' : 'completed' })}>
                {t.status === 'completed' ? <CheckCircle2 size={20} className="text-[#10b981]" /> : <Circle size={20} className="text-[var(--color-canvas-text-muted)]" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${t.status === 'completed' ? 'line-through text-[var(--color-canvas-text-muted)]' : ''}`}>{t.title}</p>
                {t.due_date && <p className="text-xs text-[var(--color-canvas-text-muted)] flex items-center gap-1 mt-0.5"><Clock size={10} /> {new Date(t.due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>}
              </div>
              <div className="w-2 h-2 rounded-full" style={{ background: PRIORITY_COLORS[t.priority] || '#64748b' }} title={t.priority} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
