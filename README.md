# MAIA News Analyzer

Aplicacion separada en un backend FastAPI y un frontend React. El codigo Django del prototipo fue retirado para dejar una base limpia organizada por servicios.

## Estructura

```text
backend/
  app/
    api/          Rutas REST versionables
    core/         Configuracion
    schemas/      Contratos Pydantic
    services/     Logica de negocio y datos mock
frontend/
  src/
    components/   Componentes reutilizables
    services/     Cliente HTTP de la API
    App.tsx       Pantallas React
```

## Backend

```bash
pyenv install 3.12.14
/Users/gbriceno/.pyenv/versions/3.12.14/bin/python -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

Swagger: `http://127.0.0.1:8000/docs`

Endpoints principales:

- `GET /api/health`
- `GET /api/articles/current`
- `POST /api/articles/analyze`
- `GET /api/explanations`
- `GET /api/perspectives`
- `GET /api/history`
- `GET /api/favorites`
- `GET /api/profile`
- `GET /api/explore/options`

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Abre `http://127.0.0.1:5173/`.

Para apuntar a otra API, crea `frontend/.env`:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```
