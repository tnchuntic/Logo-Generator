
import React, { useState, useEffect } from 'react';
import { LogoStyle, LogoGenerationParams, GeneratedLogo, DEFAULT_COLORS } from './types';
import { generateLogo, traceImageToSVG } from './services/geminiService';
import Button from './components/Button';
import LogoCard from './components/LogoCard';

const App: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVectorizing, setIsVectorizing] = useState(false);
  const [history, setHistory] = useState<GeneratedLogo[]>([]);
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

  const handleGenerate = async () => {
    if (!params.brandName.trim()) {
      setError("Please enter a Brand Name");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const imageUrl = await generateLogo(params);
      const newLogo: GeneratedLogo = {
        id: crypto.randomUUID(),
        url: imageUrl,
        prompt: `${params.brandName} - ${params.concept}`,
        timestamp: Date.now()
      };
      setHistory(prev => [newLogo, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate logo. Please try again.');
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
        // Call AI to trace raster to vector
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
        // Default PNG download
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Download failed:", err);
      setError("Conversion failed. Using direct PNG fallback.");
      // Fallback to standard PNG if conversion fails
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
                placeholder="e.g. Life Hub"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700">Slogan (Optional)</label>
              <input 
                type="text"
                value={params.slogan}
                onChange={(e) => setParams(p => ({ ...p, slogan: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#04768A] outline-none transition-all"
                placeholder="e.g. Connected Living"
              />
            </div>
          </div>

          {/* Style Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visual Style</h3>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700">Design Style</label>
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

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700">Concept & Narrative</label>
              <textarea 
                value={params.concept}
                onChange={(e) => setParams(p => ({ ...p, concept: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#04768A] outline-none min-h-[80px] text-sm resize-none"
                placeholder="Describe the core message..."
              />
            </div>
          </div>

          {/* Color Palette Section */}
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
              onClick={handleGenerate} 
              isLoading={isGenerating} 
              className="w-full py-4 text-lg" 
              variant="primary"
              icon="fa-wand-magic-sparkles"
            >
              Generate Logo
            </Button>
            {error && <p className="mt-3 text-sm text-rose-500 text-center font-medium bg-rose-50 py-2 rounded-lg">{error}</p>}
          </div>
        </section>
      </aside>

      {/* Main Display Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {isVectorizing && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-[#04768A] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold border-2 border-white/20">
              <i className="fas fa-microchip animate-pulse"></i>
              AI Vectorizing... (Tracing Paths)
            </div>
          </div>
        )}

        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Workspace</h2>
            <p className="text-slate-500 mt-1">Exporting assets for <span className="text-[#04768A] font-bold">{params.brandName || 'Your Brand'}</span></p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-xs font-bold text-slate-500">
            <i className="fas fa-bezier-curve text-[#04768A]"></i>
            TRUE VECTOR SVG SUPPORTED
          </div>
        </header>

        {history.length === 0 && !isGenerating ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-24 h-24 rounded-full bg-white shadow-xl shadow-slate-200 flex items-center justify-center mb-8 border border-slate-100">
              <i className="fas fa-layer-group text-4xl text-[#04768A]"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Ready to start?</h3>
            <p className="text-slate-500 mt-3 leading-relaxed">
              Define your brand identity and trigger the Gemini 2.5 engine to synthesize high-fidelity concepts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
            {isGenerating && (
              <div className="animate-pulse bg-white rounded-2xl aspect-square flex flex-col items-center justify-center p-10 border-2 border-dashed border-[#04768A]/20 shadow-sm">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-slate-50 border-t-[#04768A] animate-spin"></div>
                  <i className="fas fa-paint-brush absolute inset-0 flex items-center justify-center text-[#04768A] animate-pulse"></i>
                </div>
                <p className="mt-8 font-black text-slate-800 text-xl tracking-tight">Synthesizing...</p>
                <p className="text-xs text-slate-400 mt-2 text-center uppercase font-bold tracking-widest">Applying color palette</p>
              </div>
            )}
            
            {history.map((logo) => (
              <LogoCard 
                key={logo.id} 
                logo={logo} 
                onDownload={downloadLogo} 
                onDelete={deleteLogo} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
