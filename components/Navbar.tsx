import React from 'react';
import { User } from '../types';
import { Wallet, PlusCircle, Trophy } from 'lucide-react';

interface NavbarProps {
  user: User;
  onConnect: () => void;
  onNavigate: (view: 'home' | 'create' | 'leaderboard') => void;
  currentView: string;
}

const Navbar: React.FC<NavbarProps> = ({ user, onConnect, onNavigate, currentView }) => {
  return (
    <nav className="sticky top-0 z-50 bg-[#0052FF]/90 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('home')}
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
             <div className="w-6 h-6 rounded-full bg-[#0052FF]"></div>
          </div>
          <span className="text-2xl font-bold text-white font-['Chakra_Petch'] tracking-wider">BASED UP</span>
        </div>

        <div className="flex items-center gap-6">
            <button 
                onClick={() => onNavigate('leaderboard')}
                className={`flex items-center gap-2 text-sm font-bold ${currentView === 'leaderboard' ? 'text-white' : 'text-blue-200 hover:text-white'} transition-colors`}
            >
                <Trophy size={18} /> APED BOARD
            </button>
            
            <button 
                onClick={() => onNavigate('create')}
                className={`flex items-center gap-2 text-sm font-bold ${currentView === 'create' ? 'text-white' : 'text-blue-200 hover:text-white'} transition-colors`}
            >
                <PlusCircle size={18} /> CREATE
            </button>

            {user.isConnected ? (
                 <div className="flex items-center gap-4 bg-blue-800/50 pl-4 pr-2 py-1.5 rounded-full border border-blue-400/30">
                    <div className="flex flex-col items-end leading-none">
                        <span className="text-xs text-blue-200 font-bold">{user.points} PTS</span>
                        <span className="text-[10px] text-blue-300">Airdrop Tier 1</span>
                    </div>
                    <div className="bg-white text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold">
                        {user.address?.substring(0,6)}...{user.address?.substring(38)}
                    </div>
                 </div>
            ) : (
                <button 
                    onClick={onConnect}
                    className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-2 px-6 rounded-full transition-all flex items-center gap-2"
                >
                    <Wallet size={18} /> Connect Wallet
                </button>
            )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
