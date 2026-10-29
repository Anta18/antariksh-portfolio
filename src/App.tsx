import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  Sun,
  Moon,
  Plus,
  Check,
  Copy,
  Menu,
  X,
  Github,
  Linkedin,
  Asterisk,
  Pause,
  Play,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, type Project } from "./data";
import Ribbon from "./components/Ribbon";
import ProjectArt from "./components/ProjectArt";
import ProjectDialog from "./components/ProjectDialog";
import EngineRoom from "./components/EngineRoom";
import Playground from "./components/Playground";
import { useReducedMotion, setMotionPreference } from "./lib/hooks";
import MotionBridge from "./components/MotionBridge";
gsap.registerPlugin(ScrollTrigger);
const email = "antarikshdasofficial@gmail.com";
function Magnetic({
  children,
  className = "",
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
}) {
  const reduced = useReducedMotion();
  return (
    <a
      className={`pill-button magnetic ${className}`}
      href={href}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        gsap.to(e.currentTarget, {
          x: (e.clientX - r.left - r.width / 2) * 0.12,
          y: (e.clientY - r.top - r.height / 2) * 0.12,
          duration: 0.3,
        });
      }}
      onPointerLeave={(e) => {
        gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.4 });
      }}
    >
      {children}
    </a>
  );
}
export default function App() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || "light",
  );
  const [menu, setMenu] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const origin = useRef<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [filter, setFilter] = useState("All");
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#161616" : "#f5f2eb");
    try {
      localStorage.setItem("ad-theme", theme);
    } catch {
      /* Theme still works when storage is unavailable. */
    }
  }, [theme]);
  useLayoutEffect(() => {
    if (reduced) return;
    const contextCleanups: (() => void)[] = [];
    const context = gsap.context(() => {
      gsap.from(".hero-title .line-inner", {
        yPercent: 105,
        rotation: 2,
        stagger: 0.1,
        duration: 1,
        ease: "power4.out",
        delay: 0.05,
      });
      gsap.from(".hero-intro, .hero-bottom", {
        opacity: 0,
        y: 18,
        duration: 0.7,
        delay: 0.5,
      });
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) =>
        gsap.from(el, {
          y: 70,
          rotationX: 8,
          opacity: 0.2,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 95%", once: true },
        }),
      );
      gsap.to(".hero-title .line:first-child", {
        xPercent: -18,
        rotation: -4,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
      gsap.to(".hero-title .line:last-child", {
        xPercent: 15,
        rotation: 3,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
      const media = gsap.matchMedia();
      contextCleanups.push(() => media.revert());
      media.add("(min-width: 900px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".featured-project");
        gsap.set(cards, { clearProps: "filter", "--stack-shade": 0 });
        cards.forEach((card, i) => {
          if (i < cards.length - 1)
            gsap.to(card, {
              scale: 0.92,
              rotation: -2,
              "--stack-shade": 0.22,
              transformOrigin: "center top",
              ease: "none",
              scrollTrigger: {
                trigger: cards[i + 1],
                start: "top 90%",
                end: "top 100px",
                scrub: 0.6,
              },
            });
        });
      });
      gsap.utils
        .toArray<HTMLElement>(".project-cover-button")
        .forEach((card) => {
          const art = card.querySelector(".project-art");
          if (!art) return;
          const move = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            const r = card.getBoundingClientRect();
            gsap.to(art, {
              rotationY: ((e.clientX - r.left) / r.width - 0.5) * 12,
              rotationX: -((e.clientY - r.top) / r.height - 0.5) * 10,
              scale: 1.025,
              duration: 0.5,
              ease: "power2.out",
            });
          };
          const leave = () =>
            gsap.to(art, {
              rotationX: 0,
              rotationY: 0,
              scale: 1,
              duration: 0.7,
              ease: "elastic.out(1,.65)",
            });
          card.addEventListener("pointermove", move);
          card.addEventListener("pointerleave", leave);
          contextCleanups.push(() => {
            card.removeEventListener("pointermove", move);
            card.removeEventListener("pointerleave", leave);
          });
        });
      gsap.to(".rotating-asterisk", {
        rotation: 180,
        ease: "none",
        scrollTrigger: {
          trigger: ".about-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, root);
    return () => {
      contextCleanups.forEach((cleanup) => cleanup());
      context.revert();
    };
  }, [reduced]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const open = (p: Project, el: HTMLElement) => {
    origin.current = el;
    setSelected(p);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError(true);
    }
  };
  const more = projects.filter(
    (p) =>
      !p.featured &&
      (filter === "All" ||
        (filter === "Product UI"
          ? ["zelta", "bhs"].includes(p.id)
          : p.id === "commerce")),
  );
  return (
    <div ref={root} className="site-root">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a href="#" className="brand" aria-label="Antariksh Das, home">
          <span className="brand-mark" aria-hidden="true">
            ad<span>✳</span>
          </span>
          <span className="brand-name">
            ANTARIKSH
            <br />
            DAS
          </span>
        </a>
        <nav
          id="mobile-navigation"
          className={`desktop-nav ${menu ? "menu-open" : ""}`}
          aria-label="Main navigation"
        >
          {[
            ["Work", "work"],
            ["About", "about"],
            ["Engineering", "engineering"],
            ["Play", "playground"],
          ].map(([name, id]) => (
            <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>
              {name}
              <span>↗</span>
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="motion-toggle"
            aria-label={reduced ? "Enable full animations" : "Pause animations"}
            onClick={() => setMotionPreference(!reduced)}
            title={reduced ? "Enable the full experience" : "Pause animations"}
          >
            {reduced ? <Play size={13} /> : <Pause size={13} />}
            <span>MOTION {reduced ? "OFF" : "ON"}</span>
          </button>
          <a className="availability" href="#contact">
            <i /> OPEN TO GOOD IDEAS
          </a>
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            aria-pressed={theme === "dark"}
          >
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <button
            className="mobile-menu icon-button"
            aria-expanded={menu}
            aria-controls="mobile-navigation"
            aria-label={menu ? "Close menu" : "Open menu"}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>
      <main id="main">
        <section className="hero" aria-labelledby="hero-heading">
          <div className="hero-topline">
            <span className="section-eyebrow">
              <i className="orange-square" /> INDEPENDENT CREATIVE DEVELOPER
            </span>
            <span className="mono hero-location">
              BASED IN INDIA. BUILDING EVERYWHERE. ↗
            </span>
          </div>
          <div className="hero-composition">
            <Ribbon />
            <h1 className="hero-title" id="hero-heading">
              <span className="line">
                <span className="line-inner">DIGITAL,</span>
              </span>
              <span className="line">
                <span className="line-inner">
                  WITH A{" "}
                  <span className="pulse-word">
                    PULSE<span className="title-period">.</span>
                  </span>
                </span>
              </span>
            </h1>
            <span className="hero-side-note">
              DESIGNED TO FEEL.
              <br />
              ENGINEERED TO WORK.
            </span>
          </div>
          <div className="hero-bottom">
            <div className="hero-intro">
              <span className="intro-dash" />
              <p>
                Hey, I’m Antariksh. I turn ambitious ideas into
                <br className="desktop-break" /> expressive websites and
                products that <em>just work.</em>
              </p>
            </div>
            <div className="hero-ctas">
              <Magnetic href="#work" className="dark-button">
                Explore the work <ArrowDown size={17} />
              </Magnetic>
              <Magnetic href="#contact" className="outline-button">
                Start a project <ArrowUpRight size={17} />
              </Magnetic>
            </div>
          </div>
          <div className="hero-marquee" aria-hidden="true">
            <div>
              {Array.from({ length: 4 }, (_, i) => (
                <span key={i}>
                  DESIGN WITH FEELING <i>✳</i> BUILD WITH INTENT <i>✳</i> MAKE
                  IT MATTER <i>✳</i>
                </span>
              ))}
            </div>
          </div>
          <div className="hero-baseline">
            <span className="mono">A LITTLE WILD. VERY WELL BUILT.</span>
            <a
              href="#work"
              className="scroll-cue"
              aria-label="Scroll to feel something. Explore the work."
            >
              <span className="mono">SCROLL TO FEEL SOMETHING</span>
              <ArrowDown size={14} />
            </a>
          </div>
        </section>
        <section id="work" className="work-section">
          <div className="section-topline">
            <span className="section-eyebrow">01 / SELECTED WORK</span>
            <span className="mono">IDEAS MADE REAL. END TO END.</span>
          </div>
          <div className="section-heading reveal">
            <h2>
              GOOD IDEAS.
              <br />
              <span className="outline-text">REAL-WORLD IMPACT.</span>
            </h2>
            <p>
              Different challenges. One obsession:
              <br />
              making the complicated
              <br />
              <em>feel effortless.</em>
            </p>
          </div>
          <div className="featured-grid">
            {projects
              .filter((p) => p.featured)
              .map((p, i) => (
                <article
                  key={p.id}
                  className={`featured-project feature-${i}`}
                  style={{ "--card-index": i } as React.CSSProperties}
                >
                  <button
                    className="project-cover-button"
                    onClick={(e) => open(p, e.currentTarget)}
                    aria-label={`Explore ${p.name} case study`}
                  >
                    <ProjectArt project={p} />
                    <span className="project-enter">
                      <ArrowUpRight size={22} />
                    </span>
                    <span className="project-hover-label">ENTER PROJECT ↗</span>
                  </button>
                  <div className="project-info">
                    <div>
                      <span className="mono">
                        {p.number} / {p.category}
                      </span>
                      <h3>
                        <button
                          onClick={(e) =>
                            open(p, e.currentTarget.closest("article")!)
                          }
                        >
                          {p.name}
                          <ArrowUpRight size={23} />
                        </button>
                      </h3>
                    </div>
                    <p>{p.tagline}</p>
                  </div>
                </article>
              ))}
          </div>
          <div className="more-work-header">
            <h3>More good things.</h3>
            <div className="filter-tabs" aria-label="Filter additional work">
              {["All", "Product UI", "Commerce"].map((f) => (
                <button
                  key={f}
                  aria-pressed={filter === f}
                  className={filter === f ? "active" : ""}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="more-work-grid">
            {more.map((p) => (
              <article key={p.id}>
                <button
                  className="small-project"
                  onClick={(e) => open(p, e.currentTarget)}
                  aria-label={`Explore ${p.name} case study`}
                >
                  <ProjectArt project={p} compact />
                  <div className="small-project-caption">
                    <span>
                      <small className="mono" aria-hidden="true">
                        {p.category}
                      </small>
                      <strong>{p.name}</strong>
                    </span>
                    <ArrowUpRight size={21} />
                  </div>
                </button>
              </article>
            ))}
          </div>
        </section>
        <MotionBridge />
        <section id="about" className="about-section">
          <div className="section-topline">
            <span className="section-eyebrow">
              02 / THE PERSON BEHIND THE PIXELS
            </span>
            <span className="mono">TASTE MEETS TENACITY.</span>
          </div>
          <div className="about-main">
            <div className="about-title reveal">
              <h2>
                A CREATIVE
                <br />
                HEAD.
                <br />
                AN ENGINEER’S
                <br />
                <span>HEART.</span>
              </h2>
              <Asterisk
                className="rotating-asterisk"
                size={122}
                strokeWidth={1}
              />
            </div>
            <div className="about-copy reveal">
              <span className="about-kicker">Hi again. I’m Antariksh Das.</span>
              <p className="about-lead">
                I like things that make you look twice.
                <br />
                And work beautifully the first time.
              </p>
              <p>
                I study Computer Science at IIT Kharagpur. I’ve worked on
                latency-sensitive systems at Quadeye, built full-stack products,
                and spent a lot of time turning “is that possible?” into “try
                it.”
              </p>
              <p>
                From the first visual idea to the final API connection, I care
                about every part of the experience.
              </p>
              <a
                className="text-button"
                href="/Antariksh-Das-CV.pdf"
                target="_blank"
                rel="noreferrer"
              >
                A little more about me <ArrowUpRight size={17} />
              </a>
              <div className="about-credentials">
                <span>
                  IIT KHARAGPUR<small>Computer Science · Class of 2027</small>
                </span>
                <span>
                  QUADEYE<small>Systems Intern · Summer 2026</small>
                </span>
              </div>
            </div>
          </div>
          <div className="services">
            {[
              [
                "01",
                "Websites with presence",
                "Expressive brand websites, launch experiences, and motion that earns its place.",
              ],
              [
                "02",
                "Products with purpose",
                "SaaS interfaces, AI workspaces, and dashboards that make complex things clear.",
              ],
              [
                "03",
                "The whole build",
                "Frontend, APIs, databases, integrations. One considered experience, end to end.",
              ],
            ].map(([n, title, description]) => (
              <div key={n}>
                <span className="mono">{n}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <Plus size={20} />
              </div>
            ))}
          </div>
          <p className="achievement-note">
            Engineered responsive web apps under aggressive deadlines, including
            an NFT marketplace with Web3 integrations to buy, sell and mint
            NFTs.
          </p>
        </section>
        <EngineRoom />
        <Playground />
        <section id="contact" className="contact-section">
          <div className="section-topline">
            <span className="section-eyebrow">05 / YOUR NEXT GOOD IDEA</span>
            <span className="mono">
              <i className="status-dot" /> AVAILABLE FOR SELECT PROJECTS
            </span>
          </div>
          <div className="contact-heading">
            <h2>
              LET’S MAKE
              <br />
              <span>SOME </span>
              <em>NOISE.</em>
              <ArrowUpRight className="contact-arrow" />
            </h2>
          </div>
          <div className="contact-bottom">
            <div>
              <p>
                Have a wild idea? A tricky product?
                <br />
                Something the internet hasn’t seen yet?
              </p>
              <p className="contact-small">I’d love to hear it.</p>
            </div>
            <div className="email-block">
              <a href={`mailto:${email}`}>
                Let’s talk <ArrowUpRight size={27} />
              </a>
              <div className="copy-email">
                <span>{email}</span>
                <button
                  className="icon-button"
                  onClick={copy}
                  aria-label="Copy email address"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <span className="copy-feedback" role="status">
                {copied
                  ? "Copied. Good things start with hello."
                  : copyError
                    ? "Select the email to copy, or use the link above."
                    : ""}
              </span>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <a href="#" className="footer-brand">
          ad<span>✳</span>
        </a>
        <p>
          BUILT WITH INTENT.
          <br />
          AND A HEALTHY AMOUNT OF CURIOSITY.
        </p>
        <div className="footer-links">
          <a href="https://github.com/Anta18" target="_blank" rel="noreferrer">
            <Github size={15} /> GitHub <ArrowUpRight size={12} />
          </a>
          <a
            href="https://www.linkedin.com/in/antariksh-das-ba34a3257"
            target="_blank"
            rel="noreferrer"
          >
            <Linkedin size={15} /> LinkedIn <ArrowUpRight size={12} />
          </a>
          <a href="/Antariksh-Das-CV.pdf" download>
            Résumé <ArrowDown size={14} />
          </a>
        </div>
        <a className="back-top" href="#">
          BACK TO THE TOP <ArrowRight size={15} />
        </a>
      </footer>
      {selected && (
        <ProjectDialog
          key={selected.id}
          project={selected}
          origin={origin.current}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
