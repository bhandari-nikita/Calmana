"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const PAGE_SIZE = 10;

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

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    axios
      .get("http://localhost:5000/api/admin-data/quizzes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setQuizzes(r.data || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return quizzes;

    return quizzes.filter(
      (x) =>
        (x.userId?.username || "").toLowerCase().includes(t) ||
        (x.quizTitle || "").toLowerCase().includes(t)
    );
  }, [quizzes, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function exportCSV() {
    const rows = [["user", "quiz", "score", "max", "percent", "date"]];

    filtered.forEach((q) =>
      rows.push([
        q.userId?.username || "Unknown",
        q.quizTitle || q.quizSlug,
        q.score,
        q.maxScore,
        q.percentage,
        new Date(q.takenAt).toLocaleString(),
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-900">Quizzes</h1>

          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search user or quiz"
              className="border rounded px-3 py-1"
            />

            <button
              onClick={exportCSV}
              className="bg-green-700 text-white px-3 py-1 rounded"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
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
                  <tr key={qi._id} className="border-b hover:bg-green-50">
                    <td className="p-4">{qi.userId?.username || "Unknown"}</td>
                    <td className="p-4">{qi.quizTitle || qi.quizSlug}</td>
                    <td className="p-4">
                      {qi.score}/{qi.maxScore}
                    </td>
                    <td className="p-4">
                      <ScoreBadge pct={Math.round(qi.percentage || 0)} />
                    </td>
                    <td className="p-4">
                      {new Date(qi.takenAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between text-sm">
          <div>{filtered.length} quiz attempts</div>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1 border rounded"
            >
              Prev
            </button>

            <div>
              Page {page} / {totalPages}
            </div>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2 py-1 border rounded"
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
