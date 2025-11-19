
import React, { useState, useEffect } from 'react';

const BINGO_SQUARES = [
  "Gatekeeper Block", "Left Voicemail", "Wrong Person",
  "Send Email Info", "Not Interested", "Meeting Booked!",
  "Out of Office", "Call Back Later", "Hang Up"
];

const WIN_PATTERNS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export const ColdCallBingo: React.FC = () => {
  const [checked, setChecked] = useState<boolean[]>(new Array(9).fill(false));
  const [won, setWon] = useState(false);

  const toggleSquare = (index: number) => {
    const newChecked = [...checked];
    newChecked[index] = !newChecked[index];
    setChecked(newChecked);
  };

  useEffect(() => {
    const isWin = WIN_PATTERNS.some(pattern =>
      pattern.every(index => checked[index])
    );
    if (isWin && !won) {
        setWon(true);
    }
    if (!isWin) setWon(false);
  }, [checked, won]);

  return (
    <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-4 mt-6 relative overflow-hidden">
      {won && (
         <div className="absolute inset-0 bg-orange-500/10 z-0 pointer-events-none animate-pulse"></div>
      )}
      
      <div className="relative z-10">
        <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center justify-between uppercase tracking-wider">
            <span>📞 Cold Call Bingo</span>
            {won && <span className="text-orange-600 font-black animate-bounce">BINGO!</span>}
        </h3>
        
        <div className="grid grid-cols-3 gap-2">
            {BINGO_SQUARES.map((label, i) => (
            <button
                key={i}
                onClick={() => toggleSquare(i)}
                className={`h-14 text-[9px] font-bold rounded p-1 leading-tight transition-all duration-200 select-none flex items-center justify-center text-center
                ${checked[i]
                    ? 'bg-orange-500 text-white shadow-inner transform scale-95 rotate-1 border-orange-600'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200 hover:border-orange-200'
                }`}
            >
                {checked[i] && <span className="absolute opacity-20 text-3xl">❌</span>}
                <span className="relative z-10">{label}</span>
            </button>
            ))}
        </div>

        {won ? (
            <div className="mt-3 text-center animate-fade-in">
                <p className="text-xs text-orange-600 font-bold">🏆 Commission Unlocked! 🏆</p>
                <button 
                    onClick={() => setChecked(new Array(9).fill(false))} 
                    className="text-[10px] underline text-slate-400 mt-1 hover:text-orange-500"
                >
                    Play Again
                </button>
            </div>
        ) : (
            <p className="text-[10px] text-slate-300 text-center mt-2 italic">
                Mark squares as you dial...
            </p>
        )}
      </div>
    </div>
  );
};
