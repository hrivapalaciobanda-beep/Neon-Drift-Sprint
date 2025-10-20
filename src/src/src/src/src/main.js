import { setupInput, throttle, brake, left, right, nitro, reset } from './input.js';
import { Car } from './car.js';
import { buildTrack, nearestOnTrack } from './track.js';
import { ParticleSystem } from './particles.js';
import { drawGlowLine, clamp, formatTime } from './utils.js';

// Canvas y contexto 2D
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d'); // CanvasRenderingContext2D para dibujar 2D. [1](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)

const HUD = {
  lap: document.getElementById('lap'),
  laps: document.getElementById('laps'),
  time: document.getElementById('time'),
  best: document.getElementById('best'),
  drift: document.getElementById('drift'),
  nitro: document.getElementById('nitro'),
};

const TOTAL_LAPS = 3; HUD.laps.textContent = TOTAL_LAPS;

setupInput();

const W = canvas.width, H = canvas.height;
const track = buildTrack(W, H);
const particles = new ParticleSystem();

// Coche y estado de carrera
const car = new Car(W*0.5 + 80, H*0.65, -Math.PI/2);
let currentLap = 1, bestMs = Infinity;
let started = false, raceStartMs = 0, lapStartMs = 0;
let nextCheckpoint = 1;

// Ghost sencillo (replay de puntos por frame de la mejor vuelta)
let ghost = [];

function resetRace() {
  currentLap = 1; nextCheckpoint = 1; started = false;
  raceStartMs = lapStartMs = performance.now();
  car.reset(W*0.5 + 80, H*0.65, -Math.PI/2);
}
resetRace();

function update(dt) {
  const input = {
    throttle: throttle(), brake: brake(),
    left: left(), right: right(), nitro: nitro()
  };

  if (reset()) resetRace();

  car.update(dt, input, particles);
  particles.update(dt);

  // Progreso: detectar paso por checkpoints
  const idx = nearestOnTrack(track.path, car.x, car.y);
  if (idx === track.checkpoints[nextCheckpoint]) {
    nextCheckpoint++;
    if (nextCheckpoint >= track.checkpoints.length) {
      // completó vuelta
      nextCheckpoint = 0;
      const now = performance.now();
      const lapMs = now - lapStartMs;
      lapStartMs = now;
      if (!started) started = true;
      else {
        currentLap++;
        if (lapMs < bestMs) { bestMs = lapMs; HUD.best.textContent = formatTime(bestMs); ghost = []; }
        if (currentLap > TOTAL_LAPS) resetRace();
      }
      HUD.lap.textContent = String(currentLap);
    }
  }
  function draw() {
  // Fondo
  ctx.clearRect(0,0,W,H);

  // Pista: glow line
  drawGlowLine(ctx, track.path, '#00f0ff', 10);

  // Ghost (semi-transparente)
  if (ghost.length>0) {
    ctx.save(); ctx.globalAlpha = 0.35;
    for (let i=0;i<ghost.length;i+=8) {
      const g = ghost[i];
      ctx.fillStyle='#ff60c8';
      ctx.beginPath(); ctx.arc(g.x, g.y, 3, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  // Partículas
  particles.draw(ctx);

  // Coche
  car.draw(ctx);

  // HUD
  const now = performance.now();
  const timeMs = started ? (now - raceStartMs) : (now - lapStartMs);
  HUD.time.textContent  = formatTime(timeMs);
  HUD.drift.textContent = Math.floor(car.driftScore).toString();
  HUD.nitro.textContent = `${Math.floor(car.nitro*100)}%`;
}

// Bucle de juego con requestAnimationFrame (sincroniza con repintado del navegador) [2](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
let last = performance.now();
function loop(ts) {
  const dt = Math.min(1/30, (ts - last)/1000); // clamp dt para estabilidad
  last = ts;
  update(dt);
  draw();
  window.requestAnimationFrame(loop); // reprogramamos siguiente frame (rAF es one-shot) [2](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
}
window.requestAnimationFrame(loop);
