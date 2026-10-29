import { lazy, Suspense, useState } from "react";
import { Rotate3D, ArrowUpRight } from "lucide-react";
import { useReducedMotion, useVisible } from "../lib/hooks";
const Sculpture = lazy(() => import("./HeroSculpture"));
export default function Ribbon() {
  const { ref, visible } = useVisible<HTMLDivElement>("150px");
  const reduced = useReducedMotion();
  const [mode, setMode] = useState(0);
  const [ready, setReady] = useState(false);
  const bloom =
    Array.from({ length: 120 }, (_, i) => {
      const a = (i / 120) * Math.PI * 2,
        radius = 120 + 30 * Math.cos(a * 5);
      return `${i ? "L" : "M"}${250 + Math.cos(a) * radius},${250 + Math.sin(a) * radius}`;
    }).join(" ") + "Z";
  return (
    <div className="ribbon-wrap sculpture-wrap" ref={ref}>
      <div className="sculpture-coordinate">
        <span>FORM / 00{mode + 1}</span>
        <span>LIVE MATERIAL STUDY ↗</span>
      </div>
      <div
        className={`sculpture-fallback ${ready && !reduced ? "is-ready" : ""}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 500 500">
          <defs>
            <linearGradient id="knot-gradient">
              <stop stopColor="#ff4d00" />
              <stop offset=".48" stopColor="#ffbf8c" />
              <stop offset=".5" stopColor="#202020" />
              <stop offset=".7" stopColor="#f1efe9" />
              <stop offset="1" stopColor="#ff4d00" />
            </linearGradient>
          </defs>
          {mode === 1 ? (
            <circle cx="250" cy="250" r="145" fill="url(#knot-gradient)" />
          ) : (
            <path
              d={
                mode === 2
                  ? bloom
                  : "M250 100C40 100 80 400 250 310S420 100 250 190 60 390 250 400 450 180 250 100Z"
              }
              fill="none"
              stroke="url(#knot-gradient)"
              strokeWidth="48"
            />
          )}
        </svg>
      </div>
      {!reduced && (
        <Suspense fallback={null}>
          <Sculpture
            mode={mode}
            visible={visible}
            onReady={() => setReady(true)}
          />
        </Suspense>
      )}
      <div className="sculpture-caption">
        <Rotate3D size={14} />
        <span>GRAB IT. GIVE IT A TWIST.</span>
        <ArrowUpRight size={14} />
      </div>
      <div className="sculpture-modes" aria-label="Sculpture shape">
        {["Knot", "Sphere", "Bloom"].map((label, i) => (
          <button
            key={label}
            aria-pressed={mode === i}
            onClick={() => setMode(i)}
          >
            {label}
            <span>0{i + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
