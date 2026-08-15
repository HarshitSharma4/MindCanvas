'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#6366f1] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366f1]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center max-w-2xl mx-auto fade-in">
        {/* Logo */}
        <div className="w-16 h-16 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[#6366f1]/20">
          <Sparkles size={28} className="text-white" />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
          <span className="gradient-text">MindCanvas</span>
        </h1>

        <p className="text-xl text-[var(--color-canvas-text-secondary)] mb-2 font-light">
          Personal Life Operating System
        </p>

        <p className="text-[var(--color-canvas-text-muted)] mb-10 max-w-md mx-auto leading-relaxed">
          Treat your daily journal as a blank slate for thoughts and ideas. 
          Capture everything. Organize naturally.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push('/login')}
            className="btn-primary text-base px-8 py-3"
          >
            Get Started <ArrowRight size={18} />
          </button>
          <button
            onClick={() => router.push('/login?mode=login')}
            className="btn-secondary text-base px-8 py-3"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Footer tagline */}
      <p className="absolute bottom-8 text-xs text-[var(--color-canvas-text-muted)]">
        Your thoughts, your canvas, your life.
      </p>
    </div>
  );
}
