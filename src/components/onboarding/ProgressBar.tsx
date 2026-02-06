import React from 'react';
import { OnboardingStep } from '../../types';

interface ProgressBarProps {
  currentStep: OnboardingStep;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  const steps = [
    OnboardingStep.WELCOME,
    OnboardingStep.SITE_TYPE,
    OnboardingStep.SITE_PURPOSE,
    OnboardingStep.TARGET_AUDIENCE,
    OnboardingStep.BRAND_INFO,
    OnboardingStep.LOGO_UPLOAD,
    OnboardingStep.COLOR_PREFERENCE,
    OnboardingStep.CONTENT_DETAILS,
    OnboardingStep.REVIEW
  ];

  let progress = 0;
  
  if (currentStep === OnboardingStep.GENERATING) {
    progress = 100;
  } else if (currentStep === OnboardingStep.EDIT_MENU) {
    progress = 95; // Editing is close to finish
  } else {
    const currentIndex = steps.indexOf(currentStep);
    // If not found (e.g. EDIT_MENU or obscure step), keep previous or max
    progress = currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 90;
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
      <div 
        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};