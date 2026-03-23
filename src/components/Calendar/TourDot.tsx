import type { Tour } from '../../types/tour';
import { TOUR_TYPES } from '../../constants/tours';

interface Props {
  tour: Tour;
  onClick: (tour: Tour) => void;
}

export default function TourDot({ tour, onClick }: Props) {
  const cfg = TOUR_TYPES[tour.type];
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(tour); }}
      title={`${cfg.label} — ${tour.time}`}
      className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0 hover:scale-125 transition-transform cursor-pointer"
      style={{ backgroundColor: cfg.color }}
    />
  );
}
