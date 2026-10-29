import Matter from "matter-js";
// Create a finite-mass body first. Creating it static can leave an infinite
// original mass when Matter subsequently transitions it back to dynamic.
export function createStickerBody(
  x: number,
  y: number,
  w: number,
  h: number,
  angle: number,
  circular: boolean,
) {
  const options = {
    restitution: 0.65,
    friction: 0.3,
    frictionAir: 0.008,
    angle,
  };
  const body = circular
    ? Matter.Bodies.circle(x, y, Math.max(w, h) / 2, options)
    : Matter.Bodies.rectangle(x, y, w, h, {
        ...options,
        chamfer: { radius: Math.min(16, h * 0.15) },
      });
  parkSticker(body);
  return body;
}
export function parkSticker(body: Matter.Body) {
  if (!body.isStatic) Matter.Body.setStatic(body, true);
  Matter.Body.setVelocity(body, { x: 0, y: 0 });
  Matter.Body.setAngularVelocity(body, 0);
}
export function releaseSticker(body: Matter.Body) {
  if (body.isStatic) Matter.Body.setStatic(body, false);
}
