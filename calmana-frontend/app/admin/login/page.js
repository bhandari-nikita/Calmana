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

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", {
        username,
        password
      });

      localStorage.setItem("adminToken", res.data.token);
      router.push("/admin/dashboard");
    } catch (err) {
      setError("Invalid username or password");
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-green-100">
      <form onSubmit={handleLogin} className="bg-white shadow-lg p-8 rounded w-96">
        <h2 className="text-2xl font-bold text-green-700 mb-4">Admin Login</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <input
          className="w-full p-2 mb-4 border rounded"
          placeholder="Admin Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <input
          className="w-full p-2 mb-4 border rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button className="w-full bg-green-600 text-white p-2 rounded">Login</button>
      </form>
    </div>
  );
}
