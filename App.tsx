
import React, { useState, useMemo } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { Plus, Search, TrendingUp, Mic, Info, Loader2, Link2, X, Sparkles, Youtube, CheckCircle2, Download, FileText } from 'lucide-react';
import { Tool, Episode, ExtractionResult } from './types';
import { searchForEpisodeTools } from './services/geminiService';
import EpisodeCard from './components/EpisodeCard';
import LeaderboardRow from './components/LeaderboardRow';

const Dashboard = ({ tools, episodes, onAddClick }: { tools: Tool[], episodes: Episode[], onAddClick: () => void }) => {
  const sortedTools = useMemo(() => [...tools].sort((a, b) => b.mentionCount - a.mentionCount), [tools]);
  
  if (episodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
          <Sparkles size={48} />
        </div>
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Start your tool directory</h1>
        <p className="text-gray-500 max-w-md mb-10 text-lg leading-relaxed">
          Paste YouTube URLs of your favorite podcasts to automatically extract and track referenced software.
        </p>
        <button 
          onClick={onAddClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all shadow-xl shadow-indigo-100 hover:-translate-y-1 active:scale-95"
        >
          <Plus size={24} /> Add Episodes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <section className="text-center py-16 bg-white border-b border-gray-100 -mx-4 px-4 sm:-mx-8 sm:px-8">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6 tracking-tight">
          Tools of the <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Trade</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          The ultimate directory of tools, platforms, and software mentioned by industry leaders on world-class podcasts.
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
          </div>
          <Link to="/leaderboard" className="text-indigo-600 font-semibold hover:underline">
            See all rankings
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {sortedTools.slice(0, 5).map((tool, index) => (
            <LeaderboardRow 
              key={tool.id} 
              tool={tool} 
              rank={index + 1} 
              mentionedIn={episodes.filter(e => tool.episodes.includes(e.id))}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Mic className="text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Recent Episodes</h2>
          </div>
          <Link to="/episodes" className="text-indigo-600 font-semibold hover:underline">
            View all history
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {episodes.slice(0, 8).map(episode => (
            <EpisodeCard key={episode.id} episode={episode} onClick={() => window.open(episode.youtubeUrl, '_blank')} />
          ))}
        </div>
      </section>
    </div>
  );
};

const AddEpisodeModal = ({ onComplete }: { onComplete: (res: ExtractionResult[]) => void }) => {
  const [urlsInput, setUrlsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<{ url: string, status: 'pending' | 'loading' | 'success' | 'error' }[]>([]);

  const handleProcess = async () => {
    const urls = urlsInput.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    
    if (urls.length === 0) {
      setError('Please provide at least one YouTube URL.');
      return;
    }
    
    if (urls.length > 10) {
      setError('Please limit to 10 URLs at a time.');
      return;
    }

    setLoading(true);
    setError('');
    const initialProgress = urls.map(url => ({ url, status: 'pending' as const }));
    setProgress(initialProgress);

    const allResults: ExtractionResult[] = [];

    for (let i = 0; i < urls.length; i++) {
      const currentUrl = urls[i];
      setProgress(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'loading' } : p));
      
      try {
        const result = await searchForEpisodeTools(currentUrl);
        allResults.push(result);
        setProgress(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'success' } : p));
        
        // Add a small 1s delay between batch items to avoid hitting rate limits too fast
        if (i < urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (err) {
        console.error(`Error processing ${currentUrl}`, err);
        setProgress(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'error' } : p));
      }
    }

    if (allResults.length > 0) {
      setTimeout(() => onComplete(allResults), 800);
    } else {
      setLoading(false);
      setError('None of the URLs could be processed correctly. This might be due to quota limits.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-black p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Youtube className="text-red-500" />
            <h2 className="text-2xl font-serif font-bold">Batch Import</h2>
          </div>
          <p className="text-gray-400 text-sm">Paste up to 10 YouTube video links (one per line) to scan for tools.</p>
        </div>
        
        <div className="p-8 space-y-6">
          {!loading ? (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">YouTube URLs (One per line)</label>
                <div className="relative">
                  <textarea 
                    rows={6}
                    placeholder="https://www.youtube.com/watch?v=...&#10;https://www.youtube.com/watch?v=..."
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none font-mono text-sm"
                    value={urlsInput}
                    onChange={(e) => setUrlsInput(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold">{error}</div>}

              <button 
                onClick={handleProcess}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Process Batch
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
              </div>
              <p className="text-center text-sm text-gray-500 italic">Processing episodes. We've added retry logic and delays to handle quota limits gracefully.</p>
              <div className="space-y-2">
                {progress.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-500 truncate max-w-[200px]">{p.url}</span>
                    <div className="flex items-center gap-2">
                      {p.status === 'loading' && <Loader2 className="animate-spin text-indigo-500" size={16} />}
                      {p.status === 'success' && <CheckCircle2 className="text-green-500" size={16} />}
                      {p.status === 'error' && <X className="text-red-500" size={16} />}
                      <span className={`text-[10px] font-bold uppercase ${p.status === 'success' ? 'text-green-600' : p.status === 'error' ? 'text-red-600' : 'text-gray-400'}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const handleExtractionComplete = (results: ExtractionResult[]) => {
    let currentTools = [...tools];
    let currentEpisodes = [...episodes];

    results.forEach(result => {
      result.episodes.forEach((episodeRes) => {
        if (currentEpisodes.find(e => e.youtubeUrl === episodeRes.youtubeUrl)) return;

        const episodeId = 'e' + Math.random().toString(36).substr(2, 9);
        const toolIdsForThisEpisode: string[] = [];

        episodeRes.tools.forEach(t => {
          const existingToolIndex = currentTools.findIndex(ut => ut.name.toLowerCase() === t.name.toLowerCase());
          if (existingToolIndex > -1) {
            currentTools[existingToolIndex].mentionCount += 1;
            if (!currentTools[existingToolIndex].episodes.includes(episodeId)) {
              currentTools[existingToolIndex].episodes.push(episodeId);
            }
            toolIdsForThisEpisode.push(currentTools[existingToolIndex].id);
          } else {
            const newTool: Tool = {
              id: 't' + Math.random().toString(36).substr(2, 9),
              name: t.name,
              url: t.url,
              description: t.description,
              category: t.category,
              mentionCount: 1,
              episodes: [episodeId]
            };
            currentTools.push(newTool);
            toolIdsForThisEpisode.push(newTool.id);
          }
        });

        const newEpisode: Episode = {
          id: episodeId,
          title: episodeRes.episodeTitle,
          podcastName: episodeRes.podcastName,
          youtubeUrl: episodeRes.youtubeUrl,
          thumbnail: episodeRes.thumbnailUrl,
          dateAdded: episodeRes.uploadDate,
          toolsFound: toolIdsForThisEpisode
        };

        currentEpisodes = [newEpisode, ...currentEpisodes];
      });
    });

    setTools(currentTools);
    setEpisodes(currentEpisodes);
    setIsAdding(false);
  };

  const exportMarkdown = () => {
    if (tools.length === 0) return;
    
    const sorted = [...tools].sort((a, b) => b.mentionCount - a.mentionCount);
    let md = "# PodTool Leaderboard\n\n";
    md += "| Rank | Tool | Category | Mentions | URL |\n";
    md += "| :--- | :--- | :--- | :--- | :--- |\n";
    
    sorted.forEach((tool, i) => {
      md += `| ${i + 1} | **${tool.name}** | ${tool.category} | ${tool.mentionCount} | [Link](${tool.url}) |\n`;
    });
    
    md += "\n*Generated by PodTool Tracker*";
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `podtool-leaderboard-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-[#fcfcfc]">
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 sm:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white group-hover:rotate-12 transition-transform shadow-indigo-100 shadow-lg">
                <Mic size={24} />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight text-gray-900">PodTool</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Directory</Link>
              <Link to="/leaderboard" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Leaderboard</Link>
              <Link to="/episodes" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Episodes</Link>
            </div>

            <button 
              onClick={() => setIsAdding(true)}
              className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus size={18} /> Add Episodes
            </button>
          </div>
        </nav>

        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full">
          <Routes>
            <Route path="/" element={<Dashboard tools={tools} episodes={episodes} onAddClick={() => setIsAdding(true)} />} />
            <Route path="/leaderboard" element={
              <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                  <div>
                    <h2 className="text-4xl font-serif font-bold text-gray-900 mb-2">Global Leaderboard</h2>
                    <p className="text-gray-500">Ranked by total mentions across all imported episodes.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={exportMarkdown}
                      className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"
                    >
                      <FileText size={16} className="text-indigo-500" /> Export Markdown
                    </button>
                    <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold">
                      {tools.length} Tools Cataloged
                    </div>
                  </div>
                </div>
                {tools.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl">
                    <p className="text-gray-400">No tools cataloged yet.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center bg-gray-50 px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      <div className="w-12">Rank</div>
                      <div className="flex-grow">Tool & Description</div>
                      <div className="hidden md:block w-40 px-4">Category</div>
                      <div className="w-32 text-right">Mentions</div>
                      <div className="w-10"></div>
                    </div>
                    {[...tools].sort((a,b) => b.mentionCount - a.mentionCount).map((tool, i) => (
                      <LeaderboardRow 
                        key={tool.id} 
                        tool={tool} 
                        rank={i + 1} 
                        mentionedIn={episodes.filter(e => tool.episodes.includes(e.id))}
                      />
                    ))}
                  </div>
                )}
              </div>
            } />
            <Route path="/episodes" element={
              <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-4xl font-serif font-bold mb-8 text-gray-900">Episode History</h2>
                {episodes.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl">
                    <p className="text-gray-400">No episodes imported yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {episodes.map(episode => (
                      <EpisodeCard key={episode.id} episode={episode} onClick={() => window.open(episode.youtubeUrl, '_blank')} />
                    ))}
                  </div>
                )}
              </div>
            } />
          </Routes>
        </main>

        {isAdding && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsAdding(false)}></div>
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
              <button 
                onClick={() => setIsAdding(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
              >
                <X size={24} />
              </button>
              <AddEpisodeModal onComplete={handleExtractionComplete} />
            </div>
          </div>
        )}

        <footer className="bg-white border-t border-gray-100 py-12 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 opacity-50">
              <Mic size={20} />
              <span className="font-serif font-bold text-xl text-gray-900">PodTool</span>
            </div>
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} PodTool Tracker. All tools are auto-extracted from YouTube descriptions.
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
}
