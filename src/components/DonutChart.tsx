import React from 'react';

interface DonutItem {
  name: string;
  count: number;
  percentage: number;
}

interface DonutChartProps {
  data: DonutItem[];
  selectedDisciplina?: string;
  onSelectDisciplina?: (name: string) => void;
}

const COLOR_PALETTE = [
  '#1A1A1A', // Onyx
  '#8C7A6B', // Taupe
  '#D4A373', // Warm Gold/Amber
  '#6B705C', // Sage Green
  '#4A453B', // Charcoal
];

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  selectedDisciplina,
  onSelectDisciplina,
}) => {
  const total = data.reduce((acc, item) => acc + item.count, 0);

  if (total === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-[#8C7A6B]">
        Sin datos disponibles
      </div>
    );
  }

  // Calculate SVG arc paths
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  const slices = data.map((item, index) => {
    const strokeDasharray = `${(item.count / total) * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle;
    accumulatedAngle += (item.count / total) * circumference;
    const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
    const isSelected = selectedDisciplina === item.name;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      color,
      isSelected,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
      {/* SVG Donut */}
      <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-[#F5F1E8]"
            strokeWidth="14"
            fill="transparent"
          />
          {slices.map((slice) => (
            <circle
              key={slice.name}
              cx="50"
              cy="50"
              r={radius}
              stroke={slice.color}
              strokeWidth={slice.isSelected ? "17" : "14"}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              fill="transparent"
              className="transition-all duration-300 cursor-pointer hover:opacity-85"
              onClick={() => onSelectDisciplina && onSelectDisciplina(slice.isSelected ? '' : slice.name)}
            />
          ))}
        </svg>

        {/* Donut Center Counter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="font-serif-luxury text-xl font-bold text-[#1A1A1A] leading-none">
            {total}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[#7A6E5D] font-semibold mt-0.5">
            Reservas
          </span>
        </div>
      </div>

      {/* Legend List */}
      <div className="flex-1 space-y-2 w-full">
        {slices.map((slice) => (
          <div
            key={slice.name}
            onClick={() => onSelectDisciplina && onSelectDisciplina(slice.isSelected ? '' : slice.name)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectDisciplina && onSelectDisciplina(slice.isSelected ? '' : slice.name);
              }
            }}
            className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              slice.isSelected
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                : 'bg-[#FDFBF7] hover:bg-[#F5F1E8] border-[#E8E4DD] text-[#1A1A1A]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="truncate">{slice.name}</span>
            </div>
            <div className="flex items-center gap-2 font-mono-numbers">
              <span className={slice.isSelected ? 'text-white' : 'text-[#1A1A1A]'}>
                {slice.count}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                slice.isSelected ? 'bg-white/20 text-white' : 'bg-[#F5F1E8] text-[#7A6E5D]'
              }`}>
                {slice.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
