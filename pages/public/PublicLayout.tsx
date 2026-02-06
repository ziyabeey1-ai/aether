import React, { useContext } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AuthContext } from '../../App';
import { Button } from '../../components/ui/Button';

const PublicLayout: React.FC = () => {
  const { user, login } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="font-bold text-xl tracking-tight">Aether</span>
            </div>

            <div className="hidden md:flex space-x-8">
              <Link to="/" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Özellikler</Link>
              <Link to="/" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Fiyatlar</Link>
              <Link to="/" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Vitrin</Link>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <Link to="/builder">
                  <Button variant="premium">Builder'a Git</Button>
                </Link>
              ) : (
                <Button onClick={login} variant="secondary">Giriş Yap</Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <Outlet />
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2024 Aether Platforms. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;