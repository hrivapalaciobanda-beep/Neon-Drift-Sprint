export class ParticleSystem {
  constructor() { this.items = []; }
  spawn(x,y,dir,color='rgba(0,255,255,0.8)') {
    for (let i=0;i<6;i++) {
      this.items.push({
        x, y,
        vx: (Math.random()-0.5)*40 + Math.cos(dir+Math.PI)*80,
        vy: (Math.random()-0.5)*40 + Math.sin(dir+Math.PI)*80,
        life: 0.4 + Math.random()*0.3,
        t: 0,
        color
      });
    }
  }
  update(dt) {
    this.items = this.items.filter(p => (p.t += dt) < p.life);
    for (const p of this.items) { p.x += p.vx*dt; p.y += p.vy*dt; }
  }
  draw(ctx) {
    ctx.save();
    for (const p of this.items) {
      const a = 1 - (p.t/p.life);
      ctx.fillStyle = p.color.replace('0.8', (0.2 + 0.6*a).toFixed(3));
      ctx.fillRect(p.x, p.y, 2, 2);
    }
    ctx.restore();
  }
}
