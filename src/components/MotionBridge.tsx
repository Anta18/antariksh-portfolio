import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/hooks";
gsap.registerPlugin(ScrollTrigger);
export default function MotionBridge() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    if (reduced || !ref.current) return;
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "+=160%",
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
        },
      });
      timeline
        .fromTo(
          ".bridge-first",
          { xPercent: -35, rotation: -8, opacity: 0.25 },
          { xPercent: 0, rotation: 0, opacity: 1, duration: 1 },
          0,
        )
        .fromTo(
          ".bridge-second",
          { xPercent: 35, rotation: 8, opacity: 0.25 },
          { xPercent: 0, rotation: 0, opacity: 1, duration: 1 },
          0,
        )
        .fromTo(
          ".bridge-asterisk",
          { rotation: -120, scale: 0.1 },
          { rotation: 90, scale: 1, duration: 1.4 },
          0,
        )
        .to(
          ".bridge-first",
          {
            xPercent: reduced ? 0 : -75,
            rotation: -8,
            opacity: 0,
            duration: 1,
          },
          1.6,
        )
        .to(
          ".bridge-second",
          { xPercent: 75, rotation: 8, opacity: 0, duration: 1 },
          1.6,
        )
        .to(
          ".bridge-asterisk",
          { rotation: 240, scale: 11, duration: 1.4 },
          1.55,
        )
        .fromTo(
          ".bridge-final",
          { opacity: 0, scale: 0.65, rotation: -4 },
          { opacity: 1, scale: 1, rotation: 0, duration: 0.8 },
          2.25,
        )
        .to(".bridge-final", { scale: 1.08, duration: 0.8 }, 3);
    }, ref);
    return () => ctx.revert();
  }, [reduced]);
  return (
    <section
      ref={ref}
      className={`motion-bridge ${reduced ? "motion-static" : ""}`}
      aria-label="Creative direction meets serious engineering"
    >
      <div className="bridge-meta mono">
        <span>THE SPACE BETWEEN DESIGN & ENGINEERING</span>
        <span>KEEP GOING ↓</span>
      </div>
      <div className="bridge-lines" aria-hidden="true">
        <span className="bridge-first">A LITTLE</span>
        <span className="bridge-second">UNREASONABLE.</span>
      </div>
      <div className="bridge-asterisk" aria-hidden="true">
        ✳
      </div>
      <div className="bridge-final">
        <span className="mono">GOOD. THAT’S WHERE THE GOOD STUFF IS.</span>
        <h2>
          FEEL
          <br />
          SOMETHING<span>✳</span>
        </h2>
        <p>
          Distinctive on the surface.
          <br />
          Relentless underneath.
        </p>
      </div>
      <span className="bridge-foot mono">
        SCROLL TO TRANSFORM / EXPLORE TO DISCOVER
      </span>
    </section>
  );
}
