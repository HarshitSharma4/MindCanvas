'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard, BookOpen, Calendar, CheckSquare, FolderKanban,
  Lightbulb, Wallet, GraduationCap, Heart, Search, Settings,
  LogOut, Menu, X, Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/ideas', label: 'Ideas', icon: Lightbulb },
  { href: '/finance', label: 'Finance', icon: Wallet },
  { href: '/learning', label: 'Learning', icon: GraduationCap },
  { href: '/wellness', label: 'Wellness', icon: Heart },
];

const BOTTOM_ITEMS = [
  { href: '/search', label: 'Search', icon: Search },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => {
    const active = pathname === href || pathname?.startsWith(href + '/');
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
          ${active
            ? 'bg-gradient-to-r from-[#6366f1]/15 to-[#8b5cf6]/10 text-white border-l-2 border-[#6366f1]'
            : 'text-[var(--color-canvas-text-secondary)] hover:text-[var(--color-canvas-text)] hover:bg-white/[0.03]'
          }`}
      >
        <Icon size={18} className={active ? 'text-[#6366f1]' : ''} />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold gradient-text">MindCanvas</span>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(item => <NavLink key={item.href} {...item} />)}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 pb-2 space-y-1 border-t border-[var(--color-canvas-border)] pt-3 mt-2">
        {BOTTOM_ITEMS.map(item => <NavLink key={item.href} {...item} />)}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full
            text-[var(--color-canvas-text-muted)] hover:text-[#f43f5e] hover:bg-[#f43f5e]/5 transition-all duration-200"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* User */}
      {user && !collapsed && (
        <div className="px-4 py-3 border-t border-[var(--color-canvas-border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-xs font-bold text-white">
              {(user.display_name || user.full_name || user.email)?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.display_name || user.full_name}</p>
              <p className="text-xs text-[var(--color-canvas-text-muted)] truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen z-40 bg-[var(--color-canvas-surface)] border-r border-[var(--color-canvas-border)]
        transition-all duration-300
        ${collapsed ? 'w-16' : 'w-60'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {sidebarContent}
      </aside>

      {/* Spacer */}
      <div className={`hidden lg:block flex-shrink-0 ${collapsed ? 'w-16' : 'w-60'}`} />
    </>
  );
}
