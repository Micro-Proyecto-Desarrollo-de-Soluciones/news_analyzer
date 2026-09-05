import {
  Bookmark,
  ChartNoAxesColumnIncreasing,
  Check,
  CircleHelp,
  Filter,
  Landmark,
  Link,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { BottomNav } from "./components/BottomNav";
import { Header } from "./components/Header";
import {
  analyzeArticle,
  getCurrentArticle,
  getExplanations,
  getExploreOptions,
  getFavorites,
  getHistory,
  getPerspectives,
  getProfile,
} from "./services/api";
import type {
  Article,
  Explanation,
  ExploreOptions,
  FavoriteItem,
  HistoryItem,
  Perspective,
  Profile,
} from "./types";

export type Screen =
  | "home"
  | "analyzing"
  | "result"
  | "explanation"
  | "perspectives"
  | "article"
  | "history"
  | "favorites"
  | "explore"
  | "profile"
  | "onboarding";

const defaultUrl = "https://ejemplo.com/noticia";

export function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [article, setArticle] = useState<Article | null>(null);
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [perspectives, setPerspectives] = useState<Perspective[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [options, setOptions] = useState<ExploreOptions | null>(null);
  const [articleUrl, setArticleUrl] = useState(defaultUrl);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getCurrentArticle(),
      getExplanations(),
      getPerspectives(),
      getHistory(),
      getFavorites(),
      getProfile(),
      getExploreOptions(),
    ])
      .then(([articleData, explanationData, perspectiveData, historyData, favoriteData, profileData, optionData]) => {
        setArticle(articleData);
        setExplanations(explanationData);
        setPerspectives(perspectiveData);
        setHistory(historyData);
        setFavorites(favoriteData);
        setProfile(profileData);
        setOptions(optionData);
      })
      .catch(() => {
        setError("No se pudo conectar con la API. Verifica que FastAPI este ejecutandose.");
      })
      .finally(() => setLoading(false));
  }, []);

  const activeNav = useMemo<Screen>(() => {
    if (["history", "favorites", "profile"].includes(screen)) {
      return screen;
    }
    return "home";
  }, [screen]);

  async function handleAnalyze() {
    setScreen("analyzing");
    const response = await analyzeArticle(articleUrl);
    setArticle(response.article);
  }

  function renderScreen() {
    if (loading) {
      return <LoadingScreen />;
    }

    if (error) {
      return <ErrorScreen message={error} />;
    }

    if (!article || !profile || !options) {
      return <ErrorScreen message="La API no devolvio todos los datos esperados." />;
    }

    const props = {
      article,
      explanations,
      perspectives,
      history,
      favorites,
      profile,
      options,
      setScreen,
    };

    switch (screen) {
      case "analyzing":
        return <AnalyzingScreen onBack={() => setScreen("home")} onDone={() => setScreen("result")} />;
      case "result":
        return <ResultScreen article={article} onBack={() => setScreen("home")} onExplain={() => setScreen("explanation")} />;
      case "explanation":
        return <ExplanationScreen explanations={explanations} onBack={() => setScreen("result")} />;
      case "perspectives":
        return <PerspectivesScreen {...props} />;
      case "article":
        return <ArticleScreen article={article} onBack={() => setScreen("perspectives")} />;
      case "history":
        return <HistoryScreen items={history} />;
      case "favorites":
        return <FavoritesScreen items={favorites} />;
      case "explore":
        return <ExploreScreen options={options} />;
      case "profile":
        return <ProfileScreen profile={profile} />;
      case "onboarding":
        return <OnboardingScreen onContinue={() => setScreen("home")} />;
      default:
        return (
          <HomeScreen
            articleUrl={articleUrl}
            onArticleUrlChange={setArticleUrl}
            onAnalyze={handleAnalyze}
            onNavigate={setScreen}
          />
        );
    }
  }

  const hideNav = screen === "analyzing" || screen === "article" || screen === "onboarding";

  return (
    <main className={`stage ${screen === "onboarding" ? "onboarding-stage" : ""}`}>
      <section className="phone">
        <div className="statusbar">
          <span>9:41</span>
          <span className="status-icons">||| wifi bat</span>
        </div>
        <div className="screen">{renderScreen()}</div>
        {!hideNav && <BottomNav active={activeNav} onNavigate={setScreen} />}
      </section>
    </main>
  );
}

