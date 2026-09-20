export type Orientation = "LEFT" | "CENTER" | "RIGHT";

export interface BiasScores {
  left: number;
  center: number;
  right: number;
}

export interface Article {
  id: string;
  source: string;
  title: string;
  date: string;
  topic: string;
  model: string;
  orientation: Orientation;
  confidence: string;
  scores: BiasScores;
  summary: string;
  main_arguments: string[];
  url?: string | null;
  explicacion?: Explanation[];
  advertencias?: string[];
}

export interface Explanation {
  text: string;
  weight: number;
}

export interface Perspective {
  id: string;
  source: string;
  brand: string;
  title: string;
  date: string;
  orientation: Orientation;
  accent: string;
}

export interface HistoryItem {
  id: string;
  logo: string;
  title: string;
  orientation: Orientation;
  score: string;
  date: string;
}

export interface FavoriteItem {
  id: string;
  logo: string;
  source: string;
  title: string;
  orientation: Orientation;
  date: string;
}

export interface Profile {
  name: string;
  email: string;
  plan: string;
  initials: string;
  stats: {
    analyses: number;
    favorites: number;
    active_days: number;
  };
}

export interface ExploreOptions {
  topics: string[];
  orientations: Orientation[];
  sources: string[];
  date_ranges: string[];
}

export interface PredictProbabilities {
  center: number;
  left: number;
  right: number;
}

export interface PredictResponse {
  id: string;
  clase: string;
  probabilidades: PredictProbabilities;
  version_modelo?: string | null;
  advertencias?: string[];
  explicacion?: Explanation[];
}
