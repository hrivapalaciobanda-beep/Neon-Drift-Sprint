// Entradas de teclado: usa keydown/keyup y propiedades modernas 'key'/'code'
const state = new Map();
export function setupInput() {
  window.addEventListener('keydown', e => { state.set(e.code, true); });
  window.addEventListener('keyup',   e => { state.set(e.code, false); });
}
export const key = (code) => !!state.get(code);
export const throttle = () => key('ArrowUp') || key('KeyW');
export const brake    = () => key('ArrowDown') || key('KeyS');
export const left     = () => key('ArrowLeft') || key('KeyA');
export const right    = () => key('ArrowRight') || key('KeyD');
export const nitro    = () => key('ShiftLeft') || key('ShiftRight');
export const reset    = () => key('KeyR');
