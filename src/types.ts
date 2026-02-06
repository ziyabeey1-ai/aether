
// types.ts

export enum AppMode {
  PUBLIC = 'PUBLIC',
  BUILDER = 'BUILDER'
}

export enum UserRole {
  VISITOR = 'VISITOR',
  FREE = 'FREE',
  PRO = 'PRO'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tokens: number;
  avatarUrl?: string;
}

export enum SectionType {
  HERO = 'HERO',
  FEATURES = 'FEATURES',
  CONTENT = 'CONTENT',
  PRICING = 'PRICING',
  CTA = 'CTA',
  FOOTER = 'FOOTER',
  GALLERY = 'GALLERY'
}

// Content is now specific to a single language
export interface SectionContent {
  headline: string;
  subheadline: string;
  body: string;
  buttonText?: string;
  imageUrl?: string;
  items?: Array<{ title: string; desc: string; icon?: string }>;
}

export interface SectionStyles {
  backgroundColor: string;
  textColor: string;
  padding: string;
  align: 'left' | 'center' | 'right';
}

export interface SectionData {
  id: string;
  type: SectionType;
  variant: 'default' | 'modern' | 'minimal' | 'bold';
  // Multi-language support: key is language code (e.g., 'en', 'es')
  content: Record<string, SectionContent>; 
  styles: SectionStyles;
  locked: boolean;
}

export interface WebsiteProject {
  id: string;
  name: string;
  defaultLanguage: string;
  activeLanguage: string; // The language currently being edited
  draftSections: SectionData[];
  publishedSections: SectionData[]; // Snapshot of sections for the public site
  theme: {
    primaryColor: string;
    fontPairing: 'modern' | 'classic' | 'tech';
  };
}

// AI Service Types

export enum GeminiModel {
  FLASH_LITE = 'gemini-2.5-flash-lite-latest',
  FLASH_PREVIEW = 'gemini-3-flash-preview',
  PRO_PREVIEW = 'gemini-3-pro-preview',
  IMAGE_PRO = 'gemini-3-pro-image-preview',
}

export interface GenerationRequest {
  type: SectionType;
  userPrompt?: string;
  context: {
    language: string;
    brandTone: string;
    prevSection?: SectionType;
  };
  isPro: boolean;
}

export interface TranslationRequest {
  content: SectionContent;
  targetLanguage: string;
  sourceLanguage: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  aspectRatio: '1:1' | '16:9' | '4:3' | '3:4' | '9:16';
  size: '1K' | '2K';
}

// Onboarding conversation types
export enum OnboardingStep {
  WELCOME = 'WELCOME',
  SITE_TYPE = 'SITE_TYPE',
  SITE_PURPOSE = 'SITE_PURPOSE',
  TARGET_AUDIENCE = 'TARGET_AUDIENCE',
  BRAND_INFO = 'BRAND_INFO',
  LOGO_UPLOAD = 'LOGO_UPLOAD',
  COLOR_PREFERENCE = 'COLOR_PREFERENCE',
  CONTENT_DETAILS = 'CONTENT_DETAILS',
  REVIEW = 'REVIEW',
  EDIT_MENU = 'EDIT_MENU', // New step for selecting what to edit
  GENERATING = 'GENERATING'
}

export interface ConversationMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  options?: string[]; // For multiple choice questions
  metadata?: {
    step?: OnboardingStep;
    fieldName?: string;
  };
}

export interface SiteProfile {
  // Basic Info
  siteType: 'business' | 'portfolio' | 'blog' | 'ecommerce' | 'landing' | 'other';
  sitePurpose: string; // User's description
  targetAudience: string;
  
  // Brand Info
  brandName: string;
  brandTagline?: string;
  logoUrl?: string;
  logoFile?: File;
  
  // Design Preferences
  colorScheme: 'professional' | 'vibrant' | 'minimal' | 'dark' | 'custom';
  primaryColor?: string;
  secondaryColor?: string;
  
  // Content Details
  keyFeatures?: string[]; // What to highlight
  servicesProducts?: string[]; // List of services/products
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  
  // Additional
  industry?: string;
  mustHaveSections?: SectionType[];
  additionalNotes?: string;
  preferredLanguage: string;
}

export interface GenerationPlan {
  profile: SiteProfile;
  plannedSections: Array<{
    type: SectionType;
    purpose: string;
    priority: number;
  }>;
  designDirection: string;
  contentStrategy: string;
}
