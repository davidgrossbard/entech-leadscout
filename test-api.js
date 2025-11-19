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
        console.log("Attempting to generate content with 'gemini-2.5-flash'...");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Reply with exactly the word 'Success'.",
        });

        console.log("Response received!");
        console.log("Output:", response.text);
        console.log("---------------------------------------------------");
        console.log("✅ SUCCESS: Your API key is valid and working.");
        console.log("If you still see 503 errors in the app, it is a temporary server overload.");
        console.log("---------------------------------------------------");

    } catch (error) {
        console.log("---------------------------------------------------");
        console.error("❌ FAILED: The API request failed.");
        console.error("Error Status:", error.status);
        console.error("Error Message:", error.message);

        if (error.status === 403 || error.message?.includes("permission")) {
            console.log("\n👉 DIAGNOSIS: ACCESS DENIED.");
            console.log("This usually means your API key does not have access to the 'gemini-2.5-flash' model.");
            console.log("Check if you have enabled billing or if the model is available in your region.");
        } else if (error.status === 400 && error.message?.includes("API key not valid")) {
            console.log("\n👉 DIAGNOSIS: INVALID KEY.");
            console.log("Double check that you copied the key correctly.");
        } else if (error.status === 429) {
            console.log("\n👉 DIAGNOSIS: QUOTA EXCEEDED.");
            console.log("You have hit the rate limit. If on free tier, wait a minute.");
        }
        console.log("---------------------------------------------------");
    }
}

testKey();
