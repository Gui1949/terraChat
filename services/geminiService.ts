import { GoogleGenAI } from "@google/genai";
import { ChatMode, LocationData, Message } from "../types";
import { MODEL_CONFIGS, INITIAL_SYSTEM_INSTRUCTION } from "../constants";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing in process.env");
}

// Initialize the client
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const generateResponse = async (
  history: Message[],
  currentMessage: string,
  mode: ChatMode,
  location: LocationData | null
): Promise<{ text: string; groundingMetadata?: any }> => {
  
  const modelName = MODEL_CONFIGS[mode].modelName;
  
  // Prepare contents from history for context
  // Filter out error messages and map to API format
  // We take the last few messages to keep context but avoid huge payloads if not needed
  const recentHistory = history.slice(-10).map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  const contents = [
    ...recentHistory,
    { role: 'user', parts: [{ text: currentMessage }] }
  ];

  // Configure tools based on mode
  let tools: any[] = [];
  let toolConfig: any = undefined;

  if (mode === ChatMode.EXPLORER) {
    // Add Google Maps and Google Search tools
    tools = [
      { googleSearch: {} },
      { googleMaps: {} }
    ];

    // If we have location, provide it in retrievalConfig
    if (location) {
      toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        }
      };
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents as any, // Type assertion due to slight interface mismatch in some SDK versions
      config: {
        systemInstruction: INITIAL_SYSTEM_INSTRUCTION,
        tools: tools.length > 0 ? tools : undefined,
        toolConfig: toolConfig,
      },
    });

    // Extract text
    const text = response.text || "I couldn't generate a text response.";

    // Extract grounding metadata
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    return {
      text,
      groundingMetadata
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate response");
  }
};