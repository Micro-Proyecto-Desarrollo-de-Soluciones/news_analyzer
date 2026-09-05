from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, HttpUrl


class BiasScores(BaseModel):
    left: int
    center: int
    right: int


class Article(BaseModel):
    id: str
    source: str
    title: str
    date: str
    topic: str
    model: str
    orientation: str
    confidence: str
    scores: BiasScores
    summary: str
    main_arguments: List[str]
    url: HttpUrl


class Explanation(BaseModel):
    text: str
    weight: float


class Perspective(BaseModel):
    id: str
    source: str
    brand: str
    title: str
    date: str
    orientation: str
    accent: str


class HistoryItem(BaseModel):
    id: str
    logo: str
    title: str
    orientation: str
    score: str
    date: str


class FavoriteItem(BaseModel):
    id: str
    logo: str
    source: str
    title: str
    orientation: str
    date: str


class ProfileStats(BaseModel):
    analyses: int
    favorites: int
    active_days: int


class UserProfile(BaseModel):
    name: str
    email: str
    plan: str
    initials: str
    stats: ProfileStats


class ExploreOptions(BaseModel):
    topics: List[str]
    orientations: List[str]
    sources: List[str]
    date_ranges: List[str]


class AnalysisRequest(BaseModel):
    input_type: str = "url"
    url: Optional[HttpUrl] = None
    text: Optional[str] = None


class AnalysisResponse(BaseModel):
    status: str
    progress: int
    steps: List[str]
    article: Article
