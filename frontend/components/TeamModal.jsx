// frontend/components/TeamModal.jsx
import React from "react";

export default function TeamModal({ member, onClose = () => {}, onEdit = () => {} }) {
  if (!member) return null;
  const avatar = member.photo_url || `https://robohash.org/${encodeURIComponent(member.name)}.png?set=set2&size=400x400`;

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={`${member.name} profile`}>
      <div className="modal holo">
        <button className="close" onClick={onClose} aria-label="Close">&times;</button>

        <div className="projector">
          <div className="base" />
          <div className="beam" />
          <div className="hologram">
            <img src={avatar} alt={`${member.name}`} className="avatar" />
            <div className="meta">
              <h2 className="name">{member.name}</h2>
              <div className="role">{member.role}</div>
              <p className="bio">{member.bio}</p>
            </div>
          </div>
        </div>

        <div className="controls">
          <button className="btn" onClick={() => onEdit()}>Edit</button>
          <a className="btn" href={member.linkedin || "#"} target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </div>

      <style jsx>{`
        .overlay { position:fixed; inset:0; display:grid; place-items:center; z-index:1200; background: linear-gradient(180deg, rgba(0,0,0,0.44), rgba(0,0,0,0.68)); padding:24px; }
        .modal { width:100%; max-width:900px; padding:18px; border-radius:12px; border:1px solid rgba(255,255,255,0.03); box-shadow: 0 30px 80px rgba(0,0,0,0.75); background: linear-gradient(180deg, rgba(6,12,20,0.92), rgba(7,14,26,0.9)); position:relative; }

        .close { position:absolute; right:12px; top:8px; font-size:26px; border:none; background:transparent; color:#e6fbff; cursor:pointer; }

        .projector { display:flex; gap:20px; align-items:flex-start; padding-top:10px; }
        .base { width:72px; height:72px; border-radius:10px; background:linear-gradient(90deg,#02141b,#042031); box-shadow: 0 12px 30px rgba(0,0,0,0.6); position:relative; flex:0 0 72px; }
        .beam { width:0; height:0; border-left: 180px solid transparent; border-right: 180px solid transparent; border-top: 220px solid rgba(0,229,255,0.04); transform: translateY(-18px); filter: blur(8px); position:relative; z-index:1; }
        .hologram { position:relative; transform-origin:center; width:100%; display:flex; gap:18px; align-items:center; z-index:2; }
        .avatar { width:140px; height:140px; border-radius:12px; object-fit:cover; border:2px solid rgba(255,255,255,0.04); box-shadow: 0 16px 48px rgba(0,120,200,0.06); }
        .meta { display:flex; flex-direction:column; gap:6px; }
        .name { margin:0; font-family:'Orbitron', sans-serif; color:#e9fbff; font-size:20px; }
        .role { color:#93c9df; font-weight:700; }
        .bio { color:#bfe8f8; max-width:48ch; }

        .beam { animation: beamFlicker 3.2s ease-in-out infinite; }
        @keyframes beamFlicker { 0%{ opacity:0.06; transform: translateY(-18px) scaleY(1); } 50%{ opacity:0.09; transform: translateY(-20px) scaleY(1.01); } 100%{ opacity:0.06; transform: translateY(-18px) scaleY(1); } }

        .controls { display:flex; gap:10px; margin-top:14px; justify-content:flex-end; }
        .btn { padding:10px 14px; border-radius:10px; background: linear-gradient(90deg,#00e5ff,#7b5cff); border:none; color:#00141a; font-weight:700; cursor:pointer; }

        @media (max-width:760px) {
          .projector { flex-direction:column; align-items:center; }
          .hologram { flex-direction:column; text-align:center; }
          .avatar { width:120px; height:120px; }
        }
      `}</style>
    </div>
  );
}