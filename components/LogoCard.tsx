
import React, { useState } from 'react';
import { GeneratedLogo } from '../types';

interface LogoCardProps {
  logo: GeneratedLogo;
  onDownload: (url: string, format: 'png' | 'webp' | 'svg') => void;
  onDelete: (id: string) => void;
  onRefine: (logo: GeneratedLogo) => void;
  isActive?: boolean;
}

const LogoCard: React.FC<LogoCardProps> = ({ logo, onDownload, onDelete, onRefine, isActive }) => {
  const [showFormats, setShowFormats] = useState(false);

  return (
    <div className={`group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border-2 ${isActive ? 'border-[#04768A] ring-2 ring-[#04768A]/20' : 'border-slate-100'}`}>
      <div className="aspect-square relative overflow-hidden bg-slate-50 flex items-center justify-center">
        <img 
          src={logo.url} 
          alt="Generated Logo" 
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
          <div className="flex gap-2">
            <button 
              onClick={() => onRefine(logo)}
              className="w-10 h-10 rounded-full bg-white text-[#04768A] flex items-center justify-center hover:bg-[#04768A] hover:text-white transition-colors"
              title="Refine this design"
            >
              <i className="fas fa-magic"></i>
            </button>
            <button 
              onClick={() => onDelete(logo.id)}
              className="w-10 h-10 rounded-full bg-white text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
              title="Delete"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowFormats(!showFormats)}
              className="px-4 py-2 rounded-full bg-white text-slate-800 flex items-center gap-2 hover:bg-slate-100 transition-colors font-bold text-sm"
              title="Download Options"
            >
              <i className="fas fa-download"></i>
              Download
            </button>
            
            {showFormats && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-2xl overflow-hidden min-w-[140px] animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                <button 
                  onClick={() => { onDownload(logo.url, 'png'); setShowFormats(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100 flex items-center justify-between"
                >
                  PNG <span className="text-[10px] text-slate-400">Raster</span>
                </button>
                <button 
                  onClick={() => { onDownload(logo.url, 'webp'); setShowFormats(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100 flex items-center justify-between"
                >
                  WebP <span className="text-[10px] text-slate-400">Web</span>
                </button>
                <button 
                  onClick={() => { onDownload(logo.url, 'svg'); setShowFormats(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between font-semibold text-[#04768A]"
                >
                  SVG <span className="text-[10px] text-[#04768A]/50">Vector</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-3 border-t border-slate-50 flex justify-between items-center bg-white">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-tighter font-black">History Node</span>
          <span className="text-xs text-slate-600 font-medium">
            {new Date(logo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {isActive && (
          <span className="text-[10px] bg-[#04768A]/10 text-[#04768A] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
            Selected
          </span>
        )}
      </div>
      
      {showFormats && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setShowFormats(false)}
        />
      )}
    </div>
  );
};

export default LogoCard;
