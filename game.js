'use strict';

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

const COLORS = [
  null,
  '#4dd0e1', // I - cyan
  '#ffd54f', // O - yellow
  '#ba68c8', // T - purple
  '#81c784', // S - green
  '#e57373', // Z - red
  '#90caf9', // J - azul pálido
  '#ffb74d', // L - orange
  '#b0bec5', // Tuerca - gris acero
];

// Skins: cada una tiene su nombre para mostrar y una paleta con la misma
// longitud y orden que COLORS (índice 0 = null). La paleta de Retro es COLORS.
// Cada skin define draw(context, x, y, colorIndex, size): dibuja un bloque en
// su estilo. drawBlock fija globalAlpha (fantasma 0.2) antes de delegar aquí.
const SKINS = {
  retro: {
    label: 'Retro',
    colors: COLORS,
    draw: drawRetroBlock,
  },
  neon: {
    label: 'Neon',
    draw: drawNeonBlock,
    colors: [
      null,
      '#00f0ff', // I - cian eléctrico
      '#fff200', // O - amarillo
      '#ff00ff', // T - magenta
      '#39ff14', // S - verde lima
      '#ff2a4d', // Z - rojo neón
      '#2d7bff', // J - azul
      '#ff8c00', // L - naranja
      '#e0e0ff', // Tuerca - blanco azulado
    ],
  },
  pastel: {
    label: 'Pastel',
    draw: drawPastelBlock,
    colors: [
      null,
      '#aee8f0', // I
      '#fff1b0', // O
      '#d9c2f0', // T
      '#c3f0c8', // S
      '#f7b8b8', // Z
      '#b8d4f7', // J
      '#ffd8a8', // L
      '#d0d4dc', // Tuerca
    ],
  },
  pixel: {
    label: 'Pixel',
    draw: drawPixelBlock,
    colors: [
      null,
      '#00e8f8', // I
      '#f8e800', // O
      '#a800f8', // T
      '#00f800', // S
      '#f80000', // Z
      '#0058f8', // J
      '#f88800', // L
      '#bcbcbc', // Tuerca
    ],
  },
};

// Color del bloque para la skin activa.
function skinColor(colorIndex) {
  return SKINS[currentSkin].colors[colorIndex];
}

// Retro: color plano y franja de luz arriba.
function drawRetroBlock(context, x, y, colorIndex, size) {
  const px = x * size + 1, py = y * size + 1, s = size - 2;
  context.fillStyle = skinColor(colorIndex);
  context.fillRect(px, py, s, s);
  context.fillStyle = 'rgba(255,255,255,0.12)';
  context.fillRect(px, py, s, 4);
}

// Neon: brillo con shadowBlur del mismo color del bloque. El radio es
// pequeno para no penalizar los FPS; se restablece tras dibujar.
const NEON_GLOW = 8;
function drawNeonBlock(context, x, y, colorIndex, size) {
  const px = x * size + 1, py = y * size + 1, s = size - 2;
  const color = skinColor(colorIndex);
  context.shadowColor = color;
  context.shadowBlur = NEON_GLOW;
  context.fillStyle = color;
  context.fillRect(px, py, s, s);
  context.shadowBlur = 0;
  context.fillStyle = 'rgba(255,255,255,0.12)';
  context.fillRect(px, py, s, 4);
}

// Trazo de rectangulo redondeado con arcTo (compatible con todos los navegadores).
function roundedRectPath(context, px, py, s, r) {
  context.beginPath();
  context.moveTo(px + r, py);
  context.arcTo(px + s, py, px + s, py + s, r);
  context.arcTo(px + s, py + s, px, py + s, r);
  context.arcTo(px, py + s, px, py, r);
  context.arcTo(px, py, px + s, py, r);
  context.closePath();
}

// Pastel: esquinas redondeadas; la franja de luz se recorta a la forma.
function drawPastelBlock(context, x, y, colorIndex, size) {
  const px = x * size + 1, py = y * size + 1, s = size - 2;
  const r = Math.round(size * 0.25);
  context.fillStyle = skinColor(colorIndex);
  roundedRectPath(context, px, py, s, r);
  context.fill();
  context.save();
  roundedRectPath(context, px, py, s, r);
  context.clip();
  context.fillStyle = 'rgba(255,255,255,0.25)';
  context.fillRect(px, py, s, 4);
  context.restore();
}

