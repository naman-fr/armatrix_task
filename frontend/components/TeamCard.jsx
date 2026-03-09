// frontend/components/TeamCard.jsx
import React, { useEffect, useRef, useState } from "react";

export default function TeamCard({ member, onOpen = () => {}, onEdit = () => {}, onDelete = () => {} }) {
  const ref = useRef(null);
  const [transform, setTransform] = useState("perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)");
  const [shinePos, setShinePos] = useState({ x: 50, y: 50 });
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = null;

    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (y - 0.5) * 10;
      const ry = (x - 0.5) * -12;
      const s = 1.02;
      const t = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setTransform(t);
        setShinePos({ x: x * 100, y: y * 100 });
      });
    }

    function onLeave() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setTransform("perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)");
        setShinePos({ x: 50, y: 50 });
      });
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerenter", () => setHover(true));
    el.addEventListener("pointerleave", () => { onLeave(); setHover(false); });

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", () => setHover(true));
      el.removeEventListener("pointerleave", () => { onLeave(); setHover(false); });
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const avatar = member.photo_url || `https://robohash.org/${encodeURIComponent(member.name)}.png?set=set2&size=300x300`;

  return (
    <article className="card" ref={ref} style={{ transform }} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") onOpen(); }} aria-label={`Team member ${member.name}`}>
      <div className={`robot-arm ${hover ? "show" : ""}`} aria-hidden>
        <svg viewBox="0 0 120 120" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="garm" x1="0" x2="1"><stop offset="0" stopColor="#00e5ff"/><stop offset="1" stopColor="#7b5cff"/></linearGradient>
          </defs>
          <g>
            <rect x="18" y="28" width="28" height="10" rx="4" fill="#05131a" />
            <rect x="64" y="28" width="28" height="10" rx="4" fill="#05131a" />
            <path d="M 18 34 C 36 16, 84 16, 102 34" stroke="url(#garm)" strokeWidth="6" fill="none" strokeLinecap="round"/>
          </g>
        </svg>
      </div>

      <div className="card-top">
        <img className="avatar" src={avatar} alt={`${member.name} avatar`} />
        <div className="shine" style={{ background: `radial-gradient(circle at ${shinePos.x}% ${shinePos.y}%, rgba(255,255,255,0.16), transparent 20%)` }} />
      </div>

      <div className="card-body">
        <h3 className="name">{member.name}</h3>
        <div className="role">{member.role}</div>
        <p className="bio">{member.bio}</p>

        <div className="meta-row">
          <a className="link" href={member.linkedin || "#"} target="_blank" rel="noreferrer">LinkedIn</a>
          <div className="skills">{member.skills?.slice(0, 3).map((s, i) => <span className="chip" key={i}>{s}</span>)}</div>
        </div>

        <div className="actions">
          <button className="action" onClick={() => onOpen()} aria-label={`Open ${member.name}`}>View</button>
          <button className="action" onClick={() => onEdit()} aria-label={`Edit ${member.name}`}>Edit</button>
          <button className="action danger" onClick={() => onDelete()} aria-label={`Delete ${member.name}`}>Delete</button>
        </div>
      </div>

      <style jsx>{`
        .card { position:relative; overflow:hidden; border-radius:14px; min-height:320px; display:flex; flex-direction:column; background: linear-gradient(180deg, rgba(6,12,20,0.65), rgba(5,10,18,0.45)); border:1px solid rgba(255,255,255,0.03); box-shadow: 0 12px 40px rgba(0,0,0,0.7); cursor:pointer; }
        .robot-arm { position:absolute; right:-40px; top:-24px; width:120px; height:120px; z-index:12; transition: transform .28s cubic-bezier(.2,.9,.2,1), right .28s, opacity .28s; transform: rotate(-10deg) scale(0.96); opacity:0; pointer-events:none; filter: drop-shadow(0 18px 40px rgba(0,120,200,0.06)); }
        .robot-arm.show { right:8px; transform: rotate(0deg) scale(1); opacity:1; }

        .card-top { position:relative; height:160px; display:flex; align-items:center; justify-content:center; border-bottom:1px solid rgba(255,255,255,0.02); }
        .avatar { width:120px; height:120px; border-radius:18px; object-fit:cover; transform: translateY(12px); z-index:3; border:2px solid rgba(255,255,255,0.06); box-shadow: 0 10px 30px rgba(0,120,180,0.08); }
        .shine { position:absolute; inset:0; z-index:2; pointer-events:none; transition: background .08s linear; }

        .card-body { padding:14px 16px 18px 16px; display:flex; flex-direction:column; gap:8px; z-index:2; }
        .name { margin:0; font-family: 'Orbitron', sans-serif; color:#e9fbff; font-size:18px; }
        .role { color:#93c9df; font-weight:700; font-size:13px; }
        .bio { color:#aacfe1; font-size:13px; line-height:1.35; margin-top:6px; flex:1; }
        .meta-row { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:8px; }
        .link { color:#d6f7ff; text-decoration:none; font-weight:700; font-size:13px; border:1px solid rgba(255,255,255,0.03); padding:6px 10px; border-radius:999px; background: rgba(0,229,255,0.04); }
        .skills { display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
        .chip { font-size:11px; padding:6px 8px; border-radius:999px; background: rgba(255,255,255,0.02); color:#9edaf0; border:1px solid rgba(255,255,255,0.02); }

        .actions { display:flex; gap:8px; margin-top:10px; justify-content:flex-end; }
        .action { padding:8px 10px; border-radius:10px; background:transparent; border:1px solid rgba(255,255,255,0.03); color:#bfefff; cursor:pointer; font-weight:700; }
        .action:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,229,255,0.04); }
        .action.danger { background: linear-gradient(90deg, rgba(255,40,80,0.06), transparent); border:1px solid rgba(255,40,80,0.08); color:#ffb3b3; }

        @media (prefers-reduced-motion: reduce) { .robot-arm, .card { transition: none; animation: none; } }
      `}</style>
    </article>
  );
}