# Integración del modelo

Resumen de cómo el tablero pasó de datos simulados a usar el modelo real.

## Qué se hizo

**El modelo se empaquetó como wheel instalable.** En el repositorio de modelos
se construyó `modelo-sesgo`, un paquete que contiene la cadena completa de
inferencia:

```
texto crudo → desmarcado del medio → limpieza NLP → vectorizador → clasificador
```

Llega a este repositorio como archivo en `model-pkg/` y se instala desde
`requirements.txt`. Expone una sola función, `predecir(texto)`.

**La API envía el texto sin preprocesar.** Todo el tratamiento ocurre dentro del
paquete, con el mismo código que se usó al entrenar. Esto es lo que evita que el
modelo reciba en producción algo distinto de lo que aprendió, y por eso ni la
API ni el tablero deben limpiar el texto antes de enviarlo.

## Endpoints conectados

| Endpoint | Antes | Ahora |
|---|---|---|
| `POST /api/predict` | leía `data/salida.json` | clasificación real del texto enviado |
| `POST /api/articles/analyze` | devolvía un artículo fijo | extrae la nota desde la URL y la clasifica |

El resto de endpoints (`/history`, `/favorites`, `/profile`, `/perspectives`,
`/explore/options`) siguen devolviendo datos de interfaz simulados.

## Cambios en los contratos

`Article` y `PredictResponse` sumaron tres campos, todos opcionales, de modo que
el frontend anterior sigue funcionando:

- `explicacion` — términos del artículo que más empujaron hacia la clase
  predicha, calculados sobre ese artículo concreto.
- `advertencias` — avisos de confiabilidad, por ejemplo cuando el texto es más
  corto que los artículos con los que se entrenó.
- `version_modelo` — versión del paquete que produjo la predicción.

## Por qué el modelo desplegado no es el de mejor métrica

Se desplegó el baseline TF-IDF (F1 macro 0.4882) y no el modelo de embeddings
(0.5546), por tres razones de producto:

- **Explicabilidad.** En TF-IDF cada columna es una palabra, así que el
  coeficiente del clasificador dice cuánto empuja ese término hacia cada clase.
  Las dimensiones de un embedding no corresponden a palabras y no hay nada
  equivalente que mostrar. El tablero necesita esa explicación.
- **Tamaño y latencia.** No arrastra PyTorch ni descargas de modelos. La imagen
  baja de unos 2 GB a unos cientos de MB y la inferencia pasa a milisegundos.
- **Contexto completo.** Al ser bolsa de palabras no trunca el artículo.

El paquete está preparado para cambiar de modelo sin reescribirlo.

## Pendiente en el frontend

**La pantalla de explicación puede mostrar datos reales** leyendo
`article.explicacion` en lugar de llamar a `/explanations`, que devuelve valores
fijos.

**`summary` no es un resumen**, es un recorte literal de las primeras frases. El
proyecto no entrena modelos de resumen, y se prefirió no presentar como generado
algo que no lo es. La etiqueta "Resumen" debería decir "Extracto".

**`main_arguments` vuelve vacío** por la misma razón. Conviene ocultar esa
sección.

**La pantalla de inicio sigue mostrando un análisis simulado**, servido por
`/articles/current` con un modelo inexistente ("BiasClassifier v1.3").

`data/salida.json` quedó sin uso.

## Limitaciones conocidas

**Medios que bloquean la descarga.** NYT, WSJ y otros impiden el acceso
programático o tienen muro de pago, así que el flujo de URL falla con ellos. El
de texto pegado siempre funciona.

**Portadas en lugar de artículos.** Al indicar la home de un medio, la
extracción devuelve titulares concatenados y el modelo los clasificaba con alta
confianza. Se agregó un guardia que detecta ese caso por el promedio de palabras
por oración y responde 422.

**Idioma.** El modelo se entrenó sobre prensa estadounidense en inglés. Con
textos en otro idioma responde igual, sin avisar. Queda pendiente esa
advertencia.

**Contenido no político.** El modelo siempre devuelve una de las tres clases,
aunque el artículo no trate de política. No hay guardia posible para eso.
