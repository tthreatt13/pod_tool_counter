
import React from 'react';
import { Tool } from '../types';
import { ExternalLink, ChevronRight } from 'lucide-react';

interface LeaderboardRowProps {
  tool: Tool;
  rank: number;
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ tool, rank }) => {
  const isTopThree = rank <= 3;
  
  return (
    <div className="group flex items-center bg-white hover:bg-indigo-50/30 border-b border-gray-100 px-6 py-5 transition-all">
      <div className="w-12 flex-shrink-0">
        <span className={`text-lg font-bold ${isTopThree ? 'text-indigo-600' : 'text-gray-400'}`}>
          {rank}
        </span>
      </div>
      
      <div className="flex-grow flex items-center gap-4 min-w-0">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${isTopThree ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
          {tool.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 truncate">{tool.name}</h3>
            <a href={tool.url} target="_blank" rel="noopener" className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-indigo-600">
              <ExternalLink size={14} />
            </a>
          </div>
          <p className="text-sm text-gray-500 truncate max-w-md">{tool.description}</p>
        </div>
      </div>

      <div className="hidden md:block w-40 px-4">
        <span className="inline-block bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
          {tool.category}
        </span>
      </div>

      <div className="w-32 text-right">
        <div className="text-xl font-extrabold text-gray-900">{tool.mentionCount}</div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Mentions</div>
      </div>

      <div className="w-10 flex justify-end">
        <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
      </div>
    </div>
  );
};

export default LeaderboardRow;
