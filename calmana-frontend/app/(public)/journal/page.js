//calmana-frontend/app/(public)/journal/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

/* Get token like quiz */
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

function formatDateKey(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
}


function formatISTTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function JournalPage() {
  // editor
  const [entry, setEntry] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [prompt, setPrompt] = useState("");

  const [todayLabel, setTodayLabel] = useState("");

  // data
  const [entries, setEntries] = useState([]); // server returns decrypted text

  // UI
  const [savedMessage, setSavedMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarDateFilter, setSidebarDateFilter] = useState("");

  

  /* ---------------- LOAD ENTRIES ---------------- */
  async function loadEntries() {
    try {
      const token = getToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await api.get("/api/journal", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && res.data.entries) {
        setEntries(res.data.entries);
      } else {
        setEntries([]);
      }
    } catch (err) {
      console.error("Failed to fetch journal:", err);
      setEntries([]);
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    const label = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    setTodayLabel(label);
  }, []);


  /* ---------------- ADD ENTRY ---------------- */
  async function addEntry() {
    if (!entry.trim()) return;

    const payload = { text: entry };

    try {
      const token = getToken();
      const res = await api.post("/api/journal", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEntry("");
      setSavedMessage("Saved. You showed up today 🌱");

      setTimeout(() => setSavedMessage(""), 1400);
      await loadEntries();
    } catch (err) {
      console.error("Add failed:", err);
    }
  }

  /* ---------------- START EDIT ---------------- */
  function startEdit(id) {
    const e = entries.find((x) => x._id === id);
    if (!e) return;
    setEntry(e.text);
    setEditingId(id);
    setSidebarOpen(false);
  }

  /* ---------------- SAVE EDIT ---------------- */
  async function saveEdit() {
    if (!entry.trim() || !editingId) return;

    try {
      const token = getToken();
      const res = await api.put(
        "/api/journal",
        {
          id: editingId,
          text: entry,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEditingId(null);
      setEntry("");
      setSavedMessage("Updated. Reflection matters 🌿");

      setTimeout(() => setSavedMessage(""), 1400);
      await loadEntries();
    } catch (err) {
      console.error("SaveEdit failed:", err);
    }
  }

  /* ---------------- DELETE ENTRY ---------------- */
  async function deleteEntry(id) {
    if (!confirm("Delete this entry?")) return;

    try {
      const token = getToken();
      await api.delete(`/api/journal?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await loadEntries();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  /* ---------------- DOWNLOAD ---------------- */
  function downloadEntries(list, filename = "calmana_journal.txt") {
    if (!list || list.length === 0) return;
    const content = list
      .map(
        (e) =>
          `${formatDateKey(e.createdAt)} ${formatISTTime(e.createdAt)}\n${e.text}\n\n--------------`
      )
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadAll() {
    downloadEntries(entries, "calmana_journal_all.txt");
  }

  function downloadDate(dateKey) {
    const list = entries.filter((e) => formatDateKey(e.createdAt) === dateKey);
    downloadEntries(list, `calmana_journal_${dateKey}.txt`);
  }

  /* ---------------- GROUP BY DATE ---------------- */
  const grouped = useMemo(() => {
    const visible = sidebarDateFilter
      ? entries.filter((e) => formatDateKey(e.createdAt) === sidebarDateFilter)
      : entries;

    const groups = {};
    visible.forEach((e) => {
      const key = formatDateKey(e.createdAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });

    const keys = Object.keys(groups)
      .sort((a, b) => (a < b ? 1 : -1))
      .slice(0, 60); // limit to recent 60 days

    return { keys, groups };
  }, [entries, sidebarDateFilter]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash += today.charCodeAt(i);
    }
    // setPrompt(PROMPTS[hash % PROMPTS.length]);
  }, []);

  /* ---------------- SIDEBAR ---------------- */
  function toggleSidebar() {
    setSidebarOpen((s) => !s);
  }
  function handleDatePickerChange(e) {
    setSidebarDateFilter(e.target.value);
  }

  function handleSaveClick() {
    if (editingId) saveEdit();
    else addEntry();
  }

  /* ---------------- UI ---------------- */
  return (
   <div className="
      sm:space-y-10
      md:space-y-14
      lg:space-y-6
      min-h-[70vh]  
      md:min-h-[75vh]   
      bg-emerald-50
      flex
      justify-center
      pt-10 pb-8
      md:pt-15 md:pb-0
      lg:pt-8 lg:pb-5      
    ">

        {/* <div className="max-w-4xl mx-auto px-4 sm:px-10"> */}
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            {/* LEFT: heading + date */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-emerald-800">
                Daily Journal
              </h1>

              <p className="text-sm text-emerald-700 mt-1">
                {todayLabel} — You don’t need to write perfectly. Just write honestly.
              </p>
            </div>

            {/* RIGHT: button */}
            <button
              onClick={toggleSidebar}
              className="
              px-4 py-2
              border border-emerald-600
              text-emerald-700
              rounded
              hover:bg-emerald-50
              transition
              self-start sm:self-auto
              shrink-0
            ">
              {sidebarOpen ? "Hide Entries" : "Show Entries"}
            </button>
          </div>

          <div className="
          bg-white/70 backdrop-blur-sm
            border border-emerald-200
            rounded-2xl
            p-6 sm:p-8
            shadow-sm
          ">

            <textarea
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="How are you feeling today? What’s on your mind?"
              className="
                w-full
                min-h-[200px]         
                sm:min-h-[260px]       
                md:min-h-[340px]       
                lg:min-h-[300px]       
                p-4 sm:p-5
                resize-none           
                border border-emerald-300
                rounded-xl
                bg-white
                shadow-sm
                focus:outline-none
                focus:ring-2         
                focus:ring-emerald-400
                focus:border-emerald-400                
              "/>

            <div className="flex flex-wrap gap-3 mt-5 justify-start">
              <button
                onClick={handleSaveClick}
                className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
              >
                {editingId ? "Update Entry" : "Save Entry"}
              </button>
              <button
                onClick={() => {
                  setEntry("");
                  setEditingId(null);
                }}
                className="px-4 py-2 bg-transparent border border-gray-300 text-gray-600 rounded text-sm hover:bg-gray-100"
              >
                Clear
              </button>
              {savedMessage && (
                <p className="text-emerald-600 text-sm mt-1">{savedMessage}</p>
              )}
            </div>
          </div>
        </div>

        {/* ---------------- SIDEBAR ---------------- */}
        <div
          className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white/80 backdrop-blur-sm border-l border-emerald-200 shadow-xl overflow-y-auto transform transition-transform duration-300 z-50 ${sidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold text-emerald-800">
              Previous Entries
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadAll}
                className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
              >
                Download All
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="px-2 py-1 bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-4 pb-20 space-y-3">

            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={sidebarDateFilter}
                onChange={handleDatePickerChange}
                className="border p-2 rounded flex-1"
              />
              {sidebarDateFilter && (
                <button
                  onClick={() => setSidebarDateFilter("")}
                  className="px-3 py-2 bg-gray-200 rounded text-sm"
                >
                  Cancel
                </button>
              )}
              {sidebarDateFilter && (
                <button
                  onClick={() => downloadDate(sidebarDateFilter)}
                  className="px-3 py-2 bg-emerald-600 text-white rounded text-sm"
                >
                  Download Date
                </button>
              )}
            </div>

            {entries.length === 0 ? (
              <p className="text-gray-500">No entries yet.</p>
            ) : (
              grouped.keys.map((dateKey) => (
                <div key={dateKey} className="border rounded">
                  <details>
                    <summary className="cursor-pointer p-3 flex items-center justify-between bg-gray-50">
                      <div>
                        <div className="font-medium text-sm text-emerald-800">
                          {dateKey}
                        </div>
                        <div className="text-xs text-gray-500">
                          {grouped.groups[dateKey].length} entr
                          {grouped.groups[dateKey].length > 1 ? "ies" : "y"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadDate(dateKey)}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-xs"
                        >
                          Download
                        </button>
                      </div>
                    </summary>

                    <div className="p-3 space-y-2">
                      {grouped.groups[dateKey].map((it) => (
                        <div
                          key={it._id}
                          className="p-2 rounded bg-white border"
                        >
                          <div
                            className="
                            text-sm text-gray-800 mb-2
                            break-all
                            overflow-hidden
                            whitespace-nowrap
                            text-ellipsis
                          "
                            title={it.text}
                          >

                            {it.text || (
                              <span className="italic text-gray-400">
                                No content
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div>
                              {formatISTTime(it.createdAt)}
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(it._id)}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                              >
                                View / Edit
                              </button>

                              <button
                                onClick={() => deleteEntry(it._id)}
                                className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                              >
                                Delete
                              </button>

                              <button
                                onClick={() =>
                                  downloadEntries(
                                    [it],
                                    `calmana_${dateKey}_${it._id || "local"}.txt`
                                  )
                                }
                                className="px-2 py-1 bg-gray-200 rounded text-xs"
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
  );
}
