
import React, { useState } from 'react';
import { GeneratedLogo } from '../types';

interface LogoCardProps {
  logo: GeneratedLogo;
  onDownload: (url: string, format: 'png' | 'webp' | 'svg') => void;
  onDelete: (id: string) => void;
}

const LogoCard: React.FC<LogoCardProps> = ({ logo, onDownload, onDelete }) => {
  const [showFormats, setShowFormats] = useState(false);

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
      <div className="aspect-square relative overflow-hidden bg-slate-50 flex items-center justify-center">
        <img 
          src={logo.url} 
          alt="Generated Logo" 
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowFormats(!showFormats)}
              className="px-4 py-2 rounded-full bg-white text-slate-800 flex items-center gap-2 hover:bg-[#04768A] hover:text-white transition-colors font-bold text-sm"
              title="Download Options"
            >
              <i className="fas fa-download"></i>
              Download
            </button>
            
            {showFormats && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl overflow-hidden min-w-[120px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                <button 
                  onClick={() => { onDownload(logo.url, 'png'); setShowFormats(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100 flex items-center justify-between"
                >
                  PNG <span className="text-[10px] text-slate-400">High Res</span>
                </button>
                <button 
                  onClick={() => { onDownload(logo.url, 'webp'); setShowFormats(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100 flex items-center justify-between"
                >
                  WebP <span className="text-[10px] text-slate-400">Optimized</span>
                </button>
                <button 
                  onClick={() => { onDownload(logo.url, 'svg'); setShowFormats(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  SVG <span className="text-[10px] text-slate-400">Scalable</span>
                </button>
              </div>
            )}
          </div>

          <button 
             onClick={() => onDelete(logo.id)}
            className="w-10 h-10 rounded-full bg-white text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
            title="Delete"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div className="p-3 border-t border-slate-50 flex justify-between items-center bg-white">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-tighter font-bold">Concept Date</span>
          <span className="text-xs text-slate-600">
            {new Date(logo.timestamp).toLocaleDateString()}
          </span>
        </div>
        <div className="flex gap-1">
           <span className="w-2 h-2 rounded-full opacity-60" style={{ backgroundColor: '#002951' }}></span>
           <span className="w-2 h-2 rounded-full opacity-60" style={{ backgroundColor: '#04768A' }}></span>
           <span className="w-2 h-2 rounded-full opacity-60" style={{ backgroundColor: '#AEC2AF' }}></span>
           <span className="w-2 h-2 rounded-full opacity-60" style={{ backgroundColor: '#C2A3CC' }}></span>
        </div>
      </div>
      
      {/* Format overlay close trigger */}
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
