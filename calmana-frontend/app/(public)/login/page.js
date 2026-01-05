// calmana-frontend/app/login/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await axios.post(`${API}/api/auth/login`, form);

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.user.username);
        localStorage.setItem("userId", res.data.user.id);

        setMsg("Login successful. Redirecting...");
        setTimeout(() => router.push("/dashboard"), 900);
      } else {
        setMsg("Invalid credentials");
      }
    } catch (err) {
      setMsg(err?.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
      <div className="bg-white p-8 rounded max-w-md w-full">
        <h2 className="text-2xl font-bold text-green-800 mb-4">Login</h2>
        {msg && <p className="mb-3 text-red-600">{msg}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="username"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            placeholder="Username"
            required
            className="w-full p-2 border rounded"
          />

          <input
            name="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            type="password"
            placeholder="Password"
            required
            className="w-full p-2 border rounded"
          />

          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
            Login
          </button>
        </form>

        <p className="mt-3 text-sm">
          Don't have an account?{" "}
          <a href="/register" className="text-green-700 underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}
