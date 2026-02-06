import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole, User, WebsiteProject } from './types';
import PublicLayout from './pages/public/PublicLayout';
import BuilderLayout from './pages/builder/BuilderLayout';
import LandingPage from './pages/public/LandingPage';
import FeaturesPage from './pages/public/FeaturesPage';
import PricingPage from './pages/public/PricingPage';
import ShowcasePage from './pages/public/ShowcasePage';
import PrivacyPage from './pages/public/PrivacyPage';
import TermsPage from './pages/public/TermsPage';
import OnboardingChat from './pages/onboarding/OnboardingChat';
import { BuilderProvider } from './contexts/BuilderContext';
import { OnboardingProvider, useOnboarding } from './contexts/OnboardingContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { generateFullWebsite } from './services/aiPlannerService';

// Auth Context
export const AuthContext = React.createContext<{
  user: User | null;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: false
});

// App Flow Controller
const AppFlowController: React.FC<{ user: User }> = ({ user }) => {
  const { generationPlan, isGenerating } = useOnboarding();
  const [generatedProject, setGeneratedProject] = useState<WebsiteProject | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  // When generation plan is complete, generate the full website
  React.useEffect(() => {
    if (generationPlan && !isGenerating && !generatedProject && !isLoadingProject) {
      setIsLoadingProject(true);
      
      generateFullWebsite(generationPlan)
        .then(project => {
          setGeneratedProject(project);
          setIsLoadingProject(false);
        })
        .catch(error => {
          console.error('Failed to generate website:', error);
          setIsLoadingProject(false);
        });
    }
  }, [generationPlan, isGenerating, generatedProject, isLoadingProject]);

  // If we have a generated project, show builder
  if (generatedProject) {
    return (
      <BuilderProvider initialProject={generatedProject}>
        <BuilderLayout />
      </BuilderProvider>
    );
  }

  // Otherwise, show onboarding chat
  return <OnboardingChat />;
};

function App() {
  // Initialize user from localStorage to persist session
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('aether_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Failed to parse user from storage", e);
      return null;
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const login = () => {
    const newUser: User = {
      id: '123',
      name: 'Demo User',
      email: 'demo@example.com',
      role: UserRole.PRO,
      tokens: 1000,
      avatarUrl: 'https://picsum.photos/32/32'
    };
    setUser(newUser);
    localStorage.setItem('aether_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aether_user');
  };

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading Aether...</div>;
  }

  return (
    <ErrorProvider>
      <AuthContext.Provider value={{ user, login, logout, isLoading }}>
        <HashRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="features" element={<FeaturesPage />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="showcase" element={<ShowcasePage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="terms" element={<TermsPage />} />
            </Route>

            {/* Protected Builder Routes */}
            <Route 
              path="/create" 
              element={
                user ? (
                  <OnboardingProvider>
                    <AppFlowController user={user} />
                  </OnboardingProvider>
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
            {/* Direct Builder Route */}
            <Route path="/builder" element={
              user ? (
                <BuilderProvider>
                  <BuilderLayout />
                </BuilderProvider>
              ) : <Navigate to="/" replace />
            } />
          </Routes>
        </HashRouter>
      </AuthContext.Provider>
    </ErrorProvider>
  );
}

export default App;