# Backend FastAPI

API REST de MAIA News Analyzer. Expone los datos del prototipo y documentacion Swagger en `/docs`.

## Ejecutar

```bash
pyenv install 3.12.14
/Users/gbriceno/.pyenv/versions/3.12.14/bin/python -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

Swagger: `http://127.0.0.1:8000/docs`

## Endpoints principales

- `GET /api/health`
- `GET /api/articles/current`
- `POST /api/articles/analyze`
- `POST /api/predict`
- `GET /api/explanations`
- `GET /api/perspectives`
- `GET /api/history`
- `GET /api/favorites`
- `GET /api/profile`
- `GET /api/explore/options`
