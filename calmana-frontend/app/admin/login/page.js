//calmana-frontend/app/admin/login/page.js
"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`, {
        username,
        password,
      });
      localStorage.setItem("adminToken", res.data.token);
      router.push("/admin/dashboard");
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-gray-300 bg-gray-50 shadow-sm">

        {/* BRAND HEADER */}
        <div className="flex items-center justify-center px-6 py-4 border-b border-gray-300 bg-white">
          <img
            src="/assets/Calmana_green.png"   // make sure this exists in /public
            alt="Calmana"
            className="h-7 w-auto object-contain"
          />
        </div>

        {/* SYSTEM STRIP */}
        <div className="px-6 py-2 border-b border-gray-200 bg-gray-100">
          <p className="text-[11px] tracking-widest text-gray-600 uppercase text-center">
            Restricted System Access
          </p>
        </div>

        {/* CONTENT */}
        <form
          onSubmit={handleLogin}
          className="bg-white px-6 py-6"
        >
          <h1 className="text-sm font-semibold text-gray-900 mb-1">
            Administrator Sign In
          </h1>
          <p className="text-xs text-gray-600 mb-6">
            Sign in to manage Calmana platform data.
          </p>

          {error && (
            <p className="text-red-600 text-xs mb-3">{error}</p>
          )}

          <div className="mb-4">
            <label className="block text-[11px] font-medium text-gray-700 mb-1 uppercase tracking-wide">
              Username
            </label>
            <input
              className="w-full px-2 py-1.5 border border-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-green-700"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-[11px] font-medium text-gray-700 mb-1 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              className="w-full px-2 py-1.5 border border-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-green-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className={`w-full text-sm font-medium py-2 transition
            ${loading
                ? "bg-green-700 opacity-70 cursor-not-allowed"
                : "bg-green-800 hover:bg-green-900 text-white"}
            `}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* FOOTER CONTEXT */}
        <div className="px-6 py-2 border-t border-gray-300 bg-gray-100">
          <p className="text-[11px] text-gray-500 text-center">
            © {new Date().getFullYear()} Calmana • Admin System
          </p>
        </div>
      </div>
    </div >
  );
}
