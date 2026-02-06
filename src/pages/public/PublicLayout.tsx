import React, { useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../App';
import { Button } from '../../components/ui/Button';

const PublicLayout: React.FC = () => {
  const { user, login } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="font-bold text-xl tracking-tight">Aether</span>
            </Link>

            <div className="hidden md:flex space-x-8">
              <Link 
                to="/features" 
                className={`text-sm font-medium transition-colors ${isActive('/features') ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
              >
                Özellikler
              </Link>
              <Link 
                to="/pricing" 
                className={`text-sm font-medium transition-colors ${isActive('/pricing') ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
              >
                Fiyatlar
              </Link>
              <Link 
                to="/showcase" 
                className={`text-sm font-medium transition-colors ${isActive('/showcase') ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
              >
                Vitrin
              </Link>
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

      <main className="pt-16 flex-1">
        <Outlet />
      </main>

      {/* Expanded Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className="font-bold text-xl text-white tracking-tight">Aether</span>
              </div>
              <p className="text-sm text-slate-500">
                AI destekli web sitesi oluşturma platformu. Dakikalar içinde profesyonel siteler tasarlayın, yayınlayın ve büyütün.
              </p>
              <div className="flex gap-4">
                {/* Social Icons Placeholder */}
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
                <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                <a href="#" className="hover:text-white transition-colors">GitHub</a>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="text-white font-bold mb-4">Ürün</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/features" className="hover:text-white transition-colors">Özellikler</Link></li>
                <li><Link to="/showcase" className="hover:text-white transition-colors">Vitrin</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Fiyatlandırma</Link></li>
                <li><Link to="/create" className="hover:text-white transition-colors">Builder (Beta)</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-white font-bold mb-4">Şirket</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kariyer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">İletişim</a></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="text-white font-bold mb-4">Yasal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Gizlilik Politikası</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Kullanım Koşulları</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Çerez Politikası</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 text-center text-sm">
            <p>© 2024 Aether Platforms, Inc. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;