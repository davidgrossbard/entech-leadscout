import { TargetRegion, SearchResult, ParsedLead } from "../types";

const retryWithBackoff = async <T>(fn: () => Promise<T>, retries = 5, delay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0 || (error.status !== 503 && error.status !== 429)) {
      throw error;
    }
    console.log(`API Error ${error.status}. Retrying in ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
};

export const searchLeads = async (
  region: TargetRegion,
  customInstructions: string,
  excludeCompanies: string[] = []
): Promise<SearchResult> => {

  try {
    const response = await retryWithBackoff(async () => {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          region,
          customInstructions,
          excludeCompanies
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${res.status}`);
      }

      return res.json();
    });

    const text = response.text || "[]";
    let parsedLeads: ParsedLead[] = [];

    try {
      // Use regex to find the JSON array within the text, handling potential conversational wrapper text
      const jsonMatch = text.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }

      const jsonString = jsonMatch[0];
      const rawData = JSON.parse(jsonString);

      parsedLeads = rawData.map((item: any) => {
        // Normalize Company URL
        let cleanCompanyUrl = item.companyUrl;
        if (cleanCompanyUrl && !cleanCompanyUrl.startsWith('http')) {
          cleanCompanyUrl = `https://${cleanCompanyUrl}`;
        }

        // Robust Portfolio Size Parsing
        // Handles "2,000", "2000+", "approx 5000"
        let portfolioSize = 0;
        if (typeof item.estimatedPortfolio === 'number') {
          portfolioSize = item.estimatedPortfolio;
        } else if (typeof item.estimatedPortfolio === 'string') {
          const digits = item.estimatedPortfolio.replace(/[^0-9]/g, '');
          portfolioSize = parseInt(digits, 10);
          if (isNaN(portfolioSize)) portfolioSize = 0;
        }

        return {
          id: crypto.randomUUID(),
          companyName: item.companyName || "Unknown Company",
          companyUrl: cleanCompanyUrl,
          decisionMaker: {
            name: item.decisionMaker?.name || "Unknown",
            title: item.decisionMaker?.title || "N/A",
            contactDetails: item.decisionMaker?.contactDetails
          },
          estimatedPortfolio: portfolioSize,
          portfolioDescription: item.portfolioDescription || "No description available",
          strategy: item.strategy || "Research company further",
          region: region
        };
      });

    } catch (parseError) {
      console.error("JSON Parse Error", parseError);
      console.log("Raw Text:", text);
      // Throwing the error so the UI can show it, instead of silently returning empty
      throw new Error(`Failed to parse leads from AI response. Raw response: ${text.substring(0, 100)}...`);
    }

    return {
      leads: parsedLeads
    };

  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const generateOutreachMessage = async (
  lead: ParsedLead,
  type: 'email'
): Promise<string> => {

  try {
    const res = await fetch('/api/outreach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lead,
        type
      }),
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    const data = await res.json();
    return data.text || "Could not generate message.";

  } catch (error) {
    console.error("Outreach API Error:", error);
    return "Error generating message.";
  }
};
