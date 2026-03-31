import { useState } from 'react';
import type { PlatformFees, PrivateCommissionTier } from '../../types/fees';
import type { MonthlyFees, MonthlyPrivateCommission } from '../../types/fees';
import { DEFAULT_PLATFORM_FEES } from '../../constants/finance';
import { format, subMonths } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Props {
  feesArray: MonthlyFees[];
  commissionArray: MonthlyPrivateCommission[];
  onSetFees: (monthKey: string, fees: PlatformFees) => void;
  onSetTiers: (monthKey: string, tiers: PrivateCommissionTier[]) => void;
  onClose: () => void;
}

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

function monthLabel(key: string) {
  const [y, m] = key.split('-').map(Number);
  return format(new Date(y, m - 1, 1), 'MMMM yyyy', { locale: pt });
}

export default function FeesConfigPanel({ feesArray, commissionArray, onSetFees, onSetTiers, onClose }: Props) {
  const today = currentMonthKey();
  const [selectedMonth, setSelectedMonth] = useState(today);
  const [tab, setTab] = useState<'fees' | 'commission'>('fees');

  // Build list of months: current + last 11
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(new Date(), i);
    return format(d, 'yyyy-MM');
  });

  // Current fees for selected month
  const currentFees = feesArray.find(f => f.monthKey === selectedMonth)?.fees ?? { ...DEFAULT_PLATFORM_FEES };
  const [fees, setFees] = useState<PlatformFees>(currentFees);

  // Current tiers for selected month
  const currentTiers = commissionArray.find(c => c.monthKey === selectedMonth)?.tiers ?? [
    { minRepeats: 0, maxRepeats: null, commissionPct: 0.20 },
  ];
  const [tiers, setTiers] = useState<PrivateCommissionTier[]>(currentTiers);

  function handleMonthChange(mk: string) {
    setSelectedMonth(mk);
    const f = feesArray.find(x => x.monthKey === mk)?.fees ?? { ...DEFAULT_PLATFORM_FEES };
    setFees(f);
    const t = commissionArray.find(x => x.monthKey === mk)?.tiers ?? [
      { minRepeats: 0, maxRepeats: null, commissionPct: 0.20 },
    ];
    setTiers(t);
  }

  function saveFees() {
    onSetFees(selectedMonth, fees);
  }

  function saveTiers() {
    onSetTiers(selectedMonth, tiers);
  }

  function updateFee(key: keyof PlatformFees, val: string) {
    setFees(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));
  }

  function updateTier(idx: number, field: keyof PrivateCommissionTier, val: string) {
    setTiers(prev => prev.map((t, i) => {
      if (i !== idx) return t;
      if (field === 'maxRepeats') return { ...t, maxRepeats: val === '' ? null : parseInt(val) };
      if (field === 'commissionPct') return { ...t, commissionPct: parseFloat(val) / 100 || 0 };
      return { ...t, [field]: parseInt(val) || 0 };
    }));
  }

  function addTier() {
    const last = tiers[tiers.length - 1];
    const newMin = last ? (last.maxRepeats !== null ? last.maxRepeats + 1 : 0) : 0;
    setTiers(prev => [...prev, { minRepeats: newMin, maxRepeats: null, commissionPct: 0.15 }]);
  }

  function removeTier(idx: number) {
    setTiers(prev => prev.filter((_, i) => i !== idx));
  }

  const inputCls = "border border-black/[0.12] dark:border-white/[0.12] rounded-xl px-3 py-2 text-sm text-ink dark:text-[#e8e5e0] bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const labelCls = "text-[11px] font-semibold uppercase tracking-wide text-[#6b6b6b] dark:text-[#888]";

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#161616] rounded-t-2xl md:rounded-2xl shadow-modal w-full md:max-w-lg p-5 md:p-6 z-10 max-h-[92dvh] overflow-y-auto transition-colors">

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-ink dark:text-[#e8e5e0]">Configuração</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6b6b6b] hover:text-ink dark:hover:text-[#e8e5e0] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors text-lg">✕</button>
        </div>

        {/* Month selector */}
        <div className="flex flex-col gap-1.5 mb-5">
          <label className={labelCls}>Mês</label>
          <select value={selectedMonth} onChange={e => handleMonthChange(e.target.value)} className={inputCls + ' cursor-pointer capitalize'}>
            {monthOptions.map(mk => (
              <option key={mk} value={mk} className="capitalize">{monthLabel(mk)}</option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-black/[0.05] dark:bg-white/[0.06] rounded-xl p-1">
          {(['fees', 'commission'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-white dark:bg-[#222] text-ink dark:text-[#e8e5e0] shadow-card'
                  : 'text-[#6b6b6b] dark:text-[#888]'
              }`}
            >
              {t === 'fees' ? 'Fees plataformas' : 'Comissão privados'}
            </button>
          ))}
        </div>

        {tab === 'fees' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {(['civitatis', 'viator', 'take', 'bimbi'] as const).map(key => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className={labelCls}>{key === 'bimbi' ? 'Bimbi (crianças)' : key.charAt(0).toUpperCase() + key.slice(1)} €/pax</label>
                  <input
                    type="number" min={0} step={0.01}
                    value={fees[key]}
                    onChange={e => updateFee(key, e.target.value)}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={saveFees}
              className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Guardar fees — {monthLabel(selectedMonth)}
            </button>
          </div>
        )}

        {tab === 'commission' && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-[#6b6b6b] dark:text-[#888]">
              Comissão baseada nos repeats do <strong>mês anterior</strong>. Quanto mais repeats, menor a comissão.
            </p>
            <div className="flex flex-col gap-2">
              {tiers.map((tier, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-surface dark:bg-[#1a1a1a] rounded-xl p-3">
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className={labelCls}>De</span>
                    <input
                      type="number" min={0}
                      value={tier.minRepeats}
                      onChange={e => updateTier(idx, 'minRepeats', e.target.value)}
                      className={inputCls + ' w-full'}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className={labelCls}>Até</span>
                    <input
                      type="number" min={0}
                      placeholder="∞"
                      value={tier.maxRepeats ?? ''}
                      onChange={e => updateTier(idx, 'maxRepeats', e.target.value)}
                      className={inputCls + ' w-full'}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className={labelCls}>% comissão</span>
                    <input
                      type="number" min={0} max={100} step={0.5}
                      value={(tier.commissionPct * 100).toFixed(1)}
                      onChange={e => updateTier(idx, 'commissionPct', e.target.value)}
                      className={inputCls + ' w-full'}
                    />
                  </div>
                  {tiers.length > 1 && (
                    <button onClick={() => removeTier(idx)} className="mt-4 w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addTier} className="w-full py-2.5 rounded-xl border border-black/[0.12] dark:border-white/[0.12] text-sm font-medium text-[#6b6b6b] dark:text-[#888] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors">
              + Adicionar escalão
            </button>
            <button
              onClick={saveTiers}
              className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Guardar comissão — {monthLabel(selectedMonth)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
