import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Mode } from "../data";
import type { SceneState } from "../lib/scene";
export default function SpatialScene({
  mode,
  activity,
  model,
}: {
  mode: Mode;
  activity: number;
  model: SceneState;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pulse = useRef(activity);
  const simulation = useRef(model);
  simulation.current = model;
  useEffect(() => {
    pulse.current = activity;
  }, [activity]);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(7, 6, 9);
    camera.lookAt(0, 0, 0);
    const group = new THREE.Group();
    scene.add(group);
    scene.add(new THREE.AmbientLight(0xffffff, 2));
    const light = new THREE.DirectionalLight(0xffd0aa, 4);
    light.position.set(3, 8, 4);
    scene.add(light);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff540c,
      roughness: 0.36,
      metalness: 0.28,
    });
    const pale = new THREE.MeshStandardMaterial({
      color: 0xf5f2eb,
      roughness: 0.4,
    });
    const ghost = new THREE.LineBasicMaterial({
      color: 0x716e66,
      transparent: true,
      opacity: 0.45,
    });
    const movers: THREE.Mesh[] = [];
    const bars: THREE.Mesh[] = [];
    const links: THREE.Line[] = [];
    const waveLines: THREE.Line[] = [];
    const dots: THREE.Mesh[] = [];
    const dot = (x: number, y: number, z: number, r = 0.18, white = false) => {
      const m = new THREE.Mesh(
        new THREE.IcosahedronGeometry(r, 2),
        white ? pale : mat,
      );
      m.position.set(x, y, z);
      group.add(m);
      dots.push(m);
      return m;
    };
    const line = (a: THREE.Vector3, b: THREE.Vector3) => {
      const edge = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([a, b]),
        ghost,
      );
      group.add(edge);
      links.push(edge);
    };
    if (mode === "exchange") {
      for (let i = 0; i < 12; i++) {
        const height = 0.3 + Math.sin(i * 0.7) ** 2 * 2.5;
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(0.32, height, 0.65),
          i < 6 ? mat : pale,
        );
        m.position.set((i - 5.5) * 0.5, height / 2 - 1, 0);
        group.add(m);
        bars.push(m);
        m.geometry.dispose();
        m.geometry = new THREE.BoxGeometry(0.32, 1, 0.65);
      }
      for (let i = 0; i < 6; i++) movers.push(dot(-3 + i, 2.1, 0, 0.1));
    }
    if (mode === "database") {
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
        const n = dot(
          Math.cos(a) * 2.2,
          Math.sin(a) * 1.1,
          Math.sin(a) * 1.1,
          0.42,
        );
        n.material = (i % 2 ? mat : pale).clone();
      }
      for (let i = 0; i < 3; i++) {
        line(dots[i].position, dots[(i + 1) % 3].position);
        movers.push(dot(0, 0, 0, 0.09));
      }
    }
    if (mode === "alpha") {
      for (let j = 0; j < 3; j++) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(120 * 3), 3),
        );
        const wave = new THREE.Line(
          geo,
          new THREE.LineBasicMaterial({
            color: j === 1 ? 0xff6429 : 0xe8e5dc,
            transparent: true,
            opacity: j === 1 ? 1 : 0.5,
          }),
        );
        group.add(wave);
        waveLines.push(wave);
      }
    }
    if (mode === "transport") {
      for (let i = 0; i < 6; i++) {
        const packet = dot(i - 2.5, 0, 0, 0.24, i % 2 === 0);
        packet.material = mat.clone();
        if (i < 5)
          line(
            new THREE.Vector3(i - 2.5, 0, 0),
            new THREE.Vector3(i - 1.5, 0, 0),
          );
      }
      for (let i = 0; i < 4; i++) movers.push(dot(i - 2, 1, 0, 0.1));
    }
    const grid = new THREE.GridHelper(12, 24, 0x48443a, 0x302e28);
    grid.position.y = -1.6;
    scene.add(grid);
    let frame = 0,
      t = 0,
      last = 0;
    const mouse = { x: 0, y: 0 };
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width - 0.5;
      mouse.y = (e.clientY - r.top) / r.height - 0.5;
    };
    host.addEventListener("pointermove", move);
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (document.hidden || now - last < 32) return;
      last = now;
      t += 0.018;
      group.rotation.y +=
        (mouse.x * 0.3 + Math.sin(t * 0.2) * 0.07 - group.rotation.y) * 0.03;
      group.rotation.x += (mouse.y * 0.1 - group.rotation.x) * 0.03;
      const model = simulation.current;
      if (mode === "exchange" && model.book) {
        const sorted = [
          ...model.book
            .filter((o) => o.side === "buy")
            .sort((a, b) => b.price - a.price)
            .slice(0, 6),
          ...Array(6).fill(null),
        ]
          .slice(0, 6)
          .concat(
            [
              ...model.book
                .filter((o) => o.side === "sell")
                .sort((a, b) => a.price - b.price)
                .slice(0, 6),
              ...Array(6).fill(null),
            ].slice(0, 6),
          );
        bars.forEach((bar, i) => {
          const goal = sorted[i]
            ? Math.min(3.3, sorted[i]!.quantity * 0.25)
            : 0.04;
          bar.scale.y += (goal - bar.scale.y) * 0.13;
          bar.position.y = -1 + bar.scale.y / 2;
        });
      }
      if (mode === "database") {
        const isolated = !!model.isolated;
        const node = dots[2];
        node.position.x +=
          ((isolated
            ? 3.6
            : Math.cos((2 / 3) * Math.PI * 2 - Math.PI / 2) * 2.2) -
            node.position.x) *
          0.08;
        (node.material as THREE.MeshStandardMaterial).color.setHex(
          isolated ? 0x644a3c : 0xff6429,
        );
        links.forEach((edge, i) => {
          edge.visible = !isolated || i === 0;
        });
        movers.forEach((m, i) => {
          if (isolated && i > 0) {
            m.visible = false;
            return;
          }
          m.visible = true;
          const phase = (t * 0.6 + i * 0.3 + pulse.current * 0.12) % 1;
          m.position.lerpVectors(
            dots[i].position,
            dots[(i + 1) % 3].position,
            phase,
          );
        });
      } else if (mode === "alpha") {
        waveLines.forEach((wave, j) => {
          const data = wave.geometry.attributes.position;
          for (let i = 0; i < 120; i++) {
            const x = (i / 119 - 0.5) * 6;
            data.setXYZ(
              i,
              x,
              Math.sin((i / (model.window || 5)) * 0.5 + t + j) *
                (model.amplitude || 5) *
                0.13 +
                (j - 1) * 0.6,
              (j - 1) * 0.65,
            );
          }
          data.needsUpdate = true;
        });
      } else {
        for (let i = 0; i < movers.length; i++) {
          const m = movers[i];
          m.position.x = ((t * 0.8 + i + pulse.current * 0.2) % 6) - 3;
          m.position.y = mode === "exchange" ? 1.6 : Math.sin(t * 2 + i) * 0.3;
        }
        if (mode === "transport")
          dots.slice(0, 6).forEach((m, i) => {
            const packet = model.packets?.[i];
            const lost = packet?.state === "lost";
            (m.material as THREE.MeshStandardMaterial).color.setHex(
              lost ? 0xff3b12 : packet?.state === "acked" ? 0xb8d68a : 0xf5f2eb,
            );
            m.position.y += ((lost ? 1.4 : 0) - m.position.y) * 0.1;
            m.scale.setScalar(lost ? 1.35 : 1);
          });
      }
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      host.removeEventListener("pointermove", move);
      const materials = new Set<THREE.Material>();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Line) {
          o.geometry.dispose();
          const list = Array.isArray(o.material) ? o.material : [o.material];
          list.forEach((m) => materials.add(m));
        }
      });
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [mode]);
  return <div ref={ref} className="spatial-scene" aria-hidden="true" />;
}
