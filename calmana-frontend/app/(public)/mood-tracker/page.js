//calmana-frontend/app/(public)/mood-tracker/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MoodTracker() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [todayMoods, setTodayMoods] = useState([]);
  const [averageMood, setAverageMood] = useState(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const emojis = [
    { src: "/emojis/happy.gif", label: "Happy" },
    { src: "/emojis/sad.gif", label: "Sad" },
    { src: "/emojis/angry.gif", label: "Angry" },
    { src: "/emojis/neutral.gif", label: "Neutral" },
    { src: "/emojis/calm.gif", label: "Calm" },
    { src: "/emojis/excited.gif", label: "Excited" },
    { src: "/emojis/tired.gif", label: "Tired" },
  ];

  useEffect(() => {
    setIsClient(true);
    fetchTodayMoods();
  }, []);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setMessage("");
  };

  // ⭐ Correct API: Express backend
const fetchTodayMoods = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    // local day key (NOT UTC)
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const res = await fetch(
      `${API}/mood/day?date=${todayKey}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("Non-JSON response:", text);
      return;
    }

    const data = await res.json();
    setTodayMoods(data.moods || []);
    setAverageMood(data.averageMood || null);

  } catch (err) {
    console.error("Error fetching moods:", err);
  }
};

  // ⭐ Correct API: Express backend
  const handleSave = async () => {
    if (!selectedMood) {
      setMessage("Please select a mood first.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to save your mood entry.");
      router.push("/login");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/mood/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mood: selectedMood }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`Your mood "${selectedMood}" has been saved!`);
        setSelectedMood(null);
        fetchTodayMoods(); // reload from DB
      } else {
        setMessage(data.message || "Failed to save mood.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-[70vh] flex flex-col items-center mt-20 sm:pb-10 sm:space-y-8 md:space-y-18 lg:space-y-8">
      <h2 className="text-xl md:text-2xl font-semibold text-[#2f5d4a] text-center">

        How are you feeling today?
      </h2>

      {/* Mood selection */}
      <div className="
        grid 
        grid-cols-3 
        sm:grid-cols-4 
        lg:flex lg:flex-wrap lg:justify-center
        gap-4 md:gap-6 lg:gap-8
      ">

        {emojis.map((emoji) => (
          <div
            key={emoji.label}
            className={`flex flex-col items-center cursor-pointer transition-transform transform ${selectedMood === emoji.label ? "scale-110" : "hover:scale-105"
              }`}
            onClick={() => handleMoodSelect(emoji.label)}
          >
            <div className="w-full max-w-3xl px-6 py-5 flex justify-center items-center">
            <img
              src={emoji.src}
              alt={emoji.label}
              className={`w-16 h-16
                sm:w-18 sm:h-18
                md:w-16 md:h-16
                lg:w-20 lg:h-20
                rounded-full border-4
                transition ${selectedMood === emoji.label
                ? "border-[#4e937a]"
                : "border-transparent"
                }`}
            />
            </div>
            <p className="text-sm mt-2 text-[#2f5d4a]">{emoji.label}</p>
          </div>
        ))}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className={`mt-6 mb-5 md:mt-8 px-8 py-3 rounded-full text-white transition ${loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-[#4e937a] hover:bg-[#3f7f68]"
          }`}
      >
        {loading ? "Saving..." : "Save Entry"}
      </button>

      {message && (
        <p className="text-[#2f5d4a] mt-3 font-medium text-center">{message}</p>
      )}

      <button
        onClick={() => router.push("/mood-graph")}
        className="mt-1 mb-5 bg-[#2f5d4a] text-white px-6 py-2 rounded-full hover:bg-[#3f7f68] transition"
      >
        View Mood Graph
      </button>
    </div>
  );
}
