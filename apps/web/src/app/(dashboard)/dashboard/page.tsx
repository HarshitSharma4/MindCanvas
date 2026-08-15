'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
  BookOpen, CheckSquare, Wallet, GraduationCap, Heart,
  FolderKanban, Calendar, ArrowRight, Flame, Sparkles, PenLine
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: () => api.getDashboard() });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div className="space-y-6 fade-in">
        <div className="skeleton h-12 w-80" />
        <div className="skeleton h-24 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-28" />)}
        </div>
      </div>
    );
  }

  const d = data || {};
  const name = d.greeting?.display_name || user?.display_name || user?.full_name || 'there';

  return (
    <div className="space-y-8 fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting()}, <span className="gradient-text">{name}</span>.
        </h1>
        <p className="text-[var(--color-canvas-text-muted)] mt-1 text-sm">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Motivation */}
      {d.motivation && (
        <div className="card bg-gradient-to-r from-[#6366f1]/5 to-[#8b5cf6]/5 border-[#6366f1]/20">
          <div className="flex items-start gap-3">
            <Sparkles size={18} className="text-[#6366f1] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm italic text-[var(--color-canvas-text)]">&ldquo;{d.motivation.text}&rdquo;</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => router.push('/journal/new')} className="btn-primary text-xs px-4 py-2">
          <PenLine size={14} /> Write Journal
        </button>
        <button onClick={() => router.push('/tasks?new=1')} className="btn-secondary text-xs px-4 py-2">
          <CheckSquare size={14} /> Add Task
        </button>
        <button onClick={() => router.push('/finance?new=1')} className="btn-secondary text-xs px-4 py-2">
          <Wallet size={14} /> Log Expense
        </button>
        <button onClick={() => router.push('/wellness?new=1')} className="btn-secondary text-xs px-4 py-2">
          <Heart size={14} /> Log Activity
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Journal */}
        <button onClick={() => router.push('/journal')} className="card text-left group">
          <div className="flex items-center justify-between mb-3">
            <BookOpen size={18} className="text-[#6366f1]" />
            {d.journal?.streak > 0 && (
              <span className="flex items-center gap-1 text-xs text-[#f59e0b]">
                <Flame size={12} /> {d.journal.streak}
              </span>
            )}
          </div>
          <p className="text-2xl font-bold">{d.journal?.has_entry_today ? '✓' : '—'}</p>
          <p className="text-xs text-[var(--color-canvas-text-muted)] mt-1">Journal today</p>
        </button>

        {/* Tasks */}
        <button onClick={() => router.push('/tasks')} className="card text-left group">
          <div className="flex items-center justify-between mb-3">
            <CheckSquare size={18} className="text-[#10b981]" />
          </div>
          <p className="text-2xl font-bold">{d.tasks?.done_today || 0}<span className="text-sm text-[var(--color-canvas-text-muted)] font-normal"> / {(d.tasks?.done_today || 0) + (d.tasks?.pending || 0)}</span></p>
          <p className="text-xs text-[var(--color-canvas-text-muted)] mt-1">Tasks completed</p>
        </button>

        {/* Spending */}
        <button onClick={() => router.push('/finance')} className="card text-left group">
          <div className="flex items-center justify-between mb-3">
            <Wallet size={18} className="text-[#f59e0b]" />
          </div>
          <p className="text-2xl font-bold">₹{(d.spending?.today || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-[var(--color-canvas-text-muted)] mt-1">Spent today</p>
        </button>

        {/* Learning */}
        <button onClick={() => router.push('/learning')} className="card text-left group">
          <div className="flex items-center justify-between mb-3">
            <GraduationCap size={18} className="text-[#3b82f6]" />
          </div>
          <p className="text-2xl font-bold">{d.learning?.today_minutes || 0}<span className="text-sm text-[var(--color-canvas-text-muted)] font-normal"> min</span></p>
          <p className="text-xs text-[var(--color-canvas-text-muted)] mt-1">Learned today</p>
        </button>

        {/* Meditation */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <Heart size={18} className="text-[#8b5cf6]" />
          </div>
          <p className="text-2xl font-bold">{d.wellness?.meditation || 0}<span className="text-sm text-[var(--color-canvas-text-muted)] font-normal"> min</span></p>
          <p className="text-xs text-[var(--color-canvas-text-muted)] mt-1">Meditation</p>
        </div>

        {/* Exercise */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <Heart size={18} className="text-[#f43f5e]" />
          </div>
          <p className="text-2xl font-bold">{d.wellness?.exercise || 0}<span className="text-sm text-[var(--color-canvas-text-muted)] font-normal"> min</span></p>
          <p className="text-xs text-[var(--color-canvas-text-muted)] mt-1">Exercise</p>
        </div>

        {/* Weekly Learning */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <GraduationCap size={18} className="text-[#0ea5e9]" />
          </div>
          <p className="text-2xl font-bold">{Math.floor((d.learning?.week_minutes || 0) / 60)}h {(d.learning?.week_minutes || 0) % 60}m</p>
          <p className="text-xs text-[var(--color-canvas-text-muted)] mt-1">Learning this week</p>
        </div>

        {/* Weekly Spending */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <Wallet size={18} className="text-[#ef4444]" />
          </div>
          <p className="text-2xl font-bold">₹{(d.spending?.this_week || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-[var(--color-canvas-text-muted)] mt-1">Spent this week</p>
        </div>
      </div>

      {/* Projects & Events */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Active Projects */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FolderKanban size={16} className="text-[#6366f1]" /> Active Projects
            </h3>
            <button onClick={() => router.push('/projects')} className="text-xs text-[#6366f1] hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          {(d.active_projects || []).length === 0 ? (
            <p className="text-sm text-[var(--color-canvas-text-muted)]">No active projects</p>
          ) : (
            <div className="space-y-3">
              {(d.active_projects || []).map((p: any) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color || '#6366f1' }} />
                  <span className="text-sm flex-1 truncate">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="progress-bar w-16">
                      <div className="progress-fill" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-xs text-[var(--color-canvas-text-muted)]">{p.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Calendar size={16} className="text-[#f59e0b]" /> Upcoming Events
            </h3>
          </div>
          {(d.upcoming_events || []).length === 0 ? (
            <p className="text-sm text-[var(--color-canvas-text-muted)]">No upcoming events</p>
          ) : (
            <div className="space-y-3">
              {(d.upcoming_events || []).map((e: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center text-xs font-bold text-[#f59e0b]">
                    {new Date(e.event_date).getDate()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{e.title}</p>
                    {e.person_name && <p className="text-xs text-[var(--color-canvas-text-muted)]">{e.person_name}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="text-center pt-4">
        <p className="text-xs text-[var(--color-canvas-text-muted)]">
          Press <kbd className="bg-[var(--color-canvas-card)] px-1.5 py-0.5 rounded text-[10px] border border-[var(--color-canvas-border)]">⌘K</kbd> to open the command palette
        </p>
      </div>
    </div>
  );
}
