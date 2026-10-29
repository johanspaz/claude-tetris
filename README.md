# Tetris

Implementación del clásico **Tetris** en JavaScript vanilla, usando HTML5 Canvas y CSS. Sin dependencias externas, sin frameworks, sin proceso de build: solo abrir y jugar.

![Tech](https://img.shields.io/badge/HTML5-Canvas-orange)
![Tech](https://img.shields.io/badge/CSS3-blueviolet)
![Tech](https://img.shields.io/badge/JavaScript-Vanilla-yellow)

---

## Tabla de contenidos

- [Tetris](#tetris)
  - [Tabla de contenidos](#tabla-de-contenidos)
  - [Qué hace el proyecto](#qué-hace-el-proyecto)
  - [Cómo ejecutar el juego](#cómo-ejecutar-el-juego)
    - [Opción 1: abrir el archivo directamente](#opción-1-abrir-el-archivo-directamente)
    - [Opción 2: servidor local (recomendado)](#opción-2-servidor-local-recomendado)
  - [Controles](#controles)
  - [Menú de pausa](#menú-de-pausa)
  - [Records](#records)
  - [Skins visuales](#skins-visuales)
  - [Cómo funciona](#cómo-funciona)
    - [1. `index.html`](#1-indexhtml)
    - [2. `style.css`](#2-stylecss)
    - [3. `game.js`](#3-gamejs)
    - [Flujo del juego](#flujo-del-juego)
  - [Tecnologías](#tecnologías)
  - [Estructura del proyecto](#estructura-del-proyecto)
  - [Personalización](#personalización)
  - [Licencia](#licencia)

---

## Qué hace el proyecto

Es una versión jugable del Tetris clásico con todas las mecánicas que esperarías:

- Tablero de **10 × 20** celdas.
- Las **7 piezas estándar** (I, O, T, S, Z, J, L) con colores diferenciados.
- Una **tuerca** 3x3 de reto: un anillo de 8 bloques con un hueco vacío en el centro que no se puede rellenar, así que las filas que lo contienen no se completan nunca.
- **Rotación** con _wall kicks_ básicos (pequeños desplazamientos para que la pieza pueda rotar pegada a la pared).
- **Soft drop** (bajada acelerada) y **hard drop** (caída instantánea).
- **Pieza fantasma** (_ghost piece_): muestra dónde aterrizará la pieza actual.
- **Vista previa** de la siguiente pieza.
- **Sistema de puntuación** clásico de Tetris (100 / 300 / 500 / 800 multiplicado por nivel).
- **Niveles** que aumentan cada 10 líneas y aceleran la caída. Puedes elegir el nivel inicial desde el menú de pausa.
- **Combo**: racha de bloqueos consecutivos que limpian al menos una línea.
- **Menú de pausa** con reanudar, reiniciar, ver controles y nivel inicial.
- **Records**: top 5 guardado en el navegador, con nombre, puntuación, mejor combo y líneas máximas.
- **Skins visuales**: Retro, Neon, Pastel y Pixel.
- **Pausa** y **Game Over** con opción de reinicio.
- **Modo oscuro / claro**: arranca en oscuro y el botón del panel ("Modo claro" / "Modo oscuro") cambia el tema.

---

## Cómo ejecutar el juego

No hay nada que instalar ni compilar. Tienes dos opciones:

### Opción 1: abrir el archivo directamente

```bash
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

### Opción 2: servidor local (recomendado)

Cualquier servidor estático funciona. Algunos ejemplos:

```bash
# Con Python 3
python3 -m http.server 8000

# Con Node.js (npx)
npx serve .

# Con PHP
php -S localhost:8000
```

Después abre `http://localhost:8000` en el navegador.

---

## Controles

| Tecla     | Acción                            |
| --------- | --------------------------------- |
| `←` / `→` | Mover la pieza horizontalmente    |
| `↑` o `X` | Rotar la pieza en sentido horario |
| `↓`       | Soft drop (bajar más rápido)      |
| `Espacio` | Hard drop (caída instantánea)     |
| `P` o `Esc` | Pausar / reanudar (abre el menú de pausa) |

Mientras el menú de pausa está abierto, o el formulario de nombre o el selector de skin tienen el foco, las teclas del juego no mueven la pieza.

---

## Menú de pausa

Al pulsar `P` o `Esc` se abre el menú de pausa con estas opciones:

- **Reanudar**: vuelve al juego.
- **Reiniciar**: empieza una partida nueva sin recargar la página.
- **Ver controles**: muestra la lista de teclas dentro del menú. **Volver** regresa al menú.
- **Nivel inicial**: elige el nivel (1 a 10) con el que empieza la próxima partida. Se aplica al reiniciar.

---

## Records

El juego guarda el **top 5** de puntuaciones en el `localStorage` del navegador, así que se conservan al recargar la página.

- Al terminar una partida que entra en el top, el Game Over pide un nombre (máximo 12 caracteres) y lo guarda con **Guardar**. La fila nueva queda resaltada.
- Cada fila muestra la puntuación, el **mejor combo** y las **líneas máximas** (el mayor número de líneas limpiadas en una sola jugada) de esa partida.
- La tabla aparece en el panel lateral y en el Game Over.
- **Borrar records** elimina todos los records guardados, tras confirmar.
- Si el navegador no permite `localStorage`, el juego no ofrece guardar records.

---

## Skins visuales

El selector **SKIN** del panel cambia la apariencia completa del juego:

- **Retro**: bloques cuadrados con colores planos.
- **Neon**: fondo negro con brillo en cada bloque.
- **Pastel**: colores suaves con esquinas redondeadas.
- **Pixel**: bloques con bisel y textura de píxeles.

La skin elegida se recuerda entre sesiones y se aplica sin recargar. Funciona con el modo oscuro y claro.

---

## Cómo funciona

El juego se compone de tres archivos que cooperan:

### 1. `index.html`

Define la estructura visual:

- Un `<canvas id="board">` de **300 × 600** píxeles donde se renderiza el tablero.
- Un panel lateral con `SCORE`, `LINES`, `LEVEL`, vista de la siguiente pieza, el botón `#theme-toggle` para cambiar de tema, el selector `#skin-select`, la tabla de records y la lista de controles.
- Un overlay para los estados **PAUSA** (con el menú de pausa), **GAME OVER** (con el formulario de nombre y la tabla de records).

### 2. `style.css`

Aporta el aspecto visual con estética _dark / retro arcade_: fondo oscuro, tipografía monoespaciada para los marcadores y _backdrop blur_ en los overlays. Todos los colores son variables CSS definidas en `:root` (tema oscuro, por defecto) y sobrescritas en `[data-theme="light"]` (tema claro).

### 3. `game.js`

Contiene toda la lógica del juego. A grandes rasgos:

- **Modelo del tablero**: una matriz `ROWS × COLS` donde cada celda guarda `0` (vacía) o un índice de color (1–8) que identifica la pieza.
- **Piezas**: definidas como matrices cuadradas. Para rotar se calcula la transposición + reverso de filas (`rotateCW`).
- **Detección de colisiones** (`collide`): comprueba que ninguna celda de la pieza salga del tablero ni se solape con bloques ya fijados.
- **Wall kicks** (`tryRotate`): si la rotación choca, intenta desplazar la pieza ±1 y ±2 columnas antes de descartar el giro.
- **Game loop** (`loop`): basado en `requestAnimationFrame`, acumula el tiempo transcurrido y baja la pieza una fila cuando se supera `dropInterval`.
- **Limpieza de líneas** (`clearLines`): recorre el tablero de abajo hacia arriba; cada fila completa se elimina y se inserta una vacía en la cima.
- **Puntuación**: usa la tabla clásica `[0, 100, 300, 500, 800]` multiplicada por el nivel actual; el hard drop suma 2 puntos por celda recorrida y el soft drop 1 punto por fila.
- **Nivel y velocidad**: el nivel sube cada 10 líneas; la velocidad de caída se calcula como `max(100, 1000 − (level − 1) × 90)` milisegundos.
- **Tema** (`setTheme`): fija `data-theme` en `<html>`, actualiza el texto del botón, lee el color de la cuadrícula (`--grid`) y redibuja el tablero y la vista previa. Siempre arranca en oscuro.
- **Ghost piece** (`ghostY`): proyecta la posición final de la pieza actual hacia abajo y la dibuja con `globalAlpha = 0.2`.

### Flujo del juego

```
init()
  ├─ createBoard()                  → matriz vacía
  ├─ next = randomPiece()
  ├─ spawn()                        → mueve next a current y genera nueva next
  └─ requestAnimationFrame(loop)
        ↓
   loop(timestamp)
     ├─ acumula dt
     ├─ si dt ≥ dropInterval → baja la pieza o llama a lockPiece()
     ├─ draw()  (grid + tablero + ghost + pieza actual)
     └─ requestAnimationFrame(loop)

   keydown → mover / rotar / soft-drop / hard-drop / pausa
```

Cuando una pieza recién generada ya colisiona al aparecer (`spawn`), se dispara `endGame()` y se muestra el overlay de **Game Over**.

---

## Tecnologías

- **HTML5** — marcado y dos elementos `<canvas>` (tablero y vista previa).
- **CSS3** — _flexbox_, variables de color, `backdrop-filter` y `box-shadow`.
- **JavaScript (ES6+) vanilla** — `const`/`let`, _arrow functions_, _spread operator_, `Array.from`, _template literals_…
- **Canvas 2D API** — para todo el renderizado del juego.
- **`requestAnimationFrame`** — para el bucle de juego sincronizado con el navegador.

**Sin dependencias.** No hay `package.json`, ni bundler, ni transpilador.

---

## Estructura del proyecto

```
03-tetris/
├── index.html      # Estructura del DOM y canvas
├── style.css       # Estilos del juego (temas oscuro y claro)
├── game.js         # Toda la lógica del Tetris (~720 líneas)
└── README.md
```

---

## Personalización

Algunos parámetros fáciles de tunear en `game.js`:

| Constante      | Significado                              | Por defecto           |
| -------------- | ---------------------------------------- | --------------------- |
| `COLS`         | Columnas del tablero                     | `10`                  |
| `ROWS`         | Filas del tablero                        | `20`                  |
| `BLOCK`        | Tamaño en píxeles de cada celda          | `30`                  |
| `COLORS`       | Paleta de colores por tipo de pieza      | 8 colores             |
| `LINE_SCORES`  | Puntos por 1, 2, 3 o 4 líneas eliminadas | `[0,100,300,500,800]` |
| `dropInterval` | Velocidad inicial de caída en ms         | `1000`                |
| `MAX_RECORDS`  | Cuántos records se guardan               | `5`                   |
| `SKINS`        | Paleta y dibujo de cada skin visual      | Retro, Neon, Pastel, Pixel |

> Si cambias `COLS`, `ROWS` o `BLOCK`, recuerda ajustar también `width` y `height` del `<canvas id="board">` en `index.html` para que coincida (`COLS × BLOCK` × `ROWS × BLOCK`).

---

## Licencia

Proyecto de uso libre con fines educativos y de práctica.
