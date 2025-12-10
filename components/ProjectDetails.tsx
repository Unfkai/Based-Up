import React, { useState, useEffect } from 'react';
import { Project, Comment, User } from '../types';
import { analyzeSketchiness, generateSoulboundNFT } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';
import { Shield, Coins, Pickaxe, MessageSquare, ArrowLeft, Loader2, Award, Zap, Globe, Twitter, Send, ThumbsUp, ThumbsDown, CheckCircle2, User as UserIcon } from 'lucide-react';

interface ProjectDetailsProps {
  project: Project;
  onBack: () => void;
  user: User;
  onInvest: (amount: number, projectId: string) => void;
  onAddNft: (url: string) => void;
  onUpdateProject: (updatedProject: Project) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onBack, user, onInvest, onAddNft, onUpdateProject }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tokenomics' | 'chat'>('overview');
  const [investAmount, setInvestAmount] = useState<string>('');
  const [isMining, setIsMining] = useState(false);
  const [sketchMetrics, setSketchMetrics] = useState(project.sketchiness);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingNft, setGeneratingNft] = useState(false);
  const [nftUrl, setNftUrl] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [hasVotedPrediction, setHasVotedPrediction] = useState(false);

  // Trigger AI Analysis if empty
  useEffect(() => {
    if (sketchMetrics.length === 0 && !analyzing) {
      setAnalyzing(true);
      analyzeSketchiness(project.title, project.description).then(metrics => {
        setSketchMetrics(metrics);
        setAnalyzing(false);
      });
    }
  }, [project, sketchMetrics.length, analyzing]);

  const handleInvest = async () => {
    if (!investAmount) return;
    const amount = parseFloat(investAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    // Simulate Invest
    onInvest(amount, project.id);
    
    // Trigger NFT Generation
    setGeneratingNft(true);
    const url = await generateSoulboundNFT(project.title, project.description);
    setNftUrl(url);
    onAddNft(url);
    setGeneratingNft(false);
    setInvestAmount('');
  };

  const handlePostComment = () => {
      if (!newComment.trim() || !user.isConnected) return;
      
      const comment: Comment = {
          id: Math.random().toString(36).substr(2, 9),
          user: user.address ? `${user.address.substring(0,6)}...` : 'Anon',
          text: newComment,
          timestamp: Date.now()
      };

      const updatedProject = {
          ...project,
          comments: [comment, ...project.comments]
      };
      
      onUpdateProject(updatedProject);
      setNewComment('');
  };

  const handlePredictionVote = (vote: 'yes' | 'no') => {
      if (!user.isConnected || hasVotedPrediction) return;

      const updatedProject = {
          ...project,
          prediction: {
              yes: vote === 'yes' ? project.prediction.yes + 1 : project.prediction.yes,
              no: vote === 'no' ? project.prediction.no + 1 : project.prediction.no
          }
      };

      onUpdateProject(updatedProject);
      setHasVotedPrediction(true);
  };

  const percentRaised = (project.raised / project.hardCap) * 100;
  const isOverHardCap = project.raised > project.hardCap;
  const totalVotes = project.prediction.yes + project.prediction.no;
  const yesPercent = totalVotes > 0 ? (project.prediction.yes / totalVotes) * 100 : 50;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="flex items-center text-blue-300 mb-6 hover:text-white transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Back to Projects
      </button>

      {/* Hero Banner Section */}
      <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-12 group">
        <img 
            src={project.banner} 
            alt="Project Banner" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
        
        <div className="absolute bottom-6 left-6 md:left-10 flex items-end gap-6">
             <img 
                src={project.logo} 
                alt={project.title} 
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-slate-950 shadow-2xl bg-slate-900 object-cover" 
             />
             <div className="mb-2">
                 <h1 className="text-3xl md:text-5xl font-bold text-white font-['Chakra_Petch'] drop-shadow-lg">{project.title}</h1>
                 <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-blue-600/80 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-semibold border border-blue-400/30">{project.tokenTicker}</span>
                  <span className="bg-purple-600/80 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-semibold border border-purple-400/30">{project.category}</span>
                  {project.daoRights && <span className="bg-green-600/80 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 border border-green-400/30"><Shield size={12}/> DAO Rights</span>}
                </div>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8">
            
            <div className="flex gap-4 mb-6">
                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-blue-400"><Globe size={20} /></button>
                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-blue-400"><Twitter size={20} /></button>
                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-blue-400"><Send size={20} /></button>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">About Project</h3>
            <p className="text-gray-300 leading-relaxed text-lg mb-8">{project.description}</p>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 mb-6 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('overview')} 
                className={`px-4 py-2 font-semibold whitespace-nowrap ${activeTab === 'overview' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Overview & Analysis
              </button>
              <button 
                onClick={() => setActiveTab('tokenomics')} 
                className={`px-4 py-2 font-semibold whitespace-nowrap ${activeTab === 'tokenomics' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Tokenomics
              </button>
              <button 
                onClick={() => setActiveTab('chat')} 
                className={`px-4 py-2 font-semibold whitespace-nowrap ${activeTab === 'chat' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Community Chat ({project.comments.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                       <Zap className="text-yellow-400" /> Sketchiness Meter (AI)
                    </h3>
                    <div className="h-64 w-full bg-black/20 rounded-xl relative flex items-center justify-center border border-white/5">
                       {analyzing ? (
                         <div className="flex flex-col items-center text-blue-400">
                           <Loader2 className="animate-spin mb-2" size={32} />
                           <span className="text-sm">Analyzing Contract & Vibe...</span>
                         </div>
                       ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={sketchMetrics}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Sketchiness" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} 
                                formatter={(value: number) => [`${value}/100 Risk`, 'Score']}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                       )}
                       {!analyzing && (
                           <div className="absolute bottom-2 right-2 text-[10px] text-gray-500 text-right">
                               High Score = High Risk<br/>
                               Analysis by Gemini 2.5 Flash
                           </div>
                       )}
                    </div>
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-xl font-bold text-white mb-4">Funding Status</h3>
                     <div className="space-y-1">
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>Raised</span>
                            <span className={`font-mono ${isOverHardCap ? 'text-purple-400 font-bold' : 'text-white'}`}>
                                {project.raised} / {project.hardCap} ETH
                            </span>
                        </div>
                        <div className="h-4 bg-gray-800 rounded-full overflow-hidden relative">
                            <div 
                                className={`h-full relative transition-all duration-1000 ${isOverHardCap ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-blue-500'}`} 
                                style={{ width: `${Math.min(percentRaised, 100)}%` }}
                            >
                                {isOverHardCap && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                             <p className={isOverHardCap ? "text-purple-400 font-bold" : "text-green-400"}>
                                {percentRaised.toFixed(2)}% Funded
                             </p>
                             {isOverHardCap && (
                                 <span className="text-purple-400 font-bold bg-purple-400/10 px-2 py-0.5 rounded">
                                     +{(percentRaised - 100).toFixed(1)}% OVER CAP
                                 </span>
                             )}
                        </div>
                     </div>
                     
                     <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/20 mt-6">
                        <h4 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                             <Award size={16} /> Backer Rewards
                        </h4>
                        <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                            <li>Allocation of {project.tokenTicker} at launch.</li>
                            <li>Voting rights in the {project.title} DAO.</li>
                            <li>Soulbound NFT Badge (AI Generated).</li>
                            <li>Access to private Discord channel.</li>
                        </ul>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'tokenomics' && (
                <div className="h-80 w-full flex flex-col items-center justify-center">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={project.tokenomics}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {project.tokenomics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-4 justify-center mt-4">
                      {project.tokenomics.map((t, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.fill }}></div>
                              <span>{t.name}: {t.value}%</span>
                          </div>
                      ))}
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                  <div className="space-y-6">
                      {user.isConnected ? (
                        <div className="flex gap-4 mb-8">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                                {user.address ? user.address[0].toUpperCase() : 'U'}
                            </div>
                            <div className="flex-grow">
                                <textarea
                                    className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none resize-none min-h-[80px]"
                                    placeholder="Share your thoughts about this project..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <div className="flex justify-end mt-2">
                                    <button 
                                        onClick={handlePostComment}
                                        disabled={!newComment.trim()}
                                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-gray-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                    >
                                        Post Comment
                                    </button>
                                </div>
                            </div>
                        </div>
                      ) : (
                          <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl text-center mb-6">
                              <p className="text-blue-300">Connect your wallet to join the discussion.</p>
                          </div>
                      )}

                      <div className="space-y-4">
                          {project.comments.length === 0 ? (
                              <p className="text-center text-gray-500 py-10">No comments yet. Be the first!</p>
                          ) : (
                              project.comments.map(comment => (
                                  <div key={comment.id} className="flex gap-4 bg-slate-800/30 p-4 rounded-xl border border-white/5">
                                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-gray-400 shrink-0">
                                          <UserIcon size={16} />
                                      </div>
                                      <div>
                                          <div className="flex items-center gap-2 mb-1">
                                              <span className="font-bold text-white text-sm">{comment.user}</span>
                                              <span className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleDateString()}</span>
                                          </div>
                                          <p className="text-gray-300 text-sm">{comment.text}</p>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Action Card */}
        <div className="space-y-6">
           {/* Prediction Widget */}
           <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-10">
                   <Pickaxe size={100} />
               </div>
               <h3 className="text-white font-bold mb-4 flex items-center gap-2 font-['Chakra_Petch']">
                   <Zap className="text-yellow-400" size={18} /> Prediction Market
               </h3>
               <p className="text-sm text-gray-400 mb-4">Will this project successfully fund?</p>
               
               <div className="flex items-center justify-between mb-2 text-sm font-bold">
                   <span className="text-green-400">{yesPercent.toFixed(0)}% YES</span>
                   <span className="text-red-400">{(100 - yesPercent).toFixed(0)}% NO</span>
               </div>
               
               <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex mb-6">
                   <div className="h-full bg-green-500" style={{ width: `${yesPercent}%` }}></div>
                   <div className="h-full bg-red-500" style={{ width: `${100 - yesPercent}%` }}></div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                   <button 
                       onClick={() => handlePredictionVote('yes')}
                       disabled={!user.isConnected || hasVotedPrediction}
                       className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-green-500/30 text-green-400 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                   >
                       <ThumbsUp size={16} /> Vote Yes
                   </button>
                   <button 
                       onClick={() => handlePredictionVote('no')}
                       disabled={!user.isConnected || hasVotedPrediction}
                       className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-red-500/30 text-red-400 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                   >
                       <ThumbsDown size={16} /> Vote No
                   </button>
               </div>
               {hasVotedPrediction && (
                   <p className="text-center text-xs text-gray-500 mt-2">Thanks for voting!</p>
               )}
           </div>

           {/* Invest Card */}
           <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-lg shadow-blue-900/20 sticky top-24">
              <h3 className="text-2xl font-bold text-white mb-6 font-['Chakra_Petch']">Back Project</h3>
              
              <div className="space-y-4 mb-6">
                  <div className="bg-black/30 p-3 rounded-lg border border-white/10">
                      <label className="text-xs text-gray-500 uppercase font-bold">Amount (ETH)</label>
                      <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            value={investAmount}
                            onChange={(e) => setInvestAmount(e.target.value)}
                            className="bg-transparent text-white text-xl font-mono w-full outline-none focus:ring-0"
                            placeholder="0.0" 
                          />
                          <span className="text-blue-400 font-bold">ETH</span>
                      </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-400">
                      <span>Balance:</span>
                      <span className="text-white font-mono">2.54 ETH</span>
                  </div>
              </div>

              {nftUrl ? (
                   <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-xl text-center animate-in zoom-in duration-300">
                       <p className="text-green-400 font-bold mb-2 flex items-center justify-center gap-2"><CheckCircle2 size={18}/> Backing Successful!</p>
                       <img src={nftUrl} alt="NFT" className="w-24 h-24 mx-auto rounded-lg shadow-lg mb-2 pixelated border border-green-500/50" />
                       <p className="text-xs text-gray-400">Soulbound NFT minted to your wallet.</p>
                   </div>
              ) : (
                <button 
                    onClick={handleInvest}
                    disabled={generatingNft || !investAmount}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:text-gray-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,82,255,0.4)] hover:shadow-[0_0_30px_rgba(0,82,255,0.6)]"
                >
                    {generatingNft ? <Loader2 className="animate-spin" /> : <Coins />}
                    {generatingNft ? 'Minting NFT...' : 'BACK PROJECT'}
                </button>
              )}

              <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-bold flex items-center gap-2">
                          <Pickaxe size={18} /> Mining Access
                      </h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isMining} onChange={() => setIsMining(!isMining)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                  </div>
                  {isMining && (
                      <div className="bg-yellow-900/10 border border-yellow-500/20 p-3 rounded-lg text-xs text-yellow-200">
                          Activate Mining Rig? Requires <strong>{project.miningEntryCost} ETH</strong> lockup. 
                          You will mine {project.tokenTicker} every block after launch.
                      </div>
                  )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;