
import React, { useState, useCallback, useEffect } from 'react';
import { Layout } from './components/Layout';
import { RegionSelector } from './components/RegionSelector';
import { ResultsDashboard } from './components/ResultsDashboard';
import { LoadingView } from './components/LoadingView';
import { ColdCallBingo } from './components/ColdCallBingo';
import { TargetRegion, ParsedLead } from './types';
import { searchLeads } from './services/geminiService';

const App: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<TargetRegion | null>(null);
  const [customInstructions, setCustomInstructions] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<ParsedLead[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Basement Mode State
  const [isBasementMode, setIsBasementMode] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isBasementMode) {
        setMousePos({ x: e.clientX, y: e.clientY });
      }
    };
    
    if (isBasementMode) {
        window.addEventListener('mousemove', handleMouseMove);
    } else {
        window.removeEventListener('mousemove', handleMouseMove);
    }

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isBasementMode]);

  const handleRegionSelect = useCallback((region: TargetRegion) => {
    setSelectedRegion(region);
    setLeads([]);
    setError(null);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!selectedRegion) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const existingNames = leads.map(l => l.companyName);
      const result = await searchLeads(selectedRegion, customInstructions, existingNames);
      
      if (result.leads.length === 0) {
          setError("No new leads found matching your criteria. Try adjusting your custom instructions.");
      } else {
          setLeads(prev => [...prev, ...result.leads]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch leads. Please verify your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedRegion, customInstructions, leads]);

  return (
    <Layout isBasementMode={isBasementMode} onToggleBasement={() => setIsBasementMode(!isBasementMode)}>
      
      {/* Flashlight Overlay */}
      {isBasementMode && (
        <div 
            className="fixed inset-0 z-[100] pointer-events-none transition-opacity duration-500"
            style={{
                background: `radial-gradient(circle 250px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, rgba(15, 23, 42, 0.98) 100%)`
            }}
        ></div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar / Control Panel */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Scout Parameters</h2>
              
              <div className="mb-6">
                <button
                  onClick={handleSearch}
                  disabled={!selectedRegion || isLoading}
                  className={`w-full py-3 px-4 rounded-sm flex items-center justify-center space-x-2 font-bold uppercase tracking-wide transition-all transform active:scale-95
                    ${!selectedRegion || isLoading 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                      : 'bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg border border-orange-600'
                    }`}
                >
                  {isLoading ? (
                    <>
                      <span className="text-sm">Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>{leads.length > 0 ? 'Find More' : 'Start Scout'}</span>
                    </>
                  )}
                </button>
                {leads.length > 0 && !isLoading && (
                   <p className="text-xs text-center text-slate-400 mt-2 font-medium">
                      {leads.length} leads available
                   </p>
                )}
              </div>

              <div className="mb-6">
                 <RegionSelector 
                    selectedRegion={selectedRegion} 
                    onSelect={handleRegionSelect} 
                 />
              </div>

              <div className="mb-6">
                 <label className="block text-sm font-bold text-slate-700 mb-2">Refine Criteria</label>
                 <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="E.g. 'Only focus on affordable housing' or 'Find Technical Directors'"
                    className="w-full rounded-sm border-slate-300 text-sm focus:border-orange-600 focus:ring-1 focus:ring-orange-600 min-h-[100px] shadow-inner"
                 />
              </div>

              {/* Cold Call Bingo */}
              <div className="border-t border-slate-100 pt-4">
                <ColdCallBingo />
              </div>

            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 xl:col-span-9">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded-sm shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
                <div className="mb-6">
                    <LoadingView />
                </div>
            )}

            {/* Results */}
            {leads.length > 0 && (
               <div className={isLoading ? 'opacity-50 pointer-events-none filter grayscale transition-all' : 'transition-all'}>
                  <ResultsDashboard leads={leads} />
               </div>
            )}

            {/* Empty State */}
            {!leads.length && !isLoading && !error && (
              <div className="flex flex-col items-center justify-center h-96 bg-white rounded-sm border border-dashed border-slate-300 text-slate-400">
                <div className="bg-slate-50 p-6 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-orange-600 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <p className="text-xl font-bold text-slate-700">Ready to Scout</p>
                <p className="text-sm max-w-xs text-center mt-2">Select a target region to find multifamily operators with older building portfolios.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;
