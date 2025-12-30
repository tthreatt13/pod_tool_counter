
export interface Tool {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  mentionCount: number;
  episodes: string[];
}

export interface Episode {
  id: string;
  title: string;
  podcastName: string;
  youtubeUrl: string;
  thumbnail: string;
  dateAdded: string;
  toolsFound: string[];
}

export interface ToolExtraction {
  name: string;
  url: string;
  description: string;
  category: string;
}

export interface EpisodeResult {
  episodeTitle: string;
  podcastName: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  uploadDate: string;
  tools: ToolExtraction[];
}

export interface ExtractionResult {
  episodes: EpisodeResult[];
}