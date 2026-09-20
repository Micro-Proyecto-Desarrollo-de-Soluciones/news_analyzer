FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# El wheel del modelo se copia ANTES de instalar: requirements.txt lo referencia
# por ruta relativa, asi que sin esta linea el pip install falla.
COPY requirements.txt .
COPY model-pkg ./model-pkg
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Los corpus de NLTK (stopwords y WordNet) se descargan al construir la imagen.
# Si no, el contenedor los baja al atender la primera peticion, lo que la
# demora y obliga a tener salida a internet en tiempo de ejecucion. El
# directorio es privado para evitar el aviso de permisos de NLTK.
ENV NLTK_DATA=/opt/nltk_data
RUN python -m nltk.downloader -d /opt/nltk_data stopwords wordnet omw-1.4

COPY backend ./backend
COPY data ./data

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
