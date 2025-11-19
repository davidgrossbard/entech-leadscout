import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load env vars manually since we're running with node directly
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function testKey() {
    // Try both VITE_ and standard env var names
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    console.log("---------------------------------------------------");
    console.log("Testing Gemini API Key...");

    if (!apiKey) {
        console.error("❌ ERROR: No API Key found in .env.local");
        console.log("Please ensure .env.local exists and contains VITE_GEMINI_API_KEY=your_key");
        return;
    }

    // Mask key for display
    const maskedKey = apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4);
    console.log(`Found Key: ${maskedKey}`);

    const ai = new GoogleGenAI({ apiKey });

    try {
        console.log("Listing available models...");
        try {
            const listResponse = await ai.models.list();
            console.log("Available Models:");
            listResponse.models.forEach(m => {
                console.log(`- ${m.name} (${m.displayName})`);
            });
        } catch (e) {
            console.log("Could not list models:", e.message);
        }

        console.log("Attempting with 'gemini-2.0-flash-exp' (latest)...");
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: "Reply with exactly the word 'Success'.",
        });

        console.log("Response received!");
        console.log("Output:", response.text);
        console.log("---------------------------------------------------");
        console.log("✅ SUCCESS: 'gemini-2.0-flash-exp' is the correct model name.");
        console.log("I will update the application to use this name.");
        console.log("---------------------------------------------------");

    } catch (error) {
        console.log("---------------------------------------------------");
        console.error("❌ FAILED: The API request failed.");
        console.error("Error Status:", error.status);
        console.error("Error Message:", error.message);

        if (error.status === 404) {
            console.log("\n👉 DIAGNOSIS: MODEL NOT FOUND.");
            console.log("The model name is still incorrect.");
        }
        console.log("---------------------------------------------------");
    }
}

testKey();
