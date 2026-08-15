'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Plus, BookOpen, Search, Filter } from 'lucide-react';
import { useState } from 'react';

const MOODS = ['productive', 'focused', 'calm', 'creative', 'curious', 'energetic', 'anxious', 'thoughtful'];

export default function JournalListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [moodFilter, setMoodFilter] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['journals', search, moodFilter],
    queryFn: () => api.listJournals({ ...(search && { search }), ...(moodFilter && { mood: moodFilter }) }),
  });

  const entries = data?.entries || [];

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Journal</h1>
          <p className="text-sm text-[var(--color-canvas-text-muted)]">Your personal canvas for thoughts and reflections</p>
        </div>
        <button onClick={() => router.push('/journal/new')} className="btn-primary">
          <Plus size={16} /> New Entry
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-canvas-text-muted)]" />
          <input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>
        <select
          value={moodFilter}
          onChange={e => setMoodFilter(e.target.value)}
          className="input w-auto text-sm"
        >
          <option value="">All moods</option>
          {MOODS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
        </select>
      </div>

      {/* Entries */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24" />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={48} className="mx-auto text-[var(--color-canvas-text-muted)] mb-4 opacity-30" />
          <h3 className="text-lg font-medium mb-2">Your canvas is empty</h3>
          <p className="text-sm text-[var(--color-canvas-text-muted)] mb-6">Start writing what&apos;s on your mind.</p>
          <button onClick={() => router.push('/journal/new')} className="btn-primary">
            <Plus size={16} /> Write today&apos;s journal
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry: any) => (
            <button
              key={entry.id}
              onClick={() => router.push(`/journal/${entry.id}`)}
              className="card w-full text-left group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {entry.mood && (
                      <span className={`badge bg-white/5 mood-${entry.mood}`}>
                        {entry.mood}
                      </span>
                    )}
                    <span className="text-xs text-[var(--color-canvas-text-muted)]">
                      {new Date(entry.entry_date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="font-medium truncate">{entry.title || 'Untitled'}</h3>
                  <p className="text-sm text-[var(--color-canvas-text-muted)] mt-1 line-clamp-2">
                    {entry.content?.substring(0, 200)}
                  </p>
                </div>
                {entry.energy_level && (
                  <div className="flex-shrink-0 text-xs text-[var(--color-canvas-text-muted)]">
                    ⚡ {entry.energy_level}/10
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
