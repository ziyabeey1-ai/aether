import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  ConversationMessage, 
  SiteProfile, 
  OnboardingStep,
  GenerationPlan 
} from '../types';
import { generateSitePlan } from '../services/aiPlannerService';

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

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.WELCOME);
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
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
    }
  ]);
  const [siteProfile, setSiteProfile] = useState<Partial<SiteProfile>>({
    preferredLanguage: 'tr'
  });
  const [generationPlan, setGenerationPlan] = useState<GenerationPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const sendMessage = useCallback(async (content: string) => {
    // Add user message
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
      setTimeout(() => {
        setCurrentStep(stepConfig.next);
        const nextStepConfig = conversationFlow[stepConfig.next];
        if (nextStepConfig) {
          addMessage('assistant', nextStepConfig.question, nextStepConfig.options);
        } else if (stepConfig.next === OnboardingStep.REVIEW) {
          showReview();
        }
      }, 500);
    }
  }, [currentStep, addMessage]);

  const selectOption = useCallback(async (option: string) => {
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
      setTimeout(() => {
        setCurrentStep(stepConfig.next);
        const nextStepConfig = conversationFlow[stepConfig.next];
        if (nextStepConfig) {
          addMessage('assistant', nextStepConfig.question, nextStepConfig.options);
        } else if (stepConfig.next === OnboardingStep.REVIEW) {
          showReview();
        }
      }, 500);
    }
  }, [currentStep, addMessage]);

  const showReview = useCallback(() => {
    const reviewMessage = `
Harika! İşte topladığım bilgiler:

📋 **Site Bilgileri**
• Tür: ${siteProfile.siteType}
• Marka: ${siteProfile.brandName}
• Amaç: ${siteProfile.sitePurpose}
• Hedef Kitle: ${siteProfile.targetAudience}

🎨 **Tasarım**
• Renk Şeması: ${siteProfile.colorScheme}
• Logo: ${siteProfile.logoUrl ? 'Var' : 'Yok'}

✨ **İçerik**
• Özellikler: ${siteProfile.keyFeatures?.join(', ') || 'Belirtilmedi'}

Şimdi size tam bir web sitesi oluşturacağım. Tüm section'ları, içerikleri ve görselleri AI ile hazırlayacağım. Bu işlem 30-60 saniye sürebilir.

Hazır mısınız? 🚀
    `.trim();

    addMessage('assistant', reviewMessage, [
      '✅ Evet, oluştur!',
      '✏️ Bilgileri düzenle',
      '🔄 Baştan başla'
    ]);
    
    setCurrentStep(OnboardingStep.REVIEW);
  }, [siteProfile, addMessage]);

  const updateProfile = useCallback((updates: Partial<SiteProfile>) => {
    setSiteProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const uploadLogo = useCallback(async (file: File) => {
    try {
      // Convert to base64 and store
      const base64 = await convertToBase64(file);
      setSiteProfile(prev => ({ 
        ...prev, 
        logoFile: file,
        logoUrl: base64 
      }));
      
      addMessage('user', '✅ Logo yüklendi');
      
      // Auto-advance to next step
      const stepConfig = conversationFlow[currentStep];
      if (stepConfig?.next) {
        setTimeout(() => {
          setCurrentStep(stepConfig.next);
          const nextStepConfig = conversationFlow[stepConfig.next];
          if (nextStepConfig) {
            addMessage('assistant', nextStepConfig.question, nextStepConfig.options);
          }
        }, 500);
      }
    } catch (error) {
      addMessage('assistant', '❌ Logo yüklenirken hata oluştu. Lütfen tekrar deneyin.');
    }
  }, [currentStep, addMessage]);

  const skipStep = useCallback(() => {
    const stepConfig = conversationFlow[currentStep];
    if (stepConfig?.optional && stepConfig.next) {
      addMessage('user', '⏭️ Atla');
      setTimeout(() => {
        setCurrentStep(stepConfig.next);
        const nextStepConfig = conversationFlow[stepConfig.next];
        if (nextStepConfig) {
          addMessage('assistant', nextStepConfig.question, nextStepConfig.options);
        } else if (stepConfig.next === OnboardingStep.REVIEW) {
          showReview();
        }
      }, 300);
    }
  }, [currentStep, addMessage, showReview]);

  const goBack = useCallback(() => {
    // Remove last 2 messages (user + assistant)
    setMessages(prev => prev.slice(0, -2));
    
    // Go to previous step (simplified - you'd need proper step history)
    const steps = Object.values(OnboardingStep);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  }, [currentStep]);

  const startGeneration = useCallback(async () => {
    setIsGenerating(true);
    setCurrentStep(OnboardingStep.GENERATING);
    
    addMessage('assistant', '🎨 Harika! Şimdi size özel web sitenizi oluşturuyorum...');

    try {
      // Generate site plan using AI
      const plan = await generateSitePlan(siteProfile as SiteProfile);
      setGenerationPlan(plan);
      
      // This will be handled by parent component to switch to builder
      addMessage('assistant', '✅ Siteniz hazır! Builder moduna geçiliyor...');
    } catch (error) {
      addMessage('assistant', '❌ Oluşturma sırasında hata oluştu. Lütfen tekrar deneyin.');
      setIsGenerating(false);
    }
  }, [siteProfile, addMessage]);

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

// Helper function
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};