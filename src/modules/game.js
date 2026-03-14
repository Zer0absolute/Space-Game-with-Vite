import { Input } from './input.js';
import { Player } from './player.js';
import { random, circleHit } from './utils.js';

export class Game {
  constructor({ canvas, scoreEl, livesEl, waveEl, overlayEl }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scoreEl = scoreEl;
    this.livesEl = livesEl;
    this.waveEl = waveEl;
    this.overlayEl = overlayEl;

    this.input = new Input();
    this.width = 0;
    this.height = 0;
    this.player = new Player(this);
    this.bullets = [];
    this.enemies = [];
    this.stars = [];
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.running = false;
    this.gameOver = false;
    this.lastTime = 0;

    this.createStars();
    this.resize();

    window.addEventListener('resize', () => this.resize());
  }

  start() {
    requestAnimationFrame((time) => this.loop(time));
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.player.reset();
    this.createStars();
  }

  createStars() {
    this.stars = Array.from({ length: 120 }, () => ({
      x: random(0, window.innerWidth || 800),
      y: random(0, window.innerHeight || 600),
      size: random(1, 3),
      speed: random(15, 60)
    }));
  }

  beginGame() {
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.bullets = [];
    this.enemies = [];
    this.gameOver = false;
    this.running = true;
    this.player.reset();
    this.spawnWave();
    this.updateHud();
    this.overlayEl.classList.add('hidden');
  }

  spawnWave() {
    const count = 4 + this.wave * 2;

    for (let i = 0; i < count; i += 1) {
      this.enemies.push({
        x: random(30, this.width - 30),
        y: random(-300, -40),
        radius: random(14, 24),
        speed: random(70, 130) + this.wave * 8,
        drift: random(-40, 40),
        hp: 1
      });
    }
  }

  loseLife() {
    this.lives -= 1;
    this.updateHud();

    if (this.lives <= 0) {
      this.running = false;
      this.gameOver = true;
      this.overlayEl.innerHTML = `
        <div>
          <h1>Game Over</h1>
          <p>Final Score: ${this.score}</p>
          <p>Reached Wave: ${this.wave}</p>
          <p>Press Enter to restart</p>
        </div>
      `;
      this.overlayEl.classList.remove('hidden');
    } else {
      this.player.reset();
    }
  }

  updateHud() {
    this.scoreEl.textContent = String(this.score);
    this.livesEl.textContent = String(this.lives);
    this.waveEl.textContent = String(this.wave);
  }

  update(dt) {
    if (!this.running) {
      if (this.input.wasPressed('Enter')) {
        this.overlayEl.innerHTML = `
          <div>
            <h1>Space Game</h1>
            <p>Move with arrow keys or WASD</p>
            <p>Shoot with Space</p>
            <p>Destroy enemies and survive</p>
          </div>
        `;
        this.beginGame();
      }
      this.input.endFrame();
      return;
    }

    this.player.update(dt, this.input);

    if (this.input.isDown('Space') && this.player.canShoot()) {
      this.bullets.push(this.player.shoot());
    }

    for (const bullet of this.bullets) {
      bullet.y -= bullet.speed * dt;
    }

    for (const enemy of this.enemies) {
      enemy.y += enemy.speed * dt;
      enemy.x += enemy.drift * dt;
    }

    for (const star of this.stars) {
      star.y += star.speed * dt;
      if (star.y > this.height) {
        star.y = 0;
        star.x = random(0, this.width);
      }
    }

    this.bullets = this.bullets.filter((bullet) => bullet.y > -20);

    const remainingEnemies = [];

    for (const enemy of this.enemies) {
      let destroyed = false;

      if (enemy.y - enemy.radius > this.height) {
        this.loseLife();
        continue;
      }

      if (circleHit(this.player, enemy)) {
        this.loseLife();
        destroyed = true;
      }

      for (const bullet of this.bullets) {
        if (circleHit(bullet, enemy)) {
          bullet.y = -100;
          destroyed = true;
          this.score += 10;
          this.updateHud();
          break;
        }
      }

      if (!destroyed) {
        remainingEnemies.push(enemy);
      }
    }

    this.enemies = remainingEnemies;
    this.bullets = this.bullets.filter((bullet) => bullet.y > -20);

    if (this.enemies.length === 0 && this.running) {
      this.wave += 1;
      this.updateHud();
      this.spawnWave();
    }

    this.input.endFrame();
  }

  drawBackground() {
    const ctx = this.ctx;
    ctx.fillStyle = '#03060d';
    ctx.fillRect(0, 0, this.width, this.height);

    for (const star of this.stars) {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawBullets() {
    const ctx = this.ctx;
    ctx.fillStyle = '#ffe066';

    for (const bullet of this.bullets) {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawEnemies() {
    const ctx = this.ctx;

    for (const enemy of this.enemies) {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2b0b0b';
      ctx.fillRect(-enemy.radius, -4, enemy.radius * 2, 8);
      ctx.restore();
    }
  }

  draw() {
    this.drawBackground();
    this.drawBullets();
    this.drawEnemies();

    if (this.running) {
      this.player.draw(this.ctx);
    }
  }

  loop(time) {
    const dt = Math.min((time - this.lastTime) / 1000 || 0, 0.0167);
    this.lastTime = time;

    this.update(dt);
    this.draw();

    requestAnimationFrame((nextTime) => this.loop(nextTime));
  }
}
