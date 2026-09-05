from __future__ import annotations

import json
from uuid import uuid4
from pathlib import Path
from typing import List, Optional

from backend.app.schemas.news import (
    AnalysisRequest,
    AnalysisResponse,
    Article,
    BiasScores,
    Explanation,
    ExploreOptions,
    FavoriteItem,
    HistoryItem,
    Perspective,
    PredictRequest,
    PredictResponse,
    ProfileStats,
    UserProfile,
)


PROJECT_ROOT = Path(__file__).resolve().parents[3]
MOCK_OUTPUT_PATH = PROJECT_ROOT / "data" / "salida.json"


ARTICLE = Article(
    id="cnn-biden-social-programs",
    source="CNN",
    title="Biden unveils plan to expand social programs",
    date="20 Mayo 2024",
    topic="Politica / Elecciones",
    model="BiasClassifier v1.3",
    orientation="LEFT",
    confidence="Confianza alta",
    scores=BiasScores(left=72, center=19, right=9),
    summary=(
        "El presidente Biden presento un plan para expandir la inversion en "
        "programas sociales, incluyendo educacion asequible, atencion medica y vivienda."
    ),
    main_arguments=[
        "Mayor inversion publica en comunidades vulnerables.",
        "Reduccion de la desigualdad economica.",
        "Creacion de empleos y crecimiento inclusivo.",
    ],
    url="https://www.cnn.com/",
)

EXPLANATIONS = [
    Explanation(text="government intervention", weight=0.28),
    Explanation(text="social inequality", weight=0.24),
    Explanation(text="public healthcare", weight=0.16),
    Explanation(text="income redistribution", weight=0.12),
    Explanation(text="corporate responsibility", weight=0.08),
]

PERSPECTIVES = [
    Perspective(
        id="cnn-biden-social-programs",
        source="CNN",
        brand="CNN",
        title="Biden unveils plan to expand social programs",
        date="20 Mayo 2024",
        orientation="LEFT",
        accent="left",
    ),
    Perspective(
        id="quarters-social-investment",
        source="Quarters",
        brand="TQ",
        title="Why social investment is essential for equality",
        date="19 Mayo 2024",
        orientation="LEFT",
        accent="left",
    ),
]

HISTORY_ITEMS = [
    HistoryItem(
        id="history-1",
        logo="CNN",
        title="Biden unveils plan to expand social programs",
        orientation="LEFT",
        score="72%",
        date="20 Mayo 2024",
    ),
    HistoryItem(
        id="history-2",
        logo="FOX",
        title="Biden's spending plan raises concerns",
        orientation="RIGHT",
        score="68%",
        date="19 Mayo 2024",
    ),
    HistoryItem(
        id="history-3",
        logo="R",
        title="U.S. inflation cooling slower than expected",
        orientation="CENTER",
        score="55%",
        date="18 Mayo 2024",
    ),
    HistoryItem(
        id="history-4",
        logo="BBC",
        title="What the new climate policy means",
        orientation="LEFT",
        score="63%",
        date="17 Mayo 2024",
    ),
]

FAVORITES = [
    FavoriteItem(
        id="favorite-1",
        logo="NYT",
        source="The New York Times",
        title="A balanced look at the immigration reform debate",
        orientation="CENTER",
        date="15 Mayo 2024",
    ),
    FavoriteItem(
        id="favorite-2",
        logo="B",
        source="Bloomberg",
        title="Markets react to new economic data",
        orientation="CENTER",
        date="14 Mayo 2024",
    ),
    FavoriteItem(
        id="favorite-3",
        logo="AJ",
        source="Al Jazeera",
        title="Global perspectives on climate action",
        orientation="LEFT",
        date="12 Mayo 2024",
    ),
]

PROFILE = UserProfile(
    name="Carlos Rodriguez",
    email="carlos@example.com",
    plan="Usuario Premium",
    initials="CR",
    stats=ProfileStats(analyses=128, favorites=34, active_days=12),
)


def get_current_article() -> Article:
    return ARTICLE


def analyze_article(_: AnalysisRequest) -> AnalysisResponse:
    return AnalysisResponse(
        status="completed",
        progress=100,
        steps=[
            "Extrayendo articulo",
            "Procesando contenido",
            "Analizando sesgo politico",
            "Generando resultados",
        ],
        article=ARTICLE,
    )


def predict(_: PredictRequest) -> PredictResponse:
    with MOCK_OUTPUT_PATH.open(encoding="utf-8") as file:
        output = json.load(file)

    output["id"] = str(uuid4())
    return PredictResponse.model_validate(output)


def get_explanations() -> List[Explanation]:
    return EXPLANATIONS


def get_perspectives(orientation: Optional[str] = None) -> List[Perspective]:
    if not orientation:
        return PERSPECTIVES

    normalized = orientation.upper()
    return [item for item in PERSPECTIVES if item.orientation == normalized]


def get_history() -> List[HistoryItem]:
    return HISTORY_ITEMS


def get_favorites() -> List[FavoriteItem]:
    return FAVORITES


def get_profile() -> UserProfile:
    return PROFILE


def get_explore_options() -> ExploreOptions:
    return ExploreOptions(
        topics=["Inmigracion", "Economia", "Politica"],
        orientations=["LEFT", "CENTER", "RIGHT"],
        sources=["Todas las fuentes", "CNN", "Reuters"],
        date_ranges=["Ultimos 30 dias", "Esta semana"],
    )
