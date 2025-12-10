import React from 'react';
import { Project } from '../types';
import { Users, TrendingUp, AlertCircle } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  // Allow percentage to go above 100 for display logic
  const percentRaised = (project.raised / project.hardCap) * 100;
  const isOverSoftCap = project.raised >= project.softCap;
  const isOverHardCap = project.raised > project.hardCap;
  
  return (
    <div 
      onClick={() => onClick(project)}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-[0_0_20px_rgba(0,82,255,0.3)] transition-all cursor-pointer group flex flex-col h-full"
    >
      <div className="h-32 bg-slate-900 relative">
        <img 
          src={project.banner || project.logo} 
          alt={project.title} 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute top-2 right-2 bg-blue-600/90 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-blue-400/50">
          {project.category}
        </div>
      </div>
      
      <div className="p-5 relative flex-grow flex flex-col">
        {/* Overlapping Logo */}
        <div className="absolute -top-8 left-5">
             <img 
                src={project.logo} 
                alt={`${project.title} logo`}
                className="w-14 h-14 rounded-xl border-2 border-slate-900 bg-slate-800 object-cover shadow-lg group-hover:scale-110 transition-transform"
             />
        </div>

        <div className="mt-6 mb-2">
            <h3 className="text-xl font-bold text-white font-['Chakra_Petch'] group-hover:text-blue-400 transition-colors line-clamp-1">
            {project.title}
            </h3>
        </div>

        <p className="text-gray-400 text-sm line-clamp-2 mb-4 h-10">
          {project.description}
        </p>

        <div className="mt-auto">
            {/* Progress Bars */}
            <div className="mb-4 space-y-2">
            <div className="flex justify-between text-xs text-gray-300">
                <span>{project.raised} ETH</span>
                <span className={isOverHardCap ? "text-purple-400 font-bold" : ""}>
                    {percentRaised.toFixed(1)}%
                </span>
            </div>
            
            <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden relative">
                {/* Fill Bar */}
                <div 
                className={`h-full relative transition-all duration-1000 ${isOverHardCap ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(percentRaised, 100)}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
                {/* Soft Cap Marker */}
                <div 
                className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10" 
                style={{ left: `${Math.min((project.softCap / project.hardCap) * 100, 100)}%` }}
                title="Soft Cap"
                />
            </div>
            
            <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold">
                {isOverHardCap ? (
                    <span className="text-purple-400 flex items-center gap-1">
                        <AlertCircle size={10} /> {(percentRaised - 100).toFixed(0)}% OVER CAP
                    </span>
                ) : (
                   <span className={isOverSoftCap ? "text-green-400" : "text-yellow-500"}>
                    {isOverSoftCap ? "Soft Cap Met" : `${project.softCap} ETH Soft Cap`}
                   </span>
                )}
                <span>{project.hardCap} ETH Cap</span>
            </div>
            </div>

            <div className="flex justify-between items-center text-gray-400 text-sm pt-4 border-t border-white/10">
            <div className="flex items-center gap-1">
                <Users size={16} />
                <span>{project.backers} Backers</span>
            </div>
            <div className="flex items-center gap-1 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <TrendingUp size={16} />
                <span>View</span>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;