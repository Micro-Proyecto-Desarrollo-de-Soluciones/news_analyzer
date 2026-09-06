FROM python:3.12-slim

RUN pip install --no-cache-dir mlflow==3.16.0

EXPOSE 8050

CMD ["mlflow", "server", \
     "--host", "0.0.0.0", \
     "--port", "8050", \
     "--backend-store-uri", "sqlite:////mlflow/data/mlflow.db", \
     "--artifacts-destination", "/mlflow/artifacts", \
     "--allowed-hosts", "*", \
     "--cors-allowed-origins", "*"]
