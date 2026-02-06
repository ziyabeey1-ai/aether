import React from 'react';
import { SectionData, SectionType } from '../../types';

interface SectionRendererProps {
  section: SectionData;
  language: string; // The active language to render
  isSelected: boolean;
  onClick: () => void;
  onEditImage?: (e: React.MouseEvent) => void;
  onTranslate?: (e: React.MouseEvent) => void;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({ 
  section, 
  language,
  isSelected, 
  onClick, 
  onEditImage,
  onTranslate
}) => {
  const { styles, variant } = section;
  
  // Resolve content for the active language
  const content = section.content[language];
  const defaultContent = Object.values(section.content)[0]; // Fallback

  // If content is missing for this language, show placeholder/fallback
  const isMissingTranslation = !content;
  const displayContent = content || defaultContent;

  if (!displayContent) return <div className="p-8 text-center text-red-500">Error: Corrupted Section Data</div>;

  // Dynamic Tailwind classes construction
  const containerClasses = `relative group w-full transition-all duration-300 ${styles.backgroundColor} ${styles.textColor} ${styles.padding} ${isSelected ? 'ring-2 ring-violet-500 ring-offset-2 z-10' : 'hover:ring-1 hover:ring-indigo-200'}`;
  
  const alignClass = styles.align === 'center' ? 'text-center items-center' : styles.align === 'right' ? 'text-right items-end' : 'text-left items-start';

  // Specific renderers based on type
  const renderContent = () => {
    switch (section.type) {
      case SectionType.HERO:
        return (
          <div className={`container mx-auto px-4 flex flex-col ${alignClass} max-w-5xl`}>
             {variant === 'modern' && <span className="mb-4 inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold tracking-wider uppercase">New Release</span>}
             <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight tracking-tight">
               {displayContent.headline}
             </h1>
             <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl leading-relaxed">
               {displayContent.subheadline}
             </p>
             <div className="flex gap-4">
               {displayContent.buttonText && (
                 <button className="px-8 py-4 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-lg">
                   {displayContent.buttonText}
                 </button>
               )}
               {variant === 'bold' && (
                 <button className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                   Learn More
                 </button>
               )}
             </div>
             {displayContent.imageUrl && (
                <div className="mt-12 relative rounded-2xl overflow-hidden shadow-2xl w-full group/image">
                  <img src={displayContent.imageUrl} alt="Hero" className="w-full object-cover max-h-[600px]" />
                  {isSelected && (
                    <button onClick={onEditImage} className="absolute top-4 right-4 bg-white/90 p-2 rounded-lg text-xs font-bold shadow-md opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                       Edit with AI
                    </button>
                  )}
                </div>
             )}
          </div>
        );

      case SectionType.FEATURES:
        return (
          <div className="container mx-auto px-4">
            <div className={`max-w-3xl mb-12 ${styles.align === 'center' ? 'mx-auto text-center' : ''}`}>
               <h2 className="text-3xl font-bold mb-4">{displayContent.headline}</h2>
               <p className="text-lg opacity-80">{displayContent.subheadline}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayContent.items?.map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white/50 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold mb-2 text-slate-900">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        // Default text content renderer
        return (
            <div className={`container mx-auto px-4 flex flex-col ${alignClass} max-w-4xl`}>
                <h2 className="text-3xl font-bold mb-6">{displayContent.headline}</h2>
                <div className="prose prose-lg text-current opacity-90 max-w-none">
                    {displayContent.body}
                </div>
            </div>
        );
    }
  };

  return (
    <section 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={containerClasses}
    >
      {/* Overlay for selection */}
      {isSelected && (
        <div className="absolute top-0 right-0 p-2 flex gap-2 z-50">
           <span className="bg-violet-600 text-white text-xs px-2 py-1 rounded shadow-sm">Active: {section.type}</span>
        </div>
      )}

      {/* Overlay for missing translation */}
      {isMissingTranslation && (
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center z-40 border-2 border-dashed border-amber-400">
           <div className="bg-white p-4 rounded-lg shadow-xl text-center">
             <div className="text-amber-500 font-bold mb-2">Translation Missing</div>
             <p className="text-xs text-slate-500 mb-3">Content is showing in fallback language.</p>
             <button 
               onClick={(e) => { e.stopPropagation(); onTranslate && onTranslate(e); }}
               className="bg-amber-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-amber-600 transition-colors"
             >
               Auto-Translate with AI
             </button>
           </div>
        </div>
      )}
      
      {renderContent()}
    </section>
  );
};
