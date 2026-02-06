import React, { useState } from 'react';

interface ShowcaseItem {
  id: number;
  title: string;
  category: string;
  image: string;
}

const ShowcasePage: React.FC = () => {
  const [filter, setFilter] = useState('All');

  const items: ShowcaseItem[] = [
    { id: 1, title: 'Modern SaaS Dashboard', category: 'SaaS', image: 'https://picsum.photos/seed/s1/600/400' },
    { id: 2, title: 'Creative Photography', category: 'Portfolio', image: 'https://picsum.photos/seed/s2/600/400' },
    { id: 3, title: 'Organic Coffee Shop', category: 'E-commerce', image: 'https://picsum.photos/seed/s3/600/400' },
    { id: 4, title: 'Tech Startup Landing', category: 'Landing Page', image: 'https://picsum.photos/seed/s4/600/400' },
    { id: 5, title: 'Minimalist Blog', category: 'Blog', image: 'https://picsum.photos/seed/s5/600/400' },
    { id: 6, title: 'Law Firm Corporate', category: 'Business', image: 'https://picsum.photos/seed/s6/600/400' },
    { id: 7, title: 'Fitness App Promo', category: 'Landing Page', image: 'https://picsum.photos/seed/s7/600/400' },
    { id: 8, title: 'Digital Agency', category: 'Business', image: 'https://picsum.photos/seed/s8/600/400' },
    { id: 9, title: 'Handmade Ceramics', category: 'E-commerce', image: 'https://picsum.photos/seed/s9/600/400' },
  ];

  const categories = ['All', 'Business', 'Portfolio', 'E-commerce', 'Landing Page', 'Blog', 'SaaS'];
  
  const filteredItems = filter === 'All' 
    ? items 
    : items.filter(item => item.category === filter);

  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Aether Vitrini</h1>
          <p className="text-xl text-slate-600">Topluluğumuz tarafından oluşturulan ilham verici web siteleri.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === cat 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map(item => (
            <div key={item.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="aspect-video bg-slate-200 overflow-hidden relative">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-sm hover:bg-slate-100">Önizle</button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-500">{item.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            Bu kategoride henüz vitrin projesi bulunmuyor.
          </div>
        )}

        <div className="text-center mt-20 p-10 bg-indigo-900 rounded-3xl text-white">
          <h2 className="text-3xl font-bold mb-4">Sizin siteniz de burada olsun!</h2>
          <p className="mb-8 opacity-80">Aether ile harikalar yaratanlar arasına katılın.</p>
          <a href="/create" className="px-8 py-3 bg-white text-indigo-900 rounded-lg font-bold hover:bg-indigo-50 transition-colors">
            Hemen Başla
          </a>
        </div>
      </div>
    </div>
  );
};

export default ShowcasePage;