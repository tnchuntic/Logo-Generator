
import React from 'react';
import { GeneratedLogo } from '../types';

interface LogoCardProps {
  logo: GeneratedLogo;
  onDownload: (url: string) => void;
  onDelete: (id: string) => void;
}

const LogoCard: React.FC<LogoCardProps> = ({ logo, onDownload, onDelete }) => {
  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
      <div className="aspect-square relative overflow-hidden bg-slate-50">
        <img 
          src={logo.url} 
          alt="Generated Logo" 
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
          <button 
            onClick={() => onDownload(logo.url)}
            className="w-10 h-10 rounded-full bg-white text-slate-800 flex items-center justify-center hover:bg-[#04768A] hover:text-white transition-colors"
            title="Download"
          >
            <i className="fas fa-download"></i>
          </button>
          <button 
             onClick={() => onDelete(logo.id)}
            className="w-10 h-10 rounded-full bg-white text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
            title="Delete"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div className="p-3 border-t border-slate-50 flex justify-between items-center">
        <span className="text-xs text-slate-400">
          {new Date(logo.timestamp).toLocaleTimeString()}
        </span>
        <div className="flex gap-1">
           <span className="w-2 h-2 rounded-full bg-[#002951]"></span>
           <span className="w-2 h-2 rounded-full bg-[#04768A]"></span>
           <span className="w-2 h-2 rounded-full bg-[#AEC2AF]"></span>
           <span className="w-2 h-2 rounded-full bg-[#C2A3CC]"></span>
        </div>
      </div>
    </div>
  );
};

export default LogoCard;
