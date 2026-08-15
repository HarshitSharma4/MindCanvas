'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { Plus, GraduationCap, X, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function LearningPage() {
  const qc = useQueryClient();
  const [showNewSession, setShowNewSession] = useState(false);
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('');
  const { data: items = [] } = useQuery({ queryKey: ['learning-items'], queryFn: () => api.listLearningItems() });
  const { data: sessions = [] } = useQuery({ queryKey: ['learning-sessions'], queryFn: () => api.listLearningSessions() });

  const createSession = useMutation({
    mutationFn: (d: any) => api.createLearningSession(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['learning-sessions'] }); setShowNewSession(false); setTopic(''); setDuration(''); },
  });

  const chartData = (sessions as any[]).slice(0, 7).reverse().map((s: any) => ({
    date: new Date(s.session_date).toLocaleDateString('en-IN', { weekday: 'short' }),
    minutes: s.duration_minutes,
  }));

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Learning</h1><p className="text-sm text-[var(--color-canvas-text-muted)]">Track your growth</p></div>
        <button onClick={() => setShowNewSession(true)} className="btn-primary"><Plus size={16} /> Log Session</button>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-3">Recent Sessions</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="minutes" fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {showNewSession && (
        <div className="card space-y-3 border-[#6366f1]/30">
          <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="What did you study?" className="input" autoFocus />
          <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Duration (minutes)" className="input" />
          <div className="flex gap-2">
            <button onClick={() => topic && duration && createSession.mutate({ topic, duration_minutes: parseInt(duration) })} className="btn-primary text-xs" disabled={!topic || !duration}>Log</button>
            <button onClick={() => setShowNewSession(false)} className="btn-ghost text-xs"><X size={14} /></button>
          </div>
        </div>
      )}

      {/* Learning items */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Courses & Topics</h3>
        {(items as any[]).length === 0 ? (
          <p className="text-sm text-[var(--color-canvas-text-muted)]">No learning items yet</p>
        ) : (
          <div className="space-y-3">
            {(items as any[]).map((item: any) => (
              <div key={item.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">{item.title}</h4>
                  <span className="text-xs text-[var(--color-canvas-text-muted)]">{item.category}</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${item.progress}%` }} /></div>
                <p className="text-xs text-[var(--color-canvas-text-muted)] mt-1">{item.progress}% complete</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent sessions */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Recent Sessions</h3>
        <div className="space-y-2">
          {(sessions as any[]).slice(0, 10).map((s: any) => (
            <div key={s.id} className="card flex items-center gap-3 py-3">
              <GraduationCap size={16} className="text-[#6366f1] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{s.topic}</p>
                <p className="text-xs text-[var(--color-canvas-text-muted)]">{new Date(s.session_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
              </div>
              <span className="text-xs text-[var(--color-canvas-text-muted)] flex items-center gap-1"><Clock size={12} />{s.duration_minutes}m</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
