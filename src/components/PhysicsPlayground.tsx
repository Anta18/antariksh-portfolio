import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, RotateCcw, Orbit, Zap, MoveUpRight } from "lucide-react";
import Matter from "matter-js";
import { createStickerBody, parkSticker, releaseSticker } from "../lib/physics";
import gsap from "gsap";
import { useReducedMotion, useVisible } from "../lib/hooks";
const stickers = [
  { kind: "poster", label: "MAKE SOME NOISE", w: 188, h: 136 },
  { kind: "star", label: "✳", w: 114, h: 114 },
  { kind: "chrome", label: "PLAY", w: 142, h: 142 },
  { kind: "ticket", label: "ONE WILD IDEA", w: 200, h: 92 },
  { kind: "type", label: "WHAT IF?", w: 190, h: 86 },
  { kind: "code", label: "{ creative energy }", w: 212, h: 76 },
  { kind: "stamp", label: "100% HUMAN", w: 124, h: 124 },
  { kind: "pill", label: "BREAK THINGS ↗", w: 220, h: 70 },
];
type PhysicsApi = {
  release: () => void;
  reset: () => void;
  invert: () => void;
  blast: (x?: number, y?: number) => void;
  grab: (i: number, x: number, y: number) => void;
  move: (x: number, y: number) => void;
  drop: () => void;
  nudge: (i: number, key: string) => void;
};
export default function PhysicsPlayground() {
  const { ref, visible } = useVisible<HTMLDivElement>();
  const reduced = useReducedMotion();
  const prefs = useRef({ visible, reduced });
  prefs.current = { visible, reduced };
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const api = useRef<PhysicsApi | null>(null);
  const [running, setRunning] = useState(false);
  const [inverted, setInverted] = useState(false);
  const [hits, setHits] = useState(0);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const { Engine, Bodies, Body, Composite, Constraint, Events } = Matter;
    const engine = Engine.create({ enableSleeping: false });
    engine.gravity.y = 0;
    engine.positionIterations = 8;
    let bs: Matter.Body[] = [],
      walls: Matter.Body[] = [],
      homes: { x: number; y: number; a: number }[] = [];
    let grab: Matter.Constraint | null = null;
    let resetTweens: gsap.core.Tween[] = [];
    let active = false,
      resetting = false,
      frame = 0,
      last = 0,
      collisionCount = 0;
    const restore = () => {
      resetTweens.forEach((t) => t.kill());
      resetTweens = [];
      active = false;
      resetting = true;
      engine.gravity.y = 0;
      if (grab) {
        Composite.remove(engine.world, grab);
        grab = null;
      }
      setRunning(false);
      setInverted(false);
      bs.forEach((body, i) => {
        gsap.killTweensOf(body.position);
        parkSticker(body);
        const transform = {
          x: body.position.x,
          y: body.position.y,
          a: body.angle,
        };
        resetTweens.push(
          gsap.to(transform, {
            x: homes[i].x,
            y: homes[i].y,
            a: homes[i].a,
            duration: prefs.current.reduced ? 0 : 0.85,
            delay: prefs.current.reduced ? 0 : i * 0.035,
            ease: "expo.inOut",
            onUpdate: () => {
              Body.setPosition(body, { x: transform.x, y: transform.y });
              Body.setAngle(body, transform.a);
            },
            onComplete: () => {
              if (i === bs.length - 1) resetting = false;
            },
          }),
        );
      });
    };
    const release = () => {
      if (active) return;
      resetTweens.forEach((t) => t.kill());
      resetTweens = [];
      active = true;
      resetting = false;
      engine.gravity.y = prefs.current.reduced ? 0 : 0.95;
      setRunning(true);
      bs.forEach((body, i) => {
        gsap.killTweensOf(body.position);
        releaseSticker(body);
        Body.setVelocity(body, {
          x: (i % 2 ? 1 : -1) * (3 + i * 0.55),
          y: -6 - i * 0.6,
        });
        Body.setAngularVelocity(body, (i % 2 ? 1 : -1) * (0.025 + i * 0.008));
        if (prefs.current.reduced) {
          Body.setPosition(body, {
            x: homes[i].x,
            y: Math.min(host.clientHeight - 80, homes[i].y + 50),
          });
          Body.setAngle(body, 0.12 * (i % 2 ? 1 : -1));
        }
      });
    };
    const blast = (x = host.clientWidth / 2, y = host.clientHeight / 2) => {
      release();
      bs.forEach((body, i) => {
        const dx = body.position.x - x,
          dy = body.position.y - y;
        const length = Math.max(80, Math.hypot(dx, dy));
        Body.setVelocity(body, {
          x: (dx / length) * (14 + i),
          y: (dy / length) * (14 + i) - 4,
        });
        Body.setAngularVelocity(body, (i % 2 ? 1 : -1) * 0.14);
      });
    };
    const layout = () => {
      resetTweens.forEach((t) => t.kill());
      resetTweens = [];
      const width = host.clientWidth,
        height = host.clientHeight;
      Composite.clear(engine.world, false);
      bs = [];
      const mobile = width < 650,
        cols = mobile ? 2 : 4;
      const scale = mobile
        ? Math.min(0.72, (width / 2 - 18) / 220)
        : Math.min(1, (width / 4 - 18) / 220);
      homes = stickers.map((_, i) => ({
        x: (((i % cols) + 0.5) * width) / cols,
        y: mobile
          ? 75 + Math.floor(i / cols) * 114
          : 105 + Math.floor(i / cols) * 205,
        a: (i % 2 ? 1 : -1) * (0.07 + (i % 3) * 0.04),
      }));
      bs = stickers.map((s, i) => {
        const w = s.w * scale,
          h = s.h * scale;
        const node = refs.current[i];
        if (node) {
          node.style.width = `${w}px`;
          node.style.height = `${h}px`;
          node.style.setProperty("--sticker-scale", String(scale));
        }
        return createStickerBody(
          homes[i].x,
          homes[i].y,
          w,
          h,
          homes[i].a,
          s.kind === "chrome" || s.kind === "star" || s.kind === "stamp",
        );
      });
      walls = [
        Bodies.rectangle(width / 2, height + 50, width + 200, 100, {
          isStatic: true,
        }),
        Bodies.rectangle(-50, height / 2, 100, height + 200, {
          isStatic: true,
        }),
        Bodies.rectangle(width + 50, height / 2, 100, height + 200, {
          isStatic: true,
        }),
        Bodies.rectangle(width / 2, -60, width + 200, 100, { isStatic: true }),
      ];
      Composite.add(engine.world, [...bs, ...walls]);
      // Paint the parked arrangement immediately, including while offscreen.
      // Visibility should pause the simulation, not leave every target at 0,0.
      bs.forEach((body, i) => {
        const element = refs.current[i];
        if (element)
          element.style.transform = `translate(${body.position.x}px,${body.position.y}px) translate(-50%,-50%) rotate(${body.angle}rad)`;
      });
      active = false;
      resetting = false;
      setRunning(false);
      setInverted(false);
      engine.gravity.y = 0;
    };
    api.current = {
      release,
      reset: restore,
      invert: () => {
        release();
        engine.gravity.y = engine.gravity.y > 0 ? -1 : 0.95;
        setInverted(engine.gravity.y < 0);
        bs.forEach((b) =>
          Body.setVelocity(b, { x: b.velocity.x, y: engine.gravity.y * 8 }),
        );
      },
      blast,
      grab: (i, x, y) => {
        release();
        if (grab) Composite.remove(engine.world, grab);
        const body = bs[i];
        releaseSticker(body);
        grab = Constraint.create({
          pointA: { x, y },
          bodyB: body,
          pointB: { x: x - body.position.x, y: y - body.position.y },
          stiffness: 0.2,
          damping: 0.1,
          length: 0,
        });
        Composite.add(engine.world, grab);
      },
      move: (x, y) => {
        if (grab) {
          grab.pointA = { x, y };
          if (prefs.current.reduced) {
            const b = grab.bodyB;
            if (b) Body.setPosition(b, { x, y });
          }
        }
      },
      drop: () => {
        if (grab) {
          Composite.remove(engine.world, grab);
          grab = null;
        }
      },
      nudge: (i, key) => {
        release();
        const b = bs[i];
        const d: Record<string, [number, number]> = {
          ArrowLeft: [-9, 0],
          ArrowRight: [9, 0],
          ArrowUp: [0, -12],
          ArrowDown: [0, 12],
          " ": [i % 2 ? -10 : 10, -14],
        };
        if (d[key]) {
          Body.setVelocity(b, { x: d[key][0], y: d[key][1] });
          if (prefs.current.reduced)
            Body.translate(b, { x: d[key][0] * 3, y: d[key][1] * 3 });
          Body.setAngularVelocity(b, 0.12);
        }
      },
    };
    let previousWidth = 0;
    const ro = new ResizeObserver(() => {
      if (host.clientWidth !== previousWidth) {
        previousWidth = host.clientWidth;
        layout();
      }
    });
    ro.observe(host);
    layout();
    const collision = () => {
      collisionCount++;
      if (collisionCount % 4 === 0) setHits(collisionCount);
    };
    Events.on(engine, "collisionStart", collision);
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!prefs.current.visible || document.hidden) return;
      const dt = Math.min(now - last, 32) || 16.67;
      last = now;
      if (active && !prefs.current.reduced && !resetting) {
        Engine.update(engine, dt);
        host.dataset.physicsFrames = String(
          Number(host.dataset.physicsFrames || 0) + 1,
        );
      }
      bs.forEach((body, i) => {
        if (active) {
          const margin = 30;
          const x = Math.max(
              margin,
              Math.min(host.clientWidth - margin, body.position.x),
            ),
            y = Math.max(
              margin,
              Math.min(host.clientHeight - margin, body.position.y),
            );
          if (x !== body.position.x || y !== body.position.y)
            Body.setPosition(body, { x, y });
        }
        const el = refs.current[i];
        if (el)
          el.style.transform = `translate(${body.position.x}px,${body.position.y}px) translate(-50%,-50%) rotate(${body.angle}rad)`;
      });
    };
    frame = requestAnimationFrame(tick);
    return () => {
      resetTweens.forEach((t) => t.kill());
      cancelAnimationFrame(frame);
      ro.disconnect();
      Events.off(engine, "collisionStart", collision);
      bs.forEach((b) => gsap.killTweensOf(b.position));
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      api.current = null;
    };
  }, [ref]);
  const position = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  return (
    <div
      className={`physics-card physics-v2 ${running ? "physics-released" : ""}`}
    >
      <div className="play-card-header">
        <span className="mono">01 / AN EXERCISE IN LOSING CONTROL</span>
        <span className="sandbox-live">
          <i /> REAL PHYSICS. REAL CONSEQUENCES.*
        </span>
      </div>
      <div
        ref={ref}
        className="physics-stage"
        data-visible={visible}
        data-reduced={reduced}
        role="group"
        aria-label="Interactive physics playground. Drag any object to start."
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
            const p = position(e);
            api.current?.blast(p.x, p.y);
          }
        }}
      >
        <div className="sandbox-backdrop" aria-hidden="true">
          <span>MAKE</span>
          <span>A MESS.</span>
        </div>
        <span className="sandbox-coord coord-a" aria-hidden="true">
          + 00,00
        </span>
        <span className="sandbox-coord coord-b" aria-hidden="true">
          + PLAY IS A SERIOUS THING
        </span>
        {stickers.map((s, i) => (
          <button
            key={s.kind}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={`physics-sticker sticker-${s.kind}`}
            aria-label={`${s.label}. Drag, throw, or use arrow keys.`}
            onPointerDown={(e) => {
              e.stopPropagation();
              const p = position(e);
              api.current?.grab(i, p.x, p.y);
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                const p = position(e);
                api.current?.move(p.x, p.y);
              }
            }}
            onPointerUp={() => api.current?.drop()}
            onPointerCancel={() => api.current?.drop()}
            onKeyDown={(e) => {
              if (
                [
                  "ArrowLeft",
                  "ArrowRight",
                  "ArrowUp",
                  "ArrowDown",
                  " ",
                ].includes(e.key)
              ) {
                e.preventDefault();
                api.current?.nudge(i, e.key);
              }
            }}
          >
            <span>{s.label}</span>
            {s.kind === "poster" && (
              <small>
                LESS EXPECTED.
                <br />
                MORE REMEMBERED.
              </small>
            )}
            {s.kind === "ticket" && <small>ADMIT ONE / NO BORING IDEAS</small>}
            {s.kind === "chrome" && <i />}
            {s.kind === "stamp" && <small>DESIGNED WITH FEELING</small>}
          </button>
        ))}
      </div>
      <div className="play-card-footer">
        <div>
          <span className="sandbox-instruction">
            {running
              ? "Drag. Throw. Turn gravity upside down."
              : "Grab literally anything. Or click the empty space."}
          </span>
          <span className="sandbox-counter mono">
            {String(hits).padStart(3, "0")} COLLISIONS / *ONLY YOUR COMPOSURE IS
            AT RISK.
          </span>
        </div>
        <div className="sandbox-actions">
          <button
            className="icon-button"
            aria-label="Blast the objects"
            title="Blast the objects"
            onClick={() => api.current?.blast()}
          >
            <Zap size={18} />
          </button>
          <button
            className={`icon-button ${inverted ? "is-inverted" : ""}`}
            aria-label="Reverse gravity"
            title="Reverse gravity"
            onClick={() => api.current?.invert()}
          >
            <Orbit size={19} />
          </button>
          <button
            className="pill-button dark-button"
            onClick={() =>
              running ? api.current?.reset() : api.current?.blast()
            }
          >
            {running ? "Restore order" : "Break the grid"}
            {running ? <RotateCcw size={15} /> : <ArrowUpRight size={16} />}
          </button>
        </div>
      </div>
      <MoveUpRight className="sandbox-corner" size={20} />
    </div>
  );
}
