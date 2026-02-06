import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebase";
import { 
  SiteProfile, 
  GenerationPlan, 
  WebsiteProject 
} from "../types";

// PROD UPDATE: All complex planning logic is moved to server-side.
// This allows for longer timeouts and better secret management.

/**
 * Phase 1: Generate a comprehensive site plan based on user profile
 */
export const generateSitePlan = async (profile: SiteProfile): Promise<GenerationPlan> => {
  try {
    const planFn = httpsCallable<SiteProfile, GenerationPlan>(functions, 'generateSitePlan');
    const result = await planFn(profile);
    return result.data;
  } catch (error) {
    console.error("Cloud Function Error (generateSitePlan):", error);
    throw new Error("Failed to create site plan. Please check your connection.");
  }
};

/**
 * Phase 2: Generate full website with all sections based on the plan
 */
export const generateFullWebsite = async (
  plan: GenerationPlan
): Promise<WebsiteProject> => {
  try {
    // Note: In a real production app, this should likely be a background job (Firestore Trigger)
    // rather than a direct HTTP response due to timeout risks on complex sites.
    // For this implementation, we assume the Cloud Function has a 60s+ timeout configured.
    const buildFn = httpsCallable<GenerationPlan, WebsiteProject>(functions, 'generateFullWebsite');
    const result = await buildFn(plan);
    return result.data;
  } catch (error) {
    console.error("Cloud Function Error (generateFullWebsite):", error);
    throw new Error("Failed to generate the full website structure.");
  }
};

/**
 * Generate logo using AI
 */
export const generateLogo = async (brandName: string, industry?: string): Promise<string> => {
  try {
    const logoFn = httpsCallable<{brandName: string, industry?: string}, { logoUrl: string }>(functions, 'generateLogo');
    const result = await logoFn({ brandName, industry });
    return result.data.logoUrl;
  } catch (error) {
    console.error("Cloud Function Error (generateLogo):", error);
    throw new Error("Logo generation failed.");
  }
};
