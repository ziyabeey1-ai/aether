import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
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
  isEditMode: boolean; // New: Tracks if we are editing a single field
  
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

// Define flow configuration
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
  },
  [OnboardingStep.EDIT_MENU]: {
    next: null, // Dynamic
    question: "Hangi bilgiyi değiştirmek istersiniz?",
    type: 'choice',
    options: [
      '🏢 Site Türü',
      '🎯 Hedef & Amaç',
      '🏷️ Marka Adı',
      '🎨 Renk & Logo',
      '📝 İçerik Detayları',
      '↩️ Vazgeç (Geri Dön)'
    ]
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
  const [stepHistory, setStepHistory] = useState<OnboardingStep[]>([]);
  const [messages, setMessages] = useState<ConversationMessage[]>([createInitialAssistantMessage()]);
  const [siteProfile, setSiteProfile] = useState<Partial<SiteProfile>>({
    preferredLanguage: 'tr'
  });
  const [generationPlan, setGenerationPlan] = useState<GenerationPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Timeout reference for cleanup
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Hoisted showReview to avoid circular dependency in advanceToStep
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
    
    // Explicitly set these to ensure state consistency
    setCurrentStep(OnboardingStep.REVIEW);
    setIsEditMode(false);
  }, [siteProfile, addMessage]);

  // Centralized step advancement logic
  const advanceToStep = useCallback((nextStep: OnboardingStep, delay = 500) => {
    timerRef.current = setTimeout(() => {
      // Push current step to history before moving, UNLESS we are going back to Review from Edit
      if (nextStep !== OnboardingStep.REVIEW || !isEditMode) {
         setStepHistory(prev => [...prev, currentStep]);
      }
      
      setCurrentStep(nextStep);

      // Handle Review Step specifically
      if (nextStep === OnboardingStep.REVIEW) {
        showReview();
        // If we were editing, turn off edit mode upon returning to review
        setIsEditMode(false);
        return;
      }

      // Normal flow
      const nextStepConfig = conversationFlow[nextStep];
      if (nextStepConfig) {
        addMessage('assistant', nextStepConfig.question, nextStepConfig.options);
      }
    }, delay);
  }, [currentStep, isEditMode, addMessage, showReview]);

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

  const goBack = useCallback(() => {
    clearAutoAdvance();
    
    if (stepHistory.length === 0) return;

    // Pop the last step from history
    const previousStep = stepHistory[stepHistory.length - 1];
    const newHistory = stepHistory.slice(0, -1);
    
    setStepHistory(newHistory);
    setCurrentStep(previousStep);

    // Clean up UI: Remove the last question and the user's answer that led to it
    setMessages(prev => {
      // Heuristic: Remove until we hit the user's last input
      // Ideally we would snapshot messages history too, but for MVP this suffices
      return prev.slice(0, -2);
    });
    
    // If we went back from an Edit flow, turn off edit mode
    if (isEditMode && previousStep === OnboardingStep.REVIEW) {
        setIsEditMode(false);
    }

  }, [stepHistory, clearAutoAdvance, isEditMode]);

  const resetOnboarding = useCallback(() => {
    clearAutoAdvance();
    setCurrentStep(OnboardingStep.WELCOME);
    setStepHistory([]);
    setMessages([createInitialAssistantMessage()]);
    setSiteProfile({ preferredLanguage: 'tr' });
    setGenerationPlan(null);
    setIsGenerating(false);
    setIsEditMode(false);
  }, [clearAutoAdvance]);

  const uploadLogo = useCallback(async (file: File) => {
    clearAutoAdvance();
    try {
      const downloadUrl = await uploadImageToLocalStorage(file);
      
      setSiteProfile(prev => ({ 
        ...prev, 
        logoFile: file,
        logoUrl: downloadUrl 
      }));
      
      addMessage('user', '✅ Logo başarıyla yüklendi');
      
      // If we are in edit mode, go back to Review, otherwise go next
      const nextTarget = isEditMode ? OnboardingStep.REVIEW : conversationFlow[currentStep]?.next;

      if (nextTarget) {
        // Slightly longer delay for upload confirmation
        advanceToStep(nextTarget, 1500); 
      }
    } catch (error) {
      console.error(error);
      addMessage('assistant', '❌ Logo yüklenirken hata oluştu. Lütfen tekrar deneyin.');
    }
  }, [currentStep, addMessage, advanceToStep, isEditMode, clearAutoAdvance]);

  const skipStep = useCallback(() => {
    clearAutoAdvance();
    const stepConfig = conversationFlow[currentStep];
    
    if (stepConfig?.optional) {
      addMessage('user', '⏭️ Atla');
      
      const nextTarget = isEditMode ? OnboardingStep.REVIEW : stepConfig.next;
      if (nextTarget) {
        advanceToStep(nextTarget, 300);
      }
    }
  }, [currentStep, addMessage, advanceToStep, isEditMode, clearAutoAdvance]);

  const sendMessage = useCallback(async (content: string) => {
    clearAutoAdvance();
    addMessage('user', content);

    const stepConfig = conversationFlow[currentStep];
    
    // Update profile Logic
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

    // Navigation Logic
    if (isEditMode) {
      // If editing, always go back to review after input
      advanceToStep(OnboardingStep.REVIEW);
    } else if (stepConfig && stepConfig.next) {
      // Normal Flow
      advanceToStep(stepConfig.next);
    }
  }, [currentStep, addMessage, clearAutoAdvance, isEditMode, advanceToStep]);

  const selectOption = useCallback(async (option: string) => {
    clearAutoAdvance();

    // REVIEW SCREEN ACTIONS
    if (currentStep === OnboardingStep.REVIEW) {
      if (option.includes('Baştan başla')) {
        resetOnboarding();
        return;
      }
      if (option.includes('Bilgileri düzenle')) {
        // Go to Edit Menu
        setMessages(prev => prev.slice(0, -1)); // Remove the "Yes/No" options bubble to clean up
        setStepHistory(prev => [...prev, OnboardingStep.REVIEW]);
        setCurrentStep(OnboardingStep.EDIT_MENU);
        
        const editConfig = conversationFlow[OnboardingStep.EDIT_MENU];
        addMessage('assistant', editConfig.question, editConfig.options);
        return;
      }
      if (option.includes('oluştur')) {
        startGeneration();
        return;
      }
    }

    // EDIT MENU ACTIONS
    if (currentStep === OnboardingStep.EDIT_MENU) {
      if (option.includes('Vazgeç')) {
        goBack();
        return;
      }
      
      setIsEditMode(true);
      let targetStep: OnboardingStep | null = null;
      
      if (option.includes('Site Türü')) targetStep = OnboardingStep.WELCOME; // Restarting type selection
      if (option.includes('Hedef')) targetStep = OnboardingStep.SITE_TYPE; // Purpose is set after Type
      if (option.includes('Marka')) targetStep = OnboardingStep.TARGET_AUDIENCE; // Name is set after Audience
      if (option.includes('Renk')) targetStep = OnboardingStep.LOGO_UPLOAD; // Color is set after Logo
      if (option.includes('İçerik')) targetStep = OnboardingStep.CONTENT_DETAILS;

      if (targetStep) {
        // We jump to the step. Since isEditMode is true, the sendMessage at that step 
        // will redirect back to REVIEW instead of the natural next step.
        const config = conversationFlow[targetStep];
        setStepHistory(prev => [...prev, OnboardingStep.EDIT_MENU]);
        setCurrentStep(targetStep);
        addMessage('assistant', config.question, config.options);
      }
      return;
    }

    addMessage('user', option);

    // PROFILE UPDATES FROM OPTIONS
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
          return; // Wait for upload
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

    // NAVIGATION LOGIC
    const stepConfig = conversationFlow[currentStep];
    
    if (isEditMode) {
      // If we are editing, we generally return to review after one selection
      // UNLESS the step has sub-steps (like Welcome -> Site Type). 
      // For MVP simplicity, we assume editing a choice field returns to review.
      advanceToStep(OnboardingStep.REVIEW);
    } else if (stepConfig?.next) {
      advanceToStep(stepConfig.next);
    }

  }, [currentStep, addMessage, resetOnboarding, advanceToStep, startGeneration, goBack, isEditMode, clearAutoAdvance]);

  const updateProfile = useCallback((updates: Partial<SiteProfile>) => {
    setSiteProfile(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        messages,
        siteProfile,
        generationPlan,
        isGenerating,
        isEditMode,
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
