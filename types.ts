
export enum TargetRegion {
  CHICAGO = "Chicago Area",
  NY_STATE = "New York State",
  NYC = "New York City",
  NJ = "New Jersey",
  PA = "Pennsylvania",
  BALTIMORE_DC = "Baltimore / DC Area",
  BOSTON = "Boston Area",
  CT = "Connecticut"
}

export interface ContactInfo {
  name: string;
  title: string;
  contactDetails?: string; // Email or Phone if found
}

export interface ParsedLead {
  id: string; // Unique ID for React keys
  companyName: string;
  companyUrl?: string; // Website
  estimatedPortfolio: number;
  portfolioDescription: string;
  decisionMaker: ContactInfo;
  strategy: string; // tailored approach
  region: string;
}

export interface SearchResult {
  leads: ParsedLead[];
}
