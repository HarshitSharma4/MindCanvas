'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, BookOpen, CheckSquare, Lightbulb, FolderKanban,
  Wallet, GraduationCap, Heart, Calendar, Sparkles, X
} from 'lucide-react';

const COMMANDS = [
  { label: 'Write today\'s journal', icon: BookOpen, href: '/journal/new', shortcut: 'J' },
  { label: 'Create a task', icon: CheckSquare, href: '/tasks?new=1', shortcut: 'T' },
  { label: 'Capture an idea', icon: Lightbulb, href: '/ideas?new=1', shortcut: 'I' },
  { label: 'Create project', icon: FolderKanban, href: '/projects?new=1', shortcut: 'P' },
  { label: 'Add expense', icon: Wallet, href: '/finance?new=1', shortcut: 'E' },
  { label: 'Log learning session', icon: GraduationCap, href: '/learning?new=1', shortcut: 'L' },
  { label: 'Log wellness activity', icon: Heart, href: '/wellness?new=1', shortcut: 'W' },
  { label: 'View calendar', icon: Calendar, href: '/calendar', shortcut: 'C' },
  { label: 'Search everything', icon: Search, href: '/search', shortcut: 'S' },
  { label: 'Ask AI', icon: Sparkles, href: '/search?ai=1', shortcut: 'A' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setOpen(prev => !prev);
      setQuery('');
    }
    if (e.key === 'Escape') setOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!open) return null;

  const filtered = COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="cmd-overlay" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-lg glass rounded-xl overflow-hidden shadow-2xl shadow-black/50 fade-in"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '420px' }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-canvas-border)]">
          <Search size={18} className="text-[var(--color-canvas-text-muted)] flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search commands..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--color-canvas-text)] placeholder:text-[var(--color-canvas-text-muted)]"
            autoFocus
          />
          <kbd className="text-[10px] text-[var(--color-canvas-text-muted)] bg-[var(--color-canvas-bg)] px-1.5 py-0.5 rounded">ESC</kbd>
        </div>

        {/* Commands */}
        <div className="overflow-y-auto" style={{ maxHeight: '340px' }}>
          <div className="px-2 py-2">
            <p className="text-[10px] uppercase text-[var(--color-canvas-text-muted)] px-2 pb-1.5 font-semibold tracking-wider">Quick Actions</p>
            {filtered.map(cmd => (
              <button
                key={cmd.label}
                onClick={() => { router.push(cmd.href); setOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left text-sm
                  text-[var(--color-canvas-text-secondary)] hover:text-[var(--color-canvas-text)] hover:bg-white/[0.04] transition-colors"
              >
                <cmd.icon size={16} />
                <span className="flex-1">{cmd.label}</span>
                <kbd className="text-[10px] text-[var(--color-canvas-text-muted)] bg-[var(--color-canvas-bg)] px-1.5 py-0.5 rounded">{cmd.shortcut}</kbd>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-[var(--color-canvas-text-muted)] px-3 py-4 text-center">No commands found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
