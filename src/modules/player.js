import { clamp } from './utils.js';

export class Player {
  constructor(game) {
    this.game = game;
    this.radius = 18;
    this.speed = 320;
    this.fireCooldown = 0;
    this.reset();
  }

  reset() {
    this.x = this.game.width / 2;
    this.y = this.game.height - 80;
    this.vx = 0;
    this.vy = 0;
  }

  update(dt, input) {
    let dx = 0;
    let dy = 0;

    if (input.isDown('ArrowLeft') || input.isDown('KeyA')) dx -= 1;
    if (input.isDown('ArrowRight') || input.isDown('KeyD')) dx += 1;
    if (input.isDown('ArrowUp') || input.isDown('KeyW')) dy -= 1;
    if (input.isDown('ArrowDown') || input.isDown('KeyS')) dy += 1;

    const length = Math.hypot(dx, dy) || 1;
    this.vx = (dx / length) * this.speed;
    this.vy = (dy / length) * this.speed;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.x = clamp(this.x, this.radius, this.game.width - this.radius);
    this.y = clamp(this.y, this.radius, this.game.height - this.radius);

    this.fireCooldown -= dt;
  }

  canShoot() {
    return this.fireCooldown <= 0;
  }

  shoot() {
    this.fireCooldown = 0.2;
    return {
      x: this.x,
      y: this.y - this.radius,
      radius: 4,
      speed: 560
    };
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.fillStyle = '#6ee7ff';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(14, 18);
    ctx.lineTo(0, 10);
    ctx.lineTo(-14, 18);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -3, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
