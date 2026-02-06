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

  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
      <div 
        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};