import * as XLSX from 'xlsx';
import type { Tour } from '../types/tour';
import { TOUR_TYPES } from '../constants/tours';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { totalPax } from './finance';

export function exportToursExcel(tours: Tour[], filename = 'tours') {
  const sorted = [...tours].sort((a, b) => a.date.localeCompare(b.date));

  const rows = sorted.map(t => ({
    'Data': format(new Date(t.date), 'dd/MM/yyyy', { locale: pt }),
    'Hora': t.time || '—',
    'Tour': TOUR_TYPES[t.type].label,
    'Tipo': t.isPrivate ? 'Privado' : 'Plataforma',
    'Civitatis': t.paxCivitatis,
    'Viator': t.paxViator,
    'Take': t.paxTake,
    'Bimbi': t.paxBimbi,
    'Repeats': t.repeats,
    'Total Pax': totalPax(t),
    'Bruto (€)': +t.revenueTotal.toFixed(2),
    'Taxa (€)': +t.feeTotal.toFixed(2),
    'Líquido (€)': +(t.revenueTotal / 1.23 - t.feeTotal).toFixed(2),
    'Fee Manual': t.feeOverride ? 'Sim' : '',
    'Notas': t.notes ?? '',
  }));

  // Totals row
  const totalGross = sorted.reduce((s, t) => s + t.revenueTotal, 0);
  const totalFee = sorted.reduce((s, t) => s + t.feeTotal, 0);
  const totalLiquido = sorted.reduce((s, t) => s + (t.revenueTotal / 1.23 - t.feeTotal), 0);
  rows.push({
    'Data': 'TOTAL',
    'Hora': '',
    'Tour': `${sorted.length} tours`,
    'Tipo': '',
    'Civitatis': sorted.reduce((s, t) => s + t.paxCivitatis, 0),
    'Viator': sorted.reduce((s, t) => s + t.paxViator, 0),
    'Take': sorted.reduce((s, t) => s + t.paxTake, 0),
    'Bimbi': sorted.reduce((s, t) => s + t.paxBimbi, 0),
    'Repeats': sorted.reduce((s, t) => s + t.repeats, 0),
    'Total Pax': sorted.reduce((s, t) => s + totalPax(t), 0),
    'Bruto (€)': +totalGross.toFixed(2),
    'Taxa (€)': +totalFee.toFixed(2),
    'Líquido (€)': +totalLiquido.toFixed(2),
    'Fee Manual': '',
    'Notas': '',
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 12 }, { wch: 7 }, { wch: 18 }, { wch: 10 },
    { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
    { wch: 8 }, { wch: 10 }, { wch: 11 }, { wch: 10 },
    { wch: 11 }, { wch: 10 }, { wch: 30 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tours');
  XLSX.writeFile(wb, `${filename}_${format(new Date(), 'yyyy-MM')}.xlsx`);
}
