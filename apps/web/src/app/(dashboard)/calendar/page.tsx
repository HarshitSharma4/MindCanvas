'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const { data: journalDays = [] } = useQuery({
    queryKey: ['journal-calendar', year, month],
    queryFn: () => api.getJournalCalendar(year, month),
  });

  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: () => api.listEvents() });

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Mon = 0
  const daysInMonth = lastDay.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prev = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const journalMap = new Map<number, any>();
  (journalDays as any[]).forEach((j: any) => {
    const d = new Date(j.entry_date).getDate();
    journalMap.set(d, j);
  });

  const isToday = (d: number) => d === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();

  return (
    <div className="space-y-6 fade-in">
      <div><h1 className="text-2xl font-bold">Calendar</h1><p className="text-sm text-[var(--color-canvas-text-muted)]">Your journal timeline</p></div>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={prev} className="btn-ghost"><ChevronLeft size={18} /></button>
        <h2 className="text-lg font-semibold">{MONTH_NAMES[month - 1]} {year}</h2>
        <button onClick={next} className="btn-ghost"><ChevronRight size={18} /></button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-xs text-[var(--color-canvas-text-muted)] py-2 font-medium">{d}</div>
        ))}
        {cells.map((day, i) => (
          <div key={i} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all
            ${day === null ? '' :
              isToday(day) ? 'bg-[#6366f1]/20 text-[#6366f1] font-bold ring-1 ring-[#6366f1]/40' :
              journalMap.has(day) ? 'bg-[var(--color-canvas-card)] cursor-pointer hover:bg-white/[0.06]' :
              'text-[var(--color-canvas-text-muted)] hover:bg-white/[0.03]'
            }`}
          >
            {day && (
              <>
                <span>{day}</span>
                {journalMap.has(day) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1] mt-0.5" />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Upcoming events */}
      {(events as any[]).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><CalIcon size={14} className="text-[#f59e0b]" /> Personal Events</h3>
          <div className="space-y-2">
            {(events as any[]).map((e: any) => (
              <div key={e.id} className="card flex items-center gap-3 py-3">
                <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center text-xs font-bold text-[#f59e0b]">
                  {new Date(e.event_date).getDate()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{e.title}</p>
                  {e.person_name && <p className="text-xs text-[var(--color-canvas-text-muted)]">{e.person_name} — {e.relationship}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
