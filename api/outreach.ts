import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { lead, type } = req.body;

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return res.status(200).json({ text: response.text });

    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
