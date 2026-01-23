//calmana-frontend/app/admin/moods/page.js
"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function MoodBadge({ m }) {
  const map = {
    Happy: "bg-yellow-100 text-amber-800",
    Sad: "bg-blue-100 text-blue-800",
    Angry: "bg-red-100 text-red-800",
    Excited: "bg-orange-100 text-orange-800",
    Tired: "bg-violet-100 text-violet-800",
    Calm: "bg-teal-100 text-teal-800",
    Neutral: "bg-beige-100 text-beige-800"
  };
  return <span className={`px-2 py-1 rounded text-xs ${map[m] || "bg-gray-100 text-gray-800"}`}>{m}</span>;
}

function formatISTDateTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminMoodsPage() {
  const [moods, setMoods] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) { window.location.href = "/admin/login"; return; }
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-data/moods`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setMoods(r.data || []))
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
    if (!t) return moods;
    return moods.filter(m => (m.user?.username || "").toLowerCase().includes(t) || (m.mood || "").toLowerCase().includes(t) || formatISTDate(m.timestamp).toLowerCase().includes(t)
    );
  }, [moods, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  function exportCSV() {
    const rows = [["user", "mood", "value", "date"]];
    filtered.forEach(m =>
      rows.push([
        m.user?.username || "Unknown",
        m.mood,
        m.moodValue,
        formatISTDateTime(m.timestamp),
      ])
    );

    const csv = rows.map(r => r.map(c => `"${(c || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const b = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(b); const a = document.createElement("a"); a.href = url; a.download = "moods.csv"; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <h1 className="text-2xl font-bold text-green-900">Moods</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">

          <input value={q} onChange={e => { setQ(e.target.value); setPage(1) }} placeholder="Search user/mood/date" className="border rounded px-3 py-2 w-full sm:w-64" />
          <button onClick={exportCSV} className="bg-emerald-600 text-white px-3 py-1 rounded">Export CSV</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full table-auto">
            <thead className="bg-green-50 text-left text-sm text-green-800">
              <tr><th className="p-4">User</th><th className="p-4">Mood</th><th className="p-4">Value</th><th className="p-4">Date</th></tr>
            </thead>
            <tbody>
              {loading ? (<tr><td colSpan={4} className="p-4">Loading...</td></tr>) : current.length === 0 ? (<tr><td colSpan={4} className="p-4">No entries.</td></tr>) : current.map(m => (
                <tr key={m._id} className="border-b last:border-none hover:bg-green-50">
                  <td className="p-4">
                    {m.user ? (
                      <span
                        className="text-green-700 cursor-pointer hover:underline"
                        onClick={() =>
                          window.location.href = `/admin/users?q=${m.user.username}`
                        }
                      >
                        {m.user.username}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Unknown</span>
                    )}
                  </td>
                  <td className="p-4"><MoodBadge m={m.mood} /></td>
                  <td className="p-4">{m.moodValue}</td>
                  <td className="p-4">
                    {formatISTDateTime(m.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : current.length === 0 ? (
            <p className="text-sm text-gray-500">No entries.</p>
          ) : (
            current.map(m => (
              <div key={m._id} className="bg-white border border-green-100 rounded-xl p-4 shadow-sm">
                <p
                  className={`font-semibold ${m.user ? "text-green-700 cursor-pointer hover:underline" : "text-gray-400 italic"
                    }`}
                  onClick={() => {
                    if (m.user) {
                      window.location.href = `/admin/users?q=${m.user.username}`;
                    }
                  }}
                >
                  {m.user?.username || "Guest"}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <MoodBadge m={m.mood} />
                  <span className="text-sm text-gray-700">
                    Value: <strong>{m.moodValue}</strong>
                  </span>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  formatISTDateTime(m.timestamp).toLowerCase().includes(t)
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PAGINATION */}
      <div className="px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* PREVIOUS */}
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className={`
                px-2 py-1 rounded border transition
                ${page === 1
                ? "text-gray-300 border-gray-200 cursor-not-allowed"
                : "text-gray-700 border-green-300 hover:bg-green-100"
              }
              `}>
            ←
          </button>

          <span className="text-sm text-gray-600">
            Page {page} / {totalPages}
          </span>

          {/* NEXT */}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
            className={`
                px-2 py-1 rounded border transition
                ${page === totalPages
                ? "text-gray-300 border-gray-200 cursor-not-allowed"
                : "text-gray-700 border-green-300 hover:bg-green-100"
              }
              `}>
            →
          </button>
        </div>

        <span className="text-xs text-gray-400">
          {filtered.length} entries
        </span>
      </div>
    </motion.div>
  );
}
