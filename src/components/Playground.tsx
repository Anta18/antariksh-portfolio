import { ArrowUpRight } from "lucide-react";
import PhysicsPlayground from "./PhysicsPlayground";
import ParticleType from "./ParticleType";
import FrequencyLab from "./FrequencyLab";
export default function Playground() {
  return (
    <section id="playground" className="playground-section">
      <div className="section-topline">
        <span className="section-eyebrow">04 / NO BRIEF. JUST CURIOSITY.</span>
        <span className="mono">THIS PART IS FOR YOUR INNER CHILD.</span>
      </div>
      <div className="section-heading">
        <h2>
          LESS SCROLL.
          <br />
          <span className="outline-text">MORE “WOAH.”</span>
        </h2>
        <p>
          Built to be touched.
          <br />
          Slightly difficult to leave alone.
          <br />
          <span>Consider this your permission to play.</span>
        </p>
      </div>
      <PhysicsPlayground />
      <div className="mini-experiments">
        <ParticleType />
        <FrequencyLab />
      </div>
      <a className="playground-outro" href="#contact">
        <span>Imagine what we could build for your brand.</span>
        <ArrowUpRight size={23} />
      </a>
    </section>
  );
}
