import { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import TeamCard from "../components/TeamCard";
import TeamModal from "../components/TeamModal";
import TeamForm from "../components/TeamForm";
import RobotAnimator from "../components/RobotAnimator";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function TeamPage() {

  /* ---------------- STATE ---------------- */

  const [team, setTeam] = useState([]);
  const [meta, setMeta] = useState({ total: 0, offset: 0, limit: 8 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("created_at");
  const [roleFilter, setRoleFilter] = useState("all");

  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [page, setPage] = useState(0);
  const limit = 8;

  const debounceRef = useRef(null);


  /* ---------------- DATA FETCH ---------------- */

  useEffect(() => {

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchPage();
    }, 350);

    return () => clearTimeout(debounceRef.current);

  }, [page, query, sort, roleFilter]);


  async function fetchPage() {

    setLoading(true);
    setError(null);

    try {

      const offset = page * limit;

      const q = query ? `&q=${encodeURIComponent(query)}` : "";
      const r = roleFilter !== "all" ? `&role=${roleFilter}` : "";
      const s = sort ? `&sort=${sort}` : "";

      const metaR = await fetch(`${API}/team/meta?offset=${offset}&limit=${limit}${q}${r}${s}`);

      if (!metaR.ok) throw new Error("Metadata request failed");

      const metaJson = await metaR.json();
      setMeta(metaJson);

      const itemsR = await fetch(`${API}/team?offset=${offset}&limit=${limit}${q}${r}${s}`);

      if (!itemsR.ok) throw new Error("Team request failed");

      const itemsJson = await itemsR.json();

      setTeam(itemsJson);

    } catch (err) {

      setError(err.message || "Unknown error");

    } finally {

      setLoading(false);

    }

  }


  /* ---------------- CRUD ---------------- */

  async function handleCreate(data) {

    setShowForm(false);

    const temp = {
      ...data,
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setTeam((s) => [temp, ...s]);

    try {

      const r = await fetch(`${API}/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!r.ok) throw new Error("Save failed");

      const saved = await r.json();

      setTeam((s) => [saved, ...s.filter((m) => !String(m.id).startsWith("temp-"))]);

      fetchPage();

    } catch (err) {

      setError(err.message);
      setTeam((s) => s.filter((m) => !String(m.id).startsWith("temp-")));

    }

  }


  async function handleUpdate(id, payload) {

    setEditing(null);
    setShowForm(false);

    setTeam((s) =>
      s.map((m) =>
        m.id === id
          ? { ...m, ...payload, updated_at: new Date().toISOString() }
          : m
      )
    );

    try {

      const r = await fetch(`${API}/team/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!r.ok) throw new Error("Update failed");

      const updated = await r.json();

      setTeam((s) => s.map((m) => (m.id === id ? updated : m)));

      fetchPage();

    } catch (err) {

      setError(err.message);
      fetchPage();

    }

  }


  async function handleDelete(id) {

    if (!confirm("Delete this team member?")) return;

    const prev = team;

    setTeam((s) => s.filter((m) => m.id !== id));

    try {

      const r = await fetch(`${API}/team/${id}`, { method: "DELETE" });

      if (r.status !== 204) throw new Error("Delete failed");

      fetchPage();

    } catch (err) {

      setError(err.message);
      setTeam(prev);

    }

  }


  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / limit));


  /* ---------------- RENDER ---------------- */

  return (
    <div className="page">

      <Header
        onOpenManage={() => {
          setShowForm(true);
          setEditing(null);
        }}
      />

      <RobotAnimator interactive={false} size={170} />

      <main className="container">


        {/* CONTROL BAR */}

        <section className="controls">

          <div className="search">

            <input
              placeholder="Search name, role, skill..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
            />

            <button
              onClick={() => {
                setQuery("");
                setPage(0);
              }}
            >
              Clear
            </button>

          </div>


          <div className="filters">

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="all">All roles</option>
              <option value="engineer">Engineer</option>
              <option value="researcher">Researcher</option>
              <option value="designer">Designer</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="created_at">Newest</option>
              <option value="name">Name</option>
              <option value="role">Role</option>
            </select>

          </div>


          <div className="actions">

            <button
              className="btn-add"
              onClick={() => {
                setShowForm(true);
                setEditing(null);
              }}
            >
              + Add Member
            </button>

          </div>

        </section>


        {/* LOADING */}

        {loading && (

          <div className="grid">

            {Array.from({ length: limit }).map((_, i) => (
              <div className="skeleton" key={i} />
            ))}

          </div>

        )}


        {/* ERROR */}

        {error && <div className="error">⚠ {error}</div>}


        {/* TEAM GRID */}

        {!loading && !error && (

          <section className="grid">

            {team.map((m) => (

              <TeamCard
                key={m.id}
                member={m}
                onOpen={() => setSelected(m)}
                onEdit={() => {
                  setEditing(m);
                  setShowForm(true);
                }}
                onDelete={() => handleDelete(m.id)}
              />

            ))}

          </section>

        )}


        {/* PAGINATION */}

        <div className="pager">

          <div className="info">
            Page {page + 1} / {totalPages} — {meta.total || 0} members
          </div>

          <div className="pager-controls">

            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Prev
            </button>

            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </button>

          </div>

        </div>

      </main>


      {/* MODALS */}

      {selected && (
        <TeamModal
          member={selected}
          onClose={() => setSelected(null)}
          onEdit={() => {
            setEditing(selected);
            setShowForm(true);
            setSelected(null);
          }}
        />
      )}

      {showForm && (
        <TeamForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}


      {/* ---------------- STYLES ---------------- */}

      <style jsx>{`

        .page{
          min-height:100vh;
          background:
          radial-gradient(circle at 20% 10%,rgba(0,200,255,0.05),transparent 40%),
          radial-gradient(circle at 90% 80%,rgba(120,60,255,0.06),transparent 40%),
          linear-gradient(180deg,#02040a,#061025);
          color:#dbefff;
          padding-bottom:80px;
        }


        .controls{
          display:flex;
          justify-content:space-between;
          gap:16px;
          margin:30px 0;
          flex-wrap:wrap;
        }


        .search{
          display:flex;
          gap:8px;
        }


        .search input{
          padding:10px 12px;
          border-radius:10px;
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.05);
          color:white;
          min-width:240px;
        }


        .filters{
          display:flex;
          gap:8px;
        }


        .filters select{
          padding:10px;
          border-radius:8px;
          background:rgba(255,255,255,0.03);
          color:white;
          border:1px solid rgba(255,255,255,0.05);
        }


        .btn-add{
          padding:10px 16px;
          border-radius:10px;
          border:none;
          font-weight:700;
          background:linear-gradient(90deg,#00e5ff,#7b5cff);
          color:black;
          cursor:pointer;
        }


        .grid{
          display:grid;
          grid-template-columns:repeat(1,1fr);
          gap:18px;
        }

        @media(min-width:640px){
          .grid{grid-template-columns:repeat(2,1fr);}
        }

        @media(min-width:1024px){
          .grid{grid-template-columns:repeat(4,1fr);}
        }


        .skeleton{
          height:320px;
          border-radius:14px;
          background:linear-gradient(90deg,#071023,#0a1730);
          animation:pulse 1.6s infinite;
        }

        @keyframes pulse{
          0%{opacity:0.9}
          50%{opacity:0.6}
          100%{opacity:0.9}
        }


        .pager{
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-top:20px;
        }


        .pager-controls button{
          padding:8px 14px;
          border-radius:8px;
          border:1px solid rgba(255,255,255,0.08);
          background:transparent;
          color:#9fd8ff;
        }


        .error{
          color:#ff8080;
          margin:12px 0;
        }

      `}</style>

    </div>
  );
}