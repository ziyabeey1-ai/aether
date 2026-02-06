import { GoogleGenAI, Type } from "@google/genai";
import { GeminiModel, GenerationRequest, SectionContent, TranslationRequest, ImageGenerationRequest } from "../types";

// Helper to get the AI client using the API Key from environment variables
const getClient = () => {
  // Using process.env.API_KEY as configured in vite.config.ts
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found. Please check your .env file.");
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates section content/layout directly using Gemini API.
 */
export const generateSectionContent = async (
  request: GenerationRequest
): Promise<{ content: SectionContent; styles: any; variant: string }> => {
  const ai = getClient();
  
  // Use Pro model for Pro users, Flash for free users
  const model = request.isPro ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const prompt = `
    You are an expert UI/UX Designer.
    Task: Generate a JSON configuration for a website section.
    
    Context:
    - Type: ${request.type}
    - Language: ${request.context.language}
    - Brand Tone: ${request.context.brandTone}
    - User Intent: ${request.userPrompt || "High conversion, clean design."}
    
    Output JSON only. Ensure copy is professional.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          variant: { type: Type.STRING, enum: ['default', 'modern', 'minimal', 'bold'] },
          content: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              subheadline: { type: Type.STRING },
              body: { type: Type.STRING },
              buttonText: { type: Type.STRING },
              items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        desc: { type: Type.STRING }
                    }
                }
              }
            }
          },
          styles: {
            type: Type.OBJECT,
            properties: {
              align: { type: Type.STRING },
              backgroundColor: { type: Type.STRING },
              textColor: { type: Type.STRING }
            }
          }
        }
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text);
  }
  throw new Error("Failed to generate section content");
};

/**
 * Translates existing section content.
 */
export const translateSectionContent = async (req: TranslationRequest): Promise<SectionContent> => {
    const ai = getClient();

    const prompt = `
      Translate the following website content from ${req.sourceLanguage} to ${req.targetLanguage}.
      Maintain the tone, length constraints, and marketing impact.
      
      Input JSON: ${JSON.stringify(req.content)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    headline: { type: Type.STRING },
                    subheadline: { type: Type.STRING },
                    body: { type: Type.STRING },
                    buttonText: { type: Type.STRING },
                    items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                desc: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    throw new Error("Translation failed");
}

/**
 * Generates an image using Gemini Image model.
 */
export const generateSectionImage = async (req: ImageGenerationRequest): Promise<string> => {
  const ai = getClient();
  
  // Use the specific image model
  const model = 'gemini-3-pro-image-preview';

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: [{ text: req.prompt }] },
    config: {
      imageConfig: {
        aspectRatio: req.aspectRatio,
        imageSize: req.size
      }
    }
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("No image generated");
};

/**
 * Chat assistant logic.
 */
export const chatAssistant = async (message: string, history: any[]): Promise<string> => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
            ...history,
            { role: 'user', parts: [{ text: message }] }
        ],
        config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: "You are a helpful Aether Site Builder assistant."
        }
    });
    return response.text || "I couldn't process that request.";
};