import { useState } from "react";
import { Layers3, ArrowDown } from "lucide-react";
const layers = [
  {
    name: "The interface",
    type: "NEXT.JS",
    description:
      "Executive summaries, global filters, drill-downs, and a consistent dashboard experience.",
  },
  {
    name: "The application",
    type: "FASTAPI",
    description:
      "Analytics, alerting, exploration, and custom KPI endpoints. The service layer connects the interface to the right execution path.",
  },
  {
    name: "The warehouse",
    type: "POSTGRESQL",
    description:
      "The primary metrics path uses a relational warehouse and async SQLAlchemy. CSV ingestion normalizes and upserts source data.",
  },
  {
    name: "The query branch",
    type: "NLP → SQLITE",
    description:
      "A separate natural-language pipeline plans, generates, and verifies SQL over a local SQLite mirror for ad hoc analytics.",
  },
];
export default function Exploded() {
  const [depth, setDepth] = useState(65);
  const [active, setActive] = useState(0);
  return (
    <section className="exploded">
      <div className="section-eyebrow">
        <Layers3 size={16} /> BEHIND THE BUILD
      </div>
      <h3>
        Good on the surface.
        <br />
        <em>Considered all the way down.</em>
      </h3>
      <p>Pull the layers apart. Follow the thinking.</p>
      <div className="explode-layout">
        <div
          className="explode-stage"
          style={{ "--depth": depth } as React.CSSProperties}
        >
          {layers.map((layer, i) => (
            <button
              key={layer.name}
              className={`explode-layer ${active === i ? "active" : ""}`}
              style={{
                transform: `translateY(${(i - 1.5) * depth * 0.8}px) translateZ(${(3 - i) * depth * 0.6}px) rotateX(48deg) rotateZ(-24deg)`,
                zIndex: 4 - i,
              }}
              onClick={() => setActive(i)}
            >
              <span>0{i + 1}</span>
              <strong>{layer.name}</strong>
              <small>{layer.type}</small>
            </button>
          ))}
        </div>
        <div className="explode-description">
          <div
            className="layer-selector"
            aria-label="Select architecture layer"
          >
            {layers.map((layer, i) => (
              <button
                key={layer.name}
                aria-label={`Show ${layer.name.toLowerCase()}`}
                aria-pressed={active === i}
                onClick={() => setActive(i)}
              >
                0{i + 1}
              </button>
            ))}
          </div>
          <span className="mono">0{active + 1} / 04</span>
          <h4>{layers[active].name}</h4>
          <p>{layers[active].description}</p>
          <label className="range-label" htmlFor="depth">
            Assembly depth <span>{depth}%</span>
          </label>
          <input
            id="depth"
            type="range"
            min="0"
            max="100"
            value={depth}
            onChange={(e) => setDepth(+e.target.value)}
          />
          <button
            className="text-button"
            onClick={() => setDepth(depth > 0 ? 0 : 60)}
          >
            {depth > 0 ? "Assemble" : "Separate"} the layers{" "}
            <ArrowDown size={14} />
          </button>
        </div>
      </div>
      <small className="diagram-caption">
        Architecture illustration based on the Frammer project documentation.
        The query branch is a separate execution path.
      </small>
    </section>
  );
}
