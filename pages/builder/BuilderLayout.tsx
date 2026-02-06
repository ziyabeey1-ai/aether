import React, { useState, useRef } from 'react';
import { SectionType, GeminiModel, SectionData } from '../../types';
import { LANGUAGES, TOKEN_COSTS } from '../../constants';
import { Button } from '../../components/ui/Button';
import { SectionRenderer } from '../../components/builder/SectionRenderer';
import { generateSectionImage } from '../../services/geminiService';
import { useBuilder } from '../../contexts/BuilderContext';
import { uploadImageToLocalStorage } from '../../services/imageService';
import { saveProject } from '../../services/storageService';
import { useError } from '../../contexts/ErrorContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { StyleEditor } from '../../components/builder/StyleEditor';

// DnD Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Section Component
const SortableSection: React.FC<{
  section: SectionData;
  idx: number;
  selectedSectionId: string | null;
  selectSection: (id: string) => void;
}> = ({ section, idx, selectedSectionId, selectSection }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => selectSection(section.id)}
      className={`p-2 rounded text-sm cursor-pointer flex items-center justify-between group ${
        selectedSectionId === section.id
          ? 'bg-violet-900/50 text-white border border-violet-500/50'
          : 'hover:bg-slate-800'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">#{idx + 1}</span>
        <span className="truncate w-24">{section.type}</span>
      </div>
      <svg
        {...listeners}
        {...attributes}
        className="w-4 h-4 opacity-50 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
      </svg>
    </div>
  );
};

const BuilderLayout: React.FC = () => {
  const { 
    project, 
    tokens, 
    isGenerating, 
    selectedSectionId, 
    selectSection, 
    setLanguage, 
    addSection,
    rollSection,
    updateSectionImage,
    translateMissingContent,
    publishSite,
    undo,
    redo,
    canUndo,
    canRedo,
    reorderSections,
    changeVariant,
    updateSectionStyles
  } = useBuilder();

  const { showError } = useError();
  
  // UI Local State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [sectionType, setSectionType] = useState<SectionType>(SectionType.HERO);
  
  // Responsive Preview State
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const viewportWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  };

  const viewportIcons = {
    desktop: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    tablet: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    mobile: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )
  };
  
  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K'>('1K');
  const [imageRatio, setImageRatio] = useState<'1:1' | '16:9' | '9:16'>('16:9');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = project.draftSections.findIndex(s => s.id === active.id);
      const newIndex = project.draftSections.findIndex(s => s.id === over.id);
      reorderSections(oldIndex, newIndex);
    }
  };

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    'mod+z': undo,
    'mod+shift+z': redo,
    'mod+s': () => {
      saveProject(project);
      showError('Project saved!');
    },
    'escape': () => {
      selectSection(null);
    }
  });

  const handleAddSection = () => {
    setAiModalOpen(true);
    setPromptText('');
  };

  const onAddSubmit = async () => {
    await addSection(sectionType, promptText);
    setAiModalOpen(false);
  };

  const handleGenerateImage = async () => {
     if (!selectedSectionId) return;
     try {
       const imgUrl = await generateSectionImage({
         prompt: imagePrompt,
         aspectRatio: imageRatio,
         size: imageSize
       });
       updateSectionImage(selectedSectionId, imgUrl, TOKEN_COSTS.GENERATE_IMAGE);
       setImageModalOpen(false);
     } catch(e) {
       console.error(e);
       showError("Image generation failed");
     }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedSectionId || !e.target.files?.[0]) return;
    
    try {
      const file = e.target.files[0];
      const imageUrl = await uploadImageToLocalStorage(file);
      updateSectionImage(selectedSectionId, imageUrl, 0); // No token cost for uploads
      setImageModalOpen(false);
    } catch (error) {
      showError('Failed to upload image');
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR: Layers & Tools */}
      <aside className="w-64 bg-studio-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-2xl z-20">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <div className="w-6 h-6 bg-violet-500 rounded flex items-center justify-center text-white font-bold text-xs">A</div>
          <span className="font-semibold text-white tracking-wide">Builder Mode</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <div className="space-y-1">
            <h3 className="text-xs uppercase font-bold text-slate-500 mb-2">Sections</h3>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={project.draftSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {project.draftSections.map((section, idx) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    idx={idx}
                    selectedSectionId={selectedSectionId}
                    selectSection={selectSection}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>

          <button 
            onClick={handleAddSection}
            className="w-full py-3 border-2 border-dashed border-slate-700 rounded-lg hover:border-slate-500 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add AI Section
          </button>
        </div>

        <div className="p-4 border-t border-slate-800 bg-studio-950">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Tokens</span>
            <span className="text-emerald-400 font-bold font-mono">{tokens}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(tokens/10, 100)}%` }}></div>
          </div>
        </div>
      </aside>

      {/* CENTER: Canvas */}
      <main className="flex-1 flex flex-col relative min-w-0">
        
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-10">
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                  <button
                    key={device}
                    onClick={() => setViewport(device)}
                    className={`p-2 rounded transition-colors ${
                      viewport === device
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title={device.charAt(0).toUpperCase() + device.slice(1)}
                  >
                    {viewportIcons[device]}
                  </button>
                ))}
             </div>
             <div className="w-px h-6 bg-slate-200 mx-2"></div>
             <select 
               value={project.activeLanguage} 
               onChange={(e) => setLanguage(e.target.value)}
               className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none cursor-pointer"
             >
               {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
             </select>
          </div>

          <div className="flex items-center gap-3">
             <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo}>
               <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
               Undo
             </Button>
             <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
              Redo
            </Button>
             <Button 
                variant="primary" 
                size="sm" 
                onClick={() => selectedSectionId && rollSection(selectedSectionId)}
                disabled={!selectedSectionId}
                isLoading={isGenerating}
                className="bg-gradient-to-r from-violet-600 to-indigo-600"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                AI Roll
             </Button>
             <Button variant="secondary" size="sm" onClick={publishSite}>Publish</Button>
          </div>
        </header>

        {/* Canvas Area */}
        <div 
          className="flex-1 overflow-y-auto bg-slate-100 p-8 flex justify-center"
          onClick={() => selectSection(null)}
        >
           <div 
            className="bg-white shadow-2xl min-h-[800px] transition-all duration-300 origin-top"
            style={{ width: viewportWidths[viewport], maxWidth: '100%' }}
           >
              {project.draftSections.map(section => (
                <SectionRenderer 
                  key={section.id} 
                  section={section} 
                  language={project.activeLanguage}
                  isSelected={selectedSectionId === section.id}
                  onClick={() => selectSection(section.id)}
                  onEditImage={(e) => {
                    setImageModalOpen(true);
                  }}
                  onTranslate={(e) => {
                    translateMissingContent(section.id);
                  }}
                />
              ))}
              
              {project.draftSections.length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-400">
                  <p>Start by adding a section from the sidebar.</p>
                </div>
              )}
           </div>
        </div>
      </main>

      {/* RIGHT PANEL: Settings */}
      {selectedSectionId && (
        <aside className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto z-20 shadow-xl">
           <div className="mb-6 flex justify-between items-center">
             <h3 className="font-bold text-slate-900">Section Properties</h3>
             <button onClick={() => selectSection(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
           </div>
           
           <div className="space-y-6">
             <div>
               <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">AI Controls</label>
               <p className="text-xs text-slate-500 mb-3">Roll to regenerate variants while keeping the core message.</p>
               <Button onClick={() => rollSection(selectedSectionId)} disabled={isGenerating} variant="primary" className="w-full">
                 {isGenerating ? 'Thinking...' : 'Roll Variant (5 Tokens)'}
               </Button>
             </div>

             <hr className="border-slate-100" />

             <div>
               <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Variant</label>
               <div className="grid grid-cols-2 gap-2">
                 {(['default', 'modern', 'minimal', 'bold'] as const).map(v => {
                   const section = project.draftSections.find(s => s.id === selectedSectionId);
                   const isActive = section?.variant === v;
                   return (
                     <button 
                       key={v}
                       onClick={() => changeVariant(selectedSectionId, v)}
                       className={`px-3 py-2 border rounded text-sm transition-colors text-left capitalize ${
                         isActive
                           ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                           : 'border-slate-200 hover:border-indigo-500 hover:bg-indigo-50'
                       }`}
                     >
                       {v}
                     </button>
                   );
                 })}
               </div>
             </div>

             <hr className="border-slate-100" />

             {(() => {
               const section = project.draftSections.find(s => s.id === selectedSectionId);
               if (!section) return null;
               return (
                 <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                     Section Styles
                   </label>
                   <StyleEditor
                     styles={section.styles}
                     onChange={(newStyles) => updateSectionStyles(selectedSectionId, newStyles)}
                   />
                 </div>
               );
             })()}

           </div>
        </aside>
      )}

      {/* MODAL: Add AI Section */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
             <div className="p-6 border-b border-slate-100">
               <h3 className="text-xl font-bold text-slate-900">Generate New Section</h3>
               <p className="text-slate-500 text-sm">Choose a section type and describe what you need.</p>
             </div>
             <div className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Section Type</label>
                  <select
                    value={sectionType}
                    onChange={(e) => setSectionType(e.target.value as SectionType)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value={SectionType.HERO}>🎯 Hero Section</option>
                    <option value={SectionType.FEATURES}>⭐ Features</option>
                    <option value={SectionType.CONTENT}>📝 Content</option>
                    <option value={SectionType.PRICING}>💰 Pricing</option>
                    <option value={SectionType.CTA}>🚀 Call to Action</option>
                    <option value={SectionType.GALLERY}>🖼️ Gallery</option>
                    <option value={SectionType.FOOTER}>📄 Footer</option>
                  </select>
                </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Description (Optional)</label>
                 <textarea 
                   value={promptText}
                   onChange={(e) => setPromptText(e.target.value)}
                   placeholder="e.g. A dark-themed features section for a SaaS product highlighting security and speed..."
                   className="w-full h-32 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                 ></textarea>
               </div>
               <div className="flex justify-between items-center text-xs text-slate-400">
                 <span>Model: Gemini 3 Pro</span>
                 <span>Cost: 10 Tokens</span>
               </div>
             </div>
             <div className="p-6 bg-slate-50 flex justify-end gap-3">
               <Button variant="ghost" onClick={() => setAiModalOpen(false)}>Cancel</Button>
               <Button variant="premium" onClick={onAddSubmit} isLoading={isGenerating}>Generate Section</Button>
             </div>
           </div>
        </div>
      )}

      {/* MODAL: Image Generation & Upload */}
      {imageModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
             <div className="p-6 border-b border-slate-100">
               <h3 className="text-xl font-bold text-slate-900">Add Image</h3>
             </div>
             <div className="p-6 space-y-8">
               
               {/* Upload Option */}
               <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-500 transition-colors flex flex-col items-center gap-2"
                  >
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">Upload Image</span>
                    <span className="text-xs text-slate-500">Free</span>
                  </button>
                  
                  <div className="p-6 border-2 border-dashed border-indigo-100 bg-indigo-50 rounded-lg flex flex-col items-center gap-2 text-center">
                    <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm font-medium text-indigo-900">AI Generation Below</span>
                  </div>
               </div>
               
               <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />

               <div className="border-t border-slate-100 pt-6">
                 <h4 className="text-sm font-bold text-slate-900 mb-4">Generate with AI</h4>
                 <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Prompt</label>
                     <input 
                       type="text" 
                       value={imagePrompt} 
                       onChange={(e) => setImagePrompt(e.target.value)}
                       className="w-full border p-2 rounded"
                       placeholder="A futuristic city skyline..."
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Aspect Ratio</label>
                        <select value={imageRatio} onChange={(e) => setImageRatio(e.target.value as any)} className="w-full border p-2 rounded">
                          <option value="1:1">Square (1:1)</option>
                          <option value="16:9">Landscape (16:9)</option>
                          <option value="9:16">Portrait (9:16)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Size</label>
                        <select value={imageSize} onChange={(e) => setImageSize(e.target.value as any)} className="w-full border p-2 rounded">
                          <option value="1K">Standard (1K)</option>
                          <option value="2K">High Res (2K)</option>
                        </select>
                      </div>
                   </div>
                   <div className="flex justify-end pt-2">
                      <Button variant="premium" onClick={handleGenerateImage} isLoading={isGenerating}>Generate (25 Tokens)</Button>
                   </div>
                 </div>
               </div>
             </div>
             <div className="p-6 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
               <Button variant="ghost" onClick={() => setImageModalOpen(false)}>Cancel</Button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default BuilderLayout;