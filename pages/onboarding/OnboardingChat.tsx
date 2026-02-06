import React, { useRef, useEffect, useState } from 'react';
import { useOnboarding, conversationFlow } from '../../contexts/OnboardingContext';
import { OnboardingStep } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ProgressBar } from '../../components/onboarding/ProgressBar';

const OnboardingChat: React.FC = () => {
  const {
    messages,
    currentStep,
    isGenerating,
    sendMessage,
    selectOption,
    uploadLogo,
    skipStep,
    goBack,
    startGeneration
  } = useOnboarding();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadLogo(file);
    }
  };

  const canGoBack = messages.length > 2 && currentStep !== OnboardingStep.GENERATING;
  const lastMessage = messages[messages.length - 1];
  const showOptions = lastMessage?.options && lastMessage.options.length > 0;

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      <ProgressBar currentStep={currentStep} />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Aether AI</h1>
            <p className="text-xs text-slate-500 font-medium">Asistan</p>
          </div>
        </div>
        
        {canGoBack && (
          <button
            onClick={goBack}
            className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Geri
          </button>
        )}
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-6 py-4 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-50">
                    <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-indigo-600">Aether AI</span>
                  </div>
                )}
                
                <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Options (Multiple Choice) */}
                {message.options && message.options.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {message.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (currentStep === OnboardingStep.REVIEW && option.includes('oluştur')) {
                            startGeneration();
                          } else {
                            selectOption(option);
                          }
                        }}
                        className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all text-sm font-medium hover:shadow-md hover:translate-x-1 duration-200"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {/* Logo Upload Button */}
                {currentStep === OnboardingStep.LOGO_UPLOAD && 
                 message.role === 'assistant' && 
                 message.options?.some(o => o.includes('yükleyeceğim')) && (
                  <div className="mt-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Logo Yükle
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Generating Indicator */}
          {isGenerating && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-white shadow-lg border border-indigo-100 rounded-2xl px-6 py-6 max-w-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                     <LoadingSpinner size="md" />
                     <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                     </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Web siteniz oluşturuluyor...</p>
                    <p className="text-xs text-slate-500 mt-0.5">Yapay zeka çalışıyor (Yaklaşık 60sn)</p>
                  </div>
                </div>
                <div className="space-y-3 pl-1">
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Site mimarisi planlanıyor</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-600 delay-700">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse animation-delay-2000"></div>
                    <span>SEO uyumlu içerikler yazılıyor</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-600 delay-1000">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse animation-delay-4000"></div>
                    <span>Tasarım ve görseller hazırlanıyor</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {!showOptions && currentStep !== OnboardingStep.GENERATING && currentStep !== OnboardingStep.REVIEW && (
        <div className="bg-white border-t border-slate-200 px-4 py-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Mesajınızı buraya yazın..."
                  rows={1}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-slate-800 placeholder:text-slate-400 text-sm shadow-inner"
                  style={{ minHeight: '52px', maxHeight: '120px' }}
                />
              </div>
              
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="h-[52px] px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-indigo-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Gönder</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            
            {/* Skip Button for Optional Steps */}
            {lastMessage?.metadata?.step && 
             conversationFlow[lastMessage.metadata.step]?.optional && (
              <div className="mt-2 text-center">
                <button
                  onClick={skipStep}
                  className="text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors py-1 px-3 hover:bg-indigo-50 rounded-full"
                >
                  Bu adımı atla →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingChat;