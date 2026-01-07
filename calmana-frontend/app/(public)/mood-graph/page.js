//calmana-frontend/app/(public)/mood-graph/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function MoodGraph() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [view, setView] = useState("week"); // day | week | month
  const [loading, setLoading] = useState(true);
  const [dataPoints, setDataPoints] = useState([]);

  const [offset, setOffset] = useState(0);
  // const [dayOffset, setDayOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");

  const [metaLabel, setMetaLabel] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL;

  const moodLabels = {
    1: "Angry",
    2: "Sad",
    3: "Tired",
    4: "Neutral",
    5: "Calm",
    6: "Happy",
    7: "Excited",
  };

  useEffect(() => setIsClient(true), []);
  useEffect(() => {
    setOffset(0);

    setSelectedDate("");
  }, [view]);

  function getDateKey() {
    if (selectedDate) return selectedDate;

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  }


  useEffect(() => {
    fetchData();
  }, [view, offset, selectedDate]);

  //   async function fetchData() {
  //     setLoading(true);

  //     try {
  //       const token = localStorage.getItem("token");
  //       if (!token) {
  //         alert("Please log in to view your mood graph.");
  //         router.push("/login");
  //         return;
  //       }

  //       let url = "";

  //       // DAY
  //       if (view === "today") {
  //         url = `${API}/mood/today`;

  //         if (selectedDate) {
  //           url += `?date=${selectedDate}`;
  //         } else {
  //           url += `?offset=${dayOffset}`;
  //         }
  //       }

  //       // WEEK
  //       if (view === "week") {
  //         url = `${API}/mood/week?offset=${offset}`;
  //       }

  //       // MONTH
  //       if (view === "month") {
  //         url = `${API}/mood/month?offset=${offset}`;
  //       }

  //       const res = await fetch(url, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       const json = await res.json();

  //       if (!res.ok) {
  //         console.log(json);
  //         alert(json.message || "Unable to fetch data");
  //         setLoading(false);
  //         return;
  //       }

  //       // DAY PROCESSING
  //       if (view === "today") {
  //         const entries = json.moods || [];

  //         if (!selectedDate && json.date) {
  //           setMetaLabel(formatFullDate(new Date(json.date)));
  //         }

  //         const points = entries.map((e) => {
  //           const d = new Date(e.timestamp);

  //           const utcTime = `${String(d.getUTCHours()).padStart(2, "0")}:${String(
  //             d.getUTCMinutes()
  //           ).padStart(2, "0")}`;

  //           return {
  //             x: utcTime,
  //             moodValue: e.moodValue,
  //             moodLabel: moodLabels[e.moodValue] || "",
  //           };
  //         });

  //         setDataPoints(points);
  //       }


  //       // WEEK / MONTH PROCESSING
  //       // else {
  //       //   const points = entries.map((e) => {
  //       //     const d = new Date(e.timestamp);

  //       //     const utcTime = `${String(d.getUTCHours()).padStart(2, "0")}:${String(
  //       //       d.getUTCMinutes()
  //       //     ).padStart(2, "0")}`;

  //       //     return {
  //       //       x: utcTime,
  //       //       moodValue: e.moodValue,
  //       //       moodLabel: moodLabels[e.moodValue] || "",
  //       //     };
  //       //   });

  //       // WEEK / MONTH PROCESSING
  //       else {
  //         const points = (json.days || []).map((d) => ({
  //           x: d.date,
  //           moodValue: d.averageMood ?? 0,
  //           moodLabel:
  //             d.averageMood === null
  //               ? "No data"
  //               : moodLabels[Math.round(d.averageMood)] || "",
  //         }));

  //         if (view === "week") {
  //           const s = new Date(json.start);
  //           const e = new Date(json.end);
  //           setMetaLabel(`${s.toLocaleDateString()} - ${e.toLocaleDateString()}`);
  //         }

  //         if (view === "month") {
  //           const s = new Date(json.start);
  //           setMetaLabel(
  //             s.toLocaleString(undefined, { month: "long", year: "numeric" })
  //           );
  //         }

  //         setDataPoints(points);
  //       }




  //       if (view === "week") {
  //         const s = new Date(json.start);
  //         const e = new Date(json.end);
  //         setMetaLabel(`${s.toLocaleDateString()} - ${e.toLocaleDateString()}`);
  //       }

  //       if (view === "month") {
  //         const s = new Date(json.start);
  //         setMetaLabel(
  //           s.toLocaleString(undefined, { month: "long", year: "numeric" })
  //         );
  //       }

  //       setDataPoints(points);
  //     }

  //       setLoading(false);
  //   } catch (err) {
  //     console.error("fetchData error:", err);
  //     alert("Server error.");
  //     setLoading(false);
  //   }
  // }

  useEffect(() => {
    // 🔥 RESET meta label when switching views
    if (view === "today") {
      setMetaLabel(""); // clear week/month garbage immediately
    }
  }, [view]);



  async function fetchData() {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to view your mood graph.");
        router.push("/login");
        return;
      }

      let url = "";

      if (view === "today") {
        const dateKey = getDateKey();
        url = `${API}/mood/day?date=${dateKey}`;
      }

      if (view === "week") {
        url = `${API}/mood/week?offset=${offset}`;
      }

      if (view === "month") {
        url = `${API}/mood/month?offset=${offset}`;
      }


      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.message || "Unable to fetch data");
        setDataPoints([]);
        setLoading(false);
        return;
      }

      /* ---------- DAY ---------- */
      if (view === "today") {
        const dateKey = getDateKey();
        const entries = json.moods || [];

        const points = entries.map((e) => {
          const istTime = new Date(e.timestamp).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
          });

          return {
            x: istTime,
            moodValue: e.moodValue,
            moodLabel: moodLabels[e.moodValue] || "",
          };
        });

        setDataPoints(points);

        if (json.date) {
          const [y, m, d] = json.date.split("-");
          setMetaLabel(
            formatFullDate(new Date(Number(y), Number(m) - 1, Number(d)))
          );
        }


      }



      /* ---------- WEEK / MONTH ---------- */
      else {
        const points = (json.days || []).map((d) => ({
          x: d.date,
          moodValue: d.averageMood ?? 0,
          moodLabel:
            d.averageMood == null
              ? "No data"
              : moodLabels[Math.round(d.averageMood)] || "",
        }));

        setDataPoints(points);

        if (view === "week") {
          const s = new Date(json.start);
          const e = new Date(json.end);
          setMetaLabel(`${s.toLocaleDateString()} - ${e.toLocaleDateString()}`);
        }

        if (view === "month") {
          const s = new Date(json.start);
          setMetaLabel(
            s.toLocaleString(undefined, { month: "long", year: "numeric" })
          );
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("fetchData error:", err);
      alert("Server error");
      setLoading(false);
    }
  }


  function formatFullDate(d) {
    return d.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const shiftDay = (delta) => {
    const base = selectedDate ? new Date(selectedDate) : new Date();
    base.setDate(base.getDate() + delta);

    const y = base.getFullYear();
    const m = String(base.getMonth() + 1).padStart(2, "0");
    const d = String(base.getDate()).padStart(2, "0");

    setSelectedDate(`${y}-${m}-${d}`);
  };


  const prev = () => {
    if (view === "today") shiftDay(-1);
    else setOffset((o) => o - 1);
  };

  const next = () => {
    if (view === "today") shiftDay(1);
    else if (offset < 0) setOffset((o) => o + 1);
  };


  if (!isClient) return null;

  return (
    <div className="flex flex-col items-center mt-10 px-4">
      <h2 className="text-2xl font-semibold text-[#2f5d4a] mb-2">
        Your Mood Trend
      </h2>

      <div className="text-sm text-[#2f5d4a] mb-4">{metaLabel}</div>

      {/* VIEW BUTTONS */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => {
            setSelectedDate("");   // reset date
            setMetaLabel("");     // reset label FIRST
            setView("today");     // then switch view
          }}
          className={`px-4 py-2 rounded ${view === "today" ? "bg-[#4e937a] text-white" : "bg-white border"
            }`}
        >
          Day
        </button>

        <button
          onClick={() => setView("week")}
          className={`px-4 py-2 rounded ${view === "week" ? "bg-[#4e937a] text-white" : "bg-white border"
            }`}
        >
          Week
        </button>
        <button
          onClick={() => setView("month")}
          className={`px-4 py-2 rounded ${view === "month" ? "bg-[#4e937a] text-white" : "bg-white border"
            }`}
        >
          Month
        </button>
      </div>

      {/* GRAPH */}
      {loading ? (
        <p className="text-[#4e937a]">Loading mood data...</p>
      ) : dataPoints.length > 0 ? (
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={dataPoints}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6f3ea" />
            <XAxis dataKey="x" stroke="#2f5d4a" />
            <YAxis
              domain={[0, 7]}
              ticks={[1, 2, 3, 4, 5, 6, 7]}
              tickFormatter={(v) =>
                v === 0 ? "" : moodLabels[Math.round(v)] || ""
              }
              stroke="#2f5d4a"
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="moodValue"
              stroke="#4e937a"
              strokeWidth={3}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-[#4e937a]">No mood data available.</p>
      )}

      <button
        onClick={() => router.push("/mood-tracker")}
        className="mt-6 bg-[#2f5d4a] text-white px-6 py-2 rounded-full hover:bg-[#3f7f68]"
      >
        Go to Mood Tracker
      </button>
    </div>
  );
}
