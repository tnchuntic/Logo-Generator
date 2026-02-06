
import React, { useState, useEffect } from 'react';
import { LogoStyle, LogoGenerationParams, GeneratedLogo, DEFAULT_COLORS } from './types';
import { generateLogo, traceImageToSVG, refineLogo } from './services/geminiService';
import Button from './components/Button';
import LogoCard from './components/LogoCard';

const App: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVectorizing, setIsVectorizing] = useState(false);
  const [history, setHistory] = useState<GeneratedLogo[]>([]);
  const [selectedLogo, setSelectedLogo] = useState<GeneratedLogo | null>(null);
  const [refinementText, setRefinementText] = useState('');
  
  const [params, setParams] = useState<LogoGenerationParams>({
    brandName: 'Life Hub',
    slogan: 'Connected Living',
    style: LogoStyle.MINIMALIST,
    concept: 'Connectivity, unity, and modern growth.',
    aspectRatio: '1:1',
    additionalPrompt: '',
    colors: [...DEFAULT_COLORS]
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('logo-studio-history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('logo-studio-history', JSON.stringify(history));
  }, [history]);

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...params.colors];
    newColors[index] = color;
    setParams(p => ({ ...p, colors: newColors }));
  };

  const handleMainAction = async () => {
    if (!params.brandName.trim()) {
      setError("Please enter a Brand Name");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      let imageUrl: string;
      if (selectedLogo && refinementText.trim()) {
        // REFINEMENT PATH
        imageUrl = await refineLogo(selectedLogo.url, refinementText, params);
      } else {
        // FRESH GENERATION PATH
        imageUrl = await generateLogo(params);
      }

      const newLogo: GeneratedLogo = {
        id: crypto.randomUUID(),
        url: imageUrl,
        prompt: selectedLogo ? `Refinement: ${refinementText}` : `${params.brandName} - ${params.concept}`,
        timestamp: Date.now()
      };
      
      setHistory(prev => [newLogo, ...prev]);
      // Clear refinement after success
      setRefinementText('');
      setSelectedLogo(null);
    } catch (err: any) {
      setError(err.message || 'Action failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadLogo = async (url: string, format: 'png' | 'webp' | 'svg') => {
    const fileName = `${params.brandName.replace(/\s+/g, '-').toLowerCase()}-logo`;
    setError(null);

    try {
      if (format === 'svg') {
        setIsVectorizing(true);
        const svgContent = await traceImageToSVG(url, params.brandName);
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${fileName}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
        setIsVectorizing(false);
      } else if (format === 'webp') {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const webpUrl = canvas.toDataURL('image/webp', 0.9);
            const link = document.createElement('a');
            link.href = webpUrl;
            link.download = `${fileName}.webp`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        };
        img.src = url;
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      setError("Download failed. Falling back to PNG.");
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsVectorizing(false);
    }
  };

  const deleteLogo = (id: string) => {
    setHistory(prev => prev.filter(logo => logo.id !== id));
    if (selectedLogo?.id === id) setSelectedLogo(null);
  };

  const toggleRefine = (logo: GeneratedLogo) => {
    if (selectedLogo?.id === logo.id) {
      setSelectedLogo(null);
    } else {
      setSelectedLogo(logo);
      // Optional: scroll to refinement input
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* Sidebar Controls */}
      <aside className="w-full md:w-[400px] bg-white border-r border-slate-200 p-6 flex flex-col gap-6 h-screen sticky top-0 overflow-y-auto z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#002951] flex items-center justify-center text-white font-bold text-xl shadow-lg">
            B
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-800">BrandBuilder</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Studio Suite</p>
          </div>
        </div>

        <section className="flex flex-col gap-5">
          {/* Identity Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brand Identity</h3>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700">Brand Name</label>
              <input 
                type="text"
                value={params.brandName}
                onChange={(e) => setParams(p => ({ ...p, brandName: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#04768A] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700">Slogan (Optional)</label>
              <input 
                type="text"
                value={params.slogan}
                onChange={(e) => setParams(p => ({ ...p, slogan: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#04768A] outline-none transition-all"
              />
            </div>
          </div>

          {/* Refinement Section (Conditional) */}
          {selectedLogo && (
            <div className="bg-[#04768A]/5 p-4 rounded-xl border border-[#04768A]/20 space-y-3 animate-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-[#04768A] uppercase tracking-wider">Refine Selection</h3>
                <button onClick={() => setSelectedLogo(null)} className="text-slate-400 hover:text-rose-500">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1 text-slate-500 uppercase">Update Instructions</label>
                <textarea 
                  value={refinementText}
                  onChange={(e) => setRefinementText(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#04768A]/30 rounded-lg focus:ring-2 focus:ring-[#04768A] outline-none min-h-[100px] text-sm resize-none shadow-inner"
                  placeholder="e.g. 'Remove the dots', 'Change the icon to a star', 'Make text larger'..."
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Gemini will use the selected design as a base and apply your specific requests.
              </p>
            </div>
          )}

          {/* Visual Styles (Only if not in focused refinement or just always there) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Style Controls</h3>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700">Design Aesthetic</label>
              <select 
                value={params.style}
                onChange={(e) => setParams(p => ({ ...p, style: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#04768A] outline-none appearance-none"
              >
                {Object.values(LogoStyle).map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Color Palette</h3>
            <div className="flex gap-3">
              {params.colors.map((color, idx) => (
                <div key={idx} className="flex-1">
                  <div className="relative group">
                    <input 
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(idx, e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div 
                      className="w-full h-10 rounded-lg shadow-sm border border-slate-200 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  <input 
                    type="text"
                    value={color}
                    onChange={(e) => handleColorChange(idx, e.target.value)}
                    className="mt-1 w-full text-[10px] text-center font-mono border-none p-0 bg-transparent text-slate-400 uppercase focus:text-slate-700 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-2">
            <Button 
              onClick={handleMainAction} 
              isLoading={isGenerating} 
              className="w-full py-4 text-lg" 
              variant={selectedLogo ? "secondary" : "primary"}
              icon={selectedLogo ? "fa-sparkles" : "fa-wand-magic-sparkles"}
            >
              {selectedLogo ? "Refine Concept" : "Create New Logo"}
            </Button>
            {error && <p className="mt-3 text-sm text-rose-500 text-center font-medium bg-rose-50 py-2 rounded-lg">{error}</p>}
          </div>
        </section>
      </aside>

      {/* Main Display Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {isVectorizing && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-[#002951] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold border-2 border-white/20">
              <i className="fas fa-microchip animate-pulse"></i>
              Extracting Vectors...
            </div>
          </div>
        )}

        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Studio Workspace</h2>
            <p className="text-slate-500 mt-1">Iterating on brand assets for <span className="text-[#04768A] font-bold">{params.brandName}</span></p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-xs font-bold text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              GEMINI 2.5 ACTIVE
            </div>
          </div>
        </header>

        {history.length === 0 && !isGenerating ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-24 h-24 rounded-full bg-white shadow-xl shadow-slate-200 flex items-center justify-center mb-8 border border-slate-100">
              <i className="fas fa-layer-group text-4xl text-[#04768A]"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Begin Synthesis</h3>
            <p className="text-slate-500 mt-3 leading-relaxed">
              Define your brand identity and trigger the engine to generate high-fidelity concepts. Once generated, you can refine specific versions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
            {isGenerating && (
              <div className="animate-pulse bg-white rounded-2xl aspect-square flex flex-col items-center justify-center p-10 border-2 border-dashed border-[#04768A]/20 shadow-sm relative">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-slate-50 border-t-[#04768A] animate-spin"></div>
                  <i className={`fas ${selectedLogo ? 'fa-magic' : 'fa-paint-brush'} absolute inset-0 flex items-center justify-center text-[#04768A] animate-pulse`}></i>
                </div>
                <p className="mt-8 font-black text-slate-800 text-xl tracking-tight">
                  {selectedLogo ? 'Refining...' : 'Synthesizing...'}
                </p>
                <p className="text-[10px] text-slate-400 mt-2 text-center uppercase font-bold tracking-widest">
                  {selectedLogo ? 'Applying targeted edits' : 'Generating from prompt'}
                </p>
              </div>
            )}
            
            {history.map((logo) => (
              <LogoCard 
                key={logo.id} 
                logo={logo} 
                onDownload={downloadLogo} 
                onDelete={deleteLogo} 
                onRefine={toggleRefine}
                isActive={selectedLogo?.id === logo.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
