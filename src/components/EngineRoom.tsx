import { lazy, Suspense, useState, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  RotateCcw,
  Activity,
  Network,
  Radio,
  BarChart3,
} from "lucide-react";
import { engineering, type Mode } from "../data";
import {
  matchOrder,
  editPeer,
  synchronize,
  transmit,
  deliveredInOrder,
  createSignal,
  type Order,
  type Peer,
  type Packet,
} from "../lib/models";
import { useReducedMotion, useVisible } from "../lib/hooks";
import type { SceneState } from "../lib/scene";
const SpatialScene = lazy(() => import("./SpatialScene"));
export function Plot({
  values,
  color = "#ff5a1f",
  label,
  height = 100,
}: {
  values: number[];
  color?: string;
  label: string;
  height?: number;
}) {
  const min = Math.min(...values),
    max = Math.max(...values);
  const points = values
    .map(
      (v, i) =>
        `${(i / (values.length - 1)) * 600},${height - 8 - ((v - min) / (max - min || 1)) * (height - 16)}`,
    )
    .join(" ");
  return (
    <svg
      viewBox={`0 0 600 ${height}`}
      role="img"
      aria-label={label}
      className="plot"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id={`fill-${label.replace(/\W/g, "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity=".15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((y) => (
        <line
          key={y}
          x1="0"
          x2="600"
          y1={height * y}
          y2={height * y}
          stroke="currentColor"
          opacity=".1"
        />
      ))}
      <polygon
        points={`0,${height} ${points} 600,${height}`}
        fill={`url(#fill-${label.replace(/\W/g, "")})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
function Exchange({
  notify,
  update,
}: {
  notify: () => void;
  update: (state: SceneState) => void;
}) {
  const initial: Order[] = [
    { id: 1, side: "sell", price: 102, quantity: 8 },
    { id: 2, side: "sell", price: 101, quantity: 5 },
    { id: 3, side: "buy", price: 99, quantity: 6 },
    { id: 4, side: "buy", price: 98, quantity: 9 },
  ];
  const [book, setBook] = useState(initial);
  useEffect(() => update({ book }), [book, update]);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState(101);
  const [quantity, setQuantity] = useState(3);
  const [message, setMessage] = useState(
    "Place an order. Watch the engine match.",
  );
  const [id, setId] = useState(5);
  const place = () => {
    const r = matchOrder(book, { id, side, price, quantity });
    setId(id + 1);
    setBook(r.book);
    setMessage(
      r.trades.length
        ? `${r.trades.reduce((n, t) => n + t.quantity, 0)} units matched across ${r.trades.length} resting order(s).`
        : "Order resting in the book. Waiting for a match.",
    );
    notify();
  };
  return (
    <div className="experiment-controls">
      <div className="order-book">
        {(["sell", "buy"] as const).map((s) => (
          <div key={s}>
            <span className="mono">{s === "sell" ? "ASKS" : "BIDS"}</span>
            {book
              .filter((o) => o.side === s)
              .sort((a, b) =>
                s === "sell" ? a.price - b.price : b.price - a.price,
              )
              .slice(0, 4)
              .map((o) => (
                <div className={`book-row ${s}`} key={o.id}>
                  <span>${o.price.toFixed(2)}</span>
                  <span>{o.quantity} units</span>
                </div>
              ))}
          </div>
        ))}
      </div>
      <div className="order-inputs">
        <label>
          Side
          <select
            value={side}
            onChange={(e) => setSide(e.target.value as "buy" | "sell")}
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </label>
        <label>
          Limit price
          <input
            type="number"
            min="1"
            max="999"
            value={price}
            onChange={(e) =>
              setPrice(Math.max(1, Math.min(999, +e.target.value)))
            }
          />
        </label>
        <label>
          Quantity
          <input
            type="number"
            min="1"
            max="99"
            value={quantity}
            onChange={(e) =>
              setQuantity(
                Math.max(1, Math.min(99, Math.floor(+e.target.value))),
              )
            }
          />
        </label>
      </div>
      <button className="pill-button accent-button" onClick={place}>
        Place order <ArrowRight size={15} />
      </button>
      <p className="experiment-status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
function Alpha({ update }: { update: (state: SceneState) => void }) {
  const [amplitude, setAmplitude] = useState(5);
  const [window, setWindow] = useState(5);
  useEffect(() => update({ amplitude, window }), [amplitude, window, update]);
  const data = createSignal(amplitude, window);
  return (
    <div className="experiment-controls alpha-controls">
      {(["signal", "equity", "drawdown"] as const).map((k, i) => (
        <div className="plot-row" key={k}>
          <span className="mono">{k.toUpperCase()}</span>
          <Plot
            values={data.map((d) => d[k])}
            color={i === 1 ? "#e3e9c8" : i === 2 ? "#e3a2b2" : "#ff5a1f"}
            label={`Synthetic ${k}`}
          />
        </div>
      ))}
      <label className="range-label" htmlFor="amplitude">
        Signal amplitude <span>{amplitude}</span>
      </label>
      <input
        id="amplitude"
        type="range"
        min="1"
        max="10"
        value={amplitude}
        onChange={(e) => setAmplitude(+e.target.value)}
      />
      <label className="range-label" htmlFor="window">
        Signal window <span>{window}</span>
      </label>
      <input
        id="window"
        type="range"
        min="2"
        max="12"
        value={window}
        onChange={(e) => setWindow(+e.target.value)}
      />
      <small className="diagram-caption">
        Synthetic data. An interaction study, not original research results.
      </small>
    </div>
  );
}
function Database({
  notify,
  update,
}: {
  notify: () => void;
  update: (state: SceneState) => void;
}) {
  const initial: Peer[] = ["A", "B", "C"].map((id) => ({
    id,
    online: true,
    value: "Hello",
    clock: 0,
    author: "A",
  }));
  const [peers, setPeers] = useState(initial);
  const [updates, setUpdates] = useState(0);
  const disconnected = peers.some((p) => !p.online);
  useEffect(() => update({ isolated: disconnected }), [disconnected, update]);
  return (
    <div className="experiment-controls">
      <div className="peers">
        {peers.map((p) => (
          <div className={`peer ${p.online ? "" : "offline"}`} key={p.id}>
            <span className="peer-name">
              {p.id}
              <i />
            </span>
            <strong>{p.value}</strong>
            <small>
              v{p.clock} · {p.online ? "connected" : "isolated"}
            </small>
          </div>
        ))}
      </div>
      <p className="experiment-status" aria-live="polite">
        {new Set(peers.map((p) => p.value)).size === 1
          ? "All peers agree. State is synchronized."
          : "A peer is isolated. Reconnect to converge."}
      </p>
      <div className="control-actions">
        <button
          className="pill-button outline-button"
          onClick={() => {
            setPeers(
              synchronize(
                peers.map((p) =>
                  p.id === "C" ? { ...p, online: !p.online } : p,
                ),
              ),
            );
            notify();
          }}
        >
          {disconnected ? "Reconnect C" : "Disconnect C"} <Network size={15} />
        </button>
        <button
          className="pill-button accent-button"
          onClick={() => {
            setUpdates(updates + 1);
            setPeers(editPeer(peers, "A", `Edit ${updates + 1}`));
            notify();
          }}
        >
          Write to A <ArrowRight size={15} />
        </button>
      </div>
      <small className="diagram-caption">
        A simplified versioned-register illustration of partition and recovery.
      </small>
    </div>
  );
}
function Transport({
  notify,
  update,
}: {
  notify: () => void;
  update: (state: SceneState) => void;
}) {
  const initial: Packet[] = Array.from({ length: 6 }, (_, i) => ({
    seq: i + 1,
    state: "queued",
    attempts: 0,
  }));
  const [packets, setPackets] = useState(initial);
  useEffect(() => update({ packets }), [packets, update]);
  const [drop, setDrop] = useState(3);
  const [started, setStarted] = useState(false);
  const delivered = deliveredInOrder(packets);
  const missing = packets.some((p) => p.state === "lost");
  return (
    <div className="experiment-controls">
      <div className="packets">
        {packets.map((p) => (
          <div key={p.seq} className={`packet ${p.state}`}>
            <strong>0{p.seq}</strong>
            <span>{p.state}</span>
            <small>
              {p.attempts} attempt{p.attempts !== 1 ? "s" : ""}
            </small>
          </div>
        ))}
      </div>
      <label className="range-label" htmlFor="drop">
        Drop packet <span>0{drop}</span>
      </label>
      <input
        id="drop"
        type="range"
        min="1"
        max="6"
        value={drop}
        disabled={started}
        onChange={(e) => setDrop(+e.target.value)}
      />
      <div className="control-actions">
        <button
          className="pill-button accent-button"
          disabled={started && !missing}
          onClick={() => {
            setPackets(transmit(packets, started ? null : drop));
            setStarted(true);
            notify();
          }}
        >
          {started ? "Retransmit lost packet" : "Send with packet loss"}{" "}
          <Radio size={15} />
        </button>
        <button
          className="icon-button"
          aria-label="Reset transport simulation"
          onClick={() => {
            setPackets(initial);
            setStarted(false);
          }}
        >
          <RotateCcw size={17} />
        </button>
      </div>
      <p className="experiment-status" aria-live="polite">
        Delivered in order:{" "}
        {delivered.length ? delivered.join(" → ") : "waiting"}
        {missing
          ? " · Acknowledged later packets wait for the missing packet."
          : ""}
      </p>
    </div>
  );
}
export default function EngineRoom() {
  const [mode, setMode] = useState<Mode>("exchange");
  const [activity, setActivity] = useState(0);
  const [sceneState, setSceneState] = useState<SceneState>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const { ref, visible } = useVisible<HTMLDivElement>();
  const reduced = useReducedMotion();
  const current = engineering.find((p) => p.id === mode)!;
  const icons = [Activity, BarChart3, Network, Radio];
  return (
    <section id="engineering" className="engine-section">
      <div className="section-topline">
        <span className="section-eyebrow">03 / THE ENGINE ROOM</span>
        <span className="mono">BEAUTY IS MORE THAN SKIN DEEP.</span>
      </div>
      <div className="engine-heading">
        <h2>
          SERIOUS
          <br />
          UNDER THE <span>HOOD.</span>
        </h2>
        <p>
          I care about how it feels.
          <br />
          And everything it takes to make it work.
          <br />
          <span>Pull a few levers. See for yourself.</span>
        </p>
      </div>
      <div className="engine-panel">
        <div
          className="engine-tabs"
          role="tablist"
          aria-label="Engineering exhibits"
        >
          {engineering.map((p, i) => {
            const Icon = icons[i];
            return (
              <button
                role="tab"
                key={p.id}
                aria-selected={mode === p.id}
                aria-controls="engine-exhibit"
                id={`tab-${p.id}`}
                onClick={() => setMode(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    const next = (i + (e.key === "ArrowRight" ? 1 : 3)) % 4;
                    setMode(engineering[next].id);
                    document
                      .getElementById(`tab-${engineering[next].id}`)
                      ?.focus();
                  }
                }}
                tabIndex={mode === p.id ? 0 : -1}
              >
                <span className="mono">0{i + 1}</span>
                <Icon size={18} />
                {p.short}
              </button>
            );
          })}
        </div>
        <div
          className="engine-exhibit"
          id="engine-exhibit"
          role="tabpanel"
          aria-labelledby={`tab-${mode}`}
        >
          <div className="scene-area" ref={ref}>
            <div className="scene-fallback" aria-hidden="true">
              <svg viewBox="0 0 400 280">
                <ellipse cx="200" cy="160" rx="140" ry="65" />
                <ellipse
                  cx="200"
                  cy="160"
                  rx="80"
                  ry="100"
                  transform="rotate(40 200 160)"
                />
                <path d="M60 160 200 60 340 160 200 245Z" />
                {[
                  [60, 160],
                  [200, 60],
                  [340, 160],
                  [200, 245],
                  [200, 160],
                ].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={i === 4 ? 18 : 10} />
                ))}
              </svg>
            </div>
            {visible && !reduced && (
              <Suspense fallback={null}>
                <SpatialScene
                  mode={mode}
                  activity={activity}
                  model={sceneState}
                />
              </Suspense>
            )}
            <div className="scene-label">
              <span className="status-dot" /> LOCAL SIMULATION{" "}
              <span>LIVE / {mode.toUpperCase()}</span>
            </div>
          </div>
          <div className="engine-control-panel">
            <span className="section-eyebrow">{current.field}</span>
            <h3>{current.short}.</h3>
            <div key={mode}>
              {mode === "exchange" ? (
                <Exchange
                  update={setSceneState}
                  notify={() => setActivity((a) => a + 1)}
                />
              ) : mode === "alpha" ? (
                <Alpha update={setSceneState} />
              ) : mode === "database" ? (
                <Database
                  update={setSceneState}
                  notify={() => setActivity((a) => a + 1)}
                />
              ) : (
                <Transport
                  update={setSceneState}
                  notify={() => setActivity((a) => a + 1)}
                />
              )}
            </div>
          </div>
        </div>
        <div className="engine-footnote">
          <span>
            <i /> INTERACTIVE ILLUSTRATIONS · SAMPLE DATA
          </span>
          <span>THE ORIGINAL PROJECTS GO MUCH DEEPER ↓</span>
        </div>
      </div>
      <div className="engineering-list">
        {engineering.map((p) => (
          <article key={p.id} className={expanded === p.id ? "expanded" : ""}>
            <button
              className="engineering-row"
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              aria-expanded={expanded === p.id}
              aria-controls={`engineering-${p.id}`}
            >
              <span className="mono">{p.number}</span>
              <h3>{p.title}</h3>
              <span className="mono engineering-field">{p.field}</span>
              <span className="expand-mark">
                {expanded === p.id ? "−" : "+"}
              </span>
            </button>
            <div
              id={`engineering-${p.id}`}
              hidden={expanded !== p.id}
              className="engineering-detail"
            >
              <p>{p.description}</p>
              <small>{p.details}</small>
              {"url" in p && (
                <a
                  className="text-button"
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Explore the source <ArrowUpRight size={16} />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
