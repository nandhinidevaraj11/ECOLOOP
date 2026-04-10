import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is missing from environment variables.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface WasteAnalysisResult {
  wasteType: string;
  classification: 'recyclable' | 'recoverable' | 'hazardous' | 'non-recyclable';
  confidence: number;
  quantityPrediction: string; // e.g., "5-10 kg", "Approx 2 Liters"
  recyclingMethods: string[];
  reuseSuggestions: string[];
  hazardousAlert: string | null;
  materialComposition: string;
  estimatedMarketValue: string;
  safetyProtocols: string[];
}

export async function analyzeWasteImage(base64Image: string): Promise<WasteAnalysisResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze this image of industrial or household waste for a Circular Economy platform. 
    1. Identify the type of waste (e.g., Plastic, Metal, E-Waste, Glass, Paper, Textile, Chemical, etc.).
    2. Classify it into exactly one of these categories: 'recyclable', 'recoverable', 'hazardous', or 'non-recyclable'.
    3. Predict the quantity or volume visible in the image (e.g., "5-10 kg", "Approx 2 Liters").
    4. Provide specific recycling methods and creative reuse suggestions.
    5. If the waste is hazardous, provide a clear safety alert and a list of safety protocols for handling.
    6. Describe the material composition.
    7. Estimate the current market value in INR (e.g., "₹15-20 per kg") based on typical industrial scrap rates in India.
    
    Return the result in strict JSON format.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          wasteType: { type: Type.STRING },
          classification: { 
            type: Type.STRING, 
            enum: ['recyclable', 'recoverable', 'hazardous', 'non-recyclable'] 
          },
          quantityPrediction: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          recyclingMethods: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          reuseSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          hazardousAlert: { type: Type.STRING, nullable: true },
          materialComposition: { type: Type.STRING },
          estimatedMarketValue: { type: Type.STRING },
          safetyProtocols: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["wasteType", "classification", "quantityPrediction", "confidence", "recyclingMethods", "reuseSuggestions", "materialComposition", "estimatedMarketValue", "safetyProtocols"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Invalid response from AI model");
  }
}

export async function searchRecyclingCenters(lat: number, lng: number, type?: string): Promise<any[]> {
  const model = "gemini-3-flash-preview";
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Find real industrial recycling centers for ${type || 'general waste'} near coordinates ${lat}, ${lng} in Tamil Nadu. 
      Return the results as a JSON array of objects. 
      Each object must have: 
      - name (string)
      - location (string)
      - type (string)
      - contact (string)
      - buyingPrice (string, e.g. "₹20/kg")
      - commissionRate (string, e.g. "3%")
      - coordinates (object with lat and lng numbers)
      
      IMPORTANT: Return ONLY the JSON array, no other text or markdown formatting.`,
      config: {
        tools: [{ googleMaps: {} }],
        // googleMaps does not support application/json responseMimeType
      }
    });

    const text = response.text || "[]";
    // Clean the text in case the model wrapped it in markdown code blocks
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Maps Grounding error:", error);
    return []; // Return empty array on error to prevent .map() crash
  }
}
