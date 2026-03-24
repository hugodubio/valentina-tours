import { useState, useEffect } from 'react';
import type { Tour, TourType } from '../../types/tour';
import { TOUR_TYPES } from '../../constants/tours';
import { calcTourFinance, formatEur } from '../../utils/finance';

interface Props {
  initialDate?: string;
  tour?: Tour;
  onSave: (tour: Tour) => void;
  onClose: () => void;
}

interface FormState {
  date: string;
  time: string;
  type: TourType;
  participants: number | '';
  revenueTotal: number | '';
  notes: string;
}

export default function TourModal({ initialDate, tour, onSave, onClose }: Props) {
  const [form, setForm] = useState<FormState>(() =>
    tour
      ? {
          date: tour.date,
          time: tour.time,
          type: tour.type,
          participants: tour.participants || '',
          revenueTotal: tour.revenueTotal || '',
          notes: tour.notes ?? '',
        }
      : {
          date: initialDate ?? '',
          time: '',
          type: 'chiado',
          participants: '',
          revenueTotal: '',
          notes: '',
        }
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const hasFinance = form.participants !== '' && form.revenueTotal !== '';
  const finance = hasFinance
    ? calcTourFinance({ participants: Number(form.participants), revenueTotal: Number(form.revenueTotal), id: '', date: '', time: '', type: form.type, createdAt: '' })
    : null;

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const saved: Tour = tour
      ? {
          ...tour,
          date: form.date,
          time: form.time,
          type: form.type,
          participants: form.participants === '' ? 0 : Number(form.participants),
          revenueTotal: form.revenueTotal === '' ? 0 : Number(form.revenueTotal),
          notes: form.notes,
        }
      : {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          date: form.date,
          time: form.time,
          type: form.type,
          participants: form.participants === '' ? 0 : Number(form.participants),
          revenueTotal: form.revenueTotal === '' ? 0 : Number(form.revenueTotal),
          notes: form.notes,
        };
    onSave(saved);
    onClose();
  }

  const inputCls = "border border-black/[0.12] dark:border-white/[0.12] rounded-xl px-3 py-2.5 text-sm text-ink dark:text-[#e8e5e0] bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors min-h-[44px]";
  const labelCls = "text-[11px] font-semibold uppercase tracking-wide text-[#6b6b6b] dark:text-[#888]";

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#161616] rounded-t-2xl md:rounded-2xl shadow-modal w-full md:max-w-md p-5 md:p-6 z-10 max-h-[92dvh] overflow-y-auto transition-colors">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-ink dark:text-[#e8e5e0]">{tour ? 'Editar tour' : 'Novo tour'}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6b6b6b] hover:text-ink dark:hover:text-[#e8e5e0] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors text-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Data *</label>
              <input type="date" required value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Hora</label>
              <input type="text" placeholder="09:30" value={form.time} onChange={e => set('time', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Tipo de tour *</label>
            <select value={form.type} onChange={e => set('type', e.target.value as TourType)} className={inputCls + ' cursor-pointer'}>
              {Object.entries(TOUR_TYPES).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Participantes</label>
              <input
                type="number" min={1} placeholder="—"
                value={form.participants}
                onChange={e => set('participants', e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value)))}
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Total recebido €</label>
              <input
                type="number" min={0} step={0.01} placeholder="—"
                value={form.revenueTotal}
                onChange={e => set('revenueTotal', e.target.value === '' ? '' : parseFloat(e.target.value))}
                className={inputCls}
              />
            </div>
          </div>

          {/* Hint for donation-based */}
          {!hasFinance && (
            <p className="text-[11px] text-[#6b6b6b] dark:text-[#666] -mt-1">
              Os valores financeiros podem ser preenchidos depois do tour.
            </p>
          )}

          {/* Live preview */}
          {finance && (
            <div className="bg-surface dark:bg-[#1a1a1a] border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-[#6b6b6b] dark:text-[#888] mb-0.5">Bruto</div>
                <div className="text-sm font-semibold text-ink dark:text-[#e8e5e0]">{formatEur(finance.grossRevenue)}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-[#6b6b6b] dark:text-[#888] mb-0.5">Taxa</div>
                <div className="text-sm font-semibold text-red-500">{formatEur(finance.aggregatorFee)}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-[#6b6b6b] dark:text-[#888] mb-0.5">Líquido</div>
                <div className="text-sm font-semibold text-green-500">{formatEur(finance.netRevenue)}</div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Notas</label>
            <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notas opcionais..." className={inputCls + ' resize-none'} />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-black/[0.12] dark:border-white/[0.12] text-sm font-medium text-[#6b6b6b] dark:text-[#888] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors min-h-[44px]">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-[#0025a0] transition-colors min-h-[44px]">
              {tour ? 'Guardar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
