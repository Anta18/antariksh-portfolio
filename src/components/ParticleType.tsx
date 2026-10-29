import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { useReducedMotion, useVisible } from "../lib/hooks";
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  shade: number;
};
export default function ParticleType() {
  const { ref, visible } = useVisible<HTMLCanvasElement>();
  const reduced = useReducedMotion();
  const [word, setWord] = useState("FEEL.");
  const state = useRef({ word, visible, reduced });
  state.current = { word, visible, reduced };
  const pointer = useRef({ x: -999, y: -999, down: false });
  const burst = useRef(0);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = 0,
      height = 0,
      particles: Particle[] = [],
      frame = 0,
      lastWord = "",
      last = 0;
    const makeWord = () => {
      const off = document.createElement("canvas");
      off.width = width;
      off.height = height;
      const c = off.getContext("2d")!;
      c.fillStyle = "#fff";
      const size = Math.min(
        width / (state.current.word.length * 0.5),
        height * 0.8,
      );
      c.font = `${size}px Anton`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(state.current.word, width / 2, height * 0.53);
      const data = c.getImageData(0, 0, width, height).data;
      const targets: { x: number; y: number }[] = [];
      const step = width < 500 ? 4 : 5;
      for (let y = 0; y < height; y += step)
        for (let x = 0; x < width; x += step)
          if (data[(y * width + x) * 4 + 3] > 100) targets.push({ x, y });
      particles = targets.map((p, i) => {
        const old = particles[i % Math.max(1, particles.length)];
        return {
          x: old?.x ?? width / 2 + (Math.random() - 0.5) * width,
          y: old?.y ?? height / 2 + (Math.random() - 0.5) * height,
          vx: old?.vx ?? 0,
          vy: old?.vy ?? 0,
          tx: p.x,
          ty: p.y,
          shade: Math.random(),
        };
      });
      lastWord = state.current.word;
    };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      width = Math.round(r.width);
      height = Math.round(r.height);
      const d = Math.min(devicePixelRatio, 1.5);
      canvas.width = width * d;
      canvas.height = height * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      if (width && height) makeWord();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    document.fonts.ready.then(() => {
      if (canvas.isConnected) makeWord();
    });
    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      if (!state.current.visible || document.hidden || now - last < 20) return;
      last = now;
      if (lastWord !== state.current.word) makeWord();
      ctx.clearRect(0, 0, width, height);
      const p = pointer.current;
      const dark = document.documentElement.dataset.theme === "dark";
      let magnitude = 0;
      for (const q of particles) {
        const dx = q.x - p.x,
          dy = q.y - p.y,
          distance = Math.sqrt(dx * dx + dy * dy);
        if (burst.current > 0) {
          q.vx += (q.x - width / 2) * 0.05 * burst.current;
          q.vy += (q.y - height / 2) * 0.05 * burst.current;
        }
        if (distance < 100 && !state.current.reduced) {
          const force = (1 - distance / 100) * (p.down ? 15 : 5);
          q.vx += (dx / (distance || 1)) * force;
          q.vy += (dy / (distance || 1)) * force;
        }
        q.vx += (q.tx - q.x) * 0.025;
        q.vy += (q.ty - q.y) * 0.025;
        q.vx *= 0.86;
        q.vy *= 0.86;
        if (state.current.reduced) {
          q.x = q.tx;
          q.y = q.ty;
        } else {
          q.x += q.vx;
          q.y += q.vy;
        }
        magnitude = Math.min(1, (Math.abs(q.vx) + Math.abs(q.vy)) / 5);
        ctx.fillStyle =
          magnitude > 0.2 ? "#ff5b16" : dark ? "#f5f2eb" : "#161616";
        ctx.fillRect(
          q.x,
          q.y,
          magnitude > 0.4 ? 3 : 2.2,
          magnitude > 0.4 ? 3 : 2.2,
        );
      }
      burst.current *= 0.55;
      if (burst.current < 0.01) burst.current = 0;
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [ref]);
  return (
    <div className="particle-type">
      <div className="play-card-header">
        <span className="mono">02 / TYPE WITH A NERVOUS SYSTEM</span>
        <Sparkles size={19} />
      </div>
      <canvas
        ref={ref}
        className="particle-canvas"
        role="img"
        aria-label={`Interactive particle typography spelling ${word}. Move across it to scatter the particles.`}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          pointer.current.x = e.clientX - r.left;
          pointer.current.y = e.clientY - r.top;
        }}
        onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          pointer.current = {
            x: e.clientX - r.left,
            y: e.clientY - r.top,
            down: true,
          };
          burst.current = 0.35;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerUp={() => {
          pointer.current.down = false;
        }}
        onPointerCancel={() => {
          pointer.current = { x: -999, y: -999, down: false };
        }}
        onPointerLeave={() => {
          if (!pointer.current.down)
            pointer.current = { x: -999, y: -999, down: false };
        }}
      />
      <div className="particle-toolbar">
        <div className="particle-words">
          {["FEEL.", "THINK.", "BUILD."].map((w) => (
            <button
              key={w}
              onClick={() => setWord(w)}
              aria-pressed={word === w}
            >
              {w}
            </button>
          ))}
        </div>
        <button
          className="text-button"
          onClick={() => {
            burst.current = 1;
          }}
        >
          Blow it apart <ArrowUpRight size={15} />
        </button>
      </div>
      <p className="particle-hint">
        A few thousand points. One very strong attraction. Run your cursor
        through it.
      </p>
    </div>
  );
}
