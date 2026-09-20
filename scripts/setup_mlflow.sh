#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== MAIA News Analyzer - Setup MLflow =="

echo "[1/4] Verificando Docker..."
if ! command -v docker >/dev/null 2>&1; then
    echo "Docker no encontrado. Instalando..."
    sudo apt update
    sudo apt install -y docker.io docker-compose-v2
else
    echo "Docker ya está instalado."
fi

echo "[2/4] Verificando servicio Docker..."
sudo systemctl enable --now docker

echo "[3/4] Construyendo servicio MLflow..."
cd "$ROOT_DIR"
sudo docker compose build mlflow

echo "[4/4] Iniciando MLflow..."
sudo docker compose up -d mlflow

echo
echo "Estado:"
sudo docker compose ps mlflow

echo
echo "MLflow disponible en:"
echo "  http://<IP_PUBLICA_EC2>:8050"
echo
echo "Para revisar logs:"
echo "  docker compose logs -f mlflow"
