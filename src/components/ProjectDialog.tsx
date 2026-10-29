import { useEffect, useRef, useState } from "react";
import { X, ArrowUpRight, ArrowLeft } from "lucide-react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import type { Project } from "../data";
import { useReducedMotion } from "../lib/hooks";
import ProjectArt from "./ProjectArt";
import Exploded from "./Exploded";
gsap.registerPlugin(Flip);
export default function ProjectDialog({
  project,
  origin,
  onClose,
}: {
  project: Project;
  origin: HTMLElement | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const cover = useRef<HTMLDivElement>(null);
  const entrance = useRef<gsap.core.Timeline | null>(null);
  const folds = useRef<gsap.core.Tween | null>(null);
  const [closing, setClosing] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const focus = document.activeElement as HTMLElement;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    const tween = gsap.fromTo(
      dialog,
      { opacity: 0 },
      { opacity: 1, duration: reduced ? 0 : 0.2 },
    );
    let animation: gsap.core.Timeline | undefined;
    if (cover.current && origin && !reduced) {
      const original = origin.querySelector(".project-art");
      if (original) {
        const state = Flip.getState(original);
        animation = Flip.from(state, {
          targets: cover.current,
          duration: 0.75,
          ease: "power3.inOut",
          absolute: true,
          scale: true,
        });
        entrance.current = animation;
        folds.current = gsap.to(
          cover.current.querySelectorAll(".portal-slice"),
          {
            rotationY: (index) => (index === 0 ? -35 : 35),
            xPercent: (index) => (index === 0 ? -5 : 5),
            opacity: 0,
            duration: 0.8,
            delay: 0.15,
            ease: "power3.inOut",
          },
        );
      }
    }
    return () => {
      tween.kill();
      animation?.kill();
      folds.current?.kill();
      document.body.style.overflow = previous;
      dialog.close();
      if (focus?.isConnected) focus.focus({ preventScroll: true });
    };
  }, [origin, reduced]);
  const close = () => {
    if (closing) return;
    setClosing(true);
    entrance.current?.kill();
    folds.current?.kill();
    gsap.killTweensOf(cover.current);
    if (reduced) {
      onClose();
      return;
    }
    const rect = origin?.querySelector(".project-art")?.getBoundingClientRect();
    if (cover.current && rect && rect.width) {
      const current = cover.current.getBoundingClientRect();
      gsap.to(cover.current, {
        x: rect.left - current.left,
        y: rect.top - current.top,
        scaleX: rect.width / current.width,
        scaleY: rect.height / current.height,
        transformOrigin: "top left",
        duration: 0.35,
        ease: "power2.inOut",
      });
    }
    gsap.to(ref.current, { opacity: 0, duration: 0.4, onComplete: onClose });
  };
  return (
    <dialog
      ref={ref}
      className="project-dialog"
      aria-labelledby="project-title"
      onKeyDown={(e) => {
        if (e.key !== "Tab" || !ref.current) return;
        const controls = Array.from(
          ref.current.querySelectorAll<HTMLElement>(
            'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), [tabindex="0"]',
          ),
        ).filter((element) => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <div
        className="dialog-shell"
        style={{ "--project-color": project.color } as React.CSSProperties}
      >
        <header className="dialog-header">
          <button onClick={close} className="text-button">
            <ArrowLeft size={16} /> Back to the work
          </button>
          <span className="mono">PROJECT {project.number} / 07</span>
          <button
            onClick={close}
            className="icon-button"
            aria-label="Close project"
          >
            <X size={22} />
          </button>
        </header>
        <div className="dialog-heading">
          <span className="section-eyebrow">
            {project.category} · END-TO-END DESIGN & DEVELOPMENT
          </span>
          <h2 id="project-title">
            {project.name}
            <span>®</span>
          </h2>
          <p>{project.tagline}</p>
        </div>
        <div ref={cover} data-flip-id={project.id} className="dialog-cover">
          <ProjectArt project={project} large />
          {!reduced &&
            [0, 1].map((side) => (
              <div
                key={side}
                className={`portal-slice portal-slice-${side}`}
                aria-hidden="true"
              >
                <ProjectArt project={project} large />
              </div>
            ))}
        </div>
        <div className="case-body">
          <div className="case-intro">
            <span className="section-eyebrow">THE IDEA</span>
            <h3>{project.description}</h3>
            {project.formerDomain && (
              <p>
                Previously live at {project.formerDomain}. The website is now
                offline. These screens are captured from the original Figma
                designs.
              </p>
            )}
            {(project.url || project.repo) && (
              <div className="case-links">
                {project.url && (
                  <a
                    className="pill-button dark-button"
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit live site <ArrowUpRight size={17} />
                  </a>
                )}
                {project.repo && (
                  <a
                    className="text-button"
                    href={project.repo}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View source <ArrowUpRight size={16} />
                  </a>
                )}
              </div>
            )}
          </div>
          <div className="case-columns">
            <div>
              <span className="section-eyebrow">THE THINKING</span>
              <p>{project.decision}</p>
              <div className="tags">
                {project.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
            <div>
              <span className="section-eyebrow">WHAT I BUILT</span>
              <ul>
                {project.features.map((f, i) => (
                  <li key={f}>
                    <span>0{i + 1}</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {project.gallery && (
            <section
              className="case-gallery"
              aria-label={`${project.name} design archive`}
            >
              <div className="case-gallery-heading">
                <div>
                  <span className="section-eyebrow">FROM THE ORIGINAL DESIGN</span>
                  <h3>A closer look.</h3>
                </div>
                <p>Desktop to mobile. Scroll inside each screen to explore.</p>
              </div>
              <div className="case-gallery-grid">
                {project.gallery.map((screen, i) => (
                  <figure
                    key={screen.image}
                    className={`case-screen${screen.mobile ? " case-screen-mobile" : ""}`}
                  >
                    <figcaption>
                      <span>0{i + 1}</span> {screen.title}
                    </figcaption>
                    <div
                      className="case-screen-viewport"
                      tabIndex={0}
                      role="region"
                      aria-label={`${screen.title}, scrollable design screenshot`}
                    >
                      <img
                        src={screen.image}
                        {...(!screen.mobile && {
                          srcSet: `${screen.image.replace(".webp", "-640.webp")} 640w, ${screen.image} ${screen.width}w`,
                          sizes: "(max-width: 700px) 90vw, 40vw",
                        })}
                        alt={screen.alt}
                        width={screen.width}
                        height={screen.height}
                        loading="lazy"
                      />
                    </div>
                    <span className="case-screen-source">
                      FIGMA CAPTURE · {screen.mobile ? "MOBILE" : "DESKTOP"}
                    </span>
                  </figure>
                ))}
              </div>
            </section>
          )}
          {project.id === "frammer" && <Exploded />}
          <footer className="case-footer">
            <p>
              Something like this.
              <br />
              <em>Something entirely yours.</em>
            </p>
            <a
              className="pill-button accent-button"
              href="mailto:antarikshdasofficial@gmail.com"
            >
              Let's build it <ArrowUpRight size={18} />
            </a>
          </footer>
        </div>
      </div>
    </dialog>
  );
}
