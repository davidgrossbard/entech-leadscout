
import React, { useEffect, useState } from 'react';

export const LoadingView: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [tempState, setTempState] = useState({ label: "System Cold", color: "text-blue-500" });
  const [timeLeft, setTimeLeft] = useState(25); // Increased start time to match slower increment
  const [isOvertime, setIsOvertime] = useState(false);

  useEffect(() => {
    // Simulation loop
    // Slowed down increment to 0.4 to match realistic ~25s search time
    const increment = 0.4; 
    const intervalTime = 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment; 
        
        // Calculate remaining time based on remaining percentage
        // Total steps approx 250 (100 / 0.4) * 100ms = 25s
        const remainingPercent = 100 - next;
        const stepsLeft = remainingPercent / increment;
        const secondsLeft = Math.ceil((stepsLeft * intervalTime) / 1000);
        
        if (next >= 99) {
            setIsOvertime(true);
            return 99; // Hold at 99%
        }

        setTimeLeft(secondsLeft > 0 ? secondsLeft : 0);
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 20) setTempState({ label: "System Cold", color: "text-cyan-600" });
    else if (progress < 40) setTempState({ label: "Building Pressure", color: "text-blue-500" });
    else if (progress < 60) setTempState({ label: "Simmering", color: "text-yellow-600" });
    else if (progress < 80) setTempState({ label: "Boiling Point", color: "text-orange-500" });
    else setTempState({ label: "SUPERHEATED", color: "text-red-600 animate-pulse" });
  }, [progress]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
      
      {/* Thermometer Icon */}
      <div className="relative mb-8">
         <div className={`text-6xl transition-colors duration-500 ${tempState.color}`}>
            {progress > 80 ? '🔥' : '🌡️'}
         </div>
      </div>
      
      <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">SCOUTING IN PROGRESS</h3>
      <p className="text-slate-500 font-medium mb-2">Identifying high-value retrofit targets...</p>
      
      {/* Time Estimation / Overtime Message */}
      <p className={`text-sm font-mono px-3 py-1 rounded-full inline-block mb-8 transition-colors duration-300 ${isOvertime ? 'bg-red-100 text-red-700 animate-pulse font-bold' : 'bg-orange-50 text-orange-600'}`}>
        {isOvertime ? "Just another sec..." : `Est. Time Remaining: ~${timeLeft}s`}
      </p>

      {/* The Gauge UI */}
      <div className="w-full max-w-lg relative">
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-2 px-1">
            <span>Cold</span>
            <span>Operating Temp</span>
            <span>Limit</span>
        </div>
        
        <div className="h-6 w-full bg-slate-100 rounded-full border border-slate-200 overflow-hidden relative shadow-inner">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 via-yellow-400 to-red-500 opacity-30"></div>
            
            {/* Active Fill */}
            <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-yellow-500 to-red-600 transition-all duration-200 ease-linear relative"
                style={{ width: `${progress}%` }}
            >
                {/* Bubbles effect when hot */}
                {(progress > 60 || isOvertime) && (
                    <div className="absolute inset-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMyIvPgo8L3N2Zz4=')] opacity-50 animate-pulse"></div>
                )}
                
                {/* Overtime Stripes */}
                {isOvertime && (
                    <div className="absolute inset-0 w-full h-full animate-stripes"></div>
                )}

                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 shadow-[0_0_10px_rgba(0,0,0,0.2)]"></div>
            </div>
        </div>

        <div className="mt-4 flex items-center justify-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Current State:</span>
            <span className={`text-sm font-black uppercase tracking-widest ${tempState.color}`}>
                {tempState.label}
            </span>
        </div>
      </div>

      <p className="text-xs text-slate-300 mt-8 font-mono">PSI: {Math.round(progress * 1.5)} | TEMP: {Math.round(60 + (progress * 1.5))}°F</p>
    </div>
  );
};
