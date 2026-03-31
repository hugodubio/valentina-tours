import { useState, useEffect, useCallback } from 'react';
import type { Tour, TourType } from '../../types/tour';
import type { MonthlyFees, MonthlyPrivateCommission } from '../../types/fees';
import { TOUR_TYPES } from '../../constants/tours';
import {
  calcTourFinance,
  getFeesForMonth,
  getCommissionForMonth,
  lookupCommissionPct,
  getPreviousMonthKey,
  formatEur,
} from '../../utils/finance';

interface Props {
  initialDate?: string;
  tour?: Tour;
  feesArray: MonthlyFees[];
  commissionArray: MonthlyPrivateCommission[];
  repeatsPerMonth: Record<string, number>;
  onSave: (tour: Tour) => void;
  onClose: () => void;
}

interface FormState {
  date: string;
  time: string;
  type: TourType;
  isPrivate: boolean;
  paxCivitatis: number | '';
  paxViator: number | '';
  paxTake: number | '';
  paxBimbi: number | '';
  repeats: number | '';
  revenueTotal: number | '';
  feeTotal: number | '';
  feeOverride: boolean;
  notes: string;
}

function numVal(v: number | ''): number {
  return v === '' ? 0 : Number(v);
}

function validateTime(value: string): string {
  if (value === '') return '';
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) return 'Formato inválido. Usa HH:MM (ex: 09:30)';
  return '';
}

