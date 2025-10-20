// Pista: una lista de puntos formando un circuito cerrado + checkpoints
export function buildTrack(w, h) {
  // Circuito “neón” simple (oval estilizado con chicanas)
  const cx = w/2, cy = h/2, rx = w*0.36, ry = h*0.30;
  const pts = [];
  const N = 120;
  for (let i=0;i<N;i++) {
    const t = i/N * Math.PI*2;
    let x = cx + Math.cos(t)*rx;
    let y = cy + Math.sin(t)*ry;
    // chicana leve
    const ch = Math.sin(t*3) * 20 * (Math.sin(t)>0?1:0.6);
    x += Math.cos(t+Math.PI/2)*ch;
    y += Math.sin(t+Math.PI/2)*ch;
    pts.push({x,y});
  }

  // checkpoints (cada 1/6 de vuelta)
  const checkpoints = [0, N/6, 2*N/6, 3*N/6, 4*N/6, 5*N/6].map(i=>Math.floor(i));

  return { path: pts, checkpoints };
}

export function nearestOnTrack(path, x, y, fromIdx=0) {
  // Busca el punto del path más cercano a (x,y) para medir progreso/cte
  let best = { idx: fromIdx, d2: Infinity };
  for (let i=0;i<path.length;i++) {
    const p = path[i];
    const dx = p.x - x, dy = p.y - y;
    const d2 = dx*dx + dy*dy;
    if (d2 < best.d2) best = { idx: i, d2 };
  }
  return best.idx;
}
