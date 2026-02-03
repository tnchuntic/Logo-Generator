
import React, { useState, useCallback, useEffect } from 'react';
import { LogoStyle, LogoGenerationParams, GeneratedLogo, COLORS } from './types';
import { generateLogo } from './services/geminiService';
import Button from './components/Button';
import LogoCard from './components/LogoCard';

const App: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedLogo[]>([]);
  const [params, setParams] = useState<LogoGenerationParams>({
    style: LogoStyle.MINIMALIST,
    concept: 'Centralizing life, connectivity, and organic growth.',
    aspectRatio: '1:1',
    additionalPrompt: ''
  });
  const [error, setError] = useState<string | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('logo-hub-logos');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Save to local storage whenever history changes
  useEffect(() => {
    localStorage.setItem('logo-hub-logos', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const imageUrl = await generateLogo(params);
      const newLogo: GeneratedLogo = {
        id: crypto.randomUUID(),
        url: imageUrl,
        prompt: params.concept,
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
    link.download = `logo-hub-${Date.now()}.png`;
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
      <aside className="w-full md:w-96 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 h-screen sticky top-0 overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#002951] flex items-center justify-center text-white font-bold text-xl">
            L
          </div>
          <div>
            <h1 className="font-bold text-xl text-[#002951]">Logo Hub</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Design Studio</p>
          </div>
        </div>

        <section className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">Style Profile</label>
            <select 
              value={params.style}
              onChange={(e) => setParams(p => ({ ...p, style: e.target.value }))}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#04768A] outline-none appearance-none"
            >
              {Object.values(LogoStyle).map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">Logo Concept</label>
            <textarea 
              value={params.concept}
              onChange={(e) => setParams(p => ({ ...p, concept: e.target.value }))}
              placeholder="Describe what the hub represents..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#04768A] outline-none min-h-[100px] text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">Custom Directions (Optional)</label>
            <input 
              type="text"
              value={params.additionalPrompt}
              onChange={(e) => setParams(p => ({ ...p, additionalPrompt: e.target.value }))}
              placeholder="e.g. Add a small tree icon..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#04768A] outline-none text-sm"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-2 text-slate-500 uppercase">Aspect Ratio</label>
              <div className="flex gap-2">
                {(['1:1', '4:3', '16:9'] as const).map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setParams(p => ({ ...p, aspectRatio: ratio }))}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                      params.aspectRatio === ratio 
                      ? 'bg-[#002951] text-white border-[#002951]' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-[#04768A]'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-auto border-t border-slate-100">
             <div className="flex gap-2 mb-4">
               {Object.entries(COLORS).map(([name, hex]) => (
                 <div key={name} className="flex-1 group relative">
                    <div className="w-full h-8 rounded-md shadow-inner" style={{ backgroundColor: hex }}></div>
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">
                      {hex}
                    </div>
                 </div>
               ))}
             </div>
             
             <Button 
                onClick={handleGenerate} 
                isLoading={isGenerating} 
                className="w-full" 
                variant="primary"
                icon="fa-magic"
              >
                Generate Logo
              </Button>
              {error && <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>}
          </div>
        </section>

        <div className="mt-auto">
          <div className="bg-[#AEC2AF]/10 p-4 rounded-xl border border-[#AEC2AF]/30">
            <p className="text-xs font-medium text-[#04768A] mb-1 italic">Pro Tip</p>
            <p className="text-xs text-slate-600">The combination of Deep Navy and Teal creates a trustworthy foundation, while Sage and Lavender add modern warmth.</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Your Creations</h2>
            <p className="text-slate-500 mt-1">Generated brand assets for Logo Hub</p>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="font-semibold text-slate-600">Gemini 2.5 Active</span>
            </div>
          </div>
        </header>

        {history.length === 0 && !isGenerating ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
              <i className="fas fa-palette text-3xl text-slate-300"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-700">No logos yet</h3>
            <p className="text-slate-500 mt-2">Adjust your settings on the left and click "Generate" to see the magic happen for Life Hub.</p>
            <Button 
              variant="outline" 
              className="mt-6" 
              onClick={handleGenerate}
              icon="fa-plus"
            >
              Start First Concept
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isGenerating && (
              <div className="animate-pulse bg-white rounded-xl aspect-square flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#04768A]/30">
                <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-[#04768A] animate-spin mb-4"></div>
                <p className="text-sm font-semibold text-[#04768A]">Crafting your brand...</p>
                <p className="text-[10px] text-slate-400 mt-1">Thinking with Gemini</p>
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

      {/* Persistent CTA for Mobile */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-16 h-16 rounded-full bg-[#002951] text-white shadow-2xl flex items-center justify-center text-2xl active:scale-90 transition-transform disabled:opacity-50"
        >
          {isGenerating ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-magic"></i>}
        </button>
      </div>
    </div>
  );
};

export default App;
