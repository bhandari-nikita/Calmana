"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
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
      .get("http://localhost:5000/api/admin-data/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setUsers(r.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    if (!confirm("Delete this user permanently?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(
        `http://localhost:5000/api/admin-data/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert("Delete failed.");
      console.error(err);
    }
  }

  return (
    <div className="space-y-4">
      {/* ANIMATED CONTENT WRAPPED INSIDE STATIC DIV */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-4"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-900">Users</h1>

          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search username or email"
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
                <th className="p-4">Username</th>
                <th className="p-4">Email</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-4">
                    Loading…
                  </td>
                </tr>
              ) : current.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                current.map((u) => (
                  <tr key={u._id} className="border-b hover:bg-green-50">
                    <td className="p-4">{u.username}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
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

        {/* PAGINATION */}
        <div className="flex items-center justify-between text-sm">
          <div>{filtered.length} users</div>

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
