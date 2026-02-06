import { GoogleGenAI, Type } from "@google/genai";
import { GeminiModel, GenerationRequest, SectionContent, TranslationRequest, ImageGenerationRequest } from "../types";

// Note: In a real app, never expose keys. This assumes process.env is injected by the build system.
// We strictly follow the rule: apiKey must be from process.env.API_KEY.
const getClient = () => {
  // Use process.env.API_KEY directly as per @google/genai guidelines.
  // This assumes the environment variable is correctly configured in the build/runtime environment.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Generates section content/layout.
 * Returns a single SectionContent object (not the whole map).
 */
export const generateSectionContent = async (
  request: GenerationRequest
): Promise<{ content: SectionContent; styles: any; variant: string }> => {
  const ai = getClient();
  
  const model = request.isPro ? GeminiModel.PRO_PREVIEW : GeminiModel.FLASH_PREVIEW;
  
  const thinkingConfig = request.isPro 
    ? { thinkingConfig: { thinkingBudget: 4000 } } 
    : {};

  const prompt = `
    You are an expert UI/UX Designer.
    Task: Generate a JSON configuration for a website section.
    
    Context:
    - Type: ${request.type}
    - Language: ${request.context.language}
    - Brand Tone: ${request.context.brandTone}
    - User Intent: ${request.userPrompt || "High conversion, clean design."}
    
    Output JSON. Ensure copy is professional.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      ...thinkingConfig,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          variant: { type: Type.STRING },
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
 * Translates existing section content to a target language.
 */
export const translateSectionContent = async (req: TranslationRequest): Promise<SectionContent> => {
    const ai = getClient();

    const prompt = `
      Translate the following website content from ${req.sourceLanguage} to ${req.targetLanguage}.
      Maintain the tone, length constraints, and marketing impact.
      
      Input JSON: ${JSON.stringify(req.content)}
    `;

    const response = await ai.models.generateContent({
        model: GeminiModel.FLASH_PREVIEW, // Flash is perfect for translation
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

export const generateSectionImage = async (req: ImageGenerationRequest): Promise<string> => {
  const ai = getClient();
  const model = GeminiModel.IMAGE_PRO;

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

export const chatAssistant = async (message: string, history: any[]): Promise<string> => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: GeminiModel.FLASH_PREVIEW,
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