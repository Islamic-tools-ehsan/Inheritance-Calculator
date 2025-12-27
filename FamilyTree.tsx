
import React from 'react';
import { HeirKey, CalculationResult, DeceasedGender } from './types';

interface FamilyTreeProps {
  results: CalculationResult[];
  deceasedGender: DeceasedGender;
  currency: string;
}

export const FamilyTree: React.FC<FamilyTreeProps> = ({ results, deceasedGender }) => {
  const nodeWidth = 175;
  const nodeHeight = 105;

  const positions: Record<string, { x: number; y: number }> = {
    grandfather: { x: 150, y: 80 },
    paternalGrandmother: { x: 350, y: 80 },
    maternalGrandmother: { x: 750, y: 80 },
    
    father: { x: 250, y: 220 },
    mother: { x: 650, y: 220 },

    deceased: { x: 450, y: 400 },
    husband: { x: 750, y: 400 },
    wife: { x: 750, y: 400 },

    fullBrother: { x: 100, y: 300 },
    fullSister: { x: 100, y: 500 },
    paternalBrother: { x: 250, y: 360 },
    paternalSister: { x: 250, y: 460 },
    maternalBrother: { x: 650, y: 360 },
    maternalSister: { x: 650, y: 460 },

    son: { x: 300, y: 620 },
    daughter: { x: 600, y: 620 },

    grandson: { x: 300, y: 780 },
    granddaughter: { x: 600, y: 780 },

    nephewFull: { x: 880, y: 580 },
    nephewPaternal: { x: 880, y: 680 },
    uncleFull: { x: 920, y: 150 },
    unclePaternal: { x: 920, y: 250 },
    cousinFull: { x: 920, y: 800 },
    cousinPaternal: { x: 920, y: 900 },
    
    governmentTreasury: { x: 525, y: 880 }
  };

  const activeResults = results.filter(r => r.count > 0 || r.isBlocked || r.heirId === 'governmentTreasury');
  
  const sortedHeirs = [...activeResults].sort((a, b) => {
    if (a.isBlocked && !b.isBlocked) return -1;
    if (!a.isBlocked && b.isBlocked) return 1;
    return 0;
  });

  const renderNode = (heir: CalculationResult | { id: 'deceased', label: string }) => {
    const isDeceased = 'id' in heir;
    const id = isDeceased ? 'deceased' : (heir as CalculationResult).heirId;
    const pos = positions[id];
    if (!pos) return null;

    const x = pos.x - nodeWidth / 2;
    const y = pos.y - nodeHeight / 2;

    const isBlocked = !isDeceased && (heir as CalculationResult).isBlocked;
    const count = !isDeceased ? (heir as CalculationResult).count : 1;
    const label = isDeceased ? (heir as any).label : (heir as CalculationResult).heirName;
    const totalShare = !isDeceased && !isBlocked ? `${(heir as CalculationResult).sharePercentage.toFixed(1)}%` : null;
    const perShare = !isDeceased && !isBlocked && count > 1 ? `${(heir as CalculationResult).sharePercentagePerHeir.toFixed(1)}% each` : null;

    let bgColor = isDeceased ? '#1e293b' : isBlocked ? '#fef2f2' : '#f0fdf4';
    let borderColor = isDeceased ? '#0f172a' : isBlocked ? '#ef4444' : '#22c55e';
    let textColor = isDeceased ? '#ffffff' : isBlocked ? '#991b1b' : '#166534';

    if (id === 'governmentTreasury') {
      bgColor = '#fff7ed';
      borderColor = '#ea580c';
      textColor = '#9a3412';
    }

    return (
      <g key={id} className="transition-all duration-300 pointer-events-none">
        <rect
          x={x}
          y={y}
          width={nodeWidth}
          height={nodeHeight}
          rx="32"
          fill={bgColor}
          stroke={borderColor}
          strokeWidth="4"
          className="drop-shadow-lg"
        />
        <text
          x={pos.x}
          y={pos.y - (totalShare ? 20 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={textColor}
          className="text-[10px] font-black uppercase tracking-wider"
        >
          {label.split('(')[0].trim()}
        </text>
        <text
          x={pos.x}
          y={pos.y - (totalShare ? 5 : -14)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={textColor}
          className="text-[12px] font-arabic font-bold opacity-70"
        >
          {label.includes('(') ? label.substring(label.indexOf('(')) : ''}
        </text>
        {!isDeceased && count > 1 && (
           <text
            x={pos.x}
            y={pos.y + 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={textColor}
            className="text-[9px] font-black uppercase opacity-60 tracking-widest"
          >
            Count: {count}
          </text>
        )}
        {totalShare && (
          <text
            x={pos.x}
            y={pos.y + 26}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={textColor}
            className="text-[16px] font-black"
          >
            {totalShare}
          </text>
        )}
        {perShare && (
           <text
            x={pos.x}
            y={pos.y + 40}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#059669"
            className="text-[9px] font-black uppercase tracking-tight"
          >
            ({perShare})
          </text>
        )}
        {isBlocked && (
          <text
            x={pos.x}
            y={pos.y + 30}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#ef4444"
            className="text-[10px] font-black uppercase tracking-widest"
          >
            Blocked
          </text>
        )}
      </g>
    );
  };

  const renderConnection = (fromId: string, toId: string) => {
    const from = positions[fromId];
    const to = positions[toId];
    if (!from || !to) return null;

    return (
      <path
        key={`${fromId}-${toId}`}
        d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
        stroke="#e2e8f0"
        strokeWidth="2"
        fill="none"
        strokeDasharray="8 6"
        className="opacity-40"
      />
    );
  };

  return (
    <div className="w-full overflow-x-auto bg-white rounded-[2.5rem] border border-slate-100 p-12 shadow-inner">
      <svg viewBox="0 0 1050 950" className="min-w-[1000px] h-auto">
        {sortedHeirs.map(r => renderConnection('deceased', r.heirId))}
        
        {sortedHeirs.filter(r => r.isBlocked).map(r => renderNode(r))}

        {renderNode({ id: 'deceased', label: `Deceased (${deceasedGender})` })}

        {sortedHeirs.filter(r => !r.isBlocked).map(r => renderNode(r))}
      </svg>
    </div>
  );
};
