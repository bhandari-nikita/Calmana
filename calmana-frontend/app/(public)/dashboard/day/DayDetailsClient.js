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

    const API = process.env.NEXT_PUBLIC_API_URL;
    const token = localStorage.getItem("token");

    async function load() {
      try {
        const res = await fetch(`${API}/dashboard/day?date=${date}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const json = await res.json();
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
      {/* your entire UI JSX here unchanged */}
    </main>
  );
}
