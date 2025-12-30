
import React, { useState } from 'react';
import { Tool, Episode } from '../types';
import { ExternalLink, ChevronDown, ChevronRight, Youtube, Calendar } from 'lucide-react';

interface LeaderboardRowProps {
  tool: Tool;
  rank: number;
  mentionedIn: Episode[];
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ tool, rank, mentionedIn }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isTopThree = rank <= 3;
  
  return (
    <div className="border-b border-gray-100 last:border-0 transition-colors">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`group flex items-center px-6 py-5 cursor-pointer transition-all ${isExpanded ? 'bg-indigo-50/50' : 'hover:bg-indigo-50/30 bg-white'}`}
      >
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
              <a 
                href={tool.url} 
                target="_blank" 
                rel="noopener" 
                onClick={(e) => e.stopPropagation()}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-indigo-600"
              >
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
          {isExpanded ? (
            <ChevronDown size={18} className="text-indigo-600" />
          ) : (
            <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="bg-gray-50/50 border-t border-indigo-100/50 px-6 py-6 animate-in slide-in-from-top-2 duration-200">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Mentioned in {mentionedIn.length} Episodes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mentionedIn.map((episode) => (
              <a 
                key={episode.id}
                href={episode.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all group/ep"
              >
                <div className="w-16 aspect-video rounded-md overflow-hidden flex-shrink-0 bg-gray-200">
                  <img src={episode.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-gray-900 truncate group-hover/ep:text-indigo-600 transition-colors">{episode.title}</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-tight flex items-center gap-1">
                      <Youtube size={10} /> {episode.podcastName}
                    </span>
                    <span className="text-[9px] text-gray-400 flex items-center gap-1">
                      <Calendar size={10} /> {new Date(episode.dateAdded).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardRow;
