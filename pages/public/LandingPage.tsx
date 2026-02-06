import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';

const LandingPage: React.FC = () => {
  const { user, login } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleStartBuilding = () => {
    if (!user) {
      login();
    }
    // Redirect to /create instead of /builder
    setTimeout(() => navigate('/create'), 100);
  };

  return (
    <div className="flex flex-col gap-20">
      {/* Hero */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-sm font-semibold mb-6">
            Gemini AI Destekli
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto leading-tight">
            AI ile konuş, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">siteniz hazır.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Sohbet ederek web sitesi oluşturun. AI size sorular sorar, siz cevaplar verirsiniz. 
            60 saniyede profesyonel, tam düzenlenebilir web siteniz hazır!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleStartBuilding}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              🚀 Hemen Başla - Ücretsiz
            </button>
            <button className="px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 hover:border-indigo-300 rounded-xl font-semibold text-lg transition-all">
              📺 Demo İzle
            </button>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-20 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Nasıl Çalışır?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">💬 Sohbet Edin</h3>
              <p className="text-slate-600">
                AI size basit sorular sorar: Site amacınız, hedef kitleniz, marka bilgileriniz...
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">🎨 AI Oluşturur</h3>
              <p className="text-slate-600">
                60 saniyede tüm section'lar, içerikler ve tasarım otomatik oluşturulur.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">✏️ Düzenleyin</h3>
              <p className="text-slate-600">
                Tam kontrol sizde! Drag & drop ile sıralayın, stilleri değiştirin, içerikleri düzenleyin.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Anında Oluşturma</h3>
              <p className="text-slate-600">Tek bir prompt ile bölümler veya tüm sayfaları oluşturun. Gemini Flash hızıyla.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Yerel Çoklu Dil</h3>
              <p className="text-slate-600">Küresel erişim için tasarlandı. Aether çevirileri ve düzen ayarlamalarını otomatik yönetir.</p>
            </div>
             <div className="p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Token Ekonomisi</h3>
              <p className="text-slate-600">Sadece ürettiğiniz kadar ödeyin. Profesyonel araçlar için adil, şeffaf bir model.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;