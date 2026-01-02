import React, { useState } from "react";

/**
 * Props:
 * - stats: { totalSessions: number, todaySessions: number }
 */

export default function BreathingCard({ stats }) {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState("ready");

  async function startQuickBreathing() {
    // Simple front-end breathing demo (box breathing 4-4-4-4)
    setRunning(true);
    setPhase("inhale");
    // optionally POST to /api/breathing/start to record a session
    try {
      await fetch(`${API}/breathing/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "quick", duration: 16 }),
      });
    } catch (err) {
      // ignore
    }

    // cycles: inhale 4s -> hold 4s -> exhale 4s -> hold 4s (one cycle)
    const steps = ["inhale", "hold", "exhale", "hold"];
    let i = 0;
    const interval = setInterval(() => {
      setPhase(steps[i % steps.length]);
      i++;
      if (i >= steps.length * 2) {
        clearInterval(interval);
        setRunning(false);
        setPhase("done");
        // small visual done state then reset
        setTimeout(() => setPhase("ready"), 1200);
      }
    }, 4000);
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-emerald-800">Breathing</h3>
          <p className="text-sm text-emerald-700">Quick Box Breathing • 1 cycle</p>
        </div>
        <div className="text-right text-sm">
          <div className="text-emerald-800 font-semibold">{stats?.todaySessions ?? 0} today</div>
          <div className="text-emerald-600 text-xs">Total {stats?.totalSessions ?? 0}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-28 rounded-md bg-emerald-50 flex items-center justify-center">
          {!running ? (
            <div className="text-emerald-700 text-center">
              <div className="text-sm">Ready for a short breather?</div>
              <div className="mt-2">
                <button
                  onClick={startQuickBreathing}
                  className="px-4 py-2 rounded-md bg-emerald-600 text-white"
                >
                  Start (1 min)
                </button>
              </div>
            </div>
          ) : (
            <div className="text-emerald-800 text-center">
              <div className="text-xl">{phase === "inhale" ? "Inhale" : phase === "exhale" ? "Exhale" : phase === "hold" ? "Hold" : "..."}</div>
              <div className="text-sm text-emerald-600 mt-1">Follow the rhythm</div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 text-xs text-emerald-600">
        Tip: box breathing helps reduce anxiety. Use the longer breathing page for guided sessions.
      </div>
    </div>
  );
}
