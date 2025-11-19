
import React from 'react';
import { ParsedLead } from '../types';
import { LeadCard } from './LeadCard';

interface ResultsDashboardProps {
  leads: ParsedLead[];
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ leads }) => {
  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
};
