"""
Extraccion del texto de un articulo a partir de su URL.

El tablero permite pegar un enlace, pero el modelo recibe texto. Este modulo
cubre ese hueco: descarga la pagina y separa el cuerpo de la noticia del resto
(menus, publicidad, comentarios, pie de pagina).

Se usa trafilatura porque resuelve bien ese problema sobre sitios de prensa y no
requiere configuracion por medio. Un scraping propio implicaria mantener reglas
por cada dominio.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional
from urllib.parse import urlparse

# Un articulo de prensa promedia entre 15 y 25 palabras por oracion. Una portada
# extraida devuelve titulares concatenados sin puntuacion, con cientos de
# palabras entre punto y punto. El umbral separa un caso del otro.
MAX_PALABRAS_POR_ORACION = 60

# Tope del extracto. Sin esto, un texto sin puntuacion hace que "las primeras
# frases" sean el documento entero.
MAX_CARACTERES_EXTRACTO = 400

PATRON_FIN_ORACION = re.compile(r"[.!?](?:\s|$)")


class ExtraccionFallida(RuntimeError):
    """La pagina no pudo descargarse o no contiene un articulo reconocible."""


@dataclass
class ArticuloExtraido:
    texto: str
    titulo: Optional[str]
    fecha: Optional[str]
    medio: Optional[str]


def dominio(url: str) -> str:
    """Devuelve el dominio legible de una URL, sin el www."""
    host = urlparse(str(url)).netloc
    return host[4:] if host.startswith("www.") else host


def palabras_por_oracion(texto: str) -> float:
    """Promedio de palabras entre terminadores de oracion."""
    palabras = len(texto.split())
    oraciones = max(1, len(PATRON_FIN_ORACION.findall(texto)))
    return palabras / oraciones


def parece_articulo(texto: str) -> bool:
    """Heuristica para descartar paginas que no son un articulo.

    El caso tipico es que el usuario pegue la portada de un medio en lugar de
    una nota. Trafilatura extrae igual, devolviendo los titulares concatenados,
    y el modelo los clasifica sin tener forma de saber que no es un articulo:
    produce una prediccion segura sobre una entrada sin sentido.

    La senal que los separa es la puntuacion. Una portada son titulos pegados
    sin puntos, asi que el promedio de palabras por oracion se dispara.

    No es infalible (distinguir portada de articulo no tiene solucion exacta),
    pero cubre el caso que aparece en la practica.
    """
    return palabras_por_oracion(texto) <= MAX_PALABRAS_POR_ORACION


def extraer(url: str) -> ArticuloExtraido:
    """Descarga la pagina y devuelve el cuerpo del articulo con sus metadatos.

    El texto se devuelve SIN limpiar. El desmarcado y el resto del
    preprocesamiento ocurren dentro del paquete del modelo, no aca.
    """
    import trafilatura

    descarga = trafilatura.fetch_url(str(url))
    if descarga is None:
        raise ExtraccionFallida(f"No se pudo descargar la pagina: {url}")

    texto = trafilatura.extract(descarga, include_comments=False, include_tables=False)
    if not texto or not texto.strip():
        raise ExtraccionFallida(
            f"La pagina se descargo pero no se reconocio un articulo en: {url}"
        )

    if not parece_articulo(texto):
        raise ExtraccionFallida(
            "El contenido extraido no parece un articulo, sino un listado de "
            "titulares. Es lo que ocurre al indicar la portada de un medio en "
            "lugar de una nota concreta. Probar con el enlace del articulo."
        )

    titulo = None
    fecha = None
    try:
        metadatos = trafilatura.extract_metadata(descarga)
        if metadatos is not None:
            titulo = metadatos.title
            fecha = metadatos.date
    except Exception:
        # Los metadatos son opcionales: si el sitio no los expone o trafilatura
        # falla al leerlos, el articulo igual se puede clasificar.
        pass

    return ArticuloExtraido(
        texto=texto.strip(),
        titulo=titulo,
        fecha=fecha,
        medio=dominio(url),
    )


def extracto(texto: str, n_frases: int = 3) -> str:
    """Primeras frases del articulo.

    NO es un resumen generado: es un recorte literal del comienzo. El proyecto
    no entrena ningun modelo de resumen, asi que se prefiere mostrar texto real
    del articulo antes que inventar uno.
    """
    frases = [f.strip() for f in texto.replace("\n", " ").split(". ") if f.strip()]
    if not frases:
        return ""

    recorte = ". ".join(frases[:n_frases])
    if not recorte.endswith("."):
        recorte += "."

    # Tope de seguridad: un texto con poca puntuacion puede hacer que "tres
    # frases" sean el documento entero.
    if len(recorte) > MAX_CARACTERES_EXTRACTO:
        recorte = recorte[:MAX_CARACTERES_EXTRACTO].rsplit(" ", 1)[0] + "..."

    return recorte
