export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const lerp = (a,b,t) => a + (b - a) * t;
export const formatTime = (ms) => {
  if (!Number.isFinite(ms)) return '--:--.---';
  const m = Math.floor(ms/60000);
  const s = Math.floor((ms%60000)/1000);
  const x = Math.floor(ms%1000);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(x).padStart(3,'0')}`;
};
export function drawGlowLine(ctx, points, color='#00f0ff', w=6) {
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap='round';
  for (let i=6;i>=1;i--) {
    ctx.strokeStyle = `rgba(0,240,255,${0.07*i})`;
    ctx.lineWidth = w + i*2;
    ctx.beginPath();
    points.forEach((p,idx)=> idx?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
    ctx.stroke();
  }
  ctx.strokeStyle = color; ctx.lineWidth = w;
  ctx.beginPath();
  points.forEach((p,idx)=> idx?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
  ctx.stroke();
  ctx.restore();
}
 
