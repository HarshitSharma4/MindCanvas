'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Search as SearchIcon, BookOpen, Lightbulb, FolderKanban, CheckSquare, Wallet } from 'lucide-react';

const ICONS: Record<string, any> = { journal: BookOpen, idea: Lightbulb, project: FolderKanban, task: CheckSquare, finance: Wallet };

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const data = await api.search(q);
      setResults(data.results || []);
    } catch { setResults([]); }
    finally { setSearching(false); }
  };

  return (
    <div className="space-y-6 fade-in max-w-2xl mx-auto">
      <div><h1 className="text-2xl font-bold">Search</h1><p className="text-sm text-[var(--color-canvas-text-muted)]">Find anything across MindCanvas</p></div>

      <div className="relative">
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-canvas-text-muted)]" />
        <input
          type="text"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search journals, ideas, projects, tasks, finances..."
          className="input pl-11 py-3 text-base"
          autoFocus
        />
      </div>

      {searching && <div className="text-center py-8"><div className="w-6 h-6 rounded-full border-2 border-[#6366f1] border-t-transparent animate-spin mx-auto" /></div>}

      {!searching && results.length > 0 && (
        <div className="space-y-2">
          {results.map((r: any) => {
            const Icon = ICONS[r.type] || SearchIcon;
            return (
              <div key={`${r.type}-${r.id}`} className="card flex items-start gap-3 py-3">
                <Icon size={16} className="text-[#6366f1] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="badge text-[10px] bg-[#6366f1]/10 text-[#6366f1]">{r.type}</span>
                  </div>
                  <p className="text-sm font-medium mt-1">{r.title || 'Untitled'}</p>
                  {r.preview && <p className="text-xs text-[var(--color-canvas-text-muted)] mt-1 line-clamp-2">{r.preview}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!searching && query.length >= 2 && results.length === 0 && (
        <div className="text-center py-12">
          <SearchIcon size={32} className="mx-auto text-[var(--color-canvas-text-muted)] mb-3 opacity-30" />
          <p className="text-sm text-[var(--color-canvas-text-muted)]">No results found for &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
