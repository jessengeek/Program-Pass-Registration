import { useEffect, useState, useCallback } from "react";
import { fetchStudents, fetchStats, toggleCheckin } from "../api.js";

const STORAGE_KEY = "party_admin_key";

export default function Admin() {
  const [adminKey, setAdminKey] = useState(sessionStorage.getItem(STORAGE_KEY) || "");
  const [unlocked, setUnlocked] = useState(!!sessionStorage.getItem(STORAGE_KEY));
  const [keyInput, setKeyInput] = useState("");
  const [authError, setAuthError] = useState("");

  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (q) => {
      try {
        const [list, s] = await Promise.all([fetchStudents(q, adminKey), fetchStats(adminKey)]);
        setStudents(list);
        setStats(s);
        setAuthError("");
      } catch (err) {
        if (err.message === "Incorrect passcode.") {
          sessionStorage.removeItem(STORAGE_KEY);
          setUnlocked(false);
        }
        setAuthError(err.message);
      }
    },
    [adminKey]
  );

  useEffect(() => {
    if (!unlocked) return;
    setLoading(true);
    const t = setTimeout(() => load(search).finally(() => setLoading(false)), 250);
    return () => clearTimeout(t);
  }, [search, unlocked, load]);

  function handleUnlock(e) {
    e.preventDefault();
    sessionStorage.setItem(STORAGE_KEY, keyInput);
    setAdminKey(keyInput);
    setUnlocked(true);
  }

  async function handleCheckin(id) {
    try {
      const updated = await toggleCheckin(id, adminKey);
      setStudents((prev) => prev.map((s) => (s._id === id ? updated : s)));
      setStats((prev) =>
        prev
          ? { ...prev, checkedIn: prev.checkedIn + (updated.checkedIn ? 1 : -1) }
          : prev
      );
    } catch (err) {
      setAuthError(err.message);
    }
  }

  if (!unlocked) {
    return (
      <div className="page">
        <form className="card card--narrow" onSubmit={handleUnlock}>
          <p className="wordmark">Program Pass</p>
          <h1 className="card__title">Door check-in</h1>
          <p className="card__subtitle">Enter the passcode to open the guest list.</p>
          <label className="field">
            <span>Passcode</span>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              autoFocus
            />
          </label>
          {authError && <p className="error">{authError}</p>}
          <button type="submit">Unlock</button>
        </form>
      </div>
    );
  }

  return (
    <div className="page page--admin">
      <div className="admin">
        <div className="admin__header">
          <p className="wordmark">Program Pass</p>
          {stats && (
            <p className="admin__stats">
              {stats.checkedIn} / {stats.total} checked in
            </p>
          )}
        </div>

        <input
          className="admin__search"
          placeholder="Search by name or code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        {authError && <p className="error">{authError}</p>}

        <ul className="guest-list">
          {students.map((s) => (
            <li key={s._id} className="guest-row">
              <img className="guest-row__photo" src={s.photo} alt="" />
              <div className="guest-row__info">
                <p className="guest-row__name">{s.name}</p>
                <p className="guest-row__meta">
                  {s.className || "—"} · <span className="mono">{s.code}</span>
                </p>
              </div>
              <button
                className={s.checkedIn ? "checkin checkin--done" : "checkin"}
                onClick={() => handleCheckin(s._id)}
              >
                {s.checkedIn ? "Checked in" : "Check in"}
              </button>
            </li>
          ))}
          {!loading && students.length === 0 && (
            <p className="guest-list__empty">No matching registrations.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
