//calmana-frontend/app/breathing/page.js
"use client";

import { useEffect, useRef, useState } from "react";

export default function BoxBreathingPage() {

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("userId");
    if (stored) {
      setUserId(stored);
    }
  }, []);


  const PHASES = [
    { id: "inhale", label: "Inhale", duration: 4 },
    { id: "hold1", label: "Hold", duration: 4 },
    { id: "exhale", label: "Exhale", duration: 4 },
    { id: "hold2", label: "Hold", duration: 4 },
  ];

  const TOTAL_DURATION = PHASES.reduce((sum, p) => sum + p.duration, 0);

  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(PHASES[0].duration);
  const [cyclesThisSession, setCyclesThisSession] = useState(0);
  const [cyclesToday, setCyclesToday] = useState(0);

  const svgPathRef = useRef(null);
  const [pathLength, setPathLength] = useState(1);

  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastWholeCycleRef = useRef(0);

  const API = process.env.NEXT_PUBLIC_API_URL;

  // ---------- Utility ----------
  // function getTodayKey() {
  //   const d = new Date();
  //   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
  //     d.getDate()
  //   ).padStart(2, "0")}`;
  // }

  function getTodayKey() {
    const istNow = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    return istNow.toISOString().slice(0, 10);
  }


  // function incrementCyclesToday() {
  //   const key = `calmana_cycles_${getTodayKey()}`;
  //   const stored = Number(localStorage.getItem(key)) || 0;
  //   const updated = stored + 1;

  //   localStorage.setItem(key, String(updated));
  //   setCyclesToday(updated);
  // }

  // ---------- NEW: Reset guest cycles after login ----------
  // useEffect(() => {
  //   const user = JSON.parse(localStorage.getItem("user"));
  //   if (user?._id) {
  //     // user logged in → reset guest breathing cycles
  //     Object.keys(localStorage).forEach((key) => {
  //       if (key.startsWith("calmana_cycles_")) {
  //         localStorage.removeItem(key);
  //       }
  //     });

  //     setCyclesToday(0);              // 👉 Reset UI too
  //     setCyclesThisSession(0);        // 👉 Fresh session
  //   }
  // }, []);
  // ---------------------------------------------------------

  // ---------- Save session ----------
  async function saveBreathingSession() {
    try {
      // Guest user → do not save to DB
      if (!userId) {
        console.log("Guest user — breathing not saved to database.");
        return;
      }

      // Logged-in user
      const response = await fetch(`${API}/breathing/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          cyclesCompleted: cyclesThisSession,
        }),
      });

      const data = await response.json();
      console.log("Breathing session saved:", data);

    } catch (error) {
      console.error("Error saving breathing session:", error);
    }
  }

  useEffect(() => {
    if (!userId) return;

    async function fetchTodayCycles() {
      try {
        const res = await fetch(
          `${API}/breathing/today?userId=${userId}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch breathing data");
        }

        const data = await res.json();
        setCyclesToday(data.totalCycles ?? 0);

      } catch (err) {
        console.error("Failed to load today breathing cycles", err);
      }
    }

    fetchTodayCycles();
  }, [userId]);

  // ---------- On mount: load today's cycles ----------
  // useEffect(() => {
  //   const key = `calmana_cycles_${getTodayKey()}`;
  //   const val = localStorage.getItem(key);
  //   setCyclesToday(val ? Number(val) : 0);
  // }, []);

  // ---------- Measure SVG path ----------
  useEffect(() => {
    if (svgPathRef.current) {
      try {
        const len = svgPathRef.current.getTotalLength();
        setPathLength(len);
        svgPathRef.current.style.strokeDasharray = String(len);
        svgPathRef.current.style.strokeDashoffset = String(len);
      } catch {
        setPathLength(1);
      }
    }
  }, []);

  // ---------- Animation loop ----------
  useEffect(() => {
    if (!running) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    if (!startTimeRef.current) startTimeRef.current = performance.now();

    function tick(now) {
      const elapsed = (now - startTimeRef.current) / 1000;
      const cycleProgress = (elapsed % TOTAL_DURATION) / TOTAL_DURATION;
      const completedCycles = Math.floor(elapsed / TOTAL_DURATION);

      // if (completedCycles !== lastWholeCycleRef.current) {
      //   // only count when a NEW cycle completes
      //   if (completedCycles > 0) {
      //     setCyclesThisSession((c) => c + 1);
      //     incrementCyclesToday();
      //   }
      //   lastWholeCycleRef.current = completedCycles;
      // }

      if (completedCycles !== lastWholeCycleRef.current) {
        if (completedCycles > 0) {
          setCyclesThisSession(c => c + 1);
          setCyclesToday(c => c + 1); // optimistic UI
        }
        lastWholeCycleRef.current = completedCycles;
      }


      let acc = 0;
      for (let i = 0; i < PHASES.length; i++) {
        const d = PHASES[i].duration;
        if (cycleProgress * TOTAL_DURATION < acc + d) {
          setPhaseIndex(i);
          setTimeLeft(Math.ceil(acc + d - cycleProgress * TOTAL_DURATION));
          break;
        }
        acc += d;
      }

      if (svgPathRef.current && pathLength > 0) {
        const offset = pathLength - cycleProgress * pathLength;
        svgPathRef.current.style.strokeDasharray = String(pathLength);
        svgPathRef.current.style.strokeDashoffset = String(offset);
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, pathLength]);

  // ---------- Handlers ----------
  function handleStart() {
    if (running) return;
    startTimeRef.current = performance.now();
    lastWholeCycleRef.current = 0;
    setCyclesThisSession(0);
    setRunning(true);
    setCyclesToday((c) => c); // no-op, prevents accidental sync glitch
  }

  async function handleStop() {
    if (!running) return;
    setRunning(false);
    // wait one animation frame so last cycle updates
    setTimeout(() => {
      if (userId) {
        saveBreathingSession();
      }
    }, 200);
  }

  function handleReset() {
    setRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startTimeRef.current = null;
    lastWholeCycleRef.current = 0;
    setPhaseIndex(0);
    setTimeLeft(PHASES[0].duration);
    setCyclesThisSession(0);
    if (svgPathRef.current && pathLength > 0) {
      svgPathRef.current.style.strokeDasharray = String(pathLength);
      svgPathRef.current.style.strokeDashoffset = String(pathLength);
    }
  }

  const scale =
    PHASES[phaseIndex].id === "inhale"
      ? 1.07
      : PHASES[phaseIndex].id === "exhale"
        ? 0.93
        : 1.0;

  // ---------- Render ----------
  return (
    <div className="min-h-[90vh] bg-[#f5fff5] flex items-center justify-center px-10">
      <div className="max-w-3xl w-full bg-white/80 backdrop-blur rounded-2xl shadow-xl p-5 text-center">
        <h1 className="text-3xl font-semibold text-emerald-800">Calmana — Box Breathing</h1>
        <p className="text-emerald-600 mb-3 mt-3">Relax your mind and body through rhythmic breathing</p>

        <div className="relative flex justify-center">
          <svg width="280" height="280" viewBox="0 0 280 280" className="block">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect
              x="30"
              y="30"
              width="220"
              height="220"
              rx="20"
              ry="20"
              stroke="rgba(16,185,129,0.15)"
              strokeWidth="10"
              fill="none"
            />

            <rect
              ref={svgPathRef}
              x="30"
              y="30"
              width="220"
              height="220"
              rx="20"
              ry="20"
              stroke="url(#grad)"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
              filter="url(#glow)"
            />
          </svg>

          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-[3000ms] ease-in-out"
            style={{ transform: `scale(${scale})` }}
          >
            <div className="w-40 h-40 rounded-xl bg-white/90 border border-emerald-100 flex flex-col items-center justify-center shadow-md">
              <div className="text-lg font-semibold text-emerald-800">
                {PHASES[phaseIndex].label}
              </div>
              <div className="text-emerald-600 text-sm">{timeLeft}s</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          {!running ? (
            <button
              onClick={handleStart}
              className="px-6 py-2 rounded-full font-medium shadow bg-[#3f7f68] text-white hover:bg-[#4e937a]"
            >
              Start
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="px-6 py-2 rounded-full border border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50 shadow-sm"
            >
              Stop
            </button>
          )}

          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-full text-sm border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
          >
            Reset Session
          </button>
        </div>

        <div className="mt-4 text-sm text-emerald-700">
          {cyclesThisSession} cycles this session • {cyclesToday} cycles today
        </div>
        <div className="mt-3 text-xs text-emerald-500">
          A full Inhale→Hold→Exhale→Hold counts as one cycle.
        </div>
      </div>
    </div>
  );
}
