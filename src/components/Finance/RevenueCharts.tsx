import { subMonths, format } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Tour, TourType } from '../../types/tour';
import { TOUR_TYPES } from '../../constants/tours';
import { AGGREGATOR_FEE_PER_PERSON } from '../../constants/finance';
import { formatEur } from '../../utils/finance';

interface Props { tours: Tour[]; }

const CHART_W = 600;
const CHART_H = 120;
const LABEL_H = 32;
const SVG_H = CHART_H + LABEL_H;

export default function RevenueCharts({ tours }: Props) {
  const today = new Date();

  // Build last 12 months
  const monthKeys = Array.from({ length: 12 }, (_, i) =>
    format(subMonths(today, 11 - i), 'yyyy-MM')
  );
  const monthLabels = monthKeys.map(k => {
    const [y, m] = k.split('-').map(Number);
    return format(new Date(y, m - 1, 1), 'MMM', { locale: pt });
  });

  const completed = tours.filter(t => t.participants > 0 && t.revenueTotal > 0);

  // Net revenue per month
  const monthNetMap: Record<string, number> = {};
  for (const t of completed) {
    const mk = t.date.slice(0, 7);
    const net = t.revenueTotal - t.participants * AGGREGATOR_FEE_PER_PERSON;
    monthNetMap[mk] = (monthNetMap[mk] ?? 0) + net;
  }
  const barValues = monthKeys.map(k => Math.max(0, monthNetMap[k] ?? 0));
  const maxBarValue = Math.max(...barValues, 1);
  const hasMonthData = barValues.some(v => v > 0);

  // Net revenue per type
  const typeKeys = Object.keys(TOUR_TYPES) as TourType[];
  const typeData = typeKeys.map(type => {
    const net = completed
      .filter(t => t.type === type)
      .reduce((s, t) => s + t.revenueTotal - t.participants * AGGREGATOR_FEE_PER_PERSON, 0);
    return { type, net: Math.max(0, net), label: TOUR_TYPES[type].label, color: TOUR_TYPES[type].color };
  });
  const maxTypeNet = Math.max(...typeData.map(x => x.net), 1);
  const hasTypeData = typeData.some(x => x.net > 0);

  if (!hasMonthData && !hasTypeData) return null;

  const slotW = CHART_W / 12;
  const barW = slotW * 0.55;

  return (
    <div className="mb-6 md:mb-8 flex flex-col gap-4">
      {/* Monthly bar chart */}
      {hasMonthData && (
        <div className="bg-white dark:bg-[#111] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-4 md:p-5 shadow-card">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b] dark:text-[#888] mb-4">
            Receita líquida — últimos 12 meses
          </div>
          <svg
            viewBox={`0 0 ${CHART_W} ${SVG_H}`}
            width="100%"
            height="auto"
            aria-hidden="true"
            style={{ display: 'block' }}
          >
            {barValues.map((v, i) => {
              const barH = (v / maxBarValue) * CHART_H;
              const x = i * slotW + (slotW - barW) / 2;
              const y = CHART_H - barH;
              const labelX = i * slotW + slotW / 2;
              return (
                <g key={monthKeys[i]}>
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={barH}
                    rx={4}
                    fill="#002FA7"
                    fillOpacity={0.75}
                  >
                    <title>{monthLabels[i]}: {formatEur(v)}</title>
                  </rect>
                  {barH > 22 && (
                    <text
                      x={labelX}
                      y={y - 4}
                      textAnchor="middle"
                      fontSize={9}
                      className="fill-[#6b6b6b] dark:fill-[#888]"
                      fill="#6b6b6b"
                    >
                      {formatEur(v)}
                    </text>
                  )}
                  <text
                    x={labelX}
                    y={CHART_H + 18}
                    textAnchor="middle"
                    fontSize={10}
                    className="fill-[#6b6b6b] dark:fill-[#888]"
                    fill="#6b6b6b"
                  >
                    {monthLabels[i]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Tour type horizontal bars */}
      {hasTypeData && (
        <div className="bg-white dark:bg-[#111] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-4 md:p-5 shadow-card">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b] dark:text-[#888] mb-4">
            Receita líquida por tipo de tour
          </div>
          <div className="flex flex-col gap-3">
            {typeData.map(({ type, net, label, color }) => (
              <div key={type} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs text-[#6b6b6b] dark:text-[#888] text-right">{label}</span>
                <div className="flex-1 h-5 bg-black/[0.05] dark:bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: net > 0 ? `${(net / maxTypeNet) * 100}%` : '0%',
                      backgroundColor: color,
                      opacity: 0.8,
                    }}
                  />
                </div>
                <span className="w-20 shrink-0 text-xs font-semibold text-green-500 text-right">
                  {net > 0 ? formatEur(net) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
