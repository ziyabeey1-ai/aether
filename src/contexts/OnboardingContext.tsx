import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { 
  ConversationMessage, 
  SiteProfile, 
  OnboardingStep, 
  GenerationPlan 
} from '../types';
import { generateSitePlan } from '../services/aiPlannerService';
import { uploadImageToLocalStorage } from '../services/imageService';

interface OnboardingContextType {
  currentStep: OnboardingStep;
  messages: ConversationMessage[];
  siteProfile: Partial<SiteProfile>;
  generationPlan: GenerationPlan | null;
  isGenerating: boolean;
  
  // Actions
  sendMessage: (content: string) => Promise<void>;
  selectOption: (option: string) => Promise<void>;
  updateProfile: (updates: Partial<SiteProfile>) => void;
  uploadLogo: (file: File) => Promise<void>;
  skipStep: () => void;
  goBack: () => void;
  startGeneration: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const conversationFlow: Record<string, any> = {
  [OnboardingStep.WELCOME]: {
    next: OnboardingStep.SITE_TYPE,
    question: "Harika! Şimdi biraz daha detaya girelim. Web sitenizin ana amacı nedir?",
    type: 'text',
    placeholder: 'Örn: Danışmanlık hizmetlerimi tanıtmak ve müşteri kazanmak'
  },
  [OnboardingStep.SITE_TYPE]: {
    next: OnboardingStep.SITE_PURPOSE,
    question: "Mükemmel! Hedef kitleniz kimler?",
    type: 'text',
    placeholder: 'Örn: 25-45 yaş arası profesyoneller, KOBİ sahipleri'
  },
  [OnboardingStep.SITE_PURPOSE]: {
    next: OnboardingStep.TARGET_AUDIENCE,
    question: "Anladım. Markanızın adı nedir?",
    type: 'text',
    placeholder: 'Örn: Aether Consulting'
  },
  [OnboardingStep.TARGET_AUDIENCE]: {
    next: OnboardingStep.BRAND_INFO,
    question: "Harika! Markanızı özetleyen bir slogan/tagline var mı?",
    type: 'text',
    placeholder: 'Örn: Geleceği Tasarlıyoruz (İsteğe bağlı, geçebilirsiniz)',
    optional: true
  },
  [OnboardingStep.BRAND_INFO]: {
    next: OnboardingStep.LOGO_UPLOAD,
    question: "Haziriniz bir logonuz var mı?",
    type: 'choice',
    options: [
      '✅ Evet, logomu yükleyeceğim',
      '🎨 Hayır, AI ile oluşturulsun',
      '⏭️ Şimdilik logoyu atla'
    ]
  },
  [OnboardingStep.LOGO_UPLOAD]: {
    next: OnboardingStep.COLOR_PREFERENCE,
    question: "Renk tercihiniz nasıl olsun?",
    type: 'choice',
    options: [
      '💼 Profesyonel (Mavi tonları)',
      '🌈 Canlı ve Enerjik',
      '⚪ Minimal ve Sade',
      '🌙 Koyu Tema',
      '🎨 Özel renk seçeceğim'
    ]
  },
  [OnboardingStep.COLOR_PREFERENCE]: {
    next: OnboardingStep.CONTENT_DETAILS,
    question: "Neredeyse hazırız! Site nerede öne çıkarmak istediğiniz özellikler, hizmetler veya ürünler nelerdir?",
    type: 'text',
    placeholder: 'Örn: Dijital pazarlama, SEO danışmanlığı, web tasarım',
    hint: 'Virgülle ayırarak yazabilirsiniz'
  },
  [OnboardingStep.CONTENT_DETAILS]: {
    next: OnboardingStep.REVIEW,
    question: "Mükemmel! Son olarak, eklemek istediğiniz başka bir şey var mı?",
    type: 'text',
    placeholder: 'İsteğe bağlı: Özel istekleriniz, referans siteler vs.',
    optional: true
  }
};

const createInitialAssistantMessage = (): ConversationMessage => ({
  id: '1',
  role: 'assistant',
  content: "👋 Merhaba! Ben Aether AI, size harika bir web sitesi oluşturma konusunda yardımcı olacağım. Önce sizi biraz tanıyalım. Hangi tür bir web sitesi oluşturmak istiyorsunuz?",
  timestamp: new Date(),
  options: [
    '🏢 İşletme/Kurumsal',
    '🎨 Portfolio/Kişisel',
    '📝 Blog',
    '🛍️ E-ticaret',
    '🚀 Landing Page',
    '💡 Diğer'
  ],
  metadata: { step: OnboardingStep.WELCOME }
});

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.WELCOME);
  const [messages, setMessages] = useState<ConversationMessage[]>([createInitialAssistantMessage()]);
  const [siteProfile, setSiteProfile] = useState<Partial<SiteProfile>>({
    preferredLanguage: 'tr'
  });
  const [generationPlan, setGenerationPlan] = useState<GenerationPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // New: History stack to properly handle navigation
  const [stepHistory, setStepHistory] = useState<OnboardingStep[]>([]);
  
  // New: Ref to manage auto-advance timeouts
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timeout on unmount or reset
  const clearAutoAdvance = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const addMessage = useCallback((role: 'assistant' | 'user', content: string, options?: string[]) => {
    const newMessage: ConversationMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      options,
      metadata: { step: currentStep }
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, [currentStep]);

  const resetOnboarding = useCallback(() => {
    clearAutoAdvance();
    setCurrentStep(OnboardingStep.WELCOME);
    setMessages([createInitialAssistantMessage()]);
    setSiteProfile({ preferredLanguage: 'tr' });
    setGenerationPlan(null);
    setIsGenerating(false);
    setStepHistory([]);
  }, [clearAutoAdvance]);

  const advanceStep = useCallback((nextStep: OnboardingStep) => {
    setStepHistory(prev => [...prev, currentStep]);
    setCurrentStep(nextStep);

    const nextStepConfig = conversationFlow[nextStep];
    if (nextStepConfig) {
      addMessage('assistant', nextStepConfig.question, nextStepConfig.options);
    } else if (nextStep === OnboardingStep.REVIEW) {
      // We will trigger showReview from within the flow or useEffect
      // But for simplicity in this architecture, let's call it manually if needed, 
      // OR let the caller handle it.
      // Here we assume the caller logic (sendMessage/selectOption) handles the "what to say next" logic via setTimeout
    }
  }, [currentStep, addMessage]);

  const showReview = useCallback(() => {
    const reviewMessage = `
Harika! İşte topladığım bilgiler:

📋 **Site Bilgileri**
• Tür: ${siteProfile.siteType || '-'}
• Marka: ${siteProfile.brandName || '-'}
• Amaç: ${siteProfile.sitePurpose || '-'}
• Hedef Kitle: ${siteProfile.targetAudience || '-'}

🎨 **Tasarım**
• Renk Şeması: ${siteProfile.colorScheme || '-'}
• Logo: ${siteProfile.logoUrl ? 'Yüklendi/Seçildi' : 'Yok'}

✨ **İçerik**
• Özellikler: ${siteProfile.keyFeatures?.join(', ') || 'Belirtilmedi'}

Şimdi size tam bir web sitesi oluşturacağım.

Hazır mısınız? 🚀
    `.trim();

    addMessage('assistant', reviewMessage, [
      '✅ Evet, oluştur!',
      '✏️ Bilgileri düzenle',
      '🔄 Baştan başla'
    ]);
    
    // Don't push REVIEW to history recursively if we are already there or coming from edits
    setCurrentStep(OnboardingStep.REVIEW);
  }, [siteProfile, addMessage]);

  const sendMessage = useCallback(async (content: string) => {
    clearAutoAdvance();
    addMessage('user', content);

    // Update profile based on current step
    const stepConfig = conversationFlow[currentStep];
    
    switch (currentStep) {
      case OnboardingStep.SITE_TYPE:
        setSiteProfile(prev => ({ ...prev, sitePurpose: content }));
        break;
      case OnboardingStep.SITE_PURPOSE:
        setSiteProfile(prev => ({ ...prev, targetAudience: content }));
        break;
      case OnboardingStep.TARGET_AUDIENCE:
        setSiteProfile(prev => ({ ...prev, brandName: content }));
        break;
      case OnboardingStep.BRAND_INFO:
        setSiteProfile(prev => ({ ...prev, brandTagline: content }));
        break;
      case OnboardingStep.CONTENT_DETAILS:
        const features = content.split(',').map(f => f.trim()).filter(Boolean);
        setSiteProfile(prev => ({ ...prev, keyFeatures: features }));
        break;
      case OnboardingStep.REVIEW:
        setSiteProfile(prev => ({ ...prev, additionalNotes: content }));
        break;
    }

    // Move to next step
    if (stepConfig && stepConfig.next) {
      timerRef.current = setTimeout(() => {
        if (stepConfig.next === OnboardingStep.REVIEW) {
          showReview();
        } else {
          advanceStep(stepConfig.next);
        }
      }, 500);
    }
  }, [currentStep, addMessage, resetOnboarding, advanceStep, showReview, clearAutoAdvance]);

  const selectOption = useCallback(async (option: string) => {
    clearAutoAdvance();

    if (currentStep === OnboardingStep.REVIEW) {
      if (option.includes('Baştan başla')) {
        resetOnboarding();
        return;
      }

      if (option.includes('Bilgileri düzenle')) {
        // Just reset to the beginning for simple editing in this linear flow,
        // OR go back to Content Details. 
        // A better UX is to present a menu of what to edit, but for MVP:
        setMessages(prev => prev.slice(0, -2)); // Remove review msg
        setCurrentStep(OnboardingStep.CONTENT_DETAILS); // Jump back a bit
        
        // Add prompt
        const stepConfig = conversationFlow[OnboardingStep.CONTENT_DETAILS];
        if (stepConfig) {
          addMessage('assistant', stepConfig.question, stepConfig.options);
        }
        return;
      }
    }

    addMessage('user', option);

    // Handle specific option selections
    switch (currentStep) {
      case OnboardingStep.WELCOME:
        const siteTypeMap: Record<string, SiteProfile['siteType']> = {
          '🏢 İşletme/Kurumsal': 'business',
          '🎨 Portfolio/Kişisel': 'portfolio',
          '📝 Blog': 'blog',
          '🛍️ E-ticaret': 'ecommerce',
          '🚀 Landing Page': 'landing',
          '💡 Diğer': 'other'
        };
        setSiteProfile(prev => ({ ...prev, siteType: siteTypeMap[option] }));
        break;

      case OnboardingStep.LOGO_UPLOAD:
        if (option.includes('AI ile oluştur')) {
          setSiteProfile(prev => ({ ...prev, logoUrl: 'AI_GENERATED' }));
        } else if (option.includes('atla')) {
          setSiteProfile(prev => ({ ...prev, logoUrl: undefined }));
        } else if (option.includes('logomu yükleyeceğim')) {
          // Do not advance; wait for upload
          return;
        }
        break;

      case OnboardingStep.COLOR_PREFERENCE:
        const colorMap: Record<string, SiteProfile['colorScheme']> = {
          '💼 Profesyonel (Mavi tonları)': 'professional',
          '🌈 Canlı ve Enerjik': 'vibrant',
          '⚪ Minimal ve Sade': 'minimal',
          '🌙 Koyu Tema': 'dark',
          '🎨 Özel renk seçeceğim': 'custom'
        };
        setSiteProfile(prev => ({ ...prev, colorScheme: colorMap[option] }));
        break;
    }

    // Move to next step
    const stepConfig = conversationFlow[currentStep];
    if (stepConfig?.next) {
      timerRef.current = setTimeout(() => {
        if (stepConfig.next === OnboardingStep.REVIEW) {
          showReview();
        } else {
          advanceStep(stepConfig.next);
        }
      }, 500);
    }
  }, [currentStep, addMessage, resetOnboarding, advanceStep, showReview, clearAutoAdvance]);

  const updateProfile = useCallback((updates: Partial<SiteProfile>) => {
    setSiteProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const uploadLogo = useCallback(async (file: File) => {
    clearAutoAdvance();
    try {
      // PROD UPDATE: Upload to Cloud Storage instead of Base64
      const downloadUrl = await uploadImageToLocalStorage(file); // Note: Function name kept for compatibility but implementation changed to Storage
      
      setSiteProfile(prev => ({ 
        ...prev, 
        logoFile: file,
        logoUrl: downloadUrl 
      }));
      
      addMessage('user', '✅ Logo başarıyla yüklendi');
      
      // Auto-advance to next step
      const stepConfig = conversationFlow[currentStep];
      if (stepConfig?.next) {
        timerRef.current = setTimeout(() => {
          advanceStep(stepConfig.next);
        }, 500);
      }
    } catch (error) {
      console.error(error);
      addMessage('assistant', '❌ Logo yüklenirken hata oluştu. Lütfen tekrar deneyin.');
    }
  }, [currentStep, addMessage, advanceStep, clearAutoAdvance]);

  const skipStep = useCallback(() => {
    clearAutoAdvance();
    const stepConfig = conversationFlow[currentStep];
    
    if (stepConfig?.optional && stepConfig.next) {
      addMessage('user', '⏭️ Atla');
      timerRef.current = setTimeout(() => {
         if (stepConfig.next === OnboardingStep.REVIEW) {
          showReview();
        } else {
          advanceStep(stepConfig.next);
        }
      }, 300);
    }
  }, [currentStep, addMessage, showReview, advanceStep, clearAutoAdvance]);

  const goBack = useCallback(() => {
    clearAutoAdvance();
    
    if (stepHistory.length === 0) return;

    // Pop the last step from history
    const previousStep = stepHistory[stepHistory.length - 1];
    const newHistory = stepHistory.slice(0, -1);
    
    setStepHistory(newHistory);
    setCurrentStep(previousStep);

    // Remove last user message and assistant response to keep UI clean
    // This is a simplification; a real chat might keep history and just scroll up
    setMessages(prev => {
        // Heuristic: remove until we find the start of the previous step's interaction
        // For MVP: remove last 2 messages (User response + New Assistant Question)
        return prev.slice(0, -2);
    });
    
  }, [stepHistory, clearAutoAdvance]);

  const startGeneration = useCallback(async () => {
    clearAutoAdvance();
    setIsGenerating(true);
    setCurrentStep(OnboardingStep.GENERATING);
    
    addMessage('assistant', '🎨 Harika! Şimdi size özel web sitenizi oluşturuyorum...');

    try {
      const plan = await generateSitePlan(siteProfile as SiteProfile);
      setGenerationPlan(plan);
      setIsGenerating(false);
      addMessage('assistant', '✅ Siteniz hazır! Builder moduna geçiliyor...');
    } catch (error) {
      addMessage('assistant', '❌ Oluşturma sırasında hata oluştu. Lütfen tekrar deneyin.');
      setIsGenerating(false);
    }
  }, [siteProfile, addMessage, clearAutoAdvance]);

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        messages,
        siteProfile,
        generationPlan,
        isGenerating,
        sendMessage,
        selectOption,
        updateProfile,
        uploadLogo,
        skipStep,
        goBack,
        startGeneration
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
};