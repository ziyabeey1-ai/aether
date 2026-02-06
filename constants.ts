import { SectionType, SectionData, WebsiteProject } from "./types";

export const INITIAL_SECTIONS: SectionData[] = [
  {
    id: 'header-1',
    type: SectionType.HERO,
    variant: 'modern',
    content: {
      'en': {
        headline: 'Build Faster with Aether',
        subheadline: 'The AI-powered platform for next-generation web creation.',
        body: 'Create stunning, responsive websites in minutes using our advanced Gemini 3 models.',
        buttonText: 'Get Started'
      },
      'es': {
        headline: 'Construye más rápido con Aether',
        subheadline: 'La plataforma impulsada por IA para la creación web de próxima generación.',
        body: 'Cree sitios web impresionantes y responsivos en minutos utilizando nuestros modelos avanzados Gemini 3.',
        buttonText: 'Empezar'
      }
    },
    styles: {
      backgroundColor: 'bg-white',
      textColor: 'text-slate-900',
      align: 'center',
      padding: 'py-20'
    },
    locked: false
  }
];

export const INITIAL_PROJECT: WebsiteProject = {
  id: 'proj-demo',
  name: 'My Awesome Site',
  defaultLanguage: 'en',
  activeLanguage: 'en',
  draftSections: INITIAL_SECTIONS,
  publishedSections: [], // Empty until published
  theme: {
    primaryColor: '#4f46e5',
    fontPairing: 'modern'
  }
};

export const TOKEN_COSTS = {
  GENERATE_SECTION: 10,
  ROLL_SECTION: 5,
  TRANSLATE_SECTION: 2,
  GENERATE_IMAGE: 25,
  CHAT_ASSIST: 1
};

export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];
