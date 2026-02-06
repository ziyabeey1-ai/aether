import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WebsiteProject, SectionData, SectionType, SectionStyles } from '../types';
import { INITIAL_PROJECT, TOKEN_COSTS } from '../constants';
import { AuthContext } from '../App';
import { generateSectionContent, translateSectionContent } from '../services/geminiService';
import { useError } from './ErrorContext';
import { saveProject, getCurrentProject } from '../services/storageService';
import { useHistory } from '../hooks/useHistory';

interface BuilderContextType {
  project: WebsiteProject;
  tokens: number;
  isGenerating: boolean;
  selectedSectionId: string | null;
  // Actions
  selectSection: (id: string | null) => void;
  setLanguage: (lang: string) => void;
  addSection: (type: SectionType, prompt: string) => Promise<void>;
  rollSection: (sectionId: string) => Promise<void>;
  updateSectionImage: (sectionId: string, imageUrl: string, cost: number) => void;
  translateMissingContent: (sectionId: string) => Promise<void>;
  publishSite: () => void;
  
  // New Actions
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reorderSections: (startIndex: number, endIndex: number) => void;
  changeVariant: (sectionId: string, variant: 'default' | 'modern' | 'minimal' | 'bold') => void;
  updateSectionStyles: (sectionId: string, styles: Partial<SectionStyles>) => void;
}

export const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

interface BuilderProviderProps {
  children: React.ReactNode;
  initialProject?: WebsiteProject;
}

