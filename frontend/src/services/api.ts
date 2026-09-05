import type {
  Article,
  Explanation,
  ExploreOptions,
  FavoriteItem,
  HistoryItem,
  Perspective,
  Profile,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export function getCurrentArticle() {
  return request<Article>("/articles/current");
}

export function analyzeArticle(url: string) {
  return request<{ article: Article; progress: number; status: string; steps: string[] }>(
    "/articles/analyze",
    {
      method: "POST",
      body: JSON.stringify({ input_type: "url", url }),
    },
  );
}

export function getExplanations() {
  return request<Explanation[]>("/explanations");
}

export function getPerspectives() {
  return request<Perspective[]>("/perspectives");
}

export function getHistory() {
  return request<HistoryItem[]>("/history");
}

export function getFavorites() {
  return request<FavoriteItem[]>("/favorites");
}

export function getProfile() {
  return request<Profile>("/profile");
}

export function getExploreOptions() {
  return request<ExploreOptions>("/explore/options");
}
