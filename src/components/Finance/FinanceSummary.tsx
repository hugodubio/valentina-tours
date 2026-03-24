import type { Tour } from '../../types/tour';
import { calcTotals, formatEur } from '../../utils/finance';
import { toISODate } from '../../utils/dateHelpers';
import { startOfWeek, endOfWeek } from 'date-fns';

interface Props {
  tours: Tour[];
}

function SummaryCard({ label, data }: { label: string; data: ReturnType<typeof calcTotals> }) {
  return (
    <div className="bg-white dark:bg-[#111] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-4 md:p-5 shadow-card">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b] dark:text-[#888] mb-3">{label}</div>
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        <div>
          <div className="text-[10px] text-[#6b6b6b] dark:text-[#888] mb-0.5">Tours</div>
          <div className="text-xl md:text-2xl font-semibold text-ink dark:text-[#e8e5e0]">{data.tours}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#6b6b6b] dark:text-[#888] mb-0.5">Participantes</div>
          <div className="text-xl md:text-2xl font-semibold text-ink dark:text-[#e8e5e0]">{data.participants}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#6b6b6b] dark:text-[#888] mb-0.5">Bruto</div>
          <div className="text-sm font-medium text-ink dark:text-[#e8e5e0]">{formatEur(data.grossRevenue)}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#6b6b6b] dark:text-[#888] mb-0.5">Taxa</div>
          <div className="text-sm font-medium text-red-500">{formatEur(data.aggregatorFee)}</div>
        </div>
        <div className="col-span-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
          <div className="text-[10px] text-[#6b6b6b] dark:text-[#888] mb-0.5">Líquido</div>
          <div className="text-2xl md:text-3xl font-semibold text-green-500">{formatEur(data.netRevenue)}</div>
        </div>
      </div>
    </div>
  );
}

export default function FinanceSummary({ tours }: Props) {
  const today = new Date();
  const todayStr = toISODate(today);
  const monthStr = todayStr.slice(0, 7);
  const weekStart = toISODate(startOfWeek(today, { weekStartsOn: 1 }));
  const weekEnd = toISODate(endOfWeek(today, { weekStartsOn: 1 }));

  // Only include tours with financial data
  const withData = tours.filter(t => t.participants > 0 && t.revenueTotal > 0);

  const thisMonth = withData.filter(t => t.date.startsWith(monthStr));
  const thisWeek = withData.filter(t => t.date >= weekStart && t.date <= weekEnd);
  const thisDay = withData.filter(t => t.date === todayStr);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
      <SummaryCard label="Este mês" data={calcTotals(thisMonth)} />
      <SummaryCard label="Esta semana" data={calcTotals(thisWeek)} />
      <SummaryCard label="Hoje" data={calcTotals(thisDay)} />
    </div>
  );
}
