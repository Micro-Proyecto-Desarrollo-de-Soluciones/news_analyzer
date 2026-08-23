from django.urls import path

from . import views

app_name = "analyzer"

urlpatterns = [
    path("", views.home, name="home"),
    path("analyzing/", views.analyzing, name="analyzing"),
    path("result/", views.result, name="result"),
    path("explanation/", views.explanation, name="explanation"),
    path("perspectives/", views.perspectives, name="perspectives"),
    path("article/", views.article, name="article"),
    path("history/", views.history, name="history"),
    path("favorites/", views.favorites, name="favorites"),
    path("explore/", views.explore, name="explore"),
    path("profile/", views.profile, name="profile"),
    path("dark/", views.dark_result, name="dark"),
    path("onboarding/", views.onboarding, name="onboarding"),
]
