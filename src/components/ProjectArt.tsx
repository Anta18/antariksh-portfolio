import {
  ArrowUpRight,
  Layers3,
  ShoppingBag,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { Project } from "../data";
export default function ProjectArt({
  project,
  large = false,
  compact = false,
}: {
  project: Project;
  large?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      data-flip-id={project.id}
      className={`project-art art-${project.id} ${large ? "art-large" : ""}`}
      style={{ "--project-color": project.color } as React.CSSProperties}
    >
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <span className="art-wordmark">
        {project.id === "daao"
          ? "DAAO"
          : project.id === "dvote"
            ? "d/vote"
            : project.id === "frammer"
              ? "frammer.ai"
              : project.name}
      </span>
      {project.image ? (
        <div className="browser-frame">
          <div className="browser-bar">
            <i />
            <i />
            <i />
            <span>
              {project.imageSource === "figma"
                ? `${project.formerDomain} · DESIGN ARCHIVE`
                : project.url?.replace("https://", "").replace(/\/$/, "")}
            </span>
            <ArrowUpRight size={12} />
          </div>
          <img
            src={project.image}
            srcSet={`${project.image.replace(".webp", "-640.webp")} 640w, ${project.image.replace(".webp", "-960.webp")} 960w, ${project.image} 1440w`}
            sizes={
              compact
                ? "(max-width: 700px) 42vw, 22vw"
                : large
                  ? "(max-width: 700px) 80vw, 70vw"
                  : project.id === "daao"
                    ? "(max-width: 700px) 80vw, 65vw"
                    : "(max-width: 700px) 80vw, 40vw"
            }
            alt={`${project.name} ${project.imageSource === "figma" ? "catalog design from Figma" : "live website interface"}`}
            width="1440"
            height="980"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement?.classList.add("image-unavailable");
            }}
          />
          <div className="asset-fallback">
            <Layers3 />
            <span>{project.name}</span>
            <small>EXPLORE THE PROJECT</small>
          </div>
        </div>
      ) : (
        <div className="commerce-art">
          <div className="commerce-top">
            <ShoppingBag size={22} />
            <span>
              THE COMMERCE
              <br />
              ECOSYSTEM
            </span>
          </div>
          <div className="commerce-search">
            <Search size={14} /> Find something good.
          </div>
          <div className="commerce-flow">
            <span>Discover</span>
            <b>→</b>
            <span>Collect</span>
            <b>→</b>
            <span>Checkout</span>
          </div>
          <div className="commerce-bottom">
            <ShieldCheck size={16} /> Payments, handled.<span>STRIPE ↗</span>
          </div>
          <small>CAPABILITY ILLUSTRATION</small>
        </div>
      )}
      <span className="art-bottom-label">{project.category}</span>
      <span className="art-plus">+</span>
    </div>
  );
}
