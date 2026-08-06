// Integrador de molas com semântica react-spring:
// accel = -(tension/mass)·(x - target) - (friction/mass)·v, Euler semi-implícito.

const pool = new Set();

export class Spring {
  constructor({ value = 0, target = value, tension = 120, friction = 26, mass = 1, onUpdate = null }) {
    this.value = value;
    this.target = target;
    this.velocity = 0;
    this.tension = tension;
    this.friction = friction;
    this.mass = mass;
    this.onUpdate = onUpdate;
    this.done = false;
    pool.add(this);
  }

  set(target) {
    this.target = target;
    this.done = false;
    return this;
  }

  jump(value) {
    this.value = this.target = value;
    this.velocity = 0;
    this.done = false;
    return this;
  }

  step(dt) {
    if (this.done) return;
    const clamped = Math.min(dt, 1 / 30);
    const a = (-this.tension / this.mass) * (this.value - this.target) - (this.friction / this.mass) * this.velocity;
    this.velocity += a * clamped;
    this.value += this.velocity * clamped;
    if (Math.abs(this.value - this.target) < 0.0001 && Math.abs(this.velocity) < 0.0001) {
      this.value = this.target;
      this.velocity = 0;
      this.done = true;
    }
    if (this.onUpdate) this.onUpdate(this.value);
  }

  dispose() { pool.delete(this); }
}

export function stepSprings(dt) {
  for (const s of pool) s.step(dt);
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const smoothstep = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
// Lerp exponencial independente de framerate (fator por frame a 60fps).
export const damp = (current, target, factor, dt) =>
  lerp(current, target, 1 - Math.pow(1 - factor, dt * 60));