// Pixel: bisel de 2 px (claro arriba-izquierda, oscuro abajo-derecha) y una
// textura de celdas de 4 px en tono ligeramente mas claro y mas oscuro.
function drawPixelBlock(context, x, y, colorIndex, size) {
  const px = x * size + 1, py = y * size + 1, s = size - 2;
  const bevel = 2, cell = 4;
  context.fillStyle = skinColor(colorIndex);
  context.fillRect(px, py, s, s);

  // Checkerboard de celdas: claras y oscuras alternas
  for (let j = 0, row = 0; j < s; j += cell, row++) {
    for (let i = 0, col = 0; i < s; i += cell, col++) {
      context.fillStyle = (row + col) % 2 === 0
        ? 'rgba(255,255,255,0.08)'
        : 'rgba(0,0,0,0.08)';
      context.fillRect(px + i, py + j, Math.min(cell, s - i), Math.min(cell, s - j));
    }
  }

  // Bisel: luz arriba-izquierda, sombra abajo-derecha
  context.fillStyle = 'rgba(255,255,255,0.35)';
  context.fillRect(px, py, s, bevel);
  context.fillRect(px, py, bevel, s);
  context.fillStyle = 'rgba(0,0,0,0.35)';
  context.fillRect(px, py + s - bevel, s, bevel);
  context.fillRect(px + s - bevel, py, bevel, s);
}

const PIECES = [
  null,
  [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // I
  [[2,2],[2,2]],                               // O
  [[0,3,0],[3,3,3],[0,0,0]],                  // T
  [[0,4,4],[4,4,0],[0,0,0]],                  // S
  [[5,5,0],[0,5,5],[0,0,0]],                  // Z
  [[6,0,0],[6,6,6],[0,0,0]],                  // J
  [[0,0,7],[7,7,7],[0,0,0]],                  // L
  [[8,8,8],[8,0,8],[8,8,8]],                  // Tuerca
];

const LINE_SCORES = [0, 100, 300, 500, 800];

const RECORDS_KEY = 'tetris-records';
const MAX_RECORDS = 5;

// --- Records (solo almacenamiento; sin UI) ---
// Entrada: { name, score, combo, maxLines }, ordenadas de mayor a menor score.

function loadRecords() {
  let raw;
  try {
    raw = localStorage.getItem(RECORDS_KEY);
  } catch (e) {
    return [];
  }
  if (raw === null) return [];
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return [];
  }
  if (!Array.isArray(data)) return [];
  return data
    .filter(r => r && typeof r === 'object' && Number.isFinite(Number(r.score)))
    .map(r => ({
      name: typeof r.name === 'string' ? r.name : 'Jugador',
      score: Number(r.score),
      combo: Number(r.combo) || 0,
      maxLines: Number(r.maxLines) || 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RECORDS);
}

// Devuelve true si se guardó correctamente.
function saveRecords(list) {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    // Almacenamiento no disponible o lleno.
    return false;
  }
}

// Sin almacenamiento no se puede guardar, así que ninguna puntuación entra en el top.
function storageAvailable() {
  try {
    localStorage.setItem(RECORDS_KEY + '-probe', '1');
    localStorage.removeItem(RECORDS_KEY + '-probe');
    return true;
  } catch (e) {
    return false;
  }
}

function isTopScore(score) {
  if (!(Number.isFinite(score) && score > 0)) return false;
  if (!storageAvailable()) return false;
  const list = loadRecords();
  if (list.length < MAX_RECORDS) return true;
  return score > list[list.length - 1].score;
}

// Devuelve el índice donde quedó el record, o -1 si no entra o no se pudo guardar.
function addRecord(entry) {
  const score = Number(entry.score);
  if (!isTopScore(score)) return -1;

  const name = Array.from(String(entry.name ?? '').trim()).slice(0, 12).join('') || 'Jugador';
  const record = {
    name,
    score,
    combo: Number(entry.combo) || 0,
    maxLines: Number(entry.maxLines) || 0,
  };

  const list = loadRecords();
  let index = list.findIndex(r => score > r.score);
  if (index === -1) index = list.length;

  list.splice(index, 0, record);
  if (!saveRecords(list.slice(0, MAX_RECORDS))) return -1;
  return index;
}

function resetRecords() {
  try {
    localStorage.removeItem(RECORDS_KEY);
  } catch (e) {
    // Ignorado: no hay nada que borrar si el almacenamiento no está disponible.
  }
}

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');
const restartBtn = document.getElementById('restart-btn');
const themeToggle = document.getElementById('theme-toggle');
const skinSelect = document.getElementById('skin-select');
const SKIN_STORAGE_KEY = 'tetris-skin';
const pauseMenu = document.getElementById('pause-menu');
const controlsView = document.getElementById('controls-view');
const resumeBtn = document.getElementById('resume-btn');
const pauseRestartBtn = document.getElementById('pause-restart-btn');
const controlsBtn = document.getElementById('controls-btn');
const backBtn = document.getElementById('back-btn');
const startLevelSelect = document.getElementById('start-level');
const overlayStats = document.getElementById('overlay-stats');
const recordForm = document.getElementById('record-form');
const recordName = document.getElementById('record-name');
const recordError = document.getElementById('record-error');
const overlayRecords = document.getElementById('overlay-records');
const recordsBody = document.getElementById('records-body');
const overlayRecordsBody = document.getElementById('overlay-records-body');
const clearRecordsBtn = document.getElementById('clear-records-btn');
const overlayClearRecordsBtn = document.getElementById('overlay-clear-records-btn');

let theme = 'dark', gridColor;
let currentSkin = 'retro';
let startLevel = 1;
let board, current, next, score, lines, level, paused, gameOver, lastTime, dropAccum, dropInterval, animId;
let combo, bestCombo, maxLines;
let highlightIndex = -1; // fila del último record guardado (-1 = ninguna)

function createBoard() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

function randomPiece() {
  const type = Math.floor(Math.random() * (PIECES.length - 1)) + 1;
  const shape = PIECES[type].map(row => [...row]);
  return { type, shape, x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 };
}

function collide(shape, ox, oy) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = ox + c;
      const ny = oy + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function rotateCW(shape) {
  const rows = shape.length, cols = shape[0].length;
  const result = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      result[c][rows - 1 - r] = shape[r][c];
  return result;
}

function tryRotate() {
  const rotated = rotateCW(current.shape);
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collide(rotated, current.x + kick, current.y)) {
      current.shape = rotated;
      current.x += kick;
      return;
    }
  }
}

