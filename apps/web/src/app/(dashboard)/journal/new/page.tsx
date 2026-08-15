'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  ArrowLeft, Save, Image as ImageIcon, Mic, Smile,
  Zap, MapPin, Cloud, X, Check, Loader2
} from 'lucide-react';

const MOODS = [
  { value: 'productive', emoji: '🚀', color: '#10b981' },
  { value: 'focused', emoji: '🎯', color: '#6366f1' },
  { value: 'calm', emoji: '😌', color: '#0ea5e9' },
  { value: 'creative', emoji: '🎨', color: '#f59e0b' },
  { value: 'curious', emoji: '🔍', color: '#8b5cf6' },
  { value: 'energetic', emoji: '⚡', color: '#f43f5e' },
  { value: 'anxious', emoji: '😰', color: '#ef4444' },
  { value: 'thoughtful', emoji: '💭', color: '#64748b' },
];

export default function NewJournalPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [energy, setEnergy] = useState(5);
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [showMoods, setShowMoods] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleImageAdd = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...newImages]);
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  const removeImage = (index: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSave = async (isDraft = false) => {
    if (!content && !title) return;
    setSaving(true);
    try {
      const entry = await api.createJournal({
        title: title || undefined,
        content,
        mood: mood || undefined,
        energy_level: energy,
        location: location || undefined,
        is_draft: isDraft,
      });

      // Upload images
      for (const img of images) {
        await api.uploadJournalMedia(entry.id, img.file);
      }

      setSaved(true);
      setTimeout(() => router.push('/journal'), 800);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="btn-ghost">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => handleSave(true)} className="btn-secondary text-xs" disabled={saving}>
            Save Draft
          </button>
          <button onClick={() => handleSave(false)} className="btn-primary text-xs" disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Date */}
      <p className="text-sm text-[var(--color-canvas-text-muted)] mb-4">
        {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      {/* Title */}
      <input
        type="text"
        placeholder="Give your entry a title..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full bg-transparent border-none outline-none text-2xl font-bold placeholder:text-[var(--color-canvas-text-muted)]/40 mb-4"
      />

      {/* Canvas (main text area) */}
      <textarea
        placeholder="What's on your mind today? Write freely... ✨"
        value={content}
        onChange={e => setContent(e.target.value)}
        className="textarea min-h-[350px] text-base leading-relaxed border-none bg-transparent resize-none focus:ring-0 focus:shadow-none"
        autoFocus
      />

      {/* Image previews */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden aspect-video bg-[var(--color-canvas-card)]">
              <img src={img.preview} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-[var(--color-canvas-border)]">
        {/* Add Image */}
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleImageAdd} />
        <button onClick={() => fileRef.current?.click()} className="btn-ghost text-xs">
          <ImageIcon size={16} /> Image
        </button>

        {/* Audio (placeholder) */}
        <button className="btn-ghost text-xs" title="Audio recording coming soon">
          <Mic size={16} /> Audio
        </button>

        {/* Mood picker */}
        <div className="relative">
          <button onClick={() => setShowMoods(!showMoods)} className="btn-ghost text-xs">
            <Smile size={16} /> {mood ? MOODS.find(m => m.value === mood)?.emoji : 'Mood'}
          </button>
          {showMoods && (
            <div className="absolute bottom-full left-0 mb-2 p-2 glass rounded-xl grid grid-cols-4 gap-1 z-10 shadow-xl">
              {MOODS.map(m => (
                <button
                  key={m.value}
                  onClick={() => { setMood(m.value); setShowMoods(false); }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-colors
                    ${mood === m.value ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <span className="text-lg">{m.emoji}</span>
                  <span className="text-[10px] text-[var(--color-canvas-text-muted)]">{m.value}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Energy slider */}
        <div className="flex items-center gap-2 ml-2">
          <Zap size={14} className="text-[#f59e0b]" />
          <input
            type="range"
            min={1}
            max={10}
            value={energy}
            onChange={e => setEnergy(Number(e.target.value))}
            className="w-20 h-1 accent-[#f59e0b]"
          />
          <span className="text-xs text-[var(--color-canvas-text-muted)]">{energy}/10</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 ml-2">
          <MapPin size={14} className="text-[var(--color-canvas-text-muted)]" />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-[var(--color-canvas-text-muted)] w-24 placeholder:text-[var(--color-canvas-text-muted)]/50"
          />
        </div>
      </div>

      {/* Word count */}
      <div className="mt-3 text-right">
        <span className="text-xs text-[var(--color-canvas-text-muted)]">
          {content.split(/\s+/).filter(Boolean).length} words
        </span>
      </div>
    </div>
  );
}
