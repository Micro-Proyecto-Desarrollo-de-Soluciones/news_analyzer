from __future__ import annotations

from typing import Dict, List, Optional

from fastapi import APIRouter, Query

from backend.app.schemas.news import (
    AnalysisRequest,
    AnalysisResponse,
    Article,
    Explanation,
    ExploreOptions,
    FavoriteItem,
    HistoryItem,
    Perspective,
    UserProfile,
)
from backend.app.services import news_service

router = APIRouter()


@router.get("/health", tags=["system"])
def health_check() -> Dict[str, str]:
    return {"status": "ok"}


@router.get("/articles/current", response_model=Article, tags=["articles"])
def current_article() -> Article:
    return news_service.get_current_article()


@router.post("/articles/analyze", response_model=AnalysisResponse, tags=["articles"])
def analyze_article(payload: AnalysisRequest) -> AnalysisResponse:
    return news_service.analyze_article(payload)


@router.get("/explanations", response_model=List[Explanation], tags=["analysis"])
def explanations() -> List[Explanation]:
    return news_service.get_explanations()


@router.get("/perspectives", response_model=List[Perspective], tags=["articles"])
def perspectives(
    orientation: Optional[str] = Query(default=None, description="LEFT, CENTER or RIGHT"),
) -> List[Perspective]:
    return news_service.get_perspectives(orientation)


@router.get("/history", response_model=List[HistoryItem], tags=["user"])
def history() -> List[HistoryItem]:
    return news_service.get_history()


@router.get("/favorites", response_model=List[FavoriteItem], tags=["user"])
def favorites() -> List[FavoriteItem]:
    return news_service.get_favorites()


@router.get("/profile", response_model=UserProfile, tags=["user"])
def profile() -> UserProfile:
    return news_service.get_profile()


@router.get("/explore/options", response_model=ExploreOptions, tags=["explore"])
def explore_options() -> ExploreOptions:
    return news_service.get_explore_options()
