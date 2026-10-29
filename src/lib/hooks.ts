import { useEffect, useState, useRef } from "react";
function motionPreference() {
  try {
    const saved = localStorage.getItem("ad-motion-v2");
    if (saved) return saved === "reduced";
  } catch {}
  return false;
}
export function setMotionPreference(reduced: boolean) {
  try {
    localStorage.setItem("ad-motion-v2", reduced ? "reduced" : "full");
  } catch {}
  document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  window.dispatchEvent(new Event("ad-motion-change"));
}
export function useReducedMotion() {
  const [reduced, set] = useState(motionPreference);
  useEffect(() => {
    const fn = () => {
      const next = motionPreference();
      document.documentElement.dataset.motion = next ? "reduced" : "full";
      set(next);
    };
    fn();
    window.addEventListener("ad-motion-change", fn);
    return () => {
      window.removeEventListener("ad-motion-change", fn);
    };
  }, []);
  return reduced;
}
export function useVisible<T extends Element>(margin = "200px", threshold = 0) {
  const ref = useRef<T>(null);
  const [visible, set] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const o = new IntersectionObserver(
      ([e]) => set(e.isIntersecting && e.intersectionRatio >= threshold),
      {
        rootMargin: margin,
        threshold,
      },
    );
    o.observe(ref.current);
    return () => o.disconnect();
  }, [margin, threshold]);
  return { ref, visible };
}
