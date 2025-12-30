
import React from 'react';
import { Tool } from '../types';
import { ExternalLink, Tag, MessageSquare } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
  rank?: number;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, rank }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
      {rank !== undefined && (
        <span className="absolute -top-3 -left-3 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
          {rank}
        </span>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{tool.name}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
            <Tag size={12} className="text-indigo-500" />
            {tool.category}
          </div>
        </div>
        <a 
          href={tool.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <ExternalLink size={20} />
        </a>
      </div>

      <p className="text-gray-600 text-sm mb-6 line-clamp-2">
        {tool.description}
      </p>

      <div className="flex items-center justify-between border-t border-gray-50 pt-4">
        <div className="flex items-center gap-2 text-gray-500">
          <MessageSquare size={16} />
          <span className="text-sm font-semibold">{tool.mentionCount} Mentions</span>
        </div>
        <div className="flex -space-x-2">
          {/* Avatar placeholders for podcasts that mentioned this */}
          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-400">
            +{tool.episodes.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolCard;
