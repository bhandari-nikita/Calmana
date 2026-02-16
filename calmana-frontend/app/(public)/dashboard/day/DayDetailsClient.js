//calmana-frontend/app/%28public%29/dashboard/day/DayDetailsClient.js
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function DayDetailsClient() {
  const search = useSearchParams();
  const date = search.get("date");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!date) return;

    const API = process.env.NEXT_PUBLIC_API_URL || "https://calmana-backend.onrender.com";

    const token = localStorage.getItem("token");

    async function load() {
      try {
        const res = await fetch(`${API}/dashboard/day?date=${date}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const json = await res.json();

        console.log("API:", API);
        console.log("Response JSON:", json);

        setData(json);
      } catch (err) {
        console.error("Day fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [date]);

  if (!date) return <div className="p-6">No date selected.</div>;
  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6 text-emerald-600">No data found.</div>;

  return (
    <main className="min-h-screen bg-emerald-50 p-6">
      <div className="max-w-3xl mx-auto">

        <Link href="/dashboard" className="text-emerald-700 mb-4 inline-block">
          ← Back to calendar
        </Link>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">

          <h2 className="text-2xl font-semibold text-emerald-900">{date}</h2>

          {/* moods */}
          {/* journals */}
          {/* breathing */}
          {/* quiz */}
          {/* buttons */}

        </div>
      </div>
    </main>
  );
}