function merge() {
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        board[current.y + r][current.x + c] = current.shape[r][c];
}

function dropIntervalFor(lvl) {
  return Math.max(100, 1000 - (lvl - 1) * 90);
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(v => v !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  if (cleared) {
    lines += cleared;
    score += (LINE_SCORES[cleared] || 0) * level;
    level = startLevel + Math.floor(lines / 10);
    dropInterval = dropIntervalFor(level);
    updateHUD();
  }
  return cleared;
}

function ghostY() {
  let gy = current.y;
  while (!collide(current.shape, current.x, gy + 1)) gy++;
  return gy;
}

function hardDrop() {
  const gy = ghostY();
  score += (gy - current.y) * 2;
  current.y = gy;
  lockPiece();
}

function softDrop() {
  if (!collide(current.shape, current.x, current.y + 1)) {
    current.y++;
    score += 1;
    updateHUD();
  } else {
    lockPiece();
  }
}

function lockPiece() {
  merge();
  const cleared = clearLines();
  if (cleared > 0) combo++;
  else combo = 0;
  bestCombo = Math.max(bestCombo, combo);
  maxLines = Math.max(maxLines, cleared);
  spawn();
}

function spawn() {
  current = next;
  next = randomPiece();
  if (collide(current.shape, current.x, current.y)) {
    endGame();
  }
  drawNext();
}

function updateHUD() {
  scoreEl.textContent = score.toLocaleString();
  linesEl.textContent = lines;
  levelEl.textContent = level;
}

function drawBlock(context, x, y, colorIndex, size, alpha) {
  if (!colorIndex) return;
  context.globalAlpha = alpha ?? 1;
  SKINS[currentSkin].draw(context, x, y, colorIndex, size);
  context.globalAlpha = 1;
}

function drawGrid() {
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 0.5;
  for (let c = 1; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * BLOCK, 0);
    ctx.lineTo(c * BLOCK, ROWS * BLOCK);
    ctx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * BLOCK);
    ctx.lineTo(COLS * BLOCK, r * BLOCK);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  // board
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      drawBlock(ctx, c, r, board[r][c], BLOCK);

  // ghost
  const gy = ghostY();
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        drawBlock(ctx, current.x + c, gy + r, current.shape[r][c], BLOCK, 0.2);

  // current piece
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      drawBlock(ctx, current.x + c, current.y + r, current.shape[r][c], BLOCK);
}

