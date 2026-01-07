//calmana-frontend/app/(public)/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import Calendar from "@/components/Calendar";

export default function DashboardPage() {
  // 🔒 STATE — ALWAYS FIRST
  const [calendarData, setCalendarData] = useState(null);
  const [monthMeta, setMonthMeta] = useState({ year: null, month: null });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;

  // 🔒 EFFECT 1 — mark mounted (runs once)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔑 EFFECT — initial month seed (ONE TIME ONLY)
  useEffect(() => {
    if (!mounted) return;

    const now = new Date();
    setMonthMeta({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });
  }, [mounted]);


  // 🔒 EFFECT 2 — auth guard (runs after mount)
  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }
  }, [mounted]);

  // 🔒 EFFECT 3 — fetch calendar data
  useEffect(() => {
    if (!mounted) return;
    if (!monthMeta.year) return;

    async function fetchMonth() {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(
          `${API}/dashboard/calendar?year=${monthMeta.year}&month=${monthMeta.month}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Unauthorized");

        const calendarJson = await res.json();
        setCalendarData(calendarJson);
      } catch (err) {
        console.error("Calendar fetch error:", err);
        setCalendarData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchMonth();
  }, [mounted, monthMeta.year, monthMeta.month]);

  // 🔒 EFFECT 4 — derive month from IST todayKey
  useEffect(() => {
    if (!calendarData?.todayKey) return;

    const [y, m] = calendarData.todayKey.split("-");
    setMonthMeta({ year: Number(y), month: Number(m) });
  }, [calendarData?.todayKey]);

  // ❌ NO HOOKS AFTER THIS POINT

  // 🧱 RENDER GUARDS (SAFE)
  if (!mounted) {
    return null;
  }

  if (loading || !calendarData) {
    return (
      <main className="min-h-screen bg-emerald-50 p-4 sm:p-6 md:p-10">
        <div className="flex items-center justify-center min-h-[60vh]">
          Loading calendar...
        </div>
      </main>
    );
  }

  // ✅ FINAL RENDER
  return (
    <main className="min-h-screen bg-emerald-50 p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-emerald-900">
              Hello — Calmana Dashboard
            </h1>
            <p className="text-sm text-emerald-700">
              Your monthly mood overview
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a
              href="/mood-tracker"
              className="py-2 px-4 bg-emerald-600 text-white rounded-lg text-center w-full sm:w-auto"
            >
              Log Mood
            </a>

            <a
              href="/journal"
              className="py-2 px-4 border rounded-lg text-emerald-800 text-center w-full sm:w-auto"
            >
              Journal
            </a>
          </div>
        </header>

        <section className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm overflow-x-auto">
          <Calendar
            moods={calendarData.days}
            todayKey={calendarData.todayKey}
            visibleMonth={monthMeta}
            onMonthChange={setMonthMeta}
          />
        </section>

      </div>
    </main>
  );
}
