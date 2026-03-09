export default function Header({ onOpenManage = () => {} }) {
  return (
    <header className="header">
      <div className="brand">
        <div className="logo-blob" aria-hidden />
        <div className="meta">
          <div className="title">ARMATRIX</div>
          <div className="tag">Robotic Systems • Team</div>
        </div>
      </div>

      <nav className="nav">
        <a href="/team" className="nav-link">Team</a>
        <button className="nav-link manage" onClick={onOpenManage}>Manage</button>
      </nav>

      <style jsx>{`
        .header {
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding: 18px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .brand { display:flex; align-items:center; gap:12px; }
        .logo-blob {
          width:48px; height:48px; border-radius:10px;
          background-image: linear-gradient(135deg,#00e5ff, #7b5cff);
          box-shadow: 0 8px 30px rgba(0,229,255,0.08), 0 0 30px rgba(123,92,255,0.06);
          transform: rotate(-12deg);
        }
        .title { font-family: 'Orbitron', sans-serif; font-weight:700; color:#cfefff; letter-spacing:1px; }
        .tag { font-size:12px; color:#86b0c6; margin-top:2px; }
        .nav { display:flex; gap:14px; align-items:center; }
        .nav-link { color:#a9d7ee; text-decoration:none; padding:8px 12px; border-radius:8px; font-weight:600; border:1px solid rgba(255,255,255,0.02); background:transparent; }
        .nav-link.manage { cursor:pointer; background: linear-gradient(90deg,#00e5ff11,#7b5cff11); }
        .nav-link:hover { transform: translateY(-2px); transition: all .16s; }
      `}</style>
    </header>
  );
}