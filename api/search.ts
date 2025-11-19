import { GoogleGenAI } from "@google/genai";

// We can't easily share types between frontend and backend in this simple setup 
// without a shared workspace or build step adjustments, so we'll define necessary interfaces here
// or just use 'any' for simplicity in the handler to avoid build errors.

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { region, customInstructions, excludeCompanies } = req.body;

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const prompt = `
    Act as a senior sales researcher for Entech (entechsmart.com), a company specializing in smart building solutions, energy management, and boiler controls/retrofits.
    
    TASK:
    Find 4 prominent multifamily ownership or management companies in ${region}.
    
    CRITERIA:
    1. **Portfolio Size**: Must own or manage at least 10 multifamily buildings, with each building having 20+ units.
    2. **Building Age (CRITICAL)**: The portfolio MUST consist primarily of **OLDER buildings (Built before 2005)**. These are the targets for boiler retrofits.
       - **EXCLUDE**: Developers of new luxury high-rises or "New Construction" focused firms.
    3. **Region**: Must have a major operational footprint in ${region}.
    ${excludeCompanies && excludeCompanies.length > 0 ? `4. EXCLUDE these companies: ${excludeCompanies.join(', ')}.` : ''}

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

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text || "[]";

        // Basic validation that we got something resembling JSON
        if (!text.includes('[') || !text.includes(']')) {
            throw new Error("Invalid response format from AI");
        }

        return res.status(200).json({ text });

    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({
            error: error.message || 'Internal Server Error',
            details: error.toString()
        });
    }
}
