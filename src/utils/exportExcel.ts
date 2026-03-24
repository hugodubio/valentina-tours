import * as XLSX from 'xlsx';
import type { Tour } from '../types/tour';
import { TOUR_TYPES } from '../constants/tours';
import { AGGREGATOR_FEE_PER_PERSON } from '../constants/finance';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export function exportToursExcel(tours: Tour[], filename = 'tours') {
  const sorted = [...tours].sort((a, b) => a.date.localeCompare(b.date));

  const rows = sorted.map(t => {
    const fee = t.participants * AGGREGATOR_FEE_PER_PERSON;
    const net = t.revenueTotal - fee;
    return {
      'Data': format(new Date(t.date), 'dd/MM/yyyy', { locale: pt }),
      'Hora': t.time || '—',
      'Tour': TOUR_TYPES[t.type].label,
      'Pessoas': t.participants,
      'Bruto (€)': +t.revenueTotal.toFixed(2),
      'Comissão (€)': +fee.toFixed(2),
      'Líquido (€)': +net.toFixed(2),
      'Notas': t.notes ?? '',
    };
  });

  // Totals row
  const totalFee = sorted.reduce((s, t) => s + t.participants * AGGREGATOR_FEE_PER_PERSON, 0);
  const totalGross = sorted.reduce((s, t) => s + t.revenueTotal, 0);
  rows.push({
    'Data': 'TOTAL',
    'Hora': '',
    'Tour': `${sorted.length} tours`,
    'Pessoas': sorted.reduce((s, t) => s + t.participants, 0),
    'Bruto (€)': +totalGross.toFixed(2),
    'Comissão (€)': +totalFee.toFixed(2),
    'Líquido (€)': +(totalGross - totalFee).toFixed(2),
    'Notas': '',
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 12 }, { wch: 7 }, { wch: 18 }, { wch: 8 },
    { wch: 11 }, { wch: 13 }, { wch: 11 }, { wch: 30 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tours');
  XLSX.writeFile(wb, `${filename}_${format(new Date(), 'yyyy-MM')}.xlsx`);
}
