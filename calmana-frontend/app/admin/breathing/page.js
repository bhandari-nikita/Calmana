//calmana-frontend/app/admin/breathing/page.js
"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function formatBreathingEventDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function AdminBreathingPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) { window.location.href = "/admin/login"; return; }
    axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin-data/breathing`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(r => setItems(r.data || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function updatePageSize() {
      const viewportHeight = window.innerHeight;
      // header + filters + pagination ≈ 320px
      const usableHeight = viewportHeight - 320;
      const rows = Math.max(7, Math.floor(usableHeight / 56));
      setPageSize(rows);
    }
    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter(i => (i.userId?.username || "Guest").toLowerCase().includes(t)
      || String(i.cyclesCompleted).includes(t));
  }, [items, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  function exportCSV() {
    const rows = [["username", "cycles_completed", "session_at"]];
    filtered.forEach(x => rows.push([x.userId?.username || "Guest", x.cyclesCompleted, formatBreathingEventDate(x.createdAt)]));
    const csv = rows.map(r => r.map(c => `"${(c || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const b = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(b); const a = document.createElement("a"); a.href = url; a.download = "breathing.csv"; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4 pb-8 w-full lg:max-w-6xl lg:mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-green-900">
            Breathing Sessions
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search by username or cycles"
              className="border rounded px-3 py-2 w-full sm:w-64"
            />

            <button
              onClick={exportCSV}
              className="bg-emerald-600 text-white px-4 py-2 rounded transition"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden hidden md:block">
          <table className="min-w-full table-auto">
            <thead className="bg-green-50 text-left text-sm text-green-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Cycles</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="p-4">Loading...</td></tr>
              ) : current.length === 0 ? (
                <tr><td colSpan={3} className="p-4">No sessions.</td></tr>
              ) : current.map(s => (
                <tr key={s._id} className="border-b last:border-none hover:bg-green-50 transition">
                  <td className="p-4">
                    {s.userId ? (
                      <span
                        className="text-green-700 cursor-pointer hover:underline"
                        onClick={() =>
                          window.location.href = `/admin/users?q=${s.userId.username}`
                        }
                      >
                        {s.userId.username}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Guest</span>
                    )}
                  </td>
                  <td className="p-4">{s.cyclesCompleted}</td>
                  <td className="p-4">{formatBreathingEventDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : current.length === 0 ? (
            <p className="text-sm text-gray-500">No sessions.</p>
          ) : (
            current.map(s => (
              <div
                key={s._id}
                className="bg-white border border-green-100 rounded-xl p-4 shadow-sm"
              >
                <p
                  className={`font-semibold ${s.userId
                    ? "text-green-700 cursor-pointer hover:underline"
                    : "text-gray-400 italic"
                    }`}
                  onClick={() => {
                    if (s.userId) {
                      window.location.href = `/admin/users?q=${s.userId.username}`;
                    }
                  }}
                >
                  {s.userId ? s.userId.username : "Guest"}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Cycles: <span className="font-medium">{s.cyclesCompleted}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatBreathingEventDate(s.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>

        <div className=" px-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`
                px-2 py-1 rounded border transition
                ${page === 1
                  ? "text-gray-300 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-green-300 hover:bg-green-100"
                }
              `}
            >
              ←
            </button>

            <span className="text-sm text-gray-600">
              Page {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`
                px-2 py-1 rounded border transition
                ${page === totalPages
                  ? "text-gray-300 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-green-300 hover:bg-green-100"
                }
            `}
            >
              →
            </button>
          </div>

          <span className="text-xs text-gray-400">
            {filtered.length} sessions
          </span>
        </div>
      </motion.div>
    </div>
  );
}
