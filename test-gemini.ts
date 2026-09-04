import { GoogleGenAI } from "@google/genai";
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
      contents: "hello",
    });
    console.log("Success:", response.text);
  } catch (e) {
    console.error("Error with 3.7-flash:", e.message);
  }
  
  try {
    const response2 = await ai.models.generateContent({
      model: "gemini-3.0-flash",
      contents: "hello",
    });
    console.log("Success 3.0:", response2.text);
  } catch (e) {
    console.error("Error with 3.0-flash:", e.message);
  }
}
test();
