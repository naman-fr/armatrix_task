import React, { useEffect, useState } from "react";

/**
 * TeamForm
 * - initial: optional member for editing
 * - onCreate: callback with object
 * - onUpdate: callback (id, payload)
 */
export default function TeamForm({ initial = null, onClose = () => {}, onCreate = () => {}, onUpdate = () => {} }) {
  const [form, setForm] = useState({
    name: "",
    role: "",
    bio: "",
    photo_url: "",
    linkedin: "",
    skills: "",
  });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || "",
        role: initial.role || "",
        bio: initial.bio || "",
        photo_url: initial.photo_url || "",
        linkedin: initial.linkedin || "",
        skills: (initial.skills || []).join(", "),
      });
      setPreview(initial.photo_url || null);
    }
  }, [initial]);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name required";
    if (!form.role.trim()) e.role = "Role required";
    // optional: more validation for urls
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (name === "photo_url") setPreview(value || null);
  }

  async function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      bio: form.bio.trim(),
      photo_url: form.photo_url || null,
      linkedin: form.linkedin || null,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (initial && initial.id) {
        await onUpdate(initial.id, payload);
      } else {
        await onCreate(payload);
      }
      onClose();
    } catch (err) {
      setErrors({ submit: err.message || String(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={initial ? `Edit ${initial.name}` : "Add team member"}>
      <form className="form" onSubmit={submit}>
        <div className="head">
          <h3>{initial ? "Edit member" : "Add new member"}</h3>
          <button type="button" className="close" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <div className="grid">
          <label>
            <div className="label">Name</div>
            <input name="name" value={form.name} onChange={handleChange} />
            {errors.name && <div className="err">{errors.name}</div>}
          </label>

          <label>
            <div className="label">Role</div>
            <input name="role" value={form.role} onChange={handleChange} />
            {errors.role && <div className="err">{errors.role}</div>}
          </label>

          <label className="full">
            <div className="label">Bio</div>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} />
          </label>

          <label>
            <div className="label">Photo URL</div>
            <input name="photo_url" value={form.photo_url} onChange={handleChange} placeholder="https://..." />
            {preview && <img src={preview} alt="preview" className="preview" />}
          </label>

          <label>
            <div className="label">LinkedIn</div>
            <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
          </label>

          <label className="full">
            <div className="label">Skills (comma separated)</div>
            <input name="skills" value={form.skills} onChange={handleChange} placeholder="react, python, embedded" />
          </label>
        </div>

        <div className="foot">
          {errors.submit && <div className="err">{errors.submit}</div>}
          <div className="actions">
            <button type="button" className="btn subtle" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary" disabled={saving}>{saving ? "Saving..." : (initial ? "Save" : "Create")}</button>
          </div>
        </div>
      </form>

      <style jsx>{`
        .overlay { position:fixed; inset:0; z-index:1000; display:grid; place-items:center; background: linear-gradient(180deg, rgba(0,0,0,0.34), rgba(0,0,0,0.6)); padding:24px; }
        .form { width:100%; max-width:820px; background: linear-gradient(180deg, rgba(8,14,24,0.95), rgba(6,12,20,0.95)); border:1px solid rgba(255,255,255,0.04); padding:18px; border-radius:12px; box-shadow: 0 26px 80px rgba(0,0,0,0.7); }
        .head { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
        .close { background:transparent; border:none; color:#d6f7ff; font-size:26px; cursor:pointer; }
        h3 { margin:0; font-family: 'Orbitron', sans-serif; color:#e9fbff; }

        .grid { display:grid; gap:12px; grid-template-columns: repeat(2, minmax(0,1fr)); }
        .grid .full { grid-column: 1 / -1; }
        label { display:flex; flex-direction:column; gap:6px; }
        .label { color:#9fd3eb; font-size:13px; }
        input, textarea { padding:10px 12px; border-radius:10px; background:rgba(255,255,255,0.02); color:#dbefff; border:1px solid rgba(255,255,255,0.03); }
        textarea { resize:vertical; min-height:80px; }

        .preview { margin-top:8px; width:100%; max-width:160px; border-radius:10px; border:1px solid rgba(255,255,255,0.03); }

        .foot { margin-top:12px; display:flex; justify-content:space-between; align-items:center; gap:12px; }
        .err { color:#ffb4b4; font-size:13px; }
        .actions { display:flex; gap:10px; }
        .btn { padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.03); cursor:pointer; }
        .btn.primary { background: linear-gradient(90deg,#00e5ff,#7b5cff); color:#00141a; font-weight:700; border:none; }
        .btn.subtle { background:transparent; color:#9fbfd6; }

        @media(max-width:760px) { .grid { grid-template-columns: 1fr; } .preview { max-width:100px; } }
      `}</style>
    </div>
  );
}