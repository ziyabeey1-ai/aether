import { GoogleGenAI, Type } from "@google/genai";
import { 
  SiteProfile, 
  GenerationPlan, 
  SectionType, 
  SectionData,
  WebsiteProject 
} from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error('API key not found');
  return new GoogleGenAI({ apiKey });
};

/**
 * Phase 1: Generate a comprehensive site plan based on user profile
 */
export const generateSitePlan = async (profile: SiteProfile): Promise<GenerationPlan> => {
  const ai = getClient();
  
  const prompt = `
You are an expert web designer and UX strategist. Based on the following client profile, create a comprehensive website plan.

CLIENT PROFILE:
- Site Type: ${profile.siteType}
- Brand Name: ${profile.brandName}
- Purpose: ${profile.sitePurpose}
- Target Audience: ${profile.targetAudience}
- Color Scheme: ${profile.colorScheme}
- Key Features/Services: ${profile.keyFeatures?.join(', ') || 'Not specified'}
- Additional Notes: ${profile.additionalNotes || 'None'}

TASK:
Create a strategic plan for this website including:
1. Which sections to include and in what order
2. The purpose of each section
3. Overall design direction
4. Content strategy

Consider best practices for ${profile.siteType} websites and the target audience.
  `.trim();

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 4096 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plannedSections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { 
                  type: Type.STRING,
                  enum: ['HERO', 'FEATURES', 'CONTENT', 'PRICING', 'CTA', 'GALLERY', 'FOOTER']
                },
                purpose: { type: Type.STRING },
                priority: { type: Type.NUMBER }
              }
            }
          },
          designDirection: { type: Type.STRING },
          contentStrategy: { type: Type.STRING }
        }
      }
    }
  });

  const planData = JSON.parse(response.text);
  
  return {
    profile,
    ...planData
  };
};

/**
 * Phase 2: Generate full website with all sections based on the plan
 */
export const generateFullWebsite = async (
  plan: GenerationPlan
): Promise<WebsiteProject> => {
  const ai = getClient();
  
  // Generate all sections in parallel
  const sectionPromises = plan.plannedSections.map(async (plannedSection, index) => {
    const prompt = `
You are generating content for a ${plan.profile.siteType} website.

WEBSITE CONTEXT:
- Brand: ${plan.profile.brandName}
- Purpose: ${plan.profile.sitePurpose}
- Target Audience: ${plan.profile.targetAudience}
- Design Direction: ${plan.designDirection}
- Content Strategy: ${plan.contentStrategy}

SECTION TO GENERATE:
- Type: ${plannedSection.type}
- Purpose: ${plannedSection.purpose}
- Position: Section #${index + 1}

REQUIREMENTS:
1. Create professional, engaging copy appropriate for the target audience
2. For FEATURES sections: include 3-4 key features
3. Use the brand name naturally in the content
4. Match the tone to the site type (${plan.profile.siteType})
5. Keep headlines punchy and under 60 characters
6. Make CTAs clear and action-oriented

Generate the complete section configuration.
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2048 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            variant: { 
              type: Type.STRING,
              enum: ['default', 'modern', 'minimal', 'bold']
            },
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
                align: { 
                  type: Type.STRING,
                  enum: ['left', 'center', 'right']
                },
                backgroundColor: { type: Type.STRING },
                textColor: { type: Type.STRING },
                padding: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    const sectionData = JSON.parse(response.text);
    
    const section: SectionData = {
      id: `sec-${Date.now()}-${index}`,
      type: plannedSection.type as SectionType,
      variant: sectionData.variant,
      content: {
        [plan.profile.preferredLanguage]: sectionData.content
      },
      styles: sectionData.styles,
      locked: false
    };

    return section;
  });

  const sections = await Promise.all(sectionPromises);

  const themeColors = {
    professional: '#4f46e5',
    vibrant: '#ec4899',
    minimal: '#0ea5e9',
    dark: '#8b5cf6',
    custom: plan.profile.primaryColor || '#4f46e5'
  };

  const project: WebsiteProject = {
    id: `proj-${Date.now()}`,
    name: `${plan.profile.brandName} Website`,
    defaultLanguage: plan.profile.preferredLanguage,
    activeLanguage: plan.profile.preferredLanguage,
    draftSections: sections,
    publishedSections: [],
    theme: {
      primaryColor: themeColors[plan.profile.colorScheme || 'professional'],
      fontPairing: plan.profile.siteType === 'business' ? 'classic' : 'modern'
    }
  };

  return project;
};

export const generateLogo = async (brandName: string, industry?: string): Promise<string> => {
  const ai = getClient();
  
  const prompt = `
Create a modern, professional logo for "${brandName}".
${industry ? `Industry: ${industry}` : ''}
Style: Minimalist, scalable, memorable
Format: Simple icon or lettermark that works well at small sizes
  `.trim();

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: '1:1',
        imageSize: '1K'
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
  
  throw new Error("Logo generation failed");
};
