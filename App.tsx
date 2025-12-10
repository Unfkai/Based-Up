import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ProjectCard from './components/ProjectCard';
import ProjectDetails from './components/ProjectDetails';
import CreateProject from './components/CreateProject';
import { INITIAL_PROJECTS, MOCK_LEADERBOARD } from './constants';
import { Project, User, ProjectCategory } from './types';
import { Trophy, Info, Filter } from 'lucide-react';

const CATEGORIES: ('All' | ProjectCategory)[] = ['All', 'Meme', 'DeFi', 'DEX', 'Gaming', 'DAO', 'NFT', 'Social', 'Prediction', 'Launchpad', 'Community', 'Utility', 'AI'];

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'details' | 'create' | 'leaderboard'>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProjectCategory>('All');
  
  const [user, setUser] = useState<User>({
    address: null,
    isConnected: false,
    points: 0,
    ownedNfts: [],
    backedProjects: []
  });

  const handleConnect = () => {
    // Mock connection
    setUser({
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      isConnected: true,
      points: 120, // Start with some points
      ownedNfts: [],
      backedProjects: []
    });
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setView('details');
  };

  const handleCreateProject = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setView('home');
  };

  const handleUpdateProject = (updatedProject: Project) => {
    // Update local projects array
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    // Also update selected project to reflect changes immediately in UI
    setSelectedProject(updatedProject);
  };

  const handleInvest = (amount: number, projectId: string) => {
    // Logic for updating project funds
    setProjects(prev => {
        const updated = prev.map(p => {
            if (p.id === projectId) {
                return {
                    ...p,
                    raised: p.raised + amount,
                    backers: p.backers + 1
                };
            }
            return p;
        });
        
        // If currently viewing this project, update selectedProject too
        const current = updated.find(p => p.id === projectId);
        if (current && selectedProject?.id === projectId) {
            setSelectedProject(current);
        }
        
        return updated;
    });
    
    // Update User Points (Gamification)
    // 1000 points per ETH invested
    setUser(prev => ({
        ...prev,
        points: prev.points + (amount * 1000),
        backedProjects: [...prev.backedProjects, projectId]
    }));
  };
  
  const handleAddNft = (url: string) => {
      setUser(prev => ({
          ...prev,
          ownedNfts: [...prev.ownedNfts, url]
      }));
  };

  const filteredProjects = projects.filter(p => selectedCategory === 'All' || p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden">
      {/* Background Decorative Blobs */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <Navbar 
        user={user} 
        onConnect={handleConnect} 
        currentView={view}
        onNavigate={(v) => {
            setView(v);
            setSelectedProject(null);
        }} 
      />

      <main className="container mx-auto px-6 py-10 relative z-10">
        
        {view === 'home' && (
          <>
            <div className="text-center mb-12">
               <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white font-['Chakra_Petch']">
                 FUND THE BASE
               </h1>
               <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                 The premier launchpad on Base. Back projects, earn Soulbound NFTs, and analyze risks with Gemini AI.
               </p>

               {/* Category Filter Bar */}
               <div className="flex justify-center flex-wrap gap-2 max-w-4xl mx-auto">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                                selectedCategory === cat 
                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30' 
                                : 'bg-slate-900/50 border-white/10 text-gray-400 hover:border-blue-400/50 hover:text-white'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
               </div>
            </div>

            <div className="flex items-center gap-2 mb-6 text-gray-400 text-sm font-bold uppercase tracking-wider">
                 <Filter size={16} />
                 Showing {filteredProjects.length} {selectedCategory === 'All' ? 'Projects' : selectedCategory + ' Projects'}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onClick={handleProjectClick} 
                />
              ))}
            </div>
            
            {filteredProjects.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-gray-500 text-lg">No projects found in this category.</p>
                </div>
            )}
            
            <div className="mt-12 flex justify-center">
                <button className="text-gray-500 hover:text-white text-sm font-semibold tracking-widest uppercase border-b border-transparent hover:border-blue-500 transition-all pb-1">
                    Load More Projects
                </button>
            </div>
          </>
        )}

        {view === 'details' && selectedProject && (
          <ProjectDetails 
            project={selectedProject} 
            user={user}
            onBack={() => setView('home')} 
            onInvest={handleInvest}
            onAddNft={handleAddNft}
            onUpdateProject={handleUpdateProject}
          />
        )}

        {view === 'create' && (
          <CreateProject 
            onCreate={handleCreateProject}
            onCancel={() => setView('home')}
          />
        )}

        {view === 'leaderboard' && (
           <div className="max-w-3xl mx-auto">
               <h2 className="text-4xl font-bold mb-8 text-center font-['Chakra_Petch'] text-blue-400 flex items-center justify-center gap-3">
                   <Trophy size={40} /> APED LEADERBOARD
               </h2>
               <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                   <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-gray-400 font-bold text-sm uppercase">
                       <div className="col-span-2 text-center">Rank</div>
                       <div className="col-span-6">User</div>
                       <div className="col-span-4 text-right">Points</div>
                   </div>
                   {MOCK_LEADERBOARD.map((entry) => (
                       <div key={entry.rank} className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
                            <div className="col-span-2 text-center font-['Chakra_Petch'] text-2xl font-bold text-blue-500">
                                #{entry.rank}
                            </div>
                            <div className="col-span-6 flex items-center gap-4">
                                <img src={entry.avatar} alt={entry.username} className="w-10 h-10 rounded-full border border-white/20" />
                                <div>
                                    <div className="font-bold text-white flex items-center gap-2">
                                        {entry.username}
                                        {entry.badges.map(b => <span key={b}>{b}</span>)}
                                    </div>
                                    <div className="text-xs text-gray-500">Top Backer</div>
                                </div>
                            </div>
                            <div className="col-span-4 text-right font-mono text-lg text-yellow-400">
                                {entry.points.toLocaleString()}
                            </div>
                       </div>
                   ))}
               </div>
               <div className="mt-6 bg-blue-900/20 p-6 rounded-xl border border-blue-500/20 flex gap-4 items-start">
                  <Info className="text-blue-400 shrink-0 mt-1" />
                  <div className="text-sm text-gray-300">
                      <strong>How scoring works:</strong> You earn points for every ETH backed in valid projects. 
                      Holding Soulbound NFTs from successful launches adds a multiplier. 
                      Points determine your allocation in the platform's governance token airdrop.
                  </div>
               </div>
           </div>
        )}

      </main>
    </div>
  );
};

export default App;