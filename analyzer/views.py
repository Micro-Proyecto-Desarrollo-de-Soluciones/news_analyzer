from django.shortcuts import render


ARTICLE = {
    "source": "CNN",
    "title": "Biden unveils plan to expand social programs",
    "date": "20 Mayo 2024",
    "topic": "Política / Elecciones",
    "model": "BiasClassifier v1.3",
    "orientation": "LEFT",
    "confidence": "Confianza alta",
    "scores": {"left": 72, "center": 19, "right": 9},
}

EXPLANATIONS = [
    ("government intervention", 0.28),
    ("social inequality", 0.24),
    ("public healthcare", 0.16),
    ("income redistribution", 0.12),
    ("corporate responsibility", 0.08),
]

PERSPECTIVES = [
    {
        "source": "CNN",
        "brand": "CNN",
        "title": "Biden unveils plan to expand social programs",
        "date": "20 Mayo 2024",
        "orientation": "LEFT",
        "accent": "left",
    },
    {
        "source": "Quarters",
        "brand": "TQ",
        "title": "Why social investment is essential for equality",
        "date": "19 Mayo 2024",
        "orientation": "LEFT",
        "accent": "left",
    },
]

HISTORY_ITEMS = [
    ("CNN", "Biden unveils plan to expand social programs", "LEFT", "72%", "20 Mayo 2024"),
    ("FOX", "Biden's spending plan raises concerns", "RIGHT", "68%", "19 Mayo 2024"),
    ("R", "U.S. inflation cooling slower than expected", "CENTER", "55%", "18 Mayo 2024"),
    ("BBC", "What the new climate policy means", "LEFT", "63%", "17 Mayo 2024"),
]

FAVORITES = [
    ("NYT", "The New York Times", "A balanced look at the immigration reform debate", "CENTER", "15 Mayo 2024"),
    ("B", "Bloomberg", "Markets react to new economic data", "CENTER", "14 Mayo 2024"),
    ("AJ", "Al Jazeera", "Global perspectives on climate action", "LEFT", "12 Mayo 2024"),
]


def base_context(active="home"):
    return {
        "article": ARTICLE,
        "explanations": EXPLANATIONS,
        "perspectives": PERSPECTIVES,
        "history_items": HISTORY_ITEMS,
        "favorites": FAVORITES,
        "active": active,
    }


def home(request):
    return render(request, "analyzer/home.html", base_context("home"))


def analyzing(request):
    return render(request, "analyzer/analyzing.html", base_context("home"))


def result(request):
    return render(request, "analyzer/result.html", base_context("home"))


def explanation(request):
    return render(request, "analyzer/explanation.html", base_context("home"))


def perspectives(request):
    return render(request, "analyzer/perspectives.html", base_context("home"))


def article(request):
    return render(request, "analyzer/article.html", base_context("home"))


def history(request):
    return render(request, "analyzer/history.html", base_context("history"))


def favorites(request):
    return render(request, "analyzer/favorites.html", base_context("favorites"))


def explore(request):
    return render(request, "analyzer/explore.html", base_context("home"))


def profile(request):
    return render(request, "analyzer/profile.html", base_context("profile"))


def dark_result(request):
    return render(request, "analyzer/result.html", {**base_context("home"), "dark": True})


def onboarding(request):
    return render(request, "analyzer/onboarding.html", base_context("home"))
