//calmana-frontend/app/admin/users/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";



export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
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
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-data/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setUsers(r.data || []))
      .catch((err) => console.error(err))
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
    if (!t) return users;

    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(t) ||
        u.email.toLowerCase().includes(t)
    );
  }, [users, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  function exportCSV() {
    const rows = [["username", "email", "joined"]];

    filtered.forEach((u) =>
      rows.push([
        u.username,
        u.email,
        new Date(u.createdAt).toLocaleDateString(),
      ])
    );

    const csv = rows
      .map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  async function deleteUser(id) {
    if (!confirm("This will permanently delete the user and all their data. Continue?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin-data/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert("Delete failed.");
      console.error(err);
    }
  }

  return (
    <div className="space-y-4 pb-8 w-full lg:max-w-6xl lg:mx-auto">

      {/* ANIMATED CONTENT WRAPPED INSIDE STATIC DIV */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-4"
      >
        {/* HEADER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-green-900">Users</h1>
          <div className="flex items-center gap-2">

            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search username or email"
              className="border rounded px-3 py-1 w-full sm:w-auto"
            />

            <button
              onClick={exportCSV}
              className="bg-emerald-600 text-white border border-gray-300 hover:bg-gray-200 hover:text-green-800 hover:border-green-900 px-3 py-1 rounded transition"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* DESKTOP TABLE */}
          <div className="hidden md:block">
            <table className="min-w-full table-auto">
              <thead className="bg-green-50 text-left text-sm text-green-800">
                <tr>
                  <th className="p-4">Username</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-4">Loading…</td>
                  </tr>
                ) : current.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4">No matching users found.</td>
                  </tr>
                ) : (
                  current.map((u) => (
                    <tr key={u._id} className="border-b last:border-none hover:bg-gray-100">
                      <td className="p-4">{u.username}</td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4">
                        {new Date(u.createdAt).toISOString().split("T")[0]}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => deleteUser(u._id)}
                          className="text-sm text-red-600 border border-red-200 px-3 py-1 rounded hover:bg-red-50 hover:border-red-300 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-3 p-3">
            {loading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : current.length === 0 ? (
              <p className="text-sm text-gray-500">No matching users found.</p>
            ) : (
              current.map((u) => (
                <div
                  key={u._id}
                  className="bg-white border rounded-lg p-4 shadow-sm"
                >
                  <p className="font-semibold text-gray-800">{u.username}</p>
                  <p className="text-sm text-gray-600 break-all">{u.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Joined: {new Date(u.createdAt).toISOString().split("T")[0]}
                  </p>

                  <button
                    onClick={() => deleteUser(u._id)}
                    className="mt-3 w-full text-sm text-red-600 border border-red-200 rounded py-1.5 hover:bg-red-50 hover:border-red-300 transition"
                  >
                    Delete
                  </button>

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
            {filtered.length} users
          </span>
        </div>
      </motion.div>
    </div>
  );
}
