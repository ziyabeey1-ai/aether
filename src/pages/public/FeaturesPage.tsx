import React from 'react';
import { Link } from 'react-router-dom';

const FeaturesPage: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div className="bg-slate-900 text-white pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <h1 className="text-4xl md:text-6xl font-bold mb-6">Sadece bir builder değil, <br/><span className="text-indigo-400">akıllı bir tasarım ortağı.</span></h1>
           <p className="text-xl text-slate-300 max-w-2xl mx-auto">Aether, modern web teknolojilerini yapay zeka ile birleştirerek size eşsiz bir deneyim sunar.</p>
        </div>
      </div>

      {/* Feature Blocks */}
      <div className="py-24 space-y-24">
        
        {/* Block 1: AI Generation */}
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
           <div>
              <div className="inline-block p-3 bg-indigo-100 text-indigo-600 rounded-xl mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Gemini 3 Pro ile İçerik Üretimi</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                Boş sayfa sendromuna son. Sadece ne istediğinizi söyleyin, AI sizin için başlıkları, paragrafları ve harekete geçirici mesajları (CTA) saniyeler içinde yazsın.
              </p>
              <ul className="space-y-3">
                {['Marka tonuna uygun dil', 'SEO uyumlu metinler', 'Otomatik çeviri desteği'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
           </div>
           <div className="bg-slate-100 rounded-2xl p-8 aspect-video flex items-center justify-center shadow-xl">
              <span className="text-slate-400 font-semibold">AI Demo UI Screenshot</span>
           </div>
        </div>

        {/* Block 2: Visual Editing */}
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center md:flex-row-reverse">
           <div className="order-2 md:order-1 bg-slate-100 rounded-2xl p-8 aspect-video flex items-center justify-center shadow-xl">
              <span className="text-slate-400 font-semibold">Drag & Drop UI Screenshot</span>
           </div>
           <div className="order-1 md:order-2">
              <div className="inline-block p-3 bg-purple-100 text-purple-600 rounded-xl mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Tam Kontrollü Düzenleme</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                AI başlasın, siz bitirin. Oluşturulan her bölüm tamamen düzenlenebilir. Renkleri, fontları, görselleri ve yerleşimi sürükle-bırak kolaylığıyla değiştirin.
              </p>
              <ul className="space-y-3">
                 {['Canlı önizleme', 'Global stil yönetimi', 'Özel görsel yükleme'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
           </div>
        </div>

        {/* Block 3: Performance */}
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
           <div>
              <div className="inline-block p-3 bg-emerald-100 text-emerald-600 rounded-xl mb-6">
                 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Işık Hızında Performans</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                Aether ile oluşturulan siteler, modern web standartlarına (Core Web Vitals) tam uyumludur. Gereksiz kod yığınları yok, sadece temiz HTML/CSS.
              </p>
           </div>
           <div className="bg-slate-100 rounded-2xl p-8 aspect-video flex items-center justify-center shadow-xl">
              <span className="text-slate-400 font-semibold">Lighthouse Score 100/100</span>
           </div>
        </div>

      </div>

      <div className="py-20 bg-indigo-50 text-center">
        <h2 className="text-3xl font-bold mb-6">Denemeye hazır mısınız?</h2>
        <Link to="/create" className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
          Ücretsiz Site Oluştur
        </Link>
      </div>
    </div>
  );
};

export default FeaturesPage;