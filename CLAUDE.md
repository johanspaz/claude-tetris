# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

There is no build, package manager, linter, or test suite. The game is plain HTML/CSS/JS served as static files.

- Run: open `index.html` directly, or serve the folder with any static server (e.g. `python3 -m http.server 8000`, then visit `http://localhost:8000`). Opening the file directly works because there are no modules or fetches.
- Testing is manual: play in the browser and check the behavior you changed. Keyboard handling and rendering can only be verified in a browser.

## Architecture

Three files, no framework, no globals beyond the script scope:

- `index.html` defines the DOM the script expects. The element IDs (`board`, `next-canvas`, `score`, `lines`, `level`, `overlay`, `overlay-title`, `overlay-score`, `restart-btn`) are looked up by `game.js` at load time, so renaming one requires updating `game.js` too. `game.js` is loaded at the end of `<body>`.
- `game.js` holds all game state in module-level `let` variables (`board`, `current`, `next`, `score`, `lines`, `level`, `paused`, `gameOver`, `dropInterval`, `dropAccum`, `animId`). `init()` resets them and starts the loop; the restart button calls `init()` again.
- Board and pieces: the board is a `ROWS × COLS` matrix of `0` (empty) or a color index 1–7. Piece `shape`s use the same indices, so a piece's cell value is also its color (`COLORS[index]`). `PIECES` and `COLORS` must stay in the same index order.
- Piece state is `{ type, shape, x, y }`. Rotation is `rotateCW` followed by `tryRotate`, which tries kick offsets `[0, -1, 1, -2, 2]` on the column before giving up.
- The main loop is `requestAnimationFrame`-driven. `loop(ts)` accumulates elapsed time into `dropAccum` and advances the piece when it exceeds `dropInterval`. A failed downward move calls `lockPiece()`, which runs `merge()` → `clearLines()` → `spawn()` in that order. `spawn()` calls `endGame()` if the new piece collides immediately.
- Input is a single `keydown` listener. `KeyP` toggles pause and is handled before the pause/game-over guard; all other keys are ignored while paused or after game over.
- Rendering redraws the whole canvas every frame in `draw()`. The ghost piece is drawn by calling `ghostY()` and reusing `drawBlock` with alpha 0.2. The next-piece preview is a separate canvas redrawn only in `drawNext()`, called from `spawn()`.
- Scoring and speed are coupled in `clearLines()`: it updates `lines`, `score` (`LINE_SCORES[n] × level`), `level` (every 10 lines), and `dropInterval`. Soft and hard drop add points in `softDrop()` and `hardDrop()`, not in the loop.

## Conventions

- The UI text and README are in Spanish; keep new user-facing strings in Spanish.
- Keep the code dependency-free and build-free. Don't add a bundler, `package.json`, or frameworks without asking.
- Tunable constants (`COLS`, `ROWS`, `BLOCK`, `COLORS`, `LINE_SCORES`, initial `dropInterval`) are at the top of `game.js`. If `COLS`, `ROWS`, or `BLOCK` changes, the `<canvas id="board">` width and height in `index.html` must change to match.
- The README documents the game in detail (controls, mechanics, file walkthrough). Update it when behavior changes.
