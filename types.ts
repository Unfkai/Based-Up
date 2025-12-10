export interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

export interface Tokenomics {
  name: string;
  value: number;
  fill: string;
}

export interface SketchinessMetric {
  subject: string;
  A: number; // The score (0-100), higher is skechier
  fullMark: number;
}

export interface PredictionStats {
  yes: number;
  no: number;
}

export type ProjectCategory = 'Meme' | 'DeFi' | 'DEX' | 'Gaming' | 'Utility' | 'DAO' | 'Social' | 'NFT' | 'Prediction' | 'Launchpad' | 'Community' | 'AI';

export interface Project {
  id: string;
  title: string;
  description: string;
  logo: string; // URL
  banner: string; // URL
  softCap: number; // ETH
  hardCap: number; // ETH
  raised: number; // ETH
  backers: number;
  tokenTicker: string;
  tokenomics: Tokenomics[];
  comments: Comment[];
  sketchiness: SketchinessMetric[]; // AI Analysis data
  prediction: PredictionStats; // Market sentiment
  category: ProjectCategory;
  miningEntryCost: number; // ETH required to start mining
  daoRights: boolean;
  status: 'Funding' | 'Launched' | 'Ended';
}

export interface User {
  address: string | null;
  isConnected: boolean;
  points: number; // Airdrop score
  ownedNfts: string[]; // Array of image URLs (Soulbound)
  backedProjects: string[]; // Project IDs
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  avatar: string;
  badges: string[];
}