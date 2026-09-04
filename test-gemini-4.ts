import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  const apiKey = process.env.GEMINI_RESEARCH_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No API key");
    return;
  }
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: "Find recent reviews for Google Maps",
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    console.log("Success with search:", response.text);
  } catch (e) {
    console.error("Error search:", e.message);
  }
  
  try {
    const response2 = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: "Find recent reviews for Google Maps",
      config: {
        thinkingConfig: { thinkingLevel: "HIGH" }
      }
    });
    console.log("Success with thinking:", response2.text);
  } catch (e) {
    console.error("Error thinking:", e.message);
  }
}
test();
