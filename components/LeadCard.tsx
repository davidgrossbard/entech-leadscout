
import React, { useState } from 'react';
import { ParsedLead } from '../types';
import { generateOutreachMessage } from '../services/geminiService';

interface LeadCardProps {
  lead: ParsedLead;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  const [generatedContent, setGeneratedContent] = useState<{type: 'email', text: string} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGeneratedContent(null);
    try {
        const text = await generateOutreachMessage(lead, 'email');
        setGeneratedContent({ type: 'email', text });
    } catch (e) {
        console.error(e);
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-sm shadow-lg border-t-4 border-orange-500 overflow-hidden flex flex-col h-full transition-all hover:shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex justify-between items-start mb-3">
            <div className="flex-grow pr-4">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">{lead.companyName}</h3>
                {lead.companyUrl && (
                    <a 
                        href={lead.companyUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-xs font-medium text-orange-700 bg-orange-50 px-2 py-1 rounded hover:bg-orange-100 transition-colors"
                    >
                        Website
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                )}
            </div>
            <span className="flex-shrink-0 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide shadow-sm">
                {lead.region}
            </span>
        </div>
        
        <div className="space-y-2">
            <div className="flex items-center text-sm text-slate-700 font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{lead.estimatedPortfolio.toLocaleString()}+ Units</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
                {lead.portfolioDescription}
            </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6 flex-grow">
        
        {/* Decision Maker */}
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-700 font-bold shadow-inner text-lg">
                    {lead.decisionMaker.name.charAt(0)}
                </div>
            </div>
            <div className="flex-grow min-w-0 pt-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Decision Maker</p>
                <h4 className="text-base font-bold text-slate-900 truncate">{lead.decisionMaker.name}</h4>
                <p className="text-sm text-orange-600 font-medium truncate">{lead.decisionMaker.title}</p>
            </div>
        </div>

        {/* Strategy */}
        <div className="bg-slate-50 rounded p-3 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Entech Opportunity</p>
            <p className="text-sm text-slate-700 leading-relaxed">{lead.strategy}</p>
        </div>

        {/* Generator Area */}
        {generatedContent && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100 animate-fade-in shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">
                        Draft Email Content
                    </span>
                    <button 
                        onClick={() => setGeneratedContent(null)}
                        className="text-orange-400 hover:text-orange-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                <div className="bg-white p-3 rounded border border-orange-100 text-xs text-slate-700 whitespace-pre-wrap font-mono select-all cursor-text shadow-inner max-h-60 overflow-y-auto custom-scrollbar">
                    {generatedContent.text}
                </div>
                <div className="mt-2 text-right">
                    <button 
                        onClick={() => navigator.clipboard.writeText(generatedContent.text)}
                        className="text-xs text-orange-600 hover:text-orange-800 font-bold flex items-center justify-end ml-auto"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy Text
                    </button>
                </div>
            </div>
        )}

      </div>

      {/* Actions */}
      <div className="bg-slate-50 border-t border-slate-100 p-4">
        <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 disabled:opacity-50 transition-all"
        >
            {isGenerating ? (
                <span className="animate-pulse text-orange-600">Thinking...</span>
            ) : (
                <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Draft Email
                </>
            )}
        </button>
      </div>
    </div>
  );
};
