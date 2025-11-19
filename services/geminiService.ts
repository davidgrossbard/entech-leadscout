
import { GoogleGenAI } from "@google/genai";
import { TargetRegion, SearchResult, ParsedLead } from "../types";

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key missing. Please set VITE_GEMINI_API_KEY in your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
}

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
  const ai = getClient();

  const prompt = `
    Act as a senior sales researcher for Entech (entechsmart.com), a company specializing in smart building solutions, energy management, and boiler controls/retrofits.
    
    TASK:
    Find 4 prominent multifamily ownership or management companies in ${region}.
    
    CRITERIA:
    1. **Portfolio Size**: Must own or manage at least 10 multifamily buildings, with each building having 20+ units.
    2. **Building Age (CRITICAL)**: The portfolio MUST consist primarily of **OLDER buildings (Built before 2005)**. These are the targets for boiler retrofits.
       - **EXCLUDE**: Developers of new luxury high-rises or "New Construction" focused firms.
    3. **Region**: Must have a major operational footprint in ${region}.
    ${excludeCompanies.length > 0 ? `4. EXCLUDE these companies: ${excludeCompanies.join(', ')}.` : ''}

    ${customInstructions ? `USER CUSTOM INSTRUCTIONS: ${customInstructions}` : ''}

    REQUIRED DATA FOR EACH COMPANY:
    1. **Company Name**.
    2. **Company Website URL**: The main homepage.
    3. **Decision Maker (CRITICAL)**:
       - For large firms: **DO NOT find the CEO**. Find the **Director of Operations**, **VP of Facilities**, **Regional Asset Manager**, or **Director of Maintenance** for the ${region} region. Entech sells to the people who manage the boilers and energy bills, not the investors.
       - For smaller firms: The **Principal** or **Owner** is acceptable.
    4. **Estimated Portfolio**: A numeric estimate of total units (e.g. 5000).
    5. **Portfolio Description**: Mention building vintage (e.g., "Pre-war brick buildings", "1970s garden style").
    6. **Entech Strategy**: Why are they a fit? (e.g., "Old steam heating systems need controls", "Compliance with local energy laws").

    OUTPUT FORMAT:
    Return ONLY a valid JSON array. Do not include any conversational text, explanations, or markdown formatting outside the JSON array.
    [
      {
        "companyName": "Name",
        "companyUrl": "https://www.example.com",
        "decisionMaker": { 
            "name": "Name", 
            "title": "Title"
        },
        "estimatedPortfolio": 2000,
        "portfolioDescription": "Vintage 1960s mid-rise apartments...",
        "strategy": "Strategy...",
        "region": "${region}"
      }
    ]
    
    Remember: Return ONLY the JSON array.
  `;

  try {
    const response = await retryWithBackoff(() => ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    }));

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
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateOutreachMessage = async (
  lead: ParsedLead,
  type: 'email'
): Promise<string> => {
  const ai = getClient();

  const prompt = `
      Write a cold email for Entech (entechsmart.com) to send to this lead.
      
      LEAD DETAILS:
      Name: ${lead.decisionMaker.name}
      Title: ${lead.decisionMaker.title}
      Company: ${lead.companyName}
      Region: ${lead.region}
      Portfolio: ${lead.portfolioDescription}
      Strategy Note: ${lead.strategy}
  
      MY COMPANY (Entech):
      We are an energy intelligence company. We specialize in boiler controls, steam system optimization, and energy management software for multifamily buildings. We help owners of older buildings reduce fuel burn by 20-30% and automate their heating operations.
  
      CONSTRAINTS:
      - Tone: Professional, peer-to-peer, direct. Avoid "marketing fluff".
      - Length: Short (under 120 words).
      - Subject: Catchy, relevant to their role (e.g. "${lead.decisionMaker.title} / ${lead.companyName} Heating Ops").
      - Format: Plain text.
    `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: prompt,
  });

  return response.text || "Could not generate message.";
};
