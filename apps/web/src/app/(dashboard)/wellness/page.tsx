'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { Plus, Heart, X, Clock } from 'lucide-react';

const TYPES = [
  { value: 'meditation', emoji: '🧘', label: 'Meditation' },
  { value: 'exercise', emoji: '💪', label: 'Exercise' },
  { value: 'yoga', emoji: '🧘‍♀️', label: 'Yoga' },
  { value: 'walking', emoji: '🚶', label: 'Walking' },
  { value: 'sleep', emoji: '😴', label: 'Sleep' },
];

export default function WellnessPage() {
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [type, setType] = useState('meditation');
  const [duration, setDuration] = useState('');
  const [name, setName] = useState('');
  const { data: activities = [], isLoading } = useQuery({ queryKey: ['wellness'], queryFn: () => api.listWellness() });

  const createMut = useMutation({
    mutationFn: (d: any) => api.createWellness(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wellness'] }); setShowNew(false); setDuration(''); setName(''); },
  });

  // Group by type for summary
  const summary = (activities as any[]).reduce((acc: Record<string, number>, a: any) => {
    acc[a.type] = (acc[a.type] || 0) + (a.duration_minutes || 0);
    return acc;
  }, {});

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Wellness</h1><p className="text-sm text-[var(--color-canvas-text-muted)]">Mind and body tracking</p></div>
        <button onClick={() => setShowNew(true)} className="btn-primary"><Plus size={16} /> Log Activity</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TYPES.filter(t => summary[t.value]).map(t => (
          <div key={t.value} className="card text-center">
            <span className="text-2xl">{t.emoji}</span>
            <p className="text-xl font-bold mt-2">{summary[t.value]}<span className="text-xs text-[var(--color-canvas-text-muted)] font-normal"> min</span></p>
            <p className="text-xs text-[var(--color-canvas-text-muted)]">{t.label}</p>
          </div>
        ))}
      </div>

      {showNew && (
        <div className="card space-y-3 border-[#8b5cf6]/30">
          <div className="flex gap-2 flex-wrap">
            {TYPES.map(t => (
              <button key={t.value} onClick={() => setType(t.value)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${type === t.value ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' : 'bg-[var(--color-canvas-bg)] text-[var(--color-canvas-text-muted)]'}`}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Activity name (optional)" className="input flex-1" />
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Minutes" className="input w-24" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => duration && createMut.mutate({ type, activity_name: name || undefined, duration_minutes: parseInt(duration) })} className="btn-primary text-xs" disabled={!duration}>Log</button>
            <button onClick={() => setShowNew(false)} className="btn-ghost text-xs"><X size={14} /></button>
          </div>
        </div>
      )}

      {/* Activity list */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14" />)}</div>
      ) : (
        <div className="space-y-2">
          {(activities as any[]).map((a: any) => (
            <div key={a.id} className="card flex items-center gap-3 py-3">
              <span className="text-lg">{TYPES.find(t => t.value === a.type)?.emoji || '🏃'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{a.activity_name || a.type}</p>
                <p className="text-xs text-[var(--color-canvas-text-muted)]">{new Date(a.activity_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
              </div>
              <span className="text-xs text-[var(--color-canvas-text-muted)] flex items-center gap-1"><Clock size={12} />{a.duration_minutes}m</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
