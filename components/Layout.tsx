
import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  isBasementMode: boolean;
  onToggleBasement: () => void;
}

const BOILER_WISDOM = [
  "Did you know? The first steam engine was described by Hero of Alexandria in the 1st century AD.",
  "Fact: One PSI of steam pressure can lift a column of water about 2.3 feet vertically.",
  "Trivia: The 'clanking' sound in old radiators is technically called 'water hammer'.",
  "Energy Fact: A British Thermal Unit (BTU) is specifically the heat required to raise 1lb of water by 1°F.",
  "History: Cast iron radiators were invented in the 1850s by Franz San Galli in St. Petersburg.",
  "Tip: A 1/16th inch coating of soot on a boiler's heat transfer surfaces can reduce efficiency by 5%.",
  "Engineering: Steam expands to 1,600 times the volume of water when it boils.",
  "Safety: The Hartford Loop was invented by the Hartford Steam Boiler Inspection and Insurance Company to prevent dry firing.",
  "Maintenance: 'Priming' creates foam in the boiler water, which can cause water to carry over into the steam lines.",
  "History: The first central heating system was installed in the Bank of England in the 1790s."
];

export const Layout: React.FC<LayoutProps> = ({ children, isBasementMode, onToggleBasement }) => {
  const [wisdomIndex, setWisdomIndex] = useState(0);

  const nextWisdom = () => {
      setWisdomIndex((prev) => (prev + 1) % BOILER_WISDOM.length);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-600 p-2 rounded-lg shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">Entech LeadScout</h1>
                <p className="text-xs text-slate-500">Multifamily Sales Intelligence</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <button
               onClick={onToggleBasement}
               className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                 isBasementMode 
                 ? 'bg-slate-800 text-yellow-400 border-slate-700 shadow-[0_0_10px_rgba(250,204,21,0.5)]' 
                 : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
               }`}
             >
                <span className="mr-2">{isBasementMode ? '🔦' : '💡'}</span>
                {isBasementMode ? 'Basement Mode ON' : 'Basement Mode'}
             </button>

             <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Live Search Active
             </span>
          </div>
        </div>
      </header>
      <main className="flex-grow bg-slate-50">
        {children}
      </main>
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm mb-4 font-semibold text-slate-500">&copy; {new Date().getFullYear()} Entech Smart Building Solutions.</p>
          
          <div className="relative inline-block max-w-3xl mx-auto">
            <div className="bg-slate-800 rounded-lg pl-6 pr-12 py-3 border border-slate-700 relative min-h-[48px] flex items-center justify-center">
                <p className="text-xs italic text-orange-100/80 font-mono">
                <span className="font-bold text-orange-500 not-italic mr-2">BOILER WISDOM:</span>
                {BOILER_WISDOM[wisdomIndex]}
                </p>
                
                <button 
                    onClick={nextWisdom}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-orange-400 p-1 rounded transition-colors"
                    title="Next Fact"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};
