'use client';

import { useAuth } from '@/lib/auth-context';
import { Settings as SettingsIcon, User, Palette, Bell } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 fade-in max-w-2xl mx-auto">
      <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-sm text-[var(--color-canvas-text-muted)]">Manage your MindCanvas preferences</p></div>

      {/* Profile */}
      <div className="card">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><User size={16} className="text-[#6366f1]" /> Profile</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[var(--color-canvas-text-muted)] block mb-1">Email</label>
            <p className="text-sm">{user?.email}</p>
          </div>
          <div>
            <label className="text-xs text-[var(--color-canvas-text-muted)] block mb-1">Display Name</label>
            <p className="text-sm">{user?.display_name || user?.full_name || '—'}</p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><Palette size={16} className="text-[#8b5cf6]" /> Appearance</h3>
        <div className="flex gap-3">
          {['dark', 'light', 'system'].map(t => (
            <button
              key={t}
              onClick={() => document.documentElement.setAttribute('data-theme', t)}
              className="px-4 py-2 rounded-lg text-xs border border-[var(--color-canvas-border)] hover:border-[#6366f1]/40 transition-colors capitalize"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><Bell size={16} className="text-[#f59e0b]" /> Notifications</h3>
        <p className="text-xs text-[var(--color-canvas-text-muted)]">Notification preferences coming soon.</p>
      </div>

      {/* About */}
      <div className="card">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><SettingsIcon size={16} className="text-[#10b981]" /> About</h3>
        <p className="text-xs text-[var(--color-canvas-text-muted)]">MindCanvas v1.0.0 — Personal Life Operating System</p>
        <p className="text-xs text-[var(--color-canvas-text-muted)] mt-1">Your thoughts, your canvas, your life.</p>
      </div>
    </div>
  );
}
