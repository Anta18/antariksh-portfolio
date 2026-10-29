import test from "node:test";
import assert from "node:assert/strict";
import Matter from "matter-js";
import {
  createStickerBody,
  parkSticker,
  releaseSticker,
} from "../src/lib/physics.ts";
test("stickers have finite mass and actually travel after activation, including repeated resets", () => {
  for (const circle of [false, true]) {
    const engine = Matter.Engine.create();
    const body = createStickerBody(150, 100, 100, 80, 0.1, circle);
    Matter.Composite.add(engine.world, body);
    for (let cycle = 0; cycle < 4; cycle++) {
      parkSticker(body);
      parkSticker(body);
      releaseSticker(body);
      assert.ok(Number.isFinite(body.mass));
      assert.ok(body.mass > 0);
      Matter.Body.setVelocity(body, { x: 8, y: -3 });
      const before = { ...body.position };
      for (let i = 0; i < 20; i++) Matter.Engine.update(engine, 1000 / 60);
      assert.ok(
        Number.isFinite(body.position.x) && Number.isFinite(body.position.y),
      );
      assert.ok(
        Math.hypot(body.position.x - before.x, body.position.y - before.y) > 10,
      );
    }
    Matter.Engine.clear(engine);
  }
});
test("released stickers collide with a floor instead of becoming invalid or passing through it", () => {
  const engine = Matter.Engine.create();
  const body = createStickerBody(150, 80, 80, 60, 0, false);
  releaseSticker(body);
  const floor = Matter.Bodies.rectangle(150, 300, 500, 40, { isStatic: true });
  Matter.Composite.add(engine.world, [body, floor]);
  for (let i = 0; i < 180; i++) Matter.Engine.update(engine, 1000 / 60);
  assert.ok(Number.isFinite(body.position.y));
  assert.ok(body.position.y < 285);
  assert.ok(body.position.y > 200);
  Matter.Engine.clear(engine);
});
