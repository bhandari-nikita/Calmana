//calmana-frontend/components/Calendar.js
"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


const MOOD_MAP = {
  Angry: { emoji: "😡", tint: "bg-red-50", text: "text-red-800" },
  Happy: { emoji: "😊", tint: "bg-yellow-50", text: "text-amber-800" },
  Sad: { emoji: "😔", tint: "bg-blue-50", text: "text-blue-800" },
  Calm: { emoji: "😌", tint: "bg-teal-50", text: "text-teal-800" },
  Neutral: { emoji: "😐", tint: "bg-gray-50", text: "text-gray-700" },
  Excited: { emoji: "🤩", tint: "bg-yellow-50", text: "text-yellow-800" },
  Tired: { emoji: "😴", tint: "bg-violet-50", text: "text-violet-800" }
};

function toISTKey(ts) {
  if (!ts) return null;
  return new Date(ts).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
}


export default function Calendar({ moods = {}, todayKey, visibleMonth, onMonthChange }) {

  const router = useRouter();
  const [selectedDay] = useState(null);

  // Normalize moods prop -> map keyed by ISO date "YYYY-MM-DD"
const moodByDate = useMemo(() => {
  if (!moods || typeof moods !== "object") return {};
  return moods; // already keyed by YYYY-MM-DD
}, [moods]);


  // visibleMonth must contain { year, month }
  const { year, month } = visibleMonth || { year: new Date().getFullYear(), month: new Date().getMonth() + 1 };

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  const grid = [];
  let dayCursor = 1;
  for (let week = 0; week < 6; week++) {
    const row = [];
    for (let d = 0; d < 7; d++) {
      const cellIndex = week * 7 + d;
      const showDay = cellIndex >= startWeekday && dayCursor <= daysInMonth;
      row.push(showDay ? dayCursor++ : null);
    }
    grid.push(row);
  }

  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const check = () => setIsCompact(window.innerWidth < 640);
    check(); // initial
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);



  function prevMonth() {
    let y = year;
    let m = month - 1;
    if (m < 1) {
      m = 12;
      y--;
    }
    onMonthChange({ year: y, month: m });
  }
  function nextMonth() {
    let y = year;
    let m = month + 1;
    if (m > 12) {
      m = 1;
      y++;
    }
    onMonthChange({ year: y, month: m });
  }



  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">

        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="px-3 py-1 rounded-md hover:bg-emerald-50">◀</button>
          <button onClick={nextMonth} className="px-3 py-1 rounded-md hover:bg-emerald-50">▶</button>
        </div>

        <div className="text-lg font-medium text-emerald-900">
          {new Date(year, month - 1).toLocaleString(undefined, { month: "long", year: "numeric" })}
        </div>

        <div className="hidden sm:block text-sm text-emerald-700">
          Mood • Journal • Breathing
        </div>

      </div>

      <div className="grid grid-cols-7 gap-1 text-[10px] sm:text-xs text-center text-emerald-700 mb-2">

        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((row, rIdx) =>
          row.map((day, cIdx) => {
            if (!day) return (
              <div
                key={`empty-${rIdx}-${cIdx}`}
                className="min-h-[72px] sm:min-h-[96px] rounded-lg bg-transparent"
              />
            );


            const yyyy = year;
            const mm = String(month).padStart(2, "0");
            const dd = String(day).padStart(2, "0");
            const iso = `${yyyy}-${mm}-${dd}`;

            const entry = moodByDate[iso] || null;

            const moodKey = entry?.mood;
            const moodInfo = moodKey ? MOOD_MAP[moodKey] : null;

            const hasAnyData =
              entry?.mood ||
              entry?.journalCount > 0 ||
              entry?.breathingCount > 0 ||
              entry?.quiz; // ⭐ INCLUDE QUIZ

            const tintClass = moodInfo
              ? moodInfo.tint
              : hasAnyData
                ? "bg-emerald-50"
                : "bg-white";

            const textClass = moodInfo ? moodInfo.text : "text-emerald-800";

            return (
              <button
                key={iso}
                onClick={() => router.push(`/dashboard/day?date=${iso}`)}
                aria-label={`Open ${iso}`}
                className={`relative min-h-[72px] sm:min-h-[96px] p-1.5 sm:p-2 rounded-lg text-left border border-emerald-50 hover:shadow-sm transition-all ${iso === todayKey ? "ring-2 ring-emerald-200" : ""}} ${tintClass}`}
              >
                <div className="flex justify-between items-start">
                  <div className={`text-xs sm:text-sm font-medium leading-none ${textClass}`}>
                    {day}
                  </div>
                </div>

                <div className="mt-1 space-y-0.5 text-[10px] sm:text-xs">

                  {/* Mood emoji + label */}
                  {entry?.mood && (
                    <div className="flex items-center gap-1 leading-tight">

                      <span className={isCompact ? "text-base" : "text-lg"}>
                        {MOOD_MAP[entry.mood]?.emoji || "🙂"}
                      </span>
                      {!isCompact && (
                        <span className="hidden sm:inline truncate">
                          {entry.mood}
                        </span>

                      )}
                    </div>
                  )}

                  {/* Journal indicator */}
                  {entry?.journalCount > 0 && (
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                      <span className="text-emerald-600">
                        {entry.journalCount} journal
                      </span>
                    </div>
                  )}

                  {/* Breathing indicator */}
                  {entry?.breathingCount > 0 && (
                    <div className="hidden sm:flex items-center gap-2">
                      <span role="img" aria-label="breathing">🫁</span>
                      <span className="text-emerald-600">
                        {entry.breathingCount} cycles
                      </span>
                    </div>
                  )}

                  {/* Quiz indicator */}
                  {entry?.quiz && (
                    <span
                      title={`${entry.quiz.quizTitle}: ${entry.quiz.score}/${entry.quiz.maxScore}`}
                      className={`${isCompact
                        ? "text-[9px] px-1 py-[1px]"
                        : "text-[10px] px-1.5 py-[2px]"
                        } bg-blue-100 text-blue-700 rounded-sm`}
                    >
                      {isCompact ? "Q" : "Quiz"}
                    </span>
                  )}


                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
