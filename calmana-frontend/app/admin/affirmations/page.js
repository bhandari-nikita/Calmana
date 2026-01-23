//calmana-frontend/app/admin/affirmations/page.js
"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

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


export default function AdminAffirmationsPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) { window.location.href = "/admin/login"; return; }
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-data/affirmations`, { headers: { Authorization: `Bearer ${token}` } })
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
    return items.filter(a => (a.userId?.username || "").toLowerCase().includes(t) || (a.affirmation || "").toLowerCase().includes(t));
  }, [items, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  function exportCSV() {
    const rows = [["user", "affirmation", "date_time"]];

    filtered.forEach(a => {
      rows.push([
        a.userId?.username || "Guest",
        a.text || "",                  // ← THIS STAYS
        formatISTDateTime(a.createdAt)
      ]);
    });

    const csv = rows
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "affirmations.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-green-900">Affirmations</h1>
        <div className="flex items-center gap-2">
          <input value={q} onChange={e => { setQ(e.target.value); setPage(1) }} placeholder="Search user or affirmation" className="border rounded px-3 py-1" />
          <button onClick={exportCSV} className="bg-emerald-600 text-white px-3 py-1 rounded">Export CSV</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden hidden md:block">
        <table className="min-w-full table-auto">
          <thead className="bg-green-50 text-left text-sm text-green-800">
            <tr><th className="p-4">User</th><th className="p-4">Affirmation</th><th className="p-4">Date</th></tr>
          </thead>
          <tbody>
            {loading ? (<tr><td colSpan={3} className="p-4">Loading...</td></tr>) : current.length === 0 ? (<tr><td colSpan={3} className="p-4">No records.</td></tr>) : current.map(a => (
              <tr key={a._id} className="border-b hover:bg-green-50">
                <td className="p-4">
                  {a.userId ? (
                    <span
                      className="text-green-700 cursor-pointer hover:underline"
                      onClick={() =>
                        window.location.href = `/admin/users?q=${a.userId.username}`
                      }
                    >
                      {a.userId.username}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">Guest</span>
                  )}
                </td>

                <td className="p-4">{a.text}</td>
                <td className="p-4">{formatISTDateTime(a.createdAt)}</td>

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
          <p className="text-sm text-gray-500">No affirmations.</p>
        ) : (
          current.map(a => (
            <div
              key={a._id}
              className="bg-white border border-green-100 rounded-xl p-4 shadow-sm"
            >
              <p
                className={`font-semibold ${a.userId
                  ? "text-green-700 cursor-pointer hover:underline"
                  : "text-gray-400 italic"
                  }`}
                onClick={() => {
                  if (a.userId) {
                    window.location.href = `/admin/users?q=${a.userId.username}`;
                  }
                }}
              >
                {a.userId?.username || "Guest"}
              </p>

              <p className="text-sm text-gray-700 mt-2">
                {a.text}
              </p>

              <p className="text-xs text-gray-500 mt-2">
                {formatISTDateTime(a.createdAt)}
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
          {filtered.length} affirmations
        </span>
      </div>
    </motion.div>
  );
}
