// calmana-frontend/app/admin/quizzes/page.js
"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function formatQuizEventDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}


function ScoreBadge({ pct }) {
  const color =
    pct >= 80
      ? "bg-green-100 text-green-800"
      : pct >= 50
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";
  return <span className={`px-2 py-1 rounded text-xs ${color}`}>{pct}%</span>;
}

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
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
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-data/quizzes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setQuizzes(r.data || []))
      .catch((e) => console.error(e))
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
    if (!t) return quizzes;

    return quizzes.filter(
      (x) =>
        (x.userId?.username || "").toLowerCase().includes(t) ||
        (x.quizTitle || x.quizSlug || "").toLowerCase().includes(t)
    );

  }, [quizzes, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  function exportCSV() {
    const rows = [["user", "quiz", "score", "max", "percent", "taken_at"]];

    filtered.forEach((q) =>
      rows.push([
        q.userId?.username || "Guest",
        q.quizTitle || q.quizSlug,
        q.score,
        q.maxScore,
        Math.round(q.percentage || 0),
        formatQuizEventDate(q.takenAt),
      ])

    );

    const csv = rows
      .map((r) =>
        r
          .map((c) => `"${(c || "").toString().replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const b = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(b);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quizzes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* ANIMATED SECTION INSIDE A STATIC WRAPPER */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-green-900">Quizzes</h1>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search user or quiz"
              className="border rounded px-3 py-2 w-full sm:w-64"
            />

            <button
              onClick={exportCSV}
              className="bg-emerald-600 text-white px-3 py-1 rounded"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto hidden md:block">

          <table className="min-w-full table-auto">
            <thead className="bg-green-50 text-left text-sm text-green-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Quiz</th>
                <th className="p-4">Score</th>
                <th className="p-4">Percent</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-4">
                    Loading...
                  </td>
                </tr>
              ) : current.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4">
                    No records.
                  </td>
                </tr>
              ) : (
                current.map((qi) => (
                  <tr key={qi._id} className="border-b last:border-none hover:bg-green-50">
                    <td className="p-4">
                      {qi.userId ? (
                        <span
                          className="text-green-700 cursor-pointer hover:underline"
                          onClick={() =>
                            window.location.href = `/admin/users?q=${qi.userId.username}`
                          }
                        >
                          {qi.userId.username}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Guest</span>
                      )}
                    </td>

                    <td className="p-4">{qi.quizTitle || qi.quizSlug}</td>
                    <td className="p-4">
                      {qi.score}/{qi.maxScore}
                    </td>
                    <td className="p-4">
                      <ScoreBadge pct={Math.round(qi.percentage || 0)} />
                    </td>
                    <td className="p-4">
                      {formatQuizEventDate(qi.takenAt)}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : current.length === 0 ? (
            <p className="text-sm text-gray-500">No attempts.</p>
          ) : (
            current.map(qi => (
              <div
                key={qi._id}
                className="bg-white border border-green-100 rounded-xl p-4 shadow-sm"
              >
                <p className="font-semibold text-green-800">
                  {qi.userId?.username || "Guest"}
                </p>

                <p className="text-sm text-gray-700 mt-1">
                  <strong>{qi.quizTitle || qi.quizSlug}</strong>
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {qi.score}/{qi.maxScore}
                  </span>
                  <ScoreBadge pct={Math.round(qi.percentage || 0)} />
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  {formatQuizEventDate(qi.takenAt)}
                </p>

              </div>
            ))
          )}
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
            {filtered.length} attempts
          </span>
        </div>
      </motion.div>
    </div>
  );
}
