import { clamp } from './utils.js';

export class Car {
  constructor(x,y,angle=0) {
    this.x=x; this.y=y; this.angle=angle;
    this.vx=0; this.vy=0; this.angVel=0;
    this.length=36; this.width=18;

    // Parámetros arcade simples
    this.engine = 220;       // aceleración (px/s^2)
    this.brakePower = 300;   // frenada
    this.turnRate = 2.8;     // rad/s @ velocidad media
    this.drag = 1.5;         // fricción aerodinámica
    this.gripLong = 16;      // agarre longitudinal
    this.gripLat  = 9;       // agarre lateral (menor => más derrape)
    this.maxSpeed = 420;     // px/s aprox.
    this.nitro = 1.0;        // 0..1
    this.driftScore = 0;
  }

  reset(x,y,a=0) {
    this.x=x; this.y=y; this.angle=a; this.vx=this.vy=0; this.angVel=0;
    this.nitro=1; this.driftScore=0;
  }

  update(dt, input, particles) {
    // Dirección del coche
    const cos = Math.cos(this.angle), sin = Math.sin(this.angle);
    const forward = { x: cos, y: sin };
    const right   = { x:-sin, y: cos };

    // Descomponer velocidad en local (longitudinal/lateral)
    const vLong = this.vx*forward.x + this.vy*forward.y;
    const vLat  = this.vx*right.x   + this.vy*right.y;

    // Controles
    let ax = 0, ay = 0;

    // Acelerador / freno
    let accel = 0;
    if (input.throttle) accel += this.engine;
    if (input.brake)    accel -= this.brakePower;
        // Nitro
    if (input.nitro && this.nitro > 0.05) {
      accel += this.engine*0.9;
      this.nitro = Math.max(0, this.nitro - 0.35*dt);
      // estela de partículas
      particles?.spawn(this.x - forward.x*10, this.y - forward.y*10, this.angle, 'rgba(255,60,200,0.8)');
    } else {
      this.nitro = Math.min(1, this.nitro + 0.12*dt);
    }

    // Fuerza motor sobre el eje longitudinal
    const fLong = accel - Math.sign(vLong) * this.gripLong * Math.abs(vLong);
    const fLat  = - this.gripLat * vLat; // reduce deslizamiento lateral -> drift controlable

    // Convertir a mundo
    const aWorldX = (fLong*forward.x + fLat*right.x);
    const aWorldY = (fLong*forward.y + fLat*right.y);

    // arrastre
    const dragX = -this.drag * this.vx;
    const dragY = -this.drag * this.vy;

    // Integración
    this.vx += (aWorldX + dragX) * dt;
    this.vy += (aWorldY + dragY) * dt;

    // Límite de velocidad
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > this.maxSpeed) {
      const s = this.maxSpeed / speed; this.vx*=s; this.vy*=s;
    }

    // Giro proporcional a velocidad longitudinal
    const speedFactor = clamp(Math.abs(vLong)/180, 0, 1);
    let steer = 0;
    if (input.left)  steer -= 1;
    if (input.right) steer += 1;
    this.angle += steer * this.turnRate * (0.6 + 0.4*speedFactor) * dt;

    // Avanzar
    this.x += this.vx * dt; this.y += this.vy * dt;

    // Puntuación de drift (ángulo entre rumbo y velocidad)
    const velAngle = Math.atan2(this.vy, this.vx);
    let slip = Math.abs(Math.atan2(Math.sin(velAngle - this.angle), Math.cos(velAngle - this.angle)));
        if (speed > 80 && slip > 0.2) this.driftScore += (speed * slip) * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    // brillo base
    ctx.fillStyle = '#05131a';
    ctx.fillRect(-this.length/2-2, -this.width/2-2, this.length+4, this.width+4);
    // carrocería
    const grad = ctx.createLinearGradient(-this.length/2,0,this.length/2,0);
    grad.addColorStop(0,'#00a8ff'); grad.addColorStop(1,'#00f0ff');
    ctx.fillStyle = grad;
    ctx.fillRect(-this.length/2, -this.width/2, this.length, this.width);
    // vidrio
    ctx.fillStyle='rgba(255,255,255,.2)';
    ctx.fillRect(0, -this.width/3, this.length/3, 2*this.width/3);
    ctx.restore();
  }
}
 
