import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebase";
import { GenerationRequest, SectionContent, TranslationRequest, ImageGenerationRequest } from "../types";

// PROD UPDATE: API Keys are no longer used here.
// All logic is moved to backend Cloud Functions to prevent Key leakage and Prompt Injection.

/**
 * Calls the backend function to generate section content.
 */
export const generateSectionContent = async (
  request: GenerationRequest
): Promise<{ content: SectionContent; styles: any; variant: string }> => {
  try {
    const generateFn = httpsCallable<GenerationRequest, { content: SectionContent; styles: any; variant: string }>(functions, 'generateSection');
    const result = await generateFn(request);
    return result.data;
  } catch (error) {
    console.error("Cloud Function Error (generateSection):", error);
    throw new Error("AI service is currently unavailable. Please try again.");
  }
};

/**
 * Calls the backend function to translate content.
 */
export const translateSectionContent = async (req: TranslationRequest): Promise<SectionContent> => {
  try {
    const translateFn = httpsCallable<TranslationRequest, SectionContent>(functions, 'translateSection');
    const result = await translateFn(req);
    return result.data;
  } catch (error) {
    console.error("Cloud Function Error (translateSection):", error);
    throw new Error("Translation service failed.");
  }
}

/**
 * Calls the backend function to generate images.
 */
export const generateSectionImage = async (req: ImageGenerationRequest): Promise<string> => {
  try {
    const generateImageFn = httpsCallable<ImageGenerationRequest, { imageUrl: string }>(functions, 'generateImage');
    const result = await generateImageFn(req);
    return result.data.imageUrl;
  } catch (error) {
    console.error("Cloud Function Error (generateImage):", error);
    throw new Error("Image generation failed.");
  }
};

/**
 * Calls the backend function for chat assistance.
 */
export const chatAssistant = async (message: string, history: any[]): Promise<string> => {
  try {
    const chatFn = httpsCallable<{message: string, history: any[]}, { reply: string }>(functions, 'chatAssistant');
    const result = await chatFn({ message, history });
    return result.data.reply;
  } catch (error) {
    console.error("Cloud Function Error (chatAssistant):", error);
    return "I'm having trouble connecting to the server right now.";
  }
};