function drawNext() {
  const NB = 30;
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const shape = next.shape;
  const offX = Math.floor((4 - shape[0].length) / 2);
  const offY = Math.floor((4 - shape.length) / 2);
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      drawBlock(nextCtx, offX + c, offY + r, shape[r][c], NB);
}

function setTheme(name) {
  theme = name;
  document.documentElement.dataset.theme = name;
  themeToggle.textContent = name === 'dark' ? 'Modo claro' : 'Modo oscuro';
  gridColor = getComputedStyle(document.documentElement).getPropertyValue('--grid').trim();
  // El loop no redibuja en pausa ni en game over
  if (current) { draw(); drawNext(); }
}

function setSkin(name) {
  if (!Object.prototype.hasOwnProperty.call(SKINS, name)) return;
  currentSkin = name;
  document.documentElement.dataset.skin = name;
  skinSelect.value = name;
  try { localStorage.setItem(SKIN_STORAGE_KEY, name); } catch (e) { /* sin persistencia */ }
  if (current) { draw(); drawNext(); }
}

function loadSavedSkin() {
  try {
    const saved = localStorage.getItem(SKIN_STORAGE_KEY);
    if (Object.prototype.hasOwnProperty.call(SKINS, saved)) return saved;
  } catch (e) { /* sin acceso a localStorage */ }
  return 'retro';
}

// view: 'menu' (pausa), 'controls' (lista de teclas), 'gameover' o
// 'record' (game over con formulario de nombre, al entrar en el top)
function setOverlayView(view) {
  const ended = view === 'gameover' || view === 'record';
  pauseMenu.classList.toggle('hidden', view !== 'menu');
  controlsView.classList.toggle('hidden', view !== 'controls');
  restartBtn.classList.toggle('hidden', !ended);
  overlayStats.classList.toggle('hidden', !ended);
  overlayRecords.classList.toggle('hidden', !ended);
  recordForm.classList.toggle('hidden', view !== 'record');
}

// Pinta filas del top 5 en un tbody; resalta highlightIndex.
function renderRecordRows(tbody, list) {
  tbody.textContent = '';
  if (list.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 4;
    td.className = 'records-empty';
    td.textContent = 'Sin records todavía';
    tr.append(td);
    tbody.append(tr);
    return;
  }
  list.forEach((r, i) => {
    const tr = document.createElement('tr');
    if (i === highlightIndex) tr.className = 'record-new';
    [r.name, r.score.toLocaleString(), r.combo, r.maxLines].forEach((value, col) => {
      const td = document.createElement('td');
      td.textContent = value;
      if (col > 0) td.className = 'num';
      tr.append(td);
    });
    tbody.append(tr);
  });
}

function refreshRecords() {
  const list = loadRecords();
  renderRecordRows(recordsBody, list);
  renderRecordRows(overlayRecordsBody, list);
}

function clearRecords() {
  const ok = confirm('¿Borrar todos los records guardados?');
  // confirm() detiene el loop; reiniciar el reloj evita un salto de caída al volver.
  if (!gameOver && !paused) lastTime = performance.now();
  if (!ok) return;
  resetRecords();
  highlightIndex = -1;
  refreshRecords();
}

function endGame() {
  gameOver = true;
  cancelAnimationFrame(animId);
  const canSave = isTopScore(score);
  overlayTitle.textContent = 'GAME OVER';
  overlayScore.textContent = `Puntuación: ${score.toLocaleString()}`;
  overlayStats.textContent = `Mejor combo: ${bestCombo} · Máx. líneas: ${maxLines}`;
  recordName.value = '';
  recordError.textContent = '';
  setOverlayView(canSave ? 'record' : 'gameover');
  refreshRecords();
  overlay.classList.remove('hidden');
  if (canSave) recordName.focus(); // tras mostrar el overlay, para que el foco sea válido
}

