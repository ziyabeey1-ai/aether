import React, { useState, useEffect } from 'react';
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
import { ErrorProvider, useError } from './contexts/ErrorContext';
import { generateFullWebsite } from './services/aiPlannerService';

// Firebase Imports
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from './lib/firebase';

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
  const { showError } = useError();

  // When generation plan is complete, generate the full website
  useEffect(() => {
    if (generationPlan && !isGenerating && !generatedProject && !isLoadingProject) {
      setIsLoadingProject(true);
      
      generateFullWebsite(generationPlan)
        .then(project => {
          setGeneratedProject(project);
          setIsLoadingProject(false);
        })
        .catch(error => {
          console.error('Failed to generate website:', error);
          showError('Failed to generate website content. Please try again.');
          setIsLoadingProject(false);
        });
    }
  }, [generationPlan, isGenerating, generatedProject, isLoadingProject, showError]);

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for real Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Map Firebase user to our App User type
        const appUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          role: UserRole.PRO, // Default to PRO for demo purposes
          tokens: 5000, // Give generous tokens for demo
          avatarUrl: firebaseUser.photoURL || undefined
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
      alert("Giriş yapılamadı. Lütfen popup engelleyicinizi kontrol edin.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="font-medium animate-pulse">Aether başlatılıyor...</p>
      </div>
    );
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