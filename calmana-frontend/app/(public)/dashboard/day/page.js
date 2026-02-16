// calmana-frontend/app/(public)/dashboard/day/page.js
export const dynamic = "force-dynamic";

"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function DayDetailsPage() {
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
      <div className="max-w-3xl mx-auto">

        <a href="/dashboard" className="text-emerald-700 mb-4 inline-block">
          ← Back to calendar
        </a>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">


          <h2 className="text-2xl font-semibold text-emerald-900">{date}</h2>

          {/* Moods */}
          <h3 className="text-md font-semibold text-emerald-800 mt-6">Mood Entries</h3>
          {(!data.moods || data.moods.length === 0) ? (
            <p className="text-emerald-500">No mood entries.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {data.moods.map((m, i) => (
                <li key={i} className="text-emerald-700">
                  {m.mood} (value: {m.moodValue})
                </li>
              ))}
            </ul>
          )}

          {/* Journals */}
          <h3 className="text-md font-semibold text-emerald-800 mt-6">Journal Entries</h3>
          {(!data.journals || data.journals.length === 0) ? (
            <p className="text-emerald-500">No journal entries for this day.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {data.journals.map((j) => (
                <li
                  key={j.id}
                  className="p-3 bg-emerald-50 rounded"
                >
                  <strong>{j.title}</strong>
                  <details className="mt-1">
                    <summary className="text-sm text-emerald-700 cursor-pointer">
                      Read journal
                    </summary>
                    <p className="mt-2 text-sm sm:text-base whitespace-pre-line break-words break-all leading-relaxed">
                      {j.text}
                    </p>
                  </details>
                </li>

              ))}
            </ul>
          )}

          {/* Breathing Sessions */}
          <h3 className="text-md font-semibold text-emerald-800 mt-6">Breathing Sessions</h3>

          {(!data.breathing || data.breathing.totalCycles === 0) ? (
            <p className="text-emerald-500">No breathing sessions logged.</p>
          ) : (
            <div className="mt-2 p-3 rounded-md bg-emerald-50">
              <p className="text-emerald-700 font-medium">
                Total Cycles: {data.breathing.totalCycles}
              </p>

              {data.breathing.sessions?.length > 0 && (
                <ul className="mt-2 list-disc ml-5 text-emerald-700">
                  {data.breathing.sessions.map((s, idx) => (
                    <li key={idx}>Cycles: {s.cyclesCompleted}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Quiz Results */}
          <h3 className="text-md font-semibold text-emerald-800 mt-6">Quiz Results</h3>

          {(!data.quizzes || data.quizzes.length === 0) ? (
            <p className="text-emerald-500">No quiz taken on this day.</p>
          ) : (
            <div className="mt-2 space-y-3">
              {data.quizzes.map((q, i) => {

                // ⭐ COLOR BASED ON PERCENTAGE ⭐
                let headerColor = "";
                let borderColor = "";
                let textColor = "";

                if (q.percentage >= 80) {
                  headerColor = "bg-red-100";
                  borderColor = "border-red-300";
                  textColor = "text-red-800";
                } else if (q.percentage >= 40) {
                  headerColor = "bg-yellow-100";
                  borderColor = "border-yellow-300";
                  textColor = "text-yellow-800";
                } else {
                  headerColor = "bg-green-100";
                  borderColor = "border-green-300";
                  textColor = "text-green-800";
                }

                return (
                  <div
                    key={i}
                    className={`border ${borderColor} rounded-lg overflow-hidden`}
                  >
                    {/* Accordion Header */}
                    <button
                      className={`w-full flex justify-between items-center p-3 ${headerColor} ${textColor} font-medium`}
                      onClick={() => {
                        const el = document.getElementById(`quiz-${i}`);
                        el.style.display = el.style.display === "none" ? "block" : "none";
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {q.quizTitle}
                      </div>
                      <span className="text-sm">{q.percentage}%</span>
                    </button>

                    {/* Accordion Body */}
                    <div
                      id={`quiz-${i}`}
                      style={{ display: "none" }}
                      className="p-3 bg-white space-y-1 border-t"
                    >
                      <p className="text-emerald-800 text-sm">
                        <strong>Score:</strong> {q.score}/{q.maxScore}
                      </p>
                      <p className="text-emerald-800 text-sm">
                        <strong>Level:</strong> {q.level}
                      </p>
                      <p className="text-emerald-800 text-sm">
                        <strong>Percentage:</strong> {q.percentage}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}



          {/* Buttons */}
          <div className="flex gap-2 mt-6">
            <a
              href={`/journal`}
              className="py-2 px-3 rounded-md bg-emerald-600 text-white"
            >
              Add/Edit Journal
            </a>

            <a
              href={`/mood-tracker`}
              className="py-2 px-3 rounded-md border text-emerald-700"
            >
              Log Mood
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