function LoadingScreen() {
  return (
    <div className="center-state">
      <Sparkles aria-hidden="true" size={34} />
      <p>Cargando servicios...</p>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="center-state error">
      <CircleHelp aria-hidden="true" size={34} />
      <p>{message}</p>
    </div>
  );
}

function HomeScreen({
  articleUrl,
  onArticleUrlChange,
  onAnalyze,
  onNavigate,
}: {
  articleUrl: string;
  onArticleUrlChange: (value: string) => void;
  onAnalyze: () => void;
  onNavigate: (screen: Screen) => void;
}) {
  return (
    <>
      <div className="home-hero">
        <div>
          <h1>
            News
            <br />
            <span>Perspective</span>
            <br />
            Analyzer
          </h1>
          <p>Entiende la perspectiva detras de las noticias que lees.</p>
        </div>
        <div className="app-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      <section className="panel input-panel">
        <div className="segmented">
          <button className="selected" type="button">
            Pegar URL
          </button>
          <button type="button">Pegar Texto</button>
        </div>
        <label className="url-field">
          <Link aria-hidden="true" size={18} />
          <input value={articleUrl} onChange={(event) => onArticleUrlChange(event.target.value)} aria-label="URL de noticia" />
        </label>
        <button className="primary-button" onClick={onAnalyze} type="button">
          Analizar noticia
        </button>
      </section>

      <p className="muted centered">o prueba con un ejemplo</p>
      <div className="category-grid">
        <button className="category" onClick={() => onNavigate("perspectives")} type="button">
          <Landmark aria-hidden="true" size={21} />
          <b>Politica</b>
        </button>
        <button className="category" onClick={() => onNavigate("explore")} type="button">
          <ChartNoAxesColumnIncreasing aria-hidden="true" size={21} />
          <b>Economia</b>
        </button>
        <button className="category" onClick={() => onNavigate("explore")} type="button">
          <Users aria-hidden="true" size={21} />
          <b>Inmigracion</b>
        </button>
      </div>
    </>
  );
}

