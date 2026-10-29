import { useEffect, useRef, useState } from "react";
import {
  Radio,
  Volume2,
  VolumeX,
  Pause,
  Play,
  MoveUpRight,
} from "lucide-react";
import { useReducedMotion, useVisible } from "../lib/hooks";
type Mode = "orbit" | "flow" | "pulse";
type Synth = {
  context: AudioContext;
  gain: GainNode;
  filter: BiquadFilterNode;
  carrier: OscillatorNode;
  overtone: OscillatorNode;
};
export default function FrequencyLab() {
  const [frequency, setFrequency] = useState(180);
  const [resonance, setResonance] = useState(0.55);
  const [mode, setMode] = useState<Mode>("orbit");
  const [playing, setPlaying] = useState(true);
  const [sound, setSound] = useState(false);
  const [audioError, setAudioError] = useState("");
  const { ref, visible } = useVisible<HTMLDivElement>("0px", 0.2);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const config = useRef({
    frequency,
    resonance,
    mode,
    playing,
    visible,
    reduced,
  });
  config.current = { frequency, resonance, mode, playing, visible, reduced };
  const pointer = useRef({ x: 0.5, y: 0.5, down: false, inside: false });
  const impulse = useRef(0);
  const synth = useRef<Synth | null>(null);
  const audible = useRef(false);
  const suspendTimer = useRef<number | undefined>(undefined);
  const mute = () => {
    audible.current = false;
    setSound(false);
    const audio = synth.current;
    if (!audio) return;
    audio.gain.gain.cancelScheduledValues(audio.context.currentTime);
    audio.gain.gain.setTargetAtTime(0, audio.context.currentTime, 0.035);
    window.clearTimeout(suspendTimer.current);
    suspendTimer.current = window.setTimeout(() => {
      if (!audible.current) void audio.context.suspend().catch(() => {});
    }, 200);
  };
  const toggleSound = async () => {
    if (audible.current) {
      mute();
      return;
    }
    try {
      window.clearTimeout(suspendTimer.current);
      if (!synth.current) {
        const context = new AudioContext();
        const carrier = context.createOscillator();
        const overtone = context.createOscillator();
        const overtoneGain = context.createGain();
        overtoneGain.gain.value = 0.18;
        const filter = context.createBiquadFilter();
        filter.type = "lowpass";
        const gain = context.createGain();
        gain.gain.value = 0;
        carrier.connect(filter);
        overtone.connect(overtoneGain);
        overtoneGain.connect(filter);
        filter.connect(gain);
        gain.connect(context.destination);
        carrier.start();
        overtone.start();
        synth.current = { context, carrier, overtone, filter, gain };
      }
      const audio = synth.current;
      await audio.context.resume();
      // Resume can resolve after a fast scroll or tab switch.
      if (!config.current.visible || document.hidden) {
        await audio.context.suspend();
        return;
      }
      const current = config.current;
      audio.carrier.frequency.setTargetAtTime(
        current.frequency,
        audio.context.currentTime,
        0.03,
      );
      audio.overtone.frequency.setTargetAtTime(
        current.frequency *
          (current.mode === "orbit" ? 1.5 : current.mode === "flow" ? 2 : 3),
        audio.context.currentTime,
        0.03,
      );
      audio.filter.frequency.setTargetAtTime(
        450 + current.resonance * 2400,
        audio.context.currentTime,
        0.03,
      );
      audio.gain.gain.setTargetAtTime(0.025, audio.context.currentTime, 0.05);
      audible.current = true;
      setSound(true);
      setAudioError("");
      impulse.current = 1;
    } catch {
      setAudioError(
        "Sound is unavailable in this browser. Keep exploring the visual.",
      );
    }
  };
  useEffect(() => {
    const audio = synth.current;
    if (!audio) return;
    const now = audio.context.currentTime;
    audio.carrier.type = mode === "pulse" ? "triangle" : "sine";
    audio.carrier.frequency.setTargetAtTime(frequency, now, 0.045);
    audio.overtone.frequency.setTargetAtTime(
      frequency * (mode === "orbit" ? 1.5 : mode === "flow" ? 2 : 3),
      now,
      0.045,
    );
    audio.filter.frequency.setTargetAtTime(450 + resonance * 2400, now, 0.05);
    audio.filter.Q.setTargetAtTime(0.5 + resonance * 4, now, 0.05);
  }, [frequency, resonance, mode]);
  useEffect(() => {
    if (!visible) mute();
  }, [visible]);
  useEffect(() => {
    const hide = () => {
      if (document.hidden) mute();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      window.clearTimeout(suspendTimer.current);
      const audio = synth.current;
      if (audio) {
        audio.carrier.stop();
        audio.overtone.stop();
        void audio.context.close().catch(() => {});
        synth.current = null;
      }
    };
  }, []);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    let w = 0,
      h = 0,
      t = 0,
      last = 0,
      frame = 0,
      f = 180,
      r = 0.55,
      morph = 0;
    const resize = () => {
      const rect = el.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      const d = Math.min(devicePixelRatio, 1.5);
      el.width = w * d;
      el.height = h * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      const current = config.current;
      if (!current.visible || document.hidden || now - last < 28) return;
      const dt = Math.min((now - last) / 1000, 0.05) || 0.03;
      last = now;
      if (current.playing && !current.reduced) t += dt;
      if (current.playing && !current.reduced) {
        f += (current.frequency - f) * 0.12;
        r += (current.resonance - r) * 0.1;
      } else {
        f = current.frequency;
        r = current.resonance;
      }
      const target =
        current.mode === "orbit" ? 0 : current.mode === "flow" ? 1 : 2;
      if (current.playing && !current.reduced) {
        morph += (target - morph) * 0.1;
        impulse.current *= 0.94;
      } else {
        morph = target;
        impulse.current = 0;
      }
      const p = pointer.current;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#161b18";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#64705e24";
      ctx.lineWidth = 0.6;
      for (let x = 0; x < w; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      const cx = w * 0.5,
        cy = h * 0.48,
        scale = Math.min(w * 0.32, h * 0.36);
      ctx.strokeStyle = "#9ba68b20";
      for (const radius of [0.5, 1, 1.55]) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, scale * radius, scale * radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      const orbit = (u: number, j: number) => {
        const a = u * Math.PI * 2;
        const waves = f / 60;
        const radius =
          1 +
          0.23 * Math.sin(a * 3 + t * 0.9 + j * 0.13) * (r + 0.3) +
          impulse.current * 0.13 * Math.sin(a * 9 + t * 2);
        return {
          x: (Math.cos(a) * radius + 0.22 * Math.sin(a * waves + t)) * 1.04,
          y:
            Math.sin(a) * radius * 0.8 +
            0.2 * Math.cos(a * (waves - 1) - t + j * 0.12),
        };
      };
      const flow = (u: number, j: number) => {
        const x = (u * 2 - 1) * 1.5;
        const envelope = Math.pow(Math.max(0, 1 - Math.abs(x) / 1.6), 0.5);
        return {
          x,
          y:
            Math.sin((u * f) / 13 + t * 2 + j * 0.08) * (r + 0.25) * envelope +
            (j - 6) * 0.07,
        };
      };
      const pulse = (u: number, j: number) => {
        const a = u * Math.PI * 2;
        const radius =
          0.9 +
          0.28 * Math.sin(a * Math.round(f / 60) + t * 2) * (r + 0.3) +
          0.05 * j +
          impulse.current * 0.2;
        return { x: Math.cos(a) * radius, y: Math.sin(a) * radius * 0.73 };
      };
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(
        Math.sin(t * 0.22) * 0.13 + (p.inside ? (p.x - 0.5) * 0.18 : 0),
      );
      for (let j = 0; j < 13; j++) {
        const mid = j === 6;
        ctx.beginPath();
        for (let i = 0; i <= 380; i++) {
          const u = i / 380;
          const a = orbit(u, j),
            b = flow(u, j),
            c = pulse(u, j);
          const k = Math.min(1, morph),
            k2 = Math.max(0, morph - 1);
          let x = a.x + (b.x - a.x) * k,
            y = a.y + (b.y - a.y) * k;
          x += (c.x - x) * k2;
          y += (c.y - y) * k2;
          const depth = (j - 6) * 0.015;
          const px = x * scale * (1 + depth),
            py = y * scale * (1 + depth);
          if (!i) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = mid
          ? "#ffe6bd"
          : j % 3 === 0
            ? "#f5f2eb88"
            : `rgba(255,103,37,${0.16 + j * 0.035})`;
        ctx.lineWidth = mid ? 1.35 : 0.65;
        ctx.shadowColor = "#ff6b28";
        ctx.shadowBlur = mid ? 13 : 0;
        ctx.stroke();
      }
      ctx.restore();
      ctx.shadowBlur = 0;
      const markX = p.inside ? p.x * w : cx,
        markY = p.inside ? p.y * h : cy;
      ctx.strokeStyle = p.down ? "#f5f2ebaa" : "#ced5be40";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(markX - 7, markY);
      ctx.lineTo(markX + 7, markY);
      ctx.moveTo(markX, markY - 7);
      ctx.lineTo(markX, markY + 7);
      ctx.stroke();
      ctx.font = "8px monospace";
      ctx.fillStyle = "#b0bba3";
      ctx.fillText(`ƒ ${f.toFixed(1)} Hz`, 14, h - 14);
      ctx.textAlign = "right";
      ctx.fillText(
        `${current.mode.toUpperCase()} / ${Math.round(r * 100)}%`,
        w - 14,
        h - 14,
      );
      ctx.textAlign = "left";
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, []);
  const tune = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    pointer.current.x = x;
    pointer.current.y = y;
    pointer.current.inside = true;
    if (pointer.current.down) {
      setFrequency(Math.round(60 + x * 420));
      setResonance(Math.round((0.95 - y * 0.85) * 100) / 100);
    }
  };
  return (
    <div
      ref={ref}
      className={`signal-experiment frequency-lab ${sound ? "is-listening" : ""}`}
    >
      <div className="play-card-header">
        <span className="mono">03 / FIND YOUR FREQUENCY</span>
        <Radio size={19} />
      </div>
      <div className="frequency-console">
        <div className="frequency-top">
          <div className="frequency-display">
            <span>{frequency}</span>
            <small>
              Hz
              <br />
              <b>PURE POSSIBILITY.</b>
            </small>
          </div>
          <button
            className="frequency-freeze"
            aria-pressed={!playing}
            onClick={() => setPlaying(!playing)}
            aria-label={
              playing ? "Freeze frequency visual" : "Resume frequency visual"
            }
          >
            {playing ? <Pause size={13} /> : <Play size={13} />}
            <span>{playing ? "LIVE" : "FROZEN"}</span>
            <i />
          </button>
        </div>
        <div className="frequency-field">
          <canvas
            ref={canvas}
            className="frequency-canvas"
            role="img"
            aria-label={`Interactive ${mode} harmonic field at ${frequency} hertz. Drag horizontally to tune frequency and vertically to change resonance.`}
            onPointerDown={(e) => {
              pointer.current.down = true;
              tune(e);
              impulse.current = 1;
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={tune}
            onPointerUp={() => {
              pointer.current.down = false;
            }}
            onPointerCancel={() => {
              pointer.current.down = false;
              pointer.current.inside = false;
            }}
            onPointerLeave={() => {
              if (!pointer.current.down) pointer.current.inside = false;
            }}
          />
          <span className="frequency-gesture">
            <MoveUpRight size={10} /> DRAG THE FIELD. CHANGE THE FEELING.
          </span>
        </div>
        <div className="frequency-modes" aria-label="Harmonic visual mode">
          {(["orbit", "flow", "pulse"] as const).map((value, i) => (
            <button
              key={value}
              aria-pressed={mode === value}
              onClick={() => {
                setMode(value);
                impulse.current = 0.7;
              }}
            >
              <span>0{i + 1}</span>
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="frequency-controls">
        <div>
          <label htmlFor="frequency" className="range-label">
            Frequency <span>{frequency} Hz</span>
          </label>
          <input
            id="frequency"
            type="range"
            min="60"
            max="480"
            step="1"
            value={frequency}
            onChange={(e) => setFrequency(+e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="resonance" className="range-label">
            Resonance <span>{Math.round(resonance * 100)}%</span>
          </label>
          <input
            id="resonance"
            type="range"
            min=".1"
            max=".95"
            step=".01"
            value={resonance}
            onChange={(e) => setResonance(+e.target.value)}
          />
        </div>
      </div>
      <div className="frequency-bottom">
        <p>
          A little science.
          <br />
          <span>A lot of feeling.</span>
        </p>
        <button
          className={`frequency-listen ${sound ? "active" : ""}`}
          aria-pressed={sound}
          aria-label={
            sound ? "Mute frequency sound" : "Listen to frequency sound"
          }
          onClick={() => void toggleSound()}
        >
          {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span>
            {sound ? "SOUND ON" : "LISTEN"}
            <small>{sound ? "CLICK TO MUTE" : "SOUND IS OPTIONAL"}</small>
          </span>
        </button>
      </div>
      {audioError && (
        <p className="frequency-error" role="status">
          {audioError}
        </p>
      )}
    </div>
  );
}
