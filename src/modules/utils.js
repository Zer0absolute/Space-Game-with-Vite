export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function random(min, max) {
  return Math.random() * (max - min) + min;
}

export function circleHit(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = Math.hypot(dx, dy);
  return distance < a.radius + b.radius;
}
