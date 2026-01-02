// calmana-frontend/app/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import Calendar from "@/components/Calendar";

export default function DashboardPage() {
  const [moods, setMoods] = useState({});

  const [monthMeta, setMonthMeta] = useState({ year: null, month: null });
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL;

  console.log("FRONTEND USING API =", API);


  useEffect(() => {
    const now = new Date();
    setMonthMeta({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });
  }, []);

  useEffect(() => {
    if (!monthMeta.year) return;

    const token = localStorage.getItem("token");

    async function fetchMonth() {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        // fetch mood/journal/breathing
        const res = await fetch(
          `${API}/dashboard/calendar?year=${monthMeta.year}&month=${monthMeta.month}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const moodJson = await res.json();

        // fetch quiz results (NEW)
        const quizRes = await fetch(
          `${API}/api/quiz/month?year=${monthMeta.year}&month=${monthMeta.month}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const quizJson = await quizRes.json();

        // MERGE quiz results into the mood map
        // MERGE quiz results into the mood map (SAFE)
        const merged = { ...moodJson };

        if (quizJson && typeof quizJson === "object") {
          Object.entries(quizJson).forEach(([date, quiz]) => {
            // ❌ DO NOT create new dates
            // ✅ Only attach quiz if the day already exists
            if (!merged[date]) {
              merged[date] = {}; // ⭐ CREATE DAY
            }
            merged[date].quiz = quiz;

          });
        }

        setMoods(merged);



        setMoods(merged);
      } catch (err) {
        console.error("Calendar fetch error:", err);
        setMoods({});
      } finally {
        setLoading(false);
      }
    }


    fetchMonth();
  }, [monthMeta.year, monthMeta.month]);

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

          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh] sm:h-60">

              Loading calendar...
            </div>
          ) : (
            <Calendar
              moods={moods}
              visibleMonth={monthMeta}
              onMonthChange={(newMonth) => setMonthMeta(newMonth)}
              compact
            />
          )}
        </section>

      </div>
    </main>
  );
}
