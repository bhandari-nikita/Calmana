// calmana-frontend/app/admin/journals/page.js
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

export default function AdminJournalsPage() {
  const [journals, setJournals] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin-data/journals`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(r => setJournals(r.data || []))
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
    const term = q.trim().toLowerCase();
    if (!term) return journals;

    return journals.filter(j =>
      (j.user?.username || "guest").toLowerCase().includes(term) ||
      formatISTDateTime(j.createdAt).toLowerCase().includes(term)
    );

  }, [journals, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  function exportCSV() {
    const rows = [["user", "date_time", "privacy"]];

    filtered.forEach(j =>
      rows.push([
        j.user?.username || "Guest",
        formatISTDateTime(j.createdAt),
        "Encrypted - content not stored",
      ])
    );

    const csv = rows
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "journals.csv";
    a.click();
    URL.revokeObjectURL(url);
  }


  return (
    <div className="space-y-4 pb-8 w-full lg:max-w-6xl lg:mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-4"
      >

        {/* HEADER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-green-900">Journals</h1>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              value={q}
              onChange={e => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search by username"
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


        {/* TABLE (DESKTOP) */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden hidden md:block">
          <table className="min-w-full table-auto">
            <thead className="bg-green-50 text-left text-sm text-green-800">
              <tr>
                <th className="p-4">User</th>

                <th className="p-4 w-48">Date</th>

                <th className="p-4">Info</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="p-4">Loading…</td></tr>
              ) : current.length === 0 ? (
                <tr><td colSpan={3} className="p-4">No journals.</td></tr>
              ) : (
                current.map(j => (
                  <tr
                    key={j._id}
                    className="border-b last:border-none hover:bg-green-50 transition"
                  >
                    <td className="p-4">
                      {j.user ? (
                        <span
                          className="text-green-700 cursor-pointer hover:underline"
                          onClick={() =>
                            window.location.href = `/admin/users?q=${j.user.username}`
                          }
                        >
                          {j.user.username}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Guest</span>
                      )}
                    </td>

                    <td className="p-4 w-88">
                      {new Date(j.createdAt).toLocaleString()}
                    </td>


                    <td className="p-4 text-sm text-gray-600">
                      Encrypted — metadata only
                    </td>
                  </tr>

                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : current.length === 0 ? (
            <p className="text-sm text-gray-500">No journals.</p>
          ) : (
            current.map(j => (
              <div key={j._id} className="bg-white border border-green-100 rounded-xl p-4 shadow-sm">
                <p className="font-semibold text-gray-800">
                  {j.user?.username || "Guest"}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {new Date(j.createdAt).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Encrypted — metadata only
                </p>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION */}
        <div className="px-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center justify-center sm:justify-start gap-3">

            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-2 py-1 rounded border transition ${page === 1
                ? "text-gray-300 border-gray-200 cursor-not-allowed"
                : "text-gray-700 border-green-300 hover:bg-green-100"
                }`}
            >
              ←
            </button>

            <span className="text-sm text-gray-600">
              Page {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-2 py-1 rounded border transition ${page === totalPages
                ? "text-gray-300 border-gray-200 cursor-not-allowed"
                : "text-gray-700 border-green-300 hover:bg-green-100"
                }`}
            >
              →
            </button>
          </div>

          <span className="text-xs text-gray-400">
            {filtered.length} journals
          </span>
        </div>

      </motion.div>
    </div>
  );
}
