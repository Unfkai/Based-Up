import React, { useState } from 'react';
import { Project, Tokenomics } from '../types';
import { analyzeSketchiness } from '../services/geminiService';
import { Loader2, Sparkles, Plus, Trash2, PieChart, Info, Image as ImageIcon } from 'lucide-react';

interface CreateProjectProps {
  onCreate: (project: Project) => void;
  onCancel: () => void;
}

const COLORS = ['#0052FF', '#00D1FF', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#64748B', '#FFFFFF'];
const CATEGORIES = ['Meme', 'DeFi', 'DEX', 'Gaming', 'Utility', 'DAO', 'Social', 'NFT', 'Prediction', 'Launchpad', 'Community', 'AI'];

const CreateProject: React.FC<CreateProjectProps> = ({ onCreate, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    softCap: '',
    hardCap: '',
    ticker: '',
    category: 'Meme',
    bannerUrl: ''
  });

  // State for Custom Tokenomics
  const [tokenomicsList, setTokenomicsList] = useState<Tokenomics[]>([
    { name: 'Public Sale', value: 100, fill: '#0052FF' }
  ]);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenValue, setNewTokenValue] = useState('');
  const [newTokenColor, setNewTokenColor] = useState(COLORS[1]); // Default to second color since first is used

  const [loading, setLoading] = useState(false);

  const totalPercentage = tokenomicsList.reduce((acc, curr) => acc + curr.value, 0);

  const handleAddTokenomics = () => {
    if (!newTokenName || !newTokenValue) return;
    const val = parseFloat(newTokenValue);
    if (isNaN(val) || val <= 0) return;

    const newItem: Tokenomics = {
        name: newTokenName,
        value: val,
        fill: newTokenColor
    };

    setTokenomicsList([...tokenomicsList, newItem]);
    setNewTokenName('');
    setNewTokenValue('');
    // Rotate color for next input automatically, but allow user override
    const nextColorIndex = (tokenomicsList.length + 1) % COLORS.length;
    setNewTokenColor(COLORS[nextColorIndex]);
  };

  const removeTokenomics = (index: number) => {
    const newList = [...tokenomicsList];
    newList.splice(index, 1);
    setTokenomicsList(newList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Math.abs(totalPercentage - 100) > 0.1) {
        return;
    }

    setLoading(true);

    const metrics = await analyzeSketchiness(formData.title, formData.description);

    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      description: formData.description,
      logo: `https://picsum.photos/seed/${formData.title}/200/200`,
      banner: formData.bannerUrl || `https://picsum.photos/seed/${formData.title}banner/1200/400`,
      softCap: Number(formData.softCap),
      hardCap: Number(formData.hardCap),
      raised: 0,
      backers: 0,
      tokenTicker: formData.ticker,
      tokenomics: tokenomicsList,
      comments: [],
      sketchiness: metrics,
      prediction: { yes: 0, no: 0 },
      category: formData.category as any,
      miningEntryCost: 0.1,
      daoRights: true,
      status: 'Funding'
    };

    onCreate(newProject);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-slate-900/90 border border-white/10 p-8 rounded-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
      <h2 className="text-3xl font-bold text-white mb-6 font-['Chakra_Petch']">Create Base Project</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Project Name</label>
              <input 
                required
                type="text" 
                className="w-full bg-black/40 border border-gray-700 text-white rounded-lg p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
                 <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Category</label>
                <select 
                    className="w-full bg-black/40 border border-gray-700 text-white rounded-lg p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
        </div>

        <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Banner Image URL</label>
            <div className="relative">
                <input 
                    type="url" 
                    placeholder="https://..."
                    className="w-full bg-black/40 border border-gray-700 text-white rounded-lg p-3 pl-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    value={formData.bannerUrl}
                    onChange={(e) => setFormData({...formData, bannerUrl: e.target.value})}
                />
                <ImageIcon size={18} className="absolute left-3 top-3.5 text-gray-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x400px</p>
        </div>

        <div>
          <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Description (AI Analyzed)</label>
          <textarea 
            required
            className="w-full bg-black/40 border border-gray-700 text-white rounded-lg p-3 h-32 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none"
            placeholder="Describe your project, roadmap, and utility..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
             <Sparkles size={12} /> Gemini AI will analyze this for sketchiness.
          </p>
        </div>

         <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Ticker ($)</label>
            <input 
                required
                type="text" 
                className="w-full bg-black/40 border border-gray-700 text-white rounded-lg p-3 focus:border-blue-500 focus:outline-none uppercase font-mono"
                placeholder="e.g. BASED"
                value={formData.ticker}
                onChange={(e) => setFormData({...formData, ticker: e.target.value})}
            />
        </div>

        {/* Tokenomics Section */}
        <div className="bg-blue-900/10 p-6 rounded-xl border border-blue-500/20 shadow-inner">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 font-['Chakra_Petch'] text-lg">
                <PieChart size={20} className="text-blue-400" /> Tokenomics Distribution
            </h3>
            
            <div className="mb-6">
                <div className="flex flex-col md:flex-row gap-3 mb-2 items-start md:items-center">
                    <input 
                        type="text" 
                        placeholder="Allocation Name (e.g. Team)"
                        className="flex-grow w-full bg-black/40 border border-gray-700 text-white rounded-lg p-3 text-sm focus:border-blue-500 outline-none"
                        value={newTokenName}
                        onChange={(e) => setNewTokenName(e.target.value)}
                    />
                    <div className="flex gap-3 w-full md:w-auto">
                        <input 
                            type="number" 
                            placeholder="%"
                            className="w-24 bg-black/40 border border-gray-700 text-white rounded-lg p-3 text-sm focus:border-blue-500 outline-none"
                            value={newTokenValue}
                            onChange={(e) => setNewTokenValue(e.target.value)}
                        />
                        <button 
                            type="button"
                            onClick={handleAddTokenomics}
                            className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg transition-colors flex items-center justify-center min-w-[48px]"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
                
                {/* Color Selection */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    <span className="text-xs text-gray-500 uppercase font-bold mr-2">Color:</span>
                    {COLORS.map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => setNewTokenColor(color)}
                            className={`w-6 h-6 rounded-full transition-transform hover:scale-110 border-2 ${newTokenColor === color ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-2 mb-4 bg-black/20 rounded-lg p-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                {tokenomicsList.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-4">No allocations added yet.</div>
                )}
                {tokenomicsList.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-800/50 p-3 rounded border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: item.fill }}></div>
                            <span className="text-sm font-medium text-gray-200">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-mono font-bold text-white">{item.value}%</span>
                            <button 
                                type="button" 
                                onClick={() => removeTokenomics(index)}
                                className="text-gray-500 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center text-sm pt-2 border-t border-white/10">
                <span className="text-gray-400">Total Allocation</span>
                <div className="flex items-center gap-2">
                     <span className={`font-mono font-bold text-lg ${totalPercentage === 100 ? 'text-green-400' : totalPercentage > 100 ? 'text-red-400' : 'text-yellow-400'}`}>
                        {totalPercentage}%
                    </span>
                    <span className="text-gray-600">/ 100%</span>
                </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-800 h-2 mt-3 rounded-full overflow-hidden flex">
                 {tokenomicsList.map((t, i) => (
                     <div key={i} style={{ width: `${(t.value / Math.max(totalPercentage, 100)) * 100}%`, backgroundColor: t.fill }}></div>
                 ))}
                 {totalPercentage < 100 && (
                     <div className="h-full bg-transparent flex-grow"></div>
                 )}
            </div>
            {totalPercentage !== 100 && (
                <p className="text-xs text-right mt-2 text-yellow-500 flex items-center justify-end gap-1">
                    <Info size={12} />
                    {totalPercentage > 100 ? `Remove ${totalPercentage - 100}% to launch` : `Add ${100 - totalPercentage}% to launch`}
                </p>
            )}
        </div>

        <div className="grid grid-cols-2 gap-6">
           <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Soft Cap (ETH)</label>
            <input 
                required
                type="number" 
                className="w-full bg-black/40 border border-gray-700 text-white rounded-lg p-3 focus:border-blue-500 focus:outline-none font-mono"
                value={formData.softCap}
                onChange={(e) => setFormData({...formData, softCap: e.target.value})}
            />
           </div>
           <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Hard Cap (ETH)</label>
            <input 
                required
                type="number" 
                className="w-full bg-black/40 border border-gray-700 text-white rounded-lg p-3 focus:border-blue-500 focus:outline-none font-mono"
                value={formData.hardCap}
                onChange={(e) => setFormData({...formData, hardCap: e.target.value})}
            />
           </div>
        </div>

        <div className="flex gap-4 pt-4">
            <button 
                type="button" 
                onClick={onCancel}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-colors"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                disabled={loading || totalPercentage !== 100}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,82,255,0.4)] disabled:shadow-none"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {loading ? 'Analyzing & Deploying...' : 'Launch Project'}
            </button>
        </div>

      </form>
    </div>
  );
};

export default CreateProject;