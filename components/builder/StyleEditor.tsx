import React from 'react';
import { SectionStyles } from '../../types';

interface StyleEditorProps {
  styles: SectionStyles;
  onChange: (styles: SectionStyles) => void;
}

export const StyleEditor: React.FC<StyleEditorProps> = ({ styles, onChange }) => {
  const bgColors = [
    { label: 'White', value: 'bg-white', color: '#ffffff' },
    { label: 'Slate', value: 'bg-slate-50', color: '#f8fafc' },
    { label: 'Indigo', value: 'bg-indigo-50', color: '#eef2ff' },
    { label: 'Dark', value: 'bg-slate-900', color: '#0f172a' },
  ];

  const textColors = [
    { label: 'Dark', value: 'text-slate-900', color: '#0f172a' },
    { label: 'Gray', value: 'text-slate-600', color: '#475569' },
    { label: 'White', value: 'text-white', color: '#ffffff' },
  ];

  const paddings = [
    { label: 'Small', value: 'py-12' },
    { label: 'Medium', value: 'py-20' },
    { label: 'Large', value: 'py-32' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
          Background Color
        </label>
        <div className="grid grid-cols-2 gap-2">
          {bgColors.map(({ label, value, color }) => (
            <button
              key={value}
              onClick={() => onChange({ ...styles, backgroundColor: value })}
              className={`px-3 py-2 border rounded text-sm flex items-center gap-2 ${
                styles.backgroundColor === value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                className="w-4 h-4 rounded border border-slate-200"
                style={{ backgroundColor: color }}
              />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
          Text Color
        </label>
        <div className="grid grid-cols-2 gap-2">
          {textColors.map(({ label, value, color }) => (
            <button
              key={value}
              onClick={() => onChange({ ...styles, textColor: value })}
              className={`px-3 py-2 border rounded text-sm flex items-center gap-2 ${
                styles.textColor === value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                className="w-4 h-4 rounded border border-slate-200"
                style={{ backgroundColor: color }}
              />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
          Text Alignment
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['left', 'center', 'right'] as const).map(align => (
            <button
              key={align}
              onClick={() => onChange({ ...styles, align })}
              className={`px-3 py-2 border rounded text-sm capitalize ${
                styles.align === align
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
          Padding
        </label>
        <div className="grid grid-cols-3 gap-2">
          {paddings.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onChange({ ...styles, padding: value })}
              className={`px-3 py-2 border rounded text-sm ${
                styles.padding === value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};