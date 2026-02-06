import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PricingPage: React.FC = () => {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Şeffaf ve Esnek Fiyatlandırma</h1>
          <p className="text-xl text-slate-600">Gizli ücret yok. İstediğiniz zaman iptal edin.</p>
          
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!annual ? 'text-slate-900' : 'text-slate-500'}`}>Aylık</span>
            <button 
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${annual ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${annual ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-slate-900' : 'text-slate-500'}`}>
              Yıllık <span className="text-green-500 text-xs font-bold ml-1">%20 İndirim</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-shadow flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">Başlangıç</h3>
              <p className="text-slate-500 text-sm mt-2">Denemek ve kişisel projeler için.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900">₺0</span>
              <span className="text-slate-500">/ay</span>
            </div>
            <Link to="/create" className="block w-full py-3 px-4 bg-slate-100 text-slate-700 text-center font-semibold rounded-lg hover:bg-slate-200 transition-colors mb-8">
              Ücretsiz Başla
            </Link>
            <ul className="space-y-4 flex-1">
              {[
                '1 Web Sitesi',
                'Aether alt domain (site.aether.com)',
                'Temel AI özellikleri',
                'Standart şablonlar',
                'Topluluk desteği'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Tier */}
          <div className="border-2 border-indigo-600 rounded-2xl p-8 shadow-2xl relative flex flex-col transform md:-translate-y-4">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
              POPÜLER
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">Pro</h3>
              <p className="text-slate-500 text-sm mt-2">Freelancerlar ve küçük işletmeler için.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900">₺{annual ? '290' : '350'}</span>
              <span className="text-slate-500">/ay</span>
            </div>
            <Link to="/create" className="block w-full py-3 px-4 bg-indigo-600 text-white text-center font-semibold rounded-lg hover:bg-indigo-700 transition-colors mb-8">
              Hemen Başla
            </Link>
            <ul className="space-y-4 flex-1">
              {[
                '5 Web Sitesi',
                'Özel Domain Bağlama',
                'Gelişmiş AI (GPT-4 / Gemini Ultra)',
                'SEO Optimizasyon Araçları',
                'Premium Analitik',
                'Öncelikli Destek',
                'Aether markasını kaldırma'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                  <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Agency Tier */}
          <div className="border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-shadow flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">Ajans</h3>
              <p className="text-slate-500 text-sm mt-2">Çoklu müşteri yönetimi için.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900">₺{annual ? '990' : '1200'}</span>
              <span className="text-slate-500">/ay</span>
            </div>
            <Link to="/create" className="block w-full py-3 px-4 bg-white border-2 border-slate-200 text-slate-700 text-center font-semibold rounded-lg hover:border-indigo-600 hover:text-indigo-600 transition-colors mb-8">
              İletişime Geç
            </Link>
            <ul className="space-y-4 flex-1">
              {[
                'Sınırsız Web Sitesi',
                'Beyaz Etiket (White Label)',
                'Takım Yönetimi & İzinler',
                'API Erişimi',
                'Özel Müşteri Temsilcisi',
                'Müşteri Faturalandırma Paneli'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-bold mb-6">Sıkça Sorulan Sorular</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-2">İstediğim zaman plan değiştirebilir miyim?</h4>
              <p className="text-slate-600 text-sm">Evet, dilediğiniz zaman hesabınızdan planınızı yükseltebilir veya düşürebilirsiniz. Yıllık planlarda kullanılmayan süre iade edilmez.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">Öğrenci indirimi var mı?</h4>
              <p className="text-slate-600 text-sm">Evet, .edu uzantılı mail adresiyle kayıt olan öğrencilere %50 indirim sağlıyoruz. Destek ekibimize yazmanız yeterli.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">Hosting dahil mi?</h4>
              <p className="text-slate-600 text-sm">Evet! Tüm planlarımızda güvenli, hızlı ve sınırsız bant genişliğine sahip hosting hizmeti dahildir. Ekstra sunucu almanıza gerek yok.</p>
            </div>
             <div>
              <h4 className="font-bold text-lg mb-2">Para iade garantisi var mı?</h4>
              <p className="text-slate-600 text-sm">Pro planımızda ilk 14 gün içinde memnun kalmazsanız sorgusuz sualsiz ücret iadesi yapıyoruz.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;