function AnalyzingScreen({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  return (
    <>
      <Header title="Analizando noticia" onBack={onBack} />
      <div className="analysis-illustration">
        <div className="paper">
          <i />
          <i />
          <i />
          <span className="magnifier" />
        </div>
      </div>

      <h2 className="analysis-title">
        Extrayendo y analizando
        <br />
        el articulo...
      </h2>
      <div className="progress-line">
        <span style={{ width: "78%" }} />
        <b>78%</b>
      </div>
      <ol className="steps">
        {["Extrayendo articulo", "Procesando contenido", "Analizando sesgo politico"].map((step) => (
          <li className="done" key={step}>
            <span />
            {step}
            <Check aria-hidden="true" size={18} />
          </li>
        ))}
        <li className="loading">
          <span />
          Generando resultados
        </li>
      </ol>
      <button className="ghost-next" onClick={onDone} type="button">
        Ver resultado
      </button>
    </>
  );
}

function ResultScreen({ article, onBack, onExplain }: { article: Article; onBack: () => void; onExplain: () => void }) {
  return (
    <>
      <Header onBack={onBack} />
      <h2 className="section-title">
        Perspectiva politica estimada <CircleHelp className="info-icon" aria-hidden="true" size={16} />
      </h2>

      <div className="bias-labels">
        <b>LEFT</b>
        <b>CENTER</b>
        <b>RIGHT</b>
      </div>
      <div className="bias-bar">
        <span className="left" style={{ width: `${article.scores.left}%` }} />
        <span className="center" style={{ width: `${article.scores.center}%` }} />
        <span className="right" style={{ width: `${article.scores.right}%` }} />
      </div>
      <div className="scores">
        <strong>{article.scores.left}%</strong>
        <strong>{article.scores.center}%</strong>
        <strong>{article.scores.right}%</strong>
      </div>

      <section className="panel result-card">
        <p>Orientacion estimada</p>
        <h1>{article.orientation}</h1>
        <span>{article.confidence}</span>
      </section>

      <section className="panel details-card">
        <h3>Sobre este articulo</h3>
        <dl>
          <dt>Fuente</dt>
          <dd>{article.source}</dd>
          <dt>Tema</dt>
          <dd>{article.topic}</dd>
          <dt>Fecha</dt>
          <dd>{article.date}</dd>
          <dt>Modelo</dt>
          <dd>{article.model}</dd>
        </dl>
      </section>
      <button className="secondary-link" onClick={onExplain} type="button">
        Ver explicacion del resultado
      </button>
    </>
  );
}

function ExplanationScreen({ explanations, onBack }: { explanations: Explanation[]; onBack: () => void }) {
  return (
    <>
      <Header onBack={onBack} />
      <h2 className="explain-title">
        Por que el modelo
        <br />
        llego a esta conclusion?
      </h2>
      <p className="lead">Estas expresiones influyeron en la prediccion del modelo.</p>
      <div className="segmented compact">
        <button className="selected" type="button">
          Expresiones clave
        </button>
        <button type="button">Sentimiento</button>
      </div>
      <div className="keyword-list">
        {explanations.map((item) => (
          <article className="keyword-card" key={item.text}>
            <b>"{item.text}"</b>
            <div>
              <span>Influencia</span>
              <strong>{item.weight}</strong>
            </div>
            <meter min="0" max="0.3" value={item.weight} />
          </article>
        ))}
      </div>
      <p className="note">Las expresiones anteriores reflejan patrones aprendidos por el modelo.</p>
    </>
  );
}

function PerspectivesScreen({
  perspectives,
  setScreen,
}: {
  perspectives: Perspective[];
  setScreen: (screen: Screen) => void;
}) {
  return (
    <>
      <h1 className="plain-title">
        Otras perspectivas sobre
        <br />
        este tema
      </h1>
      <p className="lead">Mismo tema, diferentes perspectivas</p>
      <div className="bias-tabs">
        <button className="active" type="button">
          LEFT
        </button>
        <button type="button">CENTER</button>
        <button type="button">RIGHT</button>
      </div>
      <div className="article-list">
        {perspectives.map((item) => (
          <article className="panel article-card" key={item.id}>
            <div className="card-top">
              <span className={`logo ${item.accent}`}>{item.brand}</span>
              <b>{item.source}</b>
              <em>{item.orientation}</em>
            </div>
            <h2>{item.title}</h2>
            <p>{item.date}</p>
            <button className="outline-button" onClick={() => setScreen("article")} type="button">
              Leer articulo
            </button>
          </article>
        ))}
      </div>
    </>
  );
}

function ArticleScreen({ article, onBack }: { article: Article; onBack: () => void }) {
  return (
    <>
      <Header onBack={onBack} />
      <span className="cnn-word">CNN</span>
      <span className="pill floating">{article.orientation}</span>
      <h1 className="article-title">{article.title}</h1>
      <p className="meta">{article.date} · Politica</p>
      <h3>Resumen</h3>
      <p>{article.summary}</p>
      <h3>Argumentos principales</h3>
      <ul className="bullets">
        {article.main_arguments.map((argument) => (
          <li key={argument}>{argument}</li>
        ))}
      </ul>
      <a className="primary-button fixed-bottom" href={article.url} target="_blank" rel="noreferrer">
        Ver articulo completo
      </a>
    </>
  );
}

function HistoryScreen({ items }: { items: HistoryItem[] }) {
  return (
    <>
      <h1 className="plain-title">Historial de analisis</h1>
      <div className="article-list">
        {items.map((item) => (
          <article className="panel history-card" key={item.id}>
            <span className="logo small">{item.logo}</span>
            <div>
              <h2>{item.title}</h2>
              <p>
                <b className={item.orientation.toLowerCase()}>{item.orientation}</b> · {item.score}
              </p>
              <small>{item.date}</small>
            </div>
            <button className="bookmark" type="button" aria-label="Guardar">
              <Bookmark aria-hidden="true" size={15} />
            </button>
          </article>
        ))}
      </div>
    </>
  );
}

function FavoritesScreen({ items }: { items: FavoriteItem[] }) {
  return (
    <>
      <h1 className="plain-title">Favoritos</h1>
      <div className="article-list">
        {items.map((item) => (
          <article className="panel favorite-card" key={item.id}>
            <span className="logo small">{item.logo}</span>
            <div>
              <p className="source">
                {item.source} <em>{item.orientation}</em>
              </p>
              <h2>{item.title}</h2>
              <small>{item.date}</small>
            </div>
            <button className="bookmark saved" type="button" aria-label="Favorito">
              <Bookmark aria-hidden="true" size={15} />
            </button>
          </article>
        ))}
      </div>
    </>
  );
}

function ExploreScreen({ options }: { options: ExploreOptions }) {
  return (
    <>
      <h1 className="plain-title">Explorar articulos</h1>
      <p className="lead">Encuentra articulos por tema, fuente o perspectiva</p>
      <div className="search-row">
        <label>
          <Search aria-hidden="true" size={18} />
          <input placeholder="Buscar articulos o temas..." aria-label="Buscar" />
        </label>
        <button aria-label="Filtros" type="button">
          <Filter aria-hidden="true" size={18} />
        </button>
      </div>
      <h3>Filtros</h3>
      <form className="filter-form">
        <label>
          Tema
          <select defaultValue={options.topics[0]}>
            {options.topics.map((topic) => (
              <option key={topic}>{topic}</option>
            ))}
          </select>
        </label>
        <span>Perspectiva</span>
        <div className="choice-row">
          {options.orientations.map((orientation) => (
            <button type="button" key={orientation}>
              {orientation}
            </button>
          ))}
        </div>
        <label>
          Fuente
          <select defaultValue={options.sources[0]}>
            {options.sources.map((source) => (
              <option key={source}>{source}</option>
            ))}
          </select>
        </label>
        <label>
          Fecha
          <select defaultValue={options.date_ranges[0]}>
            {options.date_ranges.map((range) => (
              <option key={range}>{range}</option>
            ))}
          </select>
        </label>
        <button className="primary-button" type="button">
          Aplicar filtros
        </button>
      </form>
    </>
  );
}

function ProfileScreen({ profile }: { profile: Profile }) {
  return (
    <>
      <section className="profile-head">
        <div className="avatar">{profile.initials}</div>
        <div>
          <h1>{profile.name}</h1>
          <p>{profile.email}</p>
          <span>{profile.plan}</span>
        </div>
      </section>
      <div className="stats">
        <div>
          <span>Analisis realizados</span>
          <b>{profile.stats.analyses}</b>
        </div>
        <div>
          <span>Articulos favoritos</span>
          <b>{profile.stats.favorites}</b>
        </div>
        <div>
          <span>Dias activo</span>
          <b>{profile.stats.active_days}</b>
        </div>
      </div>
      <div className="settings-list">
        {["Preferencias", "Notificaciones", "Ayuda y soporte", "Cerrar sesion"].map((item) => (
          <button key={item} type="button">
            {item} <span>›</span>
          </button>
        ))}
      </div>
    </>
  );
}

function OnboardingScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <>
      <button className="skip" onClick={onContinue} type="button">
        Omitir
      </button>
      <div className="onboarding-art">
        <span className="bubble left-bubble">LEFT</span>
        <span className="bubble center-bubble">CENTER</span>
        <span className="bubble right-bubble">RIGHT</span>
        <div className="phone-card" />
      </div>
      <h1 className="onboarding-title">Entiende cada historia desde todas las perspectivas</h1>
      <p className="onboarding-copy">
        Analizamos noticias y te mostramos como se presenta el mismo tema desde diferentes puntos de vista.
      </p>
      <div className="dots">
        <span />
        <span />
        <span />
        <span />
      </div>
      <button className="primary-button fixed-bottom" onClick={onContinue} type="button">
        Siguiente
      </button>
    </>
  );
}