export const BuilderProvider: React.FC<BuilderProviderProps> = ({ children, initialProject }) => {
  const { user } = useContext(AuthContext);
  const { showError } = useError();
  
  // State management with History for Undo/Redo
  const history = useHistory<WebsiteProject>(initialProject || INITIAL_PROJECT);
  const project = history.state;
  
  const [tokens, setTokens] = useState(user?.tokens || 0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (user) setTokens(user.tokens);
  }, [user]);

  // Initial Data Load
  useEffect(() => {
    if (initialProject) {
      history.reset(initialProject);
    } else {
       const fetchProject = async () => {
         const savedProject = await getCurrentProject();
         if (savedProject) {
           history.reset(savedProject);
         }
       };
       fetchProject();
    }
  }, [initialProject]);

  // Auto-save project (debounced)
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (project && user) {
        saveProject(project).catch(err => console.error('Auto-save failed:', err));
      }
    }, 3000);

    return () => clearTimeout(saveTimeout);
  }, [project, user]);

  const selectSection = (id: string | null) => setSelectedSectionId(id);

  const setLanguage = (lang: string) => {
    history.set(prev => ({ ...prev, activeLanguage: lang }));
  };

  const reorderSections = useCallback((startIndex: number, endIndex: number) => {
    history.set(prev => {
      const newSections = Array.from(prev.draftSections);
      const [removed] = newSections.splice(startIndex, 1);
      newSections.splice(endIndex, 0, removed);
      return { ...prev, draftSections: newSections };
    });
  }, [history]);

  const changeVariant = useCallback((sectionId: string, variant: 'default' | 'modern' | 'minimal' | 'bold') => {
    history.set(prev => ({
      ...prev,
      draftSections: prev.draftSections.map(s =>
        s.id === sectionId ? { ...s, variant } : s
      )
    }));
  }, [history]);

  const updateSectionStyles = useCallback((sectionId: string, styles: Partial<SectionStyles>) => {
    history.set(prev => ({
      ...prev,
      draftSections: prev.draftSections.map(s =>
        s.id === sectionId
          ? { ...s, styles: { ...s.styles, ...styles } }
          : s
      )
    }));
  }, [history]);

  const addSection = async (type: SectionType, prompt: string) => {
    if (tokens < TOKEN_COSTS.GENERATE_SECTION) {
      showError("Insufficient tokens. Please purchase more tokens.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateSectionContent({
        type,
        userPrompt: prompt,
        context: {
          language: project.activeLanguage,
          brandTone: 'Professional',
        },
        isPro: user?.role === 'PRO'
      });

      const newSection: SectionData = {
        id: `sec-${Date.now()}`,
        type: type,
        styles: result.styles,
        variant: result.variant as any,
        content: {
          [project.activeLanguage]: result.content
        },
        locked: false
      };

      history.set(prev => ({
        ...prev,
        draftSections: [...prev.draftSections, newSection]
      }));
      setTokens(prev => prev - TOKEN_COSTS.GENERATE_SECTION);
    } catch (e: any) {
      console.error('Generation error:', e);
      showError(e.message || 'Failed to generate section.');
    } finally {
      setIsGenerating(false);
    }
  };

  const rollSection = async (sectionId: string) => {
    if (tokens < TOKEN_COSTS.ROLL_SECTION) {
        showError("Insufficient tokens");
        return;
    }
    
    const section = project.draftSections.find(s => s.id === sectionId);
    if (!section) return;

    setIsGenerating(true);
    try {
      const result = await generateSectionContent({
        type: section.type,
        userPrompt: "Give me a creative variation",
        context: {
            language: project.activeLanguage,
            brandTone: 'Professional'
        },
        isPro: user?.role === 'PRO'
      });

      history.set(prev => ({
        ...prev,
        draftSections: prev.draftSections.map(s => 
          s.id === sectionId 
            ? { ...s, content: { ...s.content, [prev.activeLanguage]: result.content }, styles: result.styles, variant: result.variant as any }
            : s
        )
      }));
      setTokens(prev => prev - TOKEN_COSTS.ROLL_SECTION);
    } catch (e) {
        console.error(e);
        showError("Failed to roll section");
    } finally {
        setIsGenerating(false);
    }
  };

  const translateMissingContent = async (sectionId: string) => {
      const section = project.draftSections.find(s => s.id === sectionId);
      if (!section) return;

      const sourceLang = Object.keys(section.content)[0];
      if (!sourceLang) return; 

      if (tokens < TOKEN_COSTS.TRANSLATE_SECTION) {
          showError("Insufficient tokens for translation");
          return;
      }

      setIsGenerating(true);
      try {
          const translatedContent = await translateSectionContent({
              content: section.content[sourceLang],
              sourceLanguage: sourceLang,
              targetLanguage: project.activeLanguage
          });

          history.set(prev => ({
              ...prev,
              draftSections: prev.draftSections.map(s => 
                  s.id === sectionId 
                  ? { ...s, content: { ...s.content, [prev.activeLanguage]: translatedContent } }
                  : s
              )
          }));
          setTokens(prev => prev - TOKEN_COSTS.TRANSLATE_SECTION);
      } catch (e) {
          console.error(e);
          showError("Translation failed");
      } finally {
          setIsGenerating(false);
      }
  };

  const updateSectionImage = (sectionId: string, imageUrl: string, cost: number) => {
     history.set(prev => ({
         ...prev,
         draftSections: prev.draftSections.map(s => {
             if (s.id !== sectionId) return s;
             const activeContent = s.content[prev.activeLanguage];
             if (!activeContent) return s;

             return {
                 ...s,
                 content: {
                     ...s.content,
                     [prev.activeLanguage]: { ...activeContent, imageUrl }
                 }
             };
         })
     }));
     if (cost > 0) setTokens(prev => prev - cost);
  };

  const publishSite = () => {
    history.set(prev => ({
      ...prev,
      publishedSections: [...prev.draftSections]
    }));
    // In production, this would trigger a Vercel/Netlify build hook
    alert("Site Published! (Data saved to Firestore)");
  };

  return (
    <BuilderContext.Provider value={{
      project,
      tokens,
      isGenerating,
      selectedSectionId,
      selectSection,
      setLanguage,
      addSection,
      rollSection,
      updateSectionImage,
      translateMissingContent,
      publishSite,
      undo: history.undo,
      redo: history.redo,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
      reorderSections,
      changeVariant,
      updateSectionStyles
    }}>
      {children}
    </BuilderContext.Provider>
  );
};

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) throw new Error("useBuilder must be used within a BuilderProvider");
  return context;
};