function togglePause() {
  if (gameOver) return;
  paused = !paused;
  if (!paused) {
    overlay.classList.add('hidden');
    lastTime = performance.now();
    loop(lastTime);
  } else {
    cancelAnimationFrame(animId);
    overlayTitle.textContent = 'PAUSA';
    overlayScore.textContent = '';
    setOverlayView('menu');
    overlay.classList.remove('hidden');
  }
}

function loop(ts) {
  const dt = ts - lastTime;
  lastTime = ts;
  dropAccum += dt;
  if (dropAccum >= dropInterval) {
    dropAccum = 0;
    if (!collide(current.shape, current.x, current.y + 1)) {
      current.y++;
    } else {
      lockPiece();
      if (gameOver) return;
    }
  }
  draw();
  animId = requestAnimationFrame(loop);
}

function init() {
  board = createBoard();
  score = 0;
  lines = 0;
  level = startLevel;
  combo = 0;
  bestCombo = 0;
  maxLines = 0;
  paused = false;
  gameOver = false;
  dropInterval = dropIntervalFor(level);
  dropAccum = 0;
  lastTime = performance.now();
  highlightIndex = -1;
  next = randomPiece();
  spawn();
  updateHUD();
  refreshRecords();
  overlay.classList.add('hidden');
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}

document.addEventListener('keydown', e => {
  if (e.target === recordName) return; // el campo de nombre usa sus propias teclas
  if (e.code === 'KeyP' || e.code === 'Escape') {
    if (!e.repeat) togglePause(); // ignora la repetición automática al mantener la tecla
    return;
  }
  if (e.target === skinSelect) return; // las flechas/Espacio son del selector
  if (paused || gameOver) return;
  switch (e.code) {
    case 'ArrowLeft':
      if (!collide(current.shape, current.x - 1, current.y)) current.x--;
      break;
    case 'ArrowRight':
      if (!collide(current.shape, current.x + 1, current.y)) current.x++;
      break;
    case 'ArrowDown':
      softDrop();
      break;
    case 'ArrowUp':
    case 'KeyX':
      tryRotate();
      break;
    case 'Space':
      e.preventDefault();
      hardDrop();
      break;
  }
  updateHUD();
});

restartBtn.addEventListener('click', init);

resumeBtn.addEventListener('click', () => {
  togglePause();
  resumeBtn.blur(); // evita que Espacio vuelva a activar el botón
});

pauseRestartBtn.addEventListener('click', () => {
  init();
  pauseRestartBtn.blur();
});

controlsBtn.addEventListener('click', () => {
  setOverlayView('controls');
  controlsBtn.blur();
});

backBtn.addEventListener('click', () => {
  setOverlayView('menu');
  backBtn.blur();
});

startLevelSelect.addEventListener('change', () => {
  startLevel = Number(startLevelSelect.value); // se aplica en la próxima partida
  startLevelSelect.blur(); // evita que las flechas cambien el selector durante el juego
});

themeToggle.addEventListener('click', () => {
  setTheme(theme === 'dark' ? 'light' : 'dark');
  themeToggle.blur(); // evita que Espacio vuelva a activar el botón
});

skinSelect.addEventListener('change', () => {
  setSkin(skinSelect.value);
  skinSelect.blur(); // evita que las flechas sigan moviendo el selector
});
skinSelect.addEventListener('keydown', e => {
  if (e.key === 'Escape') skinSelect.blur(); // cerrar sin cambiar devuelve el foco al juego
});

recordForm.addEventListener('submit', e => {
  e.preventDefault();
  const index = addRecord({ name: recordName.value, score, combo: bestCombo, maxLines });
  if (index === -1) {
    recordError.textContent = 'No se pudo guardar el record.';
    return;
  }
  highlightIndex = index;
  if (document.activeElement) document.activeElement.blur(); // quita el foco del campo y del botón
  refreshRecords();
  setOverlayView('gameover');
});

[clearRecordsBtn, overlayClearRecordsBtn].forEach(btn => {
  btn.addEventListener('click', () => {
    clearRecords();
    btn.blur(); // evita que Espacio vuelva a activar el botón
  });
});

for (const [key, skin] of Object.entries(SKINS)) {
  const option = document.createElement('option');
  option.value = key;
  option.textContent = skin.label;
  skinSelect.append(option);
}

setSkin(loadSavedSkin());
setTheme('dark');

init();
