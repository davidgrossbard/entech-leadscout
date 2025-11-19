
import React from 'react';
import { TargetRegion } from '../types';

interface RegionSelectorProps {
  selectedRegion: TargetRegion | null;
  onSelect: (region: TargetRegion) => void;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({ selectedRegion, onSelect }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">Target Region</label>
      <div className="grid grid-cols-1 gap-2">
        {Object.values(TargetRegion).map((region) => (
          <button
            key={region}
            onClick={() => onSelect(region)}
            className={`flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-all duration-200
              ${selectedRegion === region 
                ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm ring-1 ring-orange-500' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
          >
            <span className="font-medium">{region}</span>
            {selectedRegion === region && (
              <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
