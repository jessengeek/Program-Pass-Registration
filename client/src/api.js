const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

export async function registerStudent(payload) {
  const res = await fetch(`${API_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function fetchStudents(search, adminKey) {
  const url = new URL(`${API_URL}/api/admin/students`);
  if (search) url.searchParams.set("search", search);
  const res = await fetch(url, { headers: { "x-admin-key": adminKey } });
  return handle(res);
}

export async function fetchStats(adminKey) {
  const res = await fetch(`${API_URL}/api/admin/stats`, {
    headers: { "x-admin-key": adminKey },
  });
  return handle(res);
}

export async function toggleCheckin(id, adminKey) {
  const res = await fetch(`${API_URL}/api/admin/students/${id}/checkin`, {
    method: "PATCH",
    headers: { "x-admin-key": adminKey },
  });
  return handle(res);
}
