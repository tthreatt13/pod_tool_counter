
import React from 'react';
import { Episode } from '../types';
import { PlayCircle, Calendar } from 'lucide-react';

interface EpisodeCardProps {
  episode: Episode;
  onClick: (episode: Episode) => void;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode, onClick }) => {
  return (
    <div 
      onClick={() => onClick(episode)}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="aspect-video relative overflow-hidden bg-gray-100">
        <img 
          src={episode.thumbnail} 
          alt={episode.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <PlayCircle className="text-white" size={48} />
        </div>
      </div>
      
      <div className="p-5">
        <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">
          {episode.podcastName || "YOUTUBE"}
        </div>
        <h3 className="text-base font-bold text-gray-900 leading-tight mb-4 line-clamp-2">
          {episode.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar size={14} className="text-gray-400" />
            {new Date(episode.dateAdded).toLocaleDateString()}
          </div>
          <div className="font-bold bg-gray-50 text-gray-600 px-3 py-1 rounded-lg">
            {episode.toolsFound.length} Tools
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeCard;
