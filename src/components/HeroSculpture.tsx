import { useEffect, useRef } from "react";
import * as THREE from "three";
export default function HeroSculpture({
  mode,
  visible,
  onReady,
}: {
  mode: number;
  visible: boolean;
  onReady: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef({ mode, visible });
  state.current = { mode, visible };
  const ready = useRef(onReady);
  ready.current = onReady;
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    renderer.setClearColor(0, 0);
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 7.5);
    const group = new THREE.Group();
    scene.add(group);
    const uniforms = {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uForce: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
    };
    const vertex = `uniform float uTime;uniform float uMorph;uniform float uForce;uniform vec2 uPointer;varying vec3 vNormal;varying vec3 vView;varying vec3 vPosition;void main(){vec3 p=position;float a=uTime*.7;float m1=clamp(uMorph,0.,1.);float m2=clamp(uMorph-1.,0.,1.);vec3 sphere=normalize(p)*1.3;vec3 bloom=normalize(p)*(1.1+.3*sin(p.x*5.+a)*cos(p.y*5.-a));p=mix(p,sphere,m1);p=mix(p,bloom,m2);float wobble=sin(p.y*2.5+uTime)*cos(p.x*2.5-uTime)*(.06+uForce*.25);p+=normal*wobble;p.x+=sin(p.y*2.+uTime)*uForce*.3;p.xy+=uPointer*.05;vec4 mv=modelViewMatrix*vec4(p,1.);vNormal=normalize(normalMatrix*normal);vView=-mv.xyz;vPosition=p;gl_Position=projectionMatrix*mv;}`;
    const fragment = `varying vec3 vNormal;varying vec3 vView;varying vec3 vPosition;uniform float uTime;uniform float uForce;void main(){vec3 n=normalize(vNormal);vec3 eye=normalize(vView);vec3 r=reflect(-eye,n);float fres=pow(1.-abs(dot(n,eye)),2.);float band=pow(abs(sin(r.y*3.6+r.x*2.+.5)),6.);float highlight=pow(max(0.,dot(n,normalize(vec3(-1.,2.,3.)))),12.);vec3 chrome=mix(vec3(.035,.04,.045),vec3(.95,.94,.9),smoothstep(-.4,.65,r.y));chrome=mix(chrome,vec3(1.),band*.8);float orange=smoothstep(.05,.15,sin(vPosition.y*2.5+vPosition.x*1.3));vec3 ink=mix(vec3(.75,.08,.005),vec3(1.,.3,.025),.5+dot(n,normalize(vec3(1.,2.,3.)))*.5);vec3 color=mix(chrome,ink,orange*.92);color+=highlight*.7+fres*.2;gl_FragColor=vec4(color,1.);}`;
    const geometry = new THREE.TorusKnotGeometry(1, 0.37, 280, 40, 2, 3);
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms,
    });
    const sculpture = new THREE.Mesh(geometry, material);
    group.add(sculpture);
    sculpture.rotation.set(0.6, -0.3, 0.15);
    const pointCount = 110;
    const pgeo = new THREE.BufferGeometry();
    const positions = new Float32Array(pointCount * 3);
    const homes = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount; i++) {
      const a = (i / pointCount) * Math.PI * 2;
      homes[i * 3] = Math.cos(a) * (1.9 + Math.sin(i * 13) * 0.25);
      homes[i * 3 + 1] = Math.sin(a) * (1.9 + Math.cos(i * 7) * 0.25);
      homes[i * 3 + 2] = Math.sin(i * 3) * 0.5;
    }
    positions.set(homes);
    pgeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pmat = new THREE.PointsMaterial({
      color: 0xff5b16,
      size: 0.025,
      transparent: true,
      opacity: 0.7,
    });
    const points = new THREE.Points(pgeo, pmat);
    group.add(points);
    let down = false,
      rx = 0.35,
      ry = -0.3,
      tx = 0.35,
      ty = -0.3,
      force = 0,
      targetMorph = 0,
      frame = 0,
      last = 0,
      t = 0;
    const pointer = { x: 0, y: 0, lx: 0, ly: 0 };
    const move = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = (-(e.clientY - rect.top) / rect.height) * 2 + 1;
      if (down) {
        ty += (e.clientX - pointer.lx) * 0.014;
        tx += (e.clientY - pointer.ly) * 0.014;
        force = Math.min(2, force + Math.abs(e.clientX - pointer.lx) * 0.015);
      }
      pointer.lx = e.clientX;
      pointer.ly = e.clientY;
    };
    const press = (e: PointerEvent) => {
      down = true;
      pointer.lx = e.clientX;
      pointer.ly = e.clientY;
      force = 1.5;
      el.setPointerCapture(e.pointerId);
    };
    const release = () => {
      down = false;
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerdown", press);
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
    const resize = () => {
      const r = el.getBoundingClientRect();
      renderer.setSize(r.width, r.height);
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    let announced = false;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!state.current.visible || document.hidden || now - last < 22) return;
      const dt = Math.min((now - last) / 1000, 0.04) || 0.016;
      last = now;
      t += dt;
      targetMorph = state.current.mode;
      uniforms.uMorph.value += (targetMorph - uniforms.uMorph.value) * 0.055;
      uniforms.uTime.value = t;
      force *= 0.955;
      uniforms.uForce.value = force;
      uniforms.uPointer.value.set(pointer.x, pointer.y);
      if (!down) ty += dt * 0.32;
      rx += (tx - rx) * 0.12;
      ry += (ty - ry) * 0.12;
      sculpture.rotation.x = rx + Math.sin(t * 0.4) * 0.12;
      sculpture.rotation.y = ry;
      sculpture.position.y = Math.sin(t * 0.8) * 0.09;
      group.rotation.z = pointer.x * 0.04;
      points.rotation.z = -t * 0.08;
      for (let i = 0; i < pointCount; i++) {
        const spread = 1 + force * 0.4;
        positions[i * 3] = homes[i * 3] * spread;
        positions[i * 3 + 1] = homes[i * 3 + 1] * spread;
        positions[i * 3 + 2] = homes[i * 3 + 2] + Math.sin(t + i) * 0.15;
      }
      pgeo.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      if (!announced) {
        announced = true;
        ready.current();
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", press);
      el.removeEventListener("pointerup", release);
      el.removeEventListener("pointercancel", release);
      geometry.dispose();
      material.dispose();
      pgeo.dispose();
      pmat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);
  return <div ref={host} className="hero-webgl" aria-hidden="true" />;
}
