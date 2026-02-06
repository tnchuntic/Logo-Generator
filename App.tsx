
import React, { useState, useEffect } from 'react';
import { LogoStyle, LogoGenerationParams, GeneratedLogo, DEFAULT_COLORS } from './types';
import { generateLogo } from './services/geminiService';
import Button from './components/Button';
import LogoCard from './components/LogoCard';

const App: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
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

  const downloadLogo = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${params.brandName.replace(/\s+/g, '-').toLowerCase()}-logo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteLogo = (id: string) => {
    setHistory(prev => prev.filter(logo => logo.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* Sidebar Controls */}
      <aside className="w-full md:w-[400px] bg-white border-r border-slate-200 p-6 flex flex-col gap-6 h-screen sticky top-0 overflow-y-auto">
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
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
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
                      className="w-full h-10 rounded-lg shadow-sm border border-slate-200"
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
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Workspace</h2>
            <p className="text-slate-500 mt-1">Refining brand concepts for <span className="text-[#04768A] font-bold">{params.brandName || 'Your Brand'}</span></p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-sm">
            <i className="fas fa-microchip text-[#04768A]"></i>
            <span className="font-semibold text-slate-600">Gemini 2.5 Flash Engine</span>
          </div>
        </header>

        {history.length === 0 && !isGenerating ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-8">
              <i className="fas fa-mountain-sun text-4xl text-slate-300"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Your gallery is empty</h3>
            <p className="text-slate-500 mt-3 leading-relaxed">
              Design a unique logo for <strong>{params.brandName}</strong>. 
              Configure your visual identity in the sidebar and trigger the generation.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
            {isGenerating && (
              <div className="animate-pulse bg-white rounded-2xl aspect-square flex flex-col items-center justify-center p-10 border-2 border-dashed border-[#04768A]/20">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-50 border-t-[#04768A] animate-spin"></div>
                  <i className="fas fa-pen absolute inset-0 flex items-center justify-center text-[#04768A] animate-bounce"></i>
                </div>
                <p className="mt-6 font-bold text-[#04768A] text-lg">Drawing Concept...</p>
                <p className="text-xs text-slate-400 mt-2 text-center">Gemini is translating your prompt into a visual identity</p>
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
