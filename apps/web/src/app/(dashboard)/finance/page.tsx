'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { Plus, Wallet, TrendingDown, TrendingUp, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CATEGORIES = ['food','travel','shopping','bills','education','entertainment','health','subscriptions','investment','salary','freelance','gift','other'];
const CAT_COLORS: Record<string, string> = { food:'#f59e0b', travel:'#0ea5e9', shopping:'#f43f5e', bills:'#ef4444', education:'#6366f1', entertainment:'#8b5cf6', health:'#10b981', subscriptions:'#64748b', investment:'#22c55e', salary:'#10b981', freelance:'#3b82f6', gift:'#f59e0b', other:'#71717a' };

export default function FinancePage() {
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState('food');
  const [type, setType] = useState('expense');
  const [desc, setDesc] = useState('');

  const { data: txns } = useQuery({ queryKey: ['transactions'], queryFn: () => api.listTransactions() });
  const { data: summary } = useQuery({ queryKey: ['finance-summary'], queryFn: () => api.getFinanceSummary() });

  const createMut = useMutation({
    mutationFn: (d: any) => api.createTransaction(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transactions'] }); qc.invalidateQueries({ queryKey: ['finance-summary'] }); setShowNew(false); setAmount(''); setDesc(''); },
  });

  const transactions = txns?.transactions || [];
  const pieData = (summary?.categories || []).map((c: any) => ({ name: c.category, value: parseFloat(c.total) }));

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Finance</h1><p className="text-sm text-[var(--color-canvas-text-muted)]">Track your money</p></div>
        <button onClick={() => setShowNew(true)} className="btn-primary"><Plus size={16} /> Add Transaction</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-2"><TrendingDown size={16} className="text-[#ef4444]" /><span className="text-xs text-[var(--color-canvas-text-muted)]">Today</span></div>
          <p className="text-xl font-bold">₹{(summary?.today_expense || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2"><TrendingDown size={16} className="text-[#f59e0b]" /><span className="text-xs text-[var(--color-canvas-text-muted)]">This Month</span></div>
          <p className="text-xl font-bold">₹{(summary?.month_expense || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-[#10b981]" /><span className="text-xs text-[var(--color-canvas-text-muted)]">Income</span></div>
          <p className="text-xl font-bold">₹{(summary?.month_income || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Category chart */}
      {pieData.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-3">Spending by Category</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={2}>
                  {pieData.map((entry: any, i: number) => <Cell key={i} fill={CAT_COLORS[entry.name] || '#6366f1'} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.map((d: any) => (
              <span key={d.name} className="flex items-center gap-1 text-[10px] text-[var(--color-canvas-text-muted)]">
                <span className="w-2 h-2 rounded-full" style={{ background: CAT_COLORS[d.name] || '#6366f1' }} />{d.name} ₹{d.value.toLocaleString('en-IN')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* New transaction */}
      {showNew && (
        <div className="card space-y-3 border-[#f59e0b]/30">
          <div className="flex gap-2">
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="input flex-1" autoFocus />
            <select value={type} onChange={e => setType(e.target.value)} className="input w-auto text-sm">
              <option value="expense">Expense</option><option value="income">Income</option><option value="transfer">Transfer</option>
            </select>
          </div>
          <div className="flex gap-2">
            <select value={cat} onChange={e => setCat(e.target.value)} className="input flex-1 text-sm">
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="input flex-1" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => amount && createMut.mutate({ amount: parseFloat(amount), type, category: cat, description: desc || undefined })} className="btn-primary text-xs" disabled={!amount}>Add</button>
            <button onClick={() => setShowNew(false)} className="btn-ghost text-xs"><X size={14} /></button>
          </div>
        </div>
      )}

      {/* Transaction list */}
      <div className="space-y-2">
        {transactions.map((t: any) => (
          <div key={t.id} className="card flex items-center gap-3 py-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs" style={{ background: `${CAT_COLORS[t.category] || '#6366f1'}15`, color: CAT_COLORS[t.category] || '#6366f1' }}>
              {t.category?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{t.description || t.category}</p>
              <p className="text-xs text-[var(--color-canvas-text-muted)]">{new Date(t.transaction_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
            </div>
            <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-[#10b981]' : 'text-[var(--color-canvas-text)]'}`}>
              {t.type === 'income' ? '+' : '-'}₹{parseFloat(t.amount).toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
