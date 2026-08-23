# News Perspective Analyzer

Prototipo Django que renderiza una aplicacion movil para analizar la perspectiva politica de noticias.

## Ejecutar localmente

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python manage.py runserver 127.0.0.1:8000
```

Abre `http://127.0.0.1:8000/`.

## Pantallas

- `/` inicio
- `/analyzing/` estado de analisis
- `/result/` resultado
- `/explanation/` explicacion del modelo
- `/perspectives/` otras perspectivas
- `/article/` vista de articulo
- `/history/` historial
- `/favorites/` favoritos
- `/explore/` filtros y busqueda
- `/profile/` perfil
- `/dark/` resultado en modo oscuro
- `/onboarding/` onboarding
