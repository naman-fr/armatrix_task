// frontend/pages/index.js
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import RobotAnimator from "../components/RobotAnimator";

/*
  Armatrix — Enhanced Index Page
  - Frames carousel with tilt + modal preview
  - Cursor particle canvas
  - Parallax ambient blobs
  - Journey: tall vertical SVG "river" path; probe follows scroll
  - Milestone cards anchored to the path (positioned & highlighted as probe nears)
  - Timeline progress indicator
  - Prefers-reduced-motion support
  - No nested <a> inside Link (Next.js 13/14 compatible)
*/

export default function Home() {
  // Canvas / particles
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const cursorRef = useRef({ x: -9999, y: -9999, visible: false });
  const rafRef = useRef(null);

  // Frames carousel + modal
  const frames = [
    { id: 1, title: "Robotic Arm Frame 1", subtitle: "Inspection-ready head", caption: "Flexible distal sensor cluster" },
    { id: 2, title: "Robotic Arm Frame 2", subtitle: "Cable-friendly routing", caption: "Low-profile actuators" },
    { id: 3, title: "Robotic Arm Frame 3", subtitle: "High-torque backbone", caption: "High payload, compact form" },
    { id: 4, title: "Robotic Arm Frame 4", subtitle: "Slim inspection module", caption: "Micro camera array" },
    { id: 5, title: "Robotic Arm Frame 5", subtitle: "Industrial arm", caption: "Robust for shopfloor tasks" },
    { id: 6, title: "Robotic Arm Frame 6", subtitle: "Prototype 3 (1.5m)", caption: "Long reach variant" },
  ];
  const [modalFrame, setModalFrame] = useState(null);
  const frameListRef = useRef(null);
  const [framesAuto, setFramesAuto] = useState(true);

  // Journey / SVG path
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const probeRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [pathLen, setPathLen] = useState(0);
  const milestones = [
    { date: "OCT 2023", text: "Global Technical Validation — Awarded Best Presentation at IAC" },
    { date: "NOV 2023", text: "gradCapital Fellowship — $5,000 award" },
    { date: "JAN 2024", text: "Company incorporation" },
    { date: "JUN 2024", text: "Strategic funding from gradCapital" },
    { date: "NOV 2024", text: "Prototype 3 development — 1.5m arm" },
    { date: "MAR 2025", text: "WTFund grant awarded" },
    { date: "JUN 2025", text: "$2.1M pre-seed round" },
  ];

  // reduced motion
  const [reduced, setReduced] = useState(false);

  // timeline progress (0..1)
  const [timelineProgress, setTimelineProgress] = useState(0);

  // --- Helper: hex -> rgba
  function hexToRgba(hex, a = 1) {
    const h = hex.replace("#", "");
    const bigint = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${a})`;
  }

  // --- Cursor particle canvas
  useEffect(() => {
    const mq = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    const isReduced = mq ? mq.matches : false;
    setReduced(isReduced);

    const canvas = canvasRef.current;
    if (!canvas || isReduced) return;
    const ctx = canvas.getContext("2d");
    let DPR = Math.max(1, window.devicePixelRatio || 1);
    function resize() {
      DPR = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.round(window.innerWidth * DPR);
      canvas.height = Math.round(window.innerHeight * DPR);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // spawn particle at pointer
    let last = 0;
    function onPointerMove(e) {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
      cursorRef.current.visible = true;
      const now = performance.now();
      if (now - last > 12) {
        last = now;
        for (let i = 0; i < 4; i++) {
          particlesRef.current.push({
            x: e.clientX + (Math.random() - 0.5) * 12,
            y: e.clientY + (Math.random() - 0.5) * 12,
            vx: (Math.random() - 0.5) * (1.6 + Math.random() * 2),
            vy: (Math.random() - 0.5) * (1.6 + Math.random() * 2),
            life: 420 + Math.random() * 520,
            age: 0,
            size: 1 + Math.random() * 4,
            color: Math.random() > 0.5 ? "#00e5ff" : "#7b5cff",
          });
        }
      }
    }
    function onLeave() {
      cursorRef.current.visible = false;
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // subtle background noise: faint stars (rare)
      if (Math.random() < 0.02) {
        ctx.fillStyle = "rgba(255,255,255,0.02)";
        const sx = Math.random() * window.innerWidth;
        const sy = Math.random() * window.innerHeight;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.age += 16.66;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;
        const alpha = Math.max(0, 1 - p.age / p.life);
        if (alpha <= 0.02 || p.age > p.life) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.fillStyle = hexToRgba(p.color, alpha * 0.9);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // cursor halo + dot
      if (cursorRef.current.visible) {
        const x = cursorRef.current.x;
        const y = cursorRef.current.y;
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.arc(x, y, 3.6, 0, Math.PI * 2);
        ctx.fill();
        const g = ctx.createRadialGradient(x, y, 0, x, y, 54);
        g.addColorStop(0, "rgba(0,229,255,0.12)");
        g.addColorStop(1, "rgba(123,92,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 54, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onLeave);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // --- Frames carousel auto-scroll + pause-on-hover + tilt
  useEffect(() => {
    if (reduced) return;
    const el = frameListRef.current;
    if (!el) return;
    let pos = 0;
    let raf = null;
    function step() {
      if (framesAuto) {
        pos = (pos + 0.5) % el.scrollWidth;
        if (el.scrollWidth > el.clientWidth) el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [framesAuto, reduced]);

  // tilt effect on each card via pointermove
  function onFramePointerMove(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const rx = (-dy / rect.height) * 10; // rotateX
    const ry = (dx / rect.width) * 14; // rotateY
    const s = 1.02;
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s}) translateZ(0)`;
    card.style.boxShadow = `${-ry * 2}px ${rx * 2}px 40px rgba(0,0,0,0.5), 0 6px 40px rgba(0,0,0,0.6)`;
  }
  function onFramePointerLeave(e) {
    const card = e.currentTarget;
    card.style.transform = "";
    card.style.boxShadow = "";
  }

  // open modal
  function openModal(frame) {
    setModalFrame(frame);
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    setModalFrame(null);
    document.body.style.overflow = "";
  }

  // --- Journey: vertical tall path and probe mapping to scroll
  // We'll use a tall SVG (viewBox height 2200) to enable long scroll
  useEffect(() => {
    // guard
    if (!pathRef.current || !svgRef.current || !probeRef.current) {
      setLoaded(true);
      return;
    }

    const svg = svgRef.current;
    const path = pathRef.current;
    const probe = probeRef.current;

    // viewBox dimensions used in mapping (must match the viewBox below)
    const vb = { x: 0, y: 0, width: 1200, height: 2200 };

    function svgToScreenPoint(p) {
      // map SVG user coords to DOM coords using bounding rect and viewBox scale
      const rect = svg.getBoundingClientRect();
      const sx = rect.left + (p.x - vb.x) * (rect.width / vb.width);
      const sy = rect.top + (p.y - vb.y) * (rect.height / vb.height);
      return { x: sx, y: sy, rect };
    }

    const len = path.getTotalLength();
    setPathLen(len);

    // initialize dash
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;

    // compute milestone normalized positions & store them
    const positions = [];
    const start = 0.02, end = 0.98;
    milestones.forEach((m, i) => {
      const t = start + (i / Math.max(1, milestones.length - 1)) * (end - start);
      positions.push(t);
    });

    // function to position milestone cards (DOM) next to path
    function positionMilestones() {
      const rect = svg.getBoundingClientRect();
      const scaleX = rect.width / vb.width;
      const scaleY = rect.height / vb.height;
      const container = document.querySelector(".milestone-canvas");
      milestones.forEach((_, i) => {
        const t = positions[i];
        const p = path.getPointAtLength(len * t);
        // map to screen coords
        const screen = svgToScreenPoint(p);
        const card = document.querySelector(`.milestone-card[data-i='${i}']`);
        if (!card || !container) return;
        // convert screen coords to container-local coordinates
        const contRect = container.getBoundingClientRect();
        const localX = screen.x - contRect.left;
        const localY = screen.y - contRect.top;
        // apply offsets to place card beside path (alternate sides)
        const offsetX = (i % 2 === 0) ? -140 : 80;
        const offsetY = -14;
        card.style.left = `${localX + offsetX}px`;
        card.style.top = `${localY + offsetY}px`;
      });
    }

    // onresize reposition
    positionMilestones();
    window.addEventListener("resize", positionMilestones);

    // when scrolling across the journey region, map progress to path length
    function onScroll() {
      const scrolled = window.scrollY || window.pageYOffset;
      const journeyEl = document.querySelector("#journey");
      if (!journeyEl) return;
      const startTop = journeyEl.offsetTop - window.innerHeight * 0.6;
      const endTop = journeyEl.offsetTop + journeyEl.offsetHeight - window.innerHeight * 0.2;
      const pct = Math.max(0, Math.min(1, (scrolled - startTop) / Math.max(1, endTop - startTop)));
      setTimelineProgress(pct);
      // animate stroke; dashoffset = len * (1 - pct)
      const base = len * (1 - pct);
      const wiggle = Math.sin((scrolled / 220) % (Math.PI * 2)) * (len * 0.003);
      path.style.strokeDashoffset = `${base + wiggle}`;

      // place probe at current point
      const travelLen = len * pct;
      const p = path.getPointAtLength(travelLen);
      const screen = svgToScreenPoint(p);
      // set circle center using transform on probe (we will position probe via CSS using container coords)
      probe.setAttribute("cx", p.x);
      probe.setAttribute("cy", p.y);

      // reveal milestone near probe
      document.querySelectorAll(".milestone-card").forEach((card) => {
        const t = parseFloat(card.datasetT || "0");
        if (Math.abs(t - pct) < 0.065) {
          card.classList.add("near");
          card.classList.add("in-view");
        } else if (pct > t + 0.12) {
          // if probe has passed it, keep it visible
          card.classList.add("in-view");
          card.classList.remove("near");
        } else {
          card.classList.remove("near");
          // do not forcibly remove in-view if already revealed to allow gentle fade
          if (!card.classList.contains("in-view")) {
            // nothing
          }
        }
      });
    }

    // initialize data-t attributes for cards
    document.querySelectorAll(".milestone-card").forEach((card, i) => {
      card.datasetT = positions[i];
    });

    // run initial scroll mapping
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => { positionMilestones(); onScroll(); });

    setLoaded(true);

    return () => {
      window.removeEventListener("resize", positionMilestones);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // additional IntersectionObserver for reveal-on-scroll for other sections
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("in-view");
      });
    }, { threshold: 0.12 });
    document.querySelectorAll("[data-reveal]").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loaded]);

  // small utility clamp
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // investors marquee list
  const investors = [
    "grad Capital","Emergent Ventures","pi Ventures","Inuka Capital","Turbostart","Boost VC","Boundless Ventures","WTFund","Shell E4"
  ];

  // --- Render
  return (
    <main className="page-root">
      {/* canvas particle cursor */}
      <canvas ref={canvasRef} className="cursor-canvas" aria-hidden="true" />

      {/* ambient decorative blobs */}
      <div className="ambient a1" aria-hidden />
      <div className="ambient a2" aria-hidden />
      <div className="scanlines" aria-hidden />

      {/* topbar */}
      <header className="topbar" role="banner">
        <div className="logo" aria-hidden>ARMATRIX</div>
        <nav className="nav" role="navigation" aria-label="Main">
          <a href="#usecases">USE CASES</a>
          <a href="#journey">OUR JOURNEY</a>
          <Link href="/team" className="nav-link">TEAM</Link>
          <a href="#contact">CONTACT</a>
        </nav>
      </header>

      {/* Robot (decorative) */}
      <div className="robot-top" aria-hidden>
        <RobotAnimator interactive size={120} />
      </div>

      {/* HERO */}
      <section className="hero" data-reveal>
        <div className="hero-inner container">
          <div className="hero-left">
            <h1 className="headline">
              <span className="h-s1">Snake-like</span>
              <span className="h-s2">Robotic Arm</span>
            </h1>
            <p className="hero-copy">
              Robotic arms designed to inspect tight spaces within complex machinery. Hyper-redundant kinematics, embedded sensing, and
              production-grade actuation.
            </p>

            <div className="hero-ctas">
              <Link href="/team" className="btn primary">Explore Team</Link>
              <a className="btn ghost" href="#usecases">See Use Cases</a>
            </div>

            {/* frames carousel */}
            <div className="frame-strip" onMouseEnter={() => setFramesAuto(false)} onMouseLeave={() => setFramesAuto(true)} data-reveal>
              <div className="frame-list" ref={frameListRef}>
                {frames.map((f) => (
                  <div
                    key={f.id}
                    className="frame-card"
                    onPointerMove={onFramePointerMove}
                    onPointerLeave={onFramePointerLeave}
                    onClick={() => openModal(f)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") openModal(f); }}
                    aria-label={`Open ${f.title}`}
                  >
                    <div className="frame-media" />
                    <div className="frame-content">
                      <div className="frame-title">{f.title}</div>
                      <div className="frame-sub">{f.subtitle}</div>
                      <div className="frame-cap">{f.caption}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="hero-right" data-reveal>
            <div className="holo-card card-base">
              <div className="holo-title">Live Node</div>
              <div className="holo-stats">
                <div className="stat"><div className="num">5</div><div className="lbl">Online</div></div>
                <div className="stat"><div className="num">12</div><div className="lbl">Projects</div></div>
                <div className="stat"><div className="num">2</div><div className="lbl">Clusters</div></div>
              </div>
              <div className="holo-footer"><div className="pulse" /><div className="status">Fleet healthy • 98% uptime</div></div>
            </div>

            <div className="partners" aria-hidden>
              {investors.map((i) => <div key={i} className="partner">{i}</div>)}
            </div>
          </aside>
        </div>
      </section>

      {/* marquee */}
      <section className="marquee" aria-hidden>
        <div className="marq-track">
          {Array.from({ length: 6 }).flatMap((_, r) => investors.map((inv, i) => (
            <div key={`${r}-${i}`} className="marq-item">{inv}</div>
          )))}
        </div>
      </section>

      {/* usecases */}
      <section id="usecases" className="usecases container" data-reveal>
        <h2 className="section-title">USE CASES</h2>
        <div className="use-grid">
          <div className="use-card">/001 <strong>INSPECTION</strong></div>
          <div className="use-card">/002 <strong>PAINTING</strong></div>
          <div className="use-card">/003 <strong>WELDING</strong></div>
        </div>
      </section>

      {/* JOURNEY: make this section tall so scrolling maps to path */}
      <section id="journey" className="journey container" data-reveal>
        <h2 className="section-title">OUR JOURNEY</h2>

        {/* timeline progress indicator */}
        <div className="timeline-progress" aria-hidden>
          <div className="timeline-track">
            <div className="timeline-fill" style={{ transform: `scaleX(${timelineProgress})` }} />
          </div>
        </div>

        <div className="journey-wrap">
          {/* tall SVG: viewBox height 2200 (gives long path) */}
          <svg ref={svgRef} className="journey-svg" viewBox="0 0 1200 2200" preserveAspectRatio="xMidYMid meet" aria-hidden>
            <defs>
              <linearGradient id="riverGrad" x1="0" x2="1">
                <stop offset="0" stopColor="#00e5ff" stopOpacity="0.95" />
                <stop offset="1" stopColor="#7b5cff" stopOpacity="0.95" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Long curving path from bottom-left upwards to top-right (SVG coordinates) */}
            <path
              ref={pathRef}
              d="
                M80 2100
                C 180 1960, 220 1800, 320 1680
                C 420 1560, 540 1480, 640 1400
                C 740 1320, 820 1240, 900 1160
                C 980 1080, 980 920, 880 800
                C 780 680, 660 620, 540 540
                C 420 460, 320 360, 260 280
                C 200 200, 220 120, 380 80
                C 540 40, 760 40, 920 120
              "
              stroke="url(#riverGrad)"
              strokeWidth="18"
              fill="none"
              strokeLinecap="round"
              style={{ filter: "url(#glow)", opacity: 0.98 }}
            />

            {/* light overlay */}
            <path
              d="
                M80 2100
                C 180 1960, 220 1800, 320 1680
                C 420 1560, 540 1480, 640 1400
                C 740 1320, 820 1240, 900 1160
                C 980 1080, 980 920, 880 800
                C 780 680, 660 620, 540 540
                C 420 460, 320 360, 260 280
                C 200 200, 220 120, 380 80
                C 540 40, 760 40, 920 120
              "
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="6 18"
            />

            {/* probe circle (will be positioned along path) */}
            <circle ref={probeRef} cx="-20" cy="-20" r="10" fill="#fff" style={{ filter: "drop-shadow(0 10px 28px rgba(0,0,0,0.6))" }} />
          </svg>

          {/* milestone canvas overlay */}
          <div className="milestone-canvas" aria-hidden>
            {milestones.map((m, i) => (
              <div className="milestone-card" data-i={i} key={i} data-reveal>
                <div className="m-date">{m.date}</div>
                <div className="m-text">{m.text}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* contact footer */}
      <footer id="contact" className="site-footer container" data-reveal>
        <div className="contact">
          <h3>Contact</h3>
          <p>contact@armatrix.in</p>
          <p>4th Floor, 444 Jai Tower, Bengaluru - 560077</p>
        </div>
        <div className="small">Armatrix © {new Date().getFullYear()}</div>
      </footer>

      {/* Frame modal preview */}
      {modalFrame && (
        <div className="modal-root" role="dialog" aria-modal="true" aria-label={`Preview ${modalFrame.title}`} onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} aria-label="Close modal">✕</button>
            <div className="modal-media" />
            <div className="modal-body">
              <h3>{modalFrame.title}</h3>
              <p className="modal-sub">{modalFrame.subtitle}</p>
              <p>{modalFrame.caption}. This preview showcases a high-fidelity render placeholder (replace with Lottie / GIF / image for production).</p>
              <div className="modal-actions">
                <button className="btn primary" onClick={() => { /* placeholder */ }}>Request Demo</button>
                <button className="btn ghost" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* styles (long but self-contained) */}
      <style jsx>{`
        :global(html,body) { height:100%; }
        :global(body) {
          margin:0;
          font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Rajdhani", sans-serif;
          background: radial-gradient(900px 300px at 10% 12%, rgba(0,30,50,0.12), transparent 12%), linear-gradient(180deg,#03060a 0%, #071322 100%);
          color: #dbefff;
          -webkit-font-smoothing:antialiased;
        }

        .page-root { position:relative; overflow-x:hidden; }

        /* cursor canvas */
        .cursor-canvas {
          position: fixed;
          inset: 0;
          z-index: 1200;
          pointer-events: none;
        }

        /* ambient blobs */
        .ambient { position: fixed; border-radius:50%; filter: blur(110px); opacity: 0.15; pointer-events:none; z-index:0; }
        .ambient.a1 { left:-160px; top:-120px; width:520px; height:520px; background: linear-gradient(90deg, rgba(0,230,255,0.22), rgba(123,92,255,0.06)); }
        .ambient.a2 { right:-160px; bottom:-120px; width:520px; height:520px; background: linear-gradient(90deg, rgba(123,92,255,0.20), rgba(0,230,255,0.06)); }

        /* scanlines overlay */
        .scanlines { position: fixed; inset:0; background-image: linear-gradient(rgba(255,255,255,0.006) 1px, transparent 1px); background-size: 1px 6px; opacity: 0.08; pointer-events:none; z-index:0; mix-blend-mode:overlay; }

        /* topbar */
        .topbar { position: fixed; left: 20px; right: 20px; top: 20px; display:flex; justify-content:space-between; align-items:center; z-index:1100; }
        .logo { font-weight: 800; font-family: 'Orbitron', sans-serif; letter-spacing:1px; color: #fff; font-size:18px; text-shadow: 0 6px 26px rgba(0,0,0,0.6); }
        .nav { display:flex; gap:16px; align-items:center; }
        .nav a, .nav .nav-link { color: rgba(255,255,255,0.86); text-decoration:none; padding:8px 10px; border-radius:8px; font-size:13px; transition: all .18s ease; }
        .nav a:hover, .nav .nav-link:hover { transform: translateY(-4px); color:#00e5ff; }

        /* Robot top */
        .robot-top { position: fixed; right: 22px; top: 72px; z-index: 1100; pointer-events:none; }

        /* container utility */
        .container { max-width: 1200px; margin: 0 auto; padding: 28px; box-sizing: border-box; position: relative; z-index: 4; }

        /* HERO */
        .hero { min-height: 78vh; display:block; padding: 100px 0 40px; position: relative; }
        .hero-inner { display:flex; gap: 36px; align-items:flex-start; }
        .hero-left { flex: 1 1 64%; }
        .headline { font-family:'Orbitron', sans-serif; font-size: clamp(34px, 6vw, 72px); margin: 0; line-height:0.92; display:flex; gap:12px; flex-wrap:wrap; }
        .h-s1 { font-weight: 400; color: rgba(255,255,255,0.92); transform: translateY(6px) rotate(-0.4deg); }
        .h-s2 { font-weight:800; background: linear-gradient(90deg,#00e5ff,#7b5cff); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }

        .hero-copy { margin-top: 14px; color: #bfe8f8; max-width: 56ch; line-height:1.5; }

        .hero-ctas { margin-top: 18px; display:flex; gap:12px; align-items:center; }
        .btn { display:inline-block; padding: 10px 14px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.03); text-decoration:none; cursor:pointer; }
        .btn.primary { background: linear-gradient(90deg,#00e5ff,#7b5cff); color: #00141a; font-weight:800; box-shadow: 0 12px 40px rgba(0,229,255,0.08); }
        .btn.ghost { background: rgba(255,255,255,0.02); color:#9fbfd6; }

        /* frame strip */
        .frame-strip { margin-top:24px; overflow:hidden; }
        .frame-list { display:flex; gap:18px; align-items:center; padding-bottom: 6px; }
        .frame-card {
          min-width: 260px;
          min-height:140px;
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.03);
          padding: 12px;
          display:flex;
          gap:12px;
          align-items:center;
          cursor:pointer;
          transition: transform .22s cubic-bezier(.2,.9,.25,1), box-shadow .22s;
        }
        .frame-card:active { transform: scale(.995); }
        .frame-media {
          width:120px;
          height:88px;
          border-radius:8px;
          background: linear-gradient(90deg,#0b1118,#001428);
          box-shadow: inset 0 2px 8px rgba(255,255,255,0.02), 0 8px 40px rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.02);
          position:relative;
          overflow:hidden;
        }
        .frame-media::after {
          content: "";
          position:absolute; inset:0; background:
            radial-gradient(60% 60% at 20% 30%, rgba(0,229,255,0.06), transparent 8%),
            linear-gradient(180deg, rgba(255,255,255,0.02), transparent 30%);
          mix-blend-mode: screen;
        }
        .frame-content { flex:1; display:flex; flex-direction:column; gap:6px; }
        .frame-title { font-weight:800; font-size:15px; color:#e9fbff; font-family:'Orbitron', sans-serif; }
        .frame-sub { font-size:13px; color:#9fbfd6; }
        .frame-cap { margin-top:auto; font-size:12px; color:#bfe8f8; opacity:0.9; }

        /* hero-right holo card + partners */
        .hero-right { flex:0 0 360px; display:flex; flex-direction:column; gap:18px; align-items:flex-end; }
        .holo-card { width:100%; padding:18px; border-radius:12px; background: linear-gradient(180deg, rgba(6,12,20,0.86), rgba(6,12,20,0.66)); border:1px solid rgba(255,255,255,0.03); }
        .holo-title { font-family:'Orbitron', sans-serif; color:#e9fbff; font-weight:700; margin-bottom:8px; }
        .holo-stats { display:flex; gap:12px; }
        .stat .num { font-family:'Orbitron', sans-serif; color:#00e5ff; font-size:20px; }
        .holo-footer { display:flex; gap:8px; align-items:center; margin-top:12px; }
        .pulse { width:10px; height:10px; border-radius:50%; background: radial-gradient(circle, #00ffea, #0077a6); box-shadow: 0 0 22px rgba(0,229,255,0.26); }
        .status { color:#9fbfd6; font-size:13px; }

        .partners { display:flex; flex-direction:column; gap:8px; align-items:flex-end; margin-top:6px; }
        .partner { font-size:13px; color:#9fbfd6; background: rgba(255,255,255,0.01); padding:6px 10px; border-radius:10px; border:1px solid rgba(255,255,255,0.02); }

        /* marquee */
        .marquee { margin-top: 28px; overflow:hidden; pointer-events:none; z-index:2; }
        .marq-track { display:flex; gap:40px; animation: marquee 36s linear infinite; }
        .marq-item { opacity:0.08; font-weight:700; text-transform:uppercase; letter-spacing:1px; }
        @keyframes marquee { from { transform: translateX(0%); } to { transform: translateX(-50%); } }

        /* usecases */
        .usecases { margin-top:40px; padding: 18px 0; }
        .section-title { font-family:'Orbitron', sans-serif; font-weight:700; margin-bottom:12px; color:#cfefff; }
        .use-grid { display:flex; gap:16px; }
        .use-card { min-width:200px; padding:18px; border-radius:12px; background: linear-gradient(180deg, rgba(8,12,20,0.9), rgba(6,10,16,0.6)); border:1px solid rgba(255,255,255,0.03); font-weight:800; color:#e9fbff; }

        /* JOURNEY: tall container for long path (this makes page scroll) */
        .journey { margin-top:44px; padding: 10px 0 60px; }
        .timeline-progress { width:100%; display:flex; justify-content:center; margin-bottom:12px; }
        .timeline-track { width:60%; height:8px; background: rgba(255,255,255,0.03); border-radius:999px; overflow:hidden; }
        .timeline-fill { height:100%; background: linear-gradient(90deg,#00e5ff,#7b5cff); transform-origin:left center; transform: scaleX(0); transition: transform 240ms linear; }

        .journey-wrap { position:relative; width:100%; height:1400px; border-radius:12px; overflow:visible; background: linear-gradient(180deg, rgba(255,255,255,0.01), transparent 40%); border:1px solid rgba(255,255,255,0.02); padding: 12px 0; }

        .journey-svg { width:100%; height:100%; display:block; }

        .milestone-canvas { position:absolute; left:0; top:0; width:100%; height:100%; pointer-events:none; }

        .milestone-card {
          position:absolute;
          width:300px;
          padding:12px;
          border-radius:10px;
          background: linear-gradient(180deg, rgba(8,12,18,0.9), rgba(6,8,14,0.7));
          border:1px solid rgba(255,255,255,0.03);
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          transform: translate(-50%, -50%) scale(.98);
          opacity:0; transition: transform 420ms cubic-bezier(.2,.9,.25,1), opacity 420ms ease, box-shadow 220ms;
          pointer-events:auto;
        }
        .milestone-card.in-view { opacity:1; transform: translate(-50%, -56%) scale(1); }
        .milestone-card.near { outline: 2px solid rgba(0,229,255,0.08); transform: translate(-50%, -62%) scale(1.02); box-shadow: 0 28px 80px rgba(0,0,0,0.72), 0 0 36px rgba(0,229,255,0.04); }

        .m-date { font-family:'Orbitron', sans-serif; color:#00e5ff; font-size:12px; margin-bottom:8px; }
        .m-text { color:#bfe8f8; font-size:14px; }

        /* site footer */
        .site-footer { margin-top:48px; padding: 28px 0; display:flex; justify-content:space-between; color:#8fb5c9; align-items:center; }
        .contact h3 { margin:0; color:#e9fbff; }

        /* Modal */
        .modal-root {
          position: fixed;
          inset: 0;
          display:flex;
          align-items:center;
          justify-content:center;
          background: rgba(2,4,8,0.6);
          z-index:2000;
          padding: 28px;
        }
        .modal-card {
          width: min(940px, 94vw);
          max-height: 90vh;
          overflow:auto;
          border-radius: 14px;
          background: linear-gradient(180deg, rgba(6,10,16,0.95), rgba(6,10,16,0.88));
          border: 1px solid rgba(255,255,255,0.03);
          box-shadow: 0 40px 120px rgba(0,0,0,0.7);
          position: relative;
          display:flex;
          gap:18px;
        }
        .modal-close { position:absolute; right:12px; top:12px; background:transparent; color:#bfe8f8; border: none; font-size:18px; cursor:pointer; }
        .modal-media { width:44%; min-height:280px; border-top-left-radius:14px; border-bottom-left-radius:14px; background: linear-gradient(90deg,#00121a,#002432); border-right:1px solid rgba(255,255,255,0.02); }
        .modal-body { padding:18px; flex:1; }
        .modal-sub { color:#9fbfd6; margin-top:6px; }
        .modal-actions { margin-top:18px; display:flex; gap:10px; }

        /* responsive */
        @media (max-width: 980px) {
          .hero-inner { flex-direction:column-reverse; align-items:flex-start; }
          .hero-right { width:100%; align-items:flex-start; }
          .frame-list { gap:12px; }
          .frame-card { min-width:220px; }
          .journey-wrap { height:1800px; }
          .milestone-card { width:220px; }
          .modal-card { flex-direction:column; }
          .modal-media { width:100%; height:220px; border-radius:12px 12px 0 0; }
        }

        /* reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .frame-card, .frame-list, .marq-track { animation: none !important; transition: none !important; }
          .cursor-canvas { display:none; }
          [data-reveal] { transition: none !important; opacity:1 !important; transform:none !important; }
        }
      `}</style>
    </main>
  );
}