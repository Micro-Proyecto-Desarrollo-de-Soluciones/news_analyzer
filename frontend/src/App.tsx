import {
  Activity,
  AlertCircle,
  Bookmark,
  Check,
  CircleHelp,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  predictArticle,
} from "./services/api";
import type {
  Article,
  Explanation,
  ExploreOptions,
  FavoriteItem,
  HistoryItem,
  Orientation,
  Perspective,
  PredictResponse,
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
const defaultTitle = "Biden unveils plan to expand social programs";
const defaultText =
  "El presidente Biden presento un plan para expandir la inversion en programas sociales, incluyendo educacion asequible, atencion medica y vivienda. La propuesta plantea mayor inversion publica, reduccion de desigualdad y nuevos mecanismos de apoyo para comunidades vulnerables.";
const LOW_CONFIDENCE_THRESHOLD = 0.55;

export function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [article, setArticle] = useState<Article | null>(null);
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [perspectives, setPerspectives] = useState<Perspective[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [options, setOptions] = useState<ExploreOptions | null>(null);
  const [articleUrl] = useState(defaultUrl);
  const [predictTitle, setPredictTitle] = useState(defaultTitle);
  const [predictText, setPredictText] = useState(defaultText);
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(() => {
    setLoading(true);
    setError(null);
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

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const activeNav = useMemo<Screen>(() => {
    if (["history", "favorites", "profile"].includes(screen)) {
      return screen;
    }
    return "home";
  }, [screen]);

  async function handleAnalyze() {
    setScreen("analyzing");
    try {
      const response = await analyzeArticle(articleUrl);
      setArticle(response.article);
    } catch {
      setScreen("home");
      setPredictError("No se pudo completar el analisis por URL. Intenta nuevamente o usa el texto de la noticia.");
    }
  }

  async function handlePredict() {
    if (!predictText.trim()) {
      setPrediction(null);
      setPredictError("Ingresa el cuerpo de la noticia para ejecutar la prediccion.");
      return;
    }

    setPredicting(true);
    setPredictError(null);
    setPrediction(null);
    try {
      const response = await predictArticle({
        titulo: predictTitle.trim() || undefined,
        texto: predictText.trim(),
      });
      if (!isValidPrediction(response)) {
        setPredictError("La API respondio con datos incompletos o invalidos. Revisa el servicio de prediccion.");
        return;
      }
      setPrediction(response);
    } catch {
      setPredictError("No se pudo ejecutar /api/predict. Verifica que el backend este activo e intenta nuevamente.");
    } finally {
      setPredicting(false);
    }
  }

  function renderScreen() {
    if (loading) {
      return <LoadingScreen />;
    }

    if (error) {
      return <ErrorScreen message={error} onRetry={loadDashboardData} />;
    }

    if (!article || !profile || !options) {
      return <ErrorScreen message="La API no devolvio todos los datos esperados." onRetry={loadDashboardData} />;
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
          <DashboardScreen
            article={article}
            explanations={explanations}
            history={history}
            predictError={predictError}
            predictText={predictText}
            predictTitle={predictTitle}
            predicting={predicting}
            prediction={prediction}
            profile={profile}
            setPredictText={(value) => {
              setPredictText(value);
              setPrediction(null);
              setPredictError(null);
            }}
            setPredictTitle={(value) => {
              setPredictTitle(value);
              setPrediction(null);
              setPredictError(null);
            }}
            onAnalyze={handleAnalyze}
            onNavigate={setScreen}
            onPredict={handlePredict}
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

function ErrorScreen({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="center-state error">
      <CircleHelp aria-hidden="true" size={34} />
      <p>{message}</p>
      {onRetry && (
        <button className="outline-button state-action" onClick={onRetry} type="button">
          <RefreshCw aria-hidden="true" size={16} />
          Reintentar
        </button>
      )}
    </div>
  );
}

function DashboardScreen({
  article,
  explanations,
  history,
  predictError,
  predictText,
  predictTitle,
  predicting,
  prediction,
  profile,
  setPredictText,
  setPredictTitle,
  onAnalyze,
  onNavigate,
  onPredict,
}: {
  article: Article;
  explanations: Explanation[];
  history: HistoryItem[];
  predictError: string | null;
  predictText: string;
  predictTitle: string;
  predicting: boolean;
  prediction: PredictResponse | null;
  profile: Profile;
  setPredictText: (value: string) => void;
  setPredictTitle: (value: string) => void;
  onAnalyze: () => void;
  onNavigate: (screen: Screen) => void;
  onPredict: () => void;
}) {
  const probabilities = prediction?.probabilidades ?? null;
  const predictedClass = probabilities ? getTopOrientation(probabilities) : null;
  const confidence = probabilities ? Math.max(probabilities.left, probabilities.center, probabilities.right) : null;
  const hasLowConfidence = confidence !== null && confidence < LOW_CONFIDENCE_THRESHOLD;

  return (
    <div className="dashboard">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">MAIA News Analyzer</span>
          <h1>Dashboard de prediccion de perspectiva politica</h1>
          <p>
            Prototipo funcional conectado al backend: ingresa una noticia, ejecuta el modelo desde la API
            y revisa probabilidades, evidencia y contexto para el usuario.
          </p>
        </div>
        <div className="hero-actions">
          <button className="outline-button" onClick={() => onNavigate("explore")} type="button">
            <Search aria-hidden="true" size={17} />
            Explorar datos
          </button>
          <button className="primary-button compact-button" onClick={onPredict} disabled={predicting} type="button">
            <Send aria-hidden="true" size={17} />
            {predicting ? "Prediciendo..." : "Ejecutar predict"}
          </button>
        </div>
      </section>

      <section className="kpi-grid" aria-label="Indicadores del prototipo">
        <DashboardKpi label="Endpoint usado" value="/api/predict" detail="FastAPI" icon={Activity} />
        <DashboardKpi
          label="Clase estimada"
          value={predictedClass ?? "Sin ejecutar"}
          detail={confidence === null ? "Esperando prediccion" : `${formatPercent(confidence)} confianza`}
          icon={ShieldCheck}
        />
        <DashboardKpi label="Analisis registrados" value={String(profile.stats.analyses)} detail="Datos de usuario" icon={FileText} />
      </section>

      <div className="dashboard-grid">
        <section className="panel prediction-workbench">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Entrada del modelo</span>
              <h2>Analizar noticia</h2>
            </div>
            <span className="endpoint-pill">POST /predict</span>
          </div>
          <label className="field-stack">
            Titulo
            <input value={predictTitle} onChange={(event) => setPredictTitle(event.target.value)} />
          </label>
          <label className="field-stack">
            Texto de la noticia
            <textarea value={predictText} onChange={(event) => setPredictText(event.target.value)} rows={9} />
          </label>
          {predictError && (
            <div className="inline-error">
              <AlertCircle aria-hidden="true" size={16} />
              <span>{predictError}</span>
              <button onClick={onPredict} disabled={predicting || !predictText.trim()} type="button">
                Reintentar
              </button>
            </div>
          )}
          <button className="primary-button" onClick={onPredict} disabled={predicting} type="button">
            <Send aria-hidden="true" size={18} />
            {predicting ? "Consultando backend..." : "Predecir perspectiva"}
          </button>
          <button className="secondary-link" onClick={onAnalyze} type="button">
            Probar flujo de analisis por URL
          </button>
        </section>

        <section className="panel prediction-result">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Salida del modelo</span>
              <h2>Resultado predict</h2>
            </div>
            <span className={`result-badge ${predictedClass ? predictedClass.toLowerCase() : "pending"}`}>
              {predictedClass ?? "Pendiente"}
            </span>
          </div>
          {prediction && probabilities && predictedClass && confidence !== null ? (
            <>
              <div className={`dominant-result ${hasLowConfidence ? "low-confidence" : ""}`}>
                <span>Prediccion</span>
                <strong>{predictedClass}</strong>
                <small>ID: {prediction.id} · clase API: {prediction.clase}</small>
              </div>
              {hasLowConfidence && (
                <StatusNotice
                  tone="warning"
                  title="Prediccion con baja confianza"
                  message={`La probabilidad mas alta es ${formatPercent(confidence)}. Revisa las tres probabilidades antes de tomar una decision.`}
                />
              )}
              <ProbabilityBars probabilities={probabilities} />
            </>
          ) : (
            <EmptyPredictionState predicting={predicting} />
          )}
        </section>
      </div>

      <section className="support-grid">
        <article className="panel rubric-card">
          <h2>Cumplimiento de entrega</h2>
          <ul>
            <li>Usa el modelo empaquetado a traves de la API del backend.</li>
            <li>Muestra prediccion y probabilidades para el usuario final.</li>
            <li>Incluye datos relevantes: historial, explicacion y fuentes comparables.</li>
            <li>Puede desplegarse con Docker junto al servicio FastAPI.</li>
          </ul>
        </article>
        <article className="panel evidence-card">
          <h2>Variables explicativas</h2>
          {explanations.length > 0 ? (
            explanations.slice(0, 4).map((item) => (
              <div className="evidence-row" key={item.text}>
                <span>{item.text}</span>
                <meter min="0" max="0.3" value={item.weight} />
                <b>{item.weight}</b>
              </div>
            ))
          ) : (
            <EmptyPanel message="No hay variables explicativas disponibles para mostrar." />
          )}
        </article>
        <article className="panel evidence-card">
          <h2>Historial reciente</h2>
          {history.length > 0 ? (
            history.slice(0, 3).map((item) => (
              <div className="mini-history" key={item.id}>
                <span className={`dot ${item.orientation.toLowerCase()}`} />
                <p>{item.title}</p>
                <b>{item.score}</b>
              </div>
            ))
          ) : (
            <EmptyPanel message="Todavia no hay analisis registrados." />
          )}
        </article>
      </section>
    </div>
  );
}

function EmptyPredictionState({ predicting }: { predicting: boolean }) {
  return (
    <div className="empty-prediction">
      <Sparkles aria-hidden="true" size={30} />
      <strong>{predicting ? "Consultando servicio..." : "Sin prediccion ejecutada"}</strong>
      <p>
        {predicting
          ? "El tablero mostrara la clase, confianza y probabilidades cuando la API responda."
          : "Ingresa una noticia y ejecuta la prediccion para ver el resultado real de /api/predict."}
      </p>
    </div>
  );
}

function StatusNotice({
  message,
  title,
  tone,
}: {
  message: string;
  title: string;
  tone: "warning" | "error";
}) {
  return (
    <div className={`status-notice ${tone}`}>
      <AlertCircle aria-hidden="true" size={18} />
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return <p className="empty-panel">{message}</p>;
}

function DashboardKpi({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail: string;
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <article className="panel kpi-card">
      <Icon aria-hidden="true" size={21} />
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function ProbabilityBars({ probabilities }: { probabilities: { left: number; center: number; right: number } }) {
  const entries: Array<[Orientation, number]> = [
    ["LEFT", probabilities.left],
    ["CENTER", probabilities.center],
    ["RIGHT", probabilities.right],
  ];

  return (
    <div className="probability-list">
      {entries.map(([orientation, value]) => (
        <div className="probability-row" key={orientation}>
          <div>
            <b>{orientation}</b>
            <span>{formatPercent(value)}</span>
          </div>
          <meter className={orientation.toLowerCase()} min="0" max="1" value={value} />
        </div>
      ))}
    </div>
  );
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function getTopOrientation(probabilities: { left: number; center: number; right: number }): Orientation {
  const entries: Array<[Orientation, number]> = [
    ["LEFT", probabilities.left],
    ["CENTER", probabilities.center],
    ["RIGHT", probabilities.right],
  ];

  return entries.reduce((winner, current) => (current[1] > winner[1] ? current : winner))[0];
}

function isValidPrediction(value: PredictResponse): value is PredictResponse {
  const probabilities = value?.probabilidades;
  const probabilityValues = probabilities ? [probabilities.left, probabilities.center, probabilities.right] : [];

  return Boolean(
    value?.id &&
      value?.clase &&
      probabilityValues.length === 3 &&
      probabilityValues.every((probability) => Number.isFinite(probability) && probability >= 0 && probability <= 1),
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