export default function TourModal({
  initialDate,
  tour,
  feesArray,
  commissionArray,
  repeatsPerMonth,
  onSave,
  onClose,
}: Props) {
  const [timeError, setTimeError] = useState('');

  const [form, setForm] = useState<FormState>(() => {
    if (tour) {
      return {
        date: tour.date,
        time: tour.time,
        type: tour.type,
        isPrivate: tour.isPrivate,
        paxCivitatis: tour.paxCivitatis || '',
        paxViator: tour.paxViator || '',
        paxTake: tour.paxTake || '',
        paxBimbi: tour.paxBimbi || '',
        repeats: tour.repeats || '',
        revenueTotal: tour.revenueTotal || '',
        feeTotal: tour.feeTotal || '',
        feeOverride: tour.feeOverride,
        notes: tour.notes ?? '',
      };
    }
    return {
      date: initialDate ?? '',
      time: '',
      type: 'chiado',
      isPrivate: false,
      paxCivitatis: '',
      paxViator: '',
      paxTake: '',
      paxBimbi: '',
      repeats: '',
      revenueTotal: '',
      feeTotal: '',
      feeOverride: false,
      notes: '',
    };
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  // When isPrivate changes, reset pax fields
  function handlePrivateToggle(val: boolean) {
    setForm(prev => ({
      ...prev,
      isPrivate: val,
      paxCivitatis: val ? 0 : '',
      paxViator: val ? 0 : '',
      paxTake: val ? 0 : '',
      paxBimbi: val ? 0 : '',
      feeOverride: false,
      feeTotal: '',
    }));
  }

  // Finance preview
  const monthKey = form.date ? form.date.slice(0, 7) : '';
  const prevMonthKey = monthKey ? getPreviousMonthKey(monthKey) : '';
  const fees = monthKey ? getFeesForMonth(monthKey, feesArray) : getFeesForMonth('', feesArray);
  const tiers = monthKey ? getCommissionForMonth(monthKey, commissionArray) : [];
  const prevRepeats = prevMonthKey ? (repeatsPerMonth[prevMonthKey] ?? 0) : 0;
  const commissionPct = lookupCommissionPct(prevRepeats, tiers.length > 0 ? tiers : [{ minRepeats: 0, maxRepeats: null, commissionPct: 0.20 }]);

  const hasRevenue = form.revenueTotal !== '' && Number(form.revenueTotal) > 0;
  const today = new Date().toISOString().slice(0, 10);
  const isPastOrToday = form.date !== '' && form.date <= today;

  const previewTour: Tour = {
    id: '', date: form.date, time: form.time, type: form.type,
    isPrivate: form.isPrivate,
    paxCivitatis: numVal(form.paxCivitatis),
    paxViator: numVal(form.paxViator),
    paxTake: numVal(form.paxTake),
    paxBimbi: numVal(form.paxBimbi),
    repeats: numVal(form.repeats),
    revenueTotal: numVal(form.revenueTotal),
    feeTotal: form.feeOverride ? numVal(form.feeTotal) : 0,
    feeOverride: form.feeOverride,
    createdAt: '',
  };

  const finance = hasRevenue && isPastOrToday
    ? calcTourFinance(previewTour, fees, commissionPct)
    : null;

  const autoFee = finance ? finance.feeCalculated : 0;

  // When feeOverride is toggled off, clear feeTotal
  const handleFeeOverride = useCallback((val: boolean) => {
    setForm(prev => ({ ...prev, feeOverride: val, feeTotal: val ? prev.feeTotal : '' }));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateTime(form.time);
    if (err) { setTimeError(err); return; }

    const base: Omit<Tour, 'id' | 'createdAt'> = {
      date: form.date,
      time: form.time,
      type: form.type,
      isPrivate: form.isPrivate,
      paxCivitatis: numVal(form.paxCivitatis),
      paxViator: numVal(form.paxViator),
      paxTake: numVal(form.paxTake),
      paxBimbi: numVal(form.paxBimbi),
      repeats: numVal(form.repeats),
      revenueTotal: numVal(form.revenueTotal),
      feeTotal: form.feeOverride ? numVal(form.feeTotal) : autoFee,
      feeOverride: form.feeOverride,
      notes: form.notes,
    };

    const saved: Tour = tour
      ? { ...tour, ...base }
      : { ...base, id: crypto.randomUUID(), createdAt: new Date().toISOString() };

    onSave(saved);
    onClose();
  }

  const inputCls = "border border-black/[0.12] dark:border-white/[0.12] rounded-xl px-3 py-2.5 text-sm text-ink dark:text-[#e8e5e0] bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors min-h-[44px]";
  const labelCls = "text-[11px] font-semibold uppercase tracking-wide text-[#6b6b6b] dark:text-[#888]";
  const numInput = (field: keyof FormState, placeholder = '0') => (
    <input
      type="number"
      min={0}
      placeholder={placeholder}
      value={form[field] as number | ''}
      onChange={e => set(field, e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)) as FormState[typeof field])}
      className={inputCls}
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#161616] rounded-t-2xl md:rounded-2xl shadow-modal w-full md:max-w-lg p-5 md:p-6 z-10 max-h-[92dvh] overflow-y-auto transition-colors">

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-ink dark:text-[#e8e5e0]">{tour ? 'Editar tour' : 'Novo tour'}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6b6b6b] hover:text-ink dark:hover:text-[#e8e5e0] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Secção 1: Info básica */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Data *</label>
                <input type="date" required value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Hora</label>
                <input
                  type="text"
                  placeholder="09:30"
                  value={form.time}
                  onChange={e => { set('time', e.target.value); if (timeError) setTimeError(validateTime(e.target.value)); }}
                  onBlur={e => setTimeError(validateTime(e.target.value))}
                  className={`${inputCls} ${timeError ? 'border-red-400 focus:ring-red-300 focus:border-red-400' : ''}`}
                />
                {timeError && <span className="text-[11px] text-red-500 -mt-1">{timeError}</span>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Tipo de tour *</label>
              <select value={form.type} onChange={e => set('type', e.target.value as TourType)} className={inputCls + ' cursor-pointer'}>
                {Object.entries(TOUR_TYPES).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.emoji} {cfg.label}</option>
                ))}
              </select>
            </div>

            {/* Tour privado toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => handlePrivateToggle(!form.isPrivate)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.isPrivate ? 'bg-primary' : 'bg-black/[0.15] dark:bg-white/[0.15]'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isPrivate ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-ink dark:text-[#e8e5e0] font-medium">Tour privado</span>
              {form.isPrivate && (
                <span className="text-[11px] text-[#6b6b6b] dark:text-[#888]">sem fee de plataforma</span>
              )}
            </label>
          </div>

          {/* Secção 2: Pax (apenas se for data passada/hoje) */}
          {isPastOrToday ? (
            <div className="flex flex-col gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#6b6b6b] dark:text-[#888] border-t border-black/[0.06] dark:border-white/[0.06] pt-3">
                Participantes
              </div>

              {!form.isPrivate && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>
                      Civitatis
                      <span className="ml-1 text-[#6b6b6b]">({formatEur(fees.civitatis)}/p)</span>
                    </label>
                    {numInput('paxCivitatis')}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>
                      Viator
                      <span className="ml-1 text-[#6b6b6b]">({formatEur(fees.viator)}/p)</span>
                    </label>
                    {numInput('paxViator')}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>
                      Take
                      <span className="ml-1 text-[#6b6b6b]">({formatEur(fees.take)}/p)</span>
                    </label>
                    {numInput('paxTake')}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>
                      Bimbi
                      <span className="ml-1 text-[#6b6b6b]">({formatEur(fees.bimbi)}/p)</span>
                    </label>
                    {numInput('paxBimbi')}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Repeats <span className="text-[#6b6b6b] font-normal normal-case tracking-normal">(convertidos para tour privado)</span></label>
                {numInput('repeats')}
              </div>

              {form.isPrivate && prevMonthKey && (
                <div className="text-[11px] text-[#6b6b6b] dark:text-[#888] bg-black/[0.04] dark:bg-white/[0.04] rounded-xl px-3 py-2">
                  Comissão baseada em <strong>{prevRepeats} repeats</strong> em {prevMonthKey}: <strong>{(commissionPct * 100).toFixed(0)}%</strong> sobre a base
                </div>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-2.5">
              Tour futuro — pax e valores a preencher no dia do tour.
            </p>
          )}

          {/* Secção 3: Financeiro */}
          {isPastOrToday && (
            <div className="flex flex-col gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#6b6b6b] dark:text-[#888] border-t border-black/[0.06] dark:border-white/[0.06] pt-3">
                Financeiro
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Total recebido € <span className="text-[#6b6b6b] font-normal normal-case tracking-normal">(IVA 23% incluído)</span></label>
                <input
                  type="number" min={0} step={0.01} placeholder="0.00"
                  value={form.revenueTotal}
                  onChange={e => set('revenueTotal', e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className={inputCls}
                />
              </div>

              {/* Fee com override toggle */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className={labelCls}>
                    {form.isPrivate ? 'Comissão' : 'Taxa total'} €
                    {!form.feeOverride && finance && (
                      <span className="ml-1 text-[#6b6b6b] font-normal normal-case tracking-normal">(calculada auto)</span>
                    )}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleFeeOverride(!form.feeOverride)}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-colors ${
                      form.feeOverride
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        : 'bg-black/[0.05] dark:bg-white/[0.06] text-[#6b6b6b] dark:text-[#888]'
                    }`}
                  >
                    {form.feeOverride ? 'Manual' : 'Editar'}
                  </button>
                </div>
                <input
                  type="number" min={0} step={0.01}
                  placeholder={finance ? autoFee.toFixed(2) : '0.00'}
                  value={form.feeOverride ? form.feeTotal : (finance ? autoFee.toFixed(2) : '')}
                  onChange={e => form.feeOverride && set('feeTotal', e.target.value === '' ? '' : parseFloat(e.target.value))}
                  readOnly={!form.feeOverride}
                  className={`${inputCls} ${!form.feeOverride ? 'bg-surface dark:bg-[#111] text-[#6b6b6b] dark:text-[#888]' : 'border-amber-400 focus:ring-amber-300 focus:border-amber-400'}`}
                />
              </div>

              {/* Preview */}
              {finance && (
                <div className="bg-surface dark:bg-[#1a1a1a] border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-3 grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-wide text-[#6b6b6b] dark:text-[#888] mb-0.5">Bruto</div>
                    <div className="text-xs font-semibold text-ink dark:text-[#e8e5e0]">{formatEur(finance.grossRevenue)}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-wide text-[#6b6b6b] dark:text-[#888] mb-0.5">Base</div>
                    <div className="text-xs font-semibold text-ink dark:text-[#e8e5e0]">{formatEur(finance.base)}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-wide text-[#6b6b6b] dark:text-[#888] mb-0.5">IVA</div>
                    <div className="text-xs font-semibold text-red-400">{formatEur(finance.iva)}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-wide text-[#6b6b6b] dark:text-[#888] mb-0.5">Líquido</div>
                    <div className={`text-xs font-semibold ${finance.liquido >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatEur(finance.liquido)}</div>
                  </div>
                </div>
              )}
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
            <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-colors min-h-[44px]">
              {tour ? 'Guardar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
