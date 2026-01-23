//calmana-frontend/app/affirmations/page.js
"use client";

import { useEffect, useState } from "react";

export default function AffirmationsPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const affirmationsList = [
    "I am capable of achieving my goals.",
    "I choose to focus on what I can control.",
    "I am worthy of love and respect.",
    "Every day is a fresh start.",
    "I believe in my ability to overcome challenges.",
    "I radiate positivity and kindness.",
    "I am grateful for the good in my life.",
    "My mind is calm, and my body is relaxed.",
    "I am constantly growing and improving.",
    "I have the strength to face any challenge.",
  ];

  const [affirmation, setAffirmation] = useState(affirmationsList[0]);
  const [fade, setFade] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  // ⭐ Favorites toggle
  const [showFav, setShowFav] = useState(false);

  // Load login data
  useEffect(() => {
    setIsClient(true);

    const t = localStorage.getItem("token");
    const uid = localStorage.getItem("userId");

    if (t) setToken(t);
    if (uid) setUserId(uid);
  }, []);

  // Load favorites from DB
  useEffect(() => {
    if (!isClient || !userId) return;

    const loadFavorites = async () => {
      try {
        setLoadingFavorites(true);

        const res = await fetch(`${API}/api/affirmations/list/${userId}`);
        const data = await res.json();

        if (data?.favorites) {
          setFavorites(data.favorites.map((f) => f.text));
        }
      } catch (err) {
        console.error("Failed to load favorites:", err);
      } finally {
        setLoadingFavorites(false);
      }
    };

    loadFavorites();
  }, [isClient, userId]);

  // Auto rotate affirmation
  useEffect(() => {
    const interval = setInterval(generateAffirmation, 8000);
    return () => clearInterval(interval);
  }, []);

  const generateAffirmation = () => {
    setFade(false);
    setTimeout(() => {
      const i = Math.floor(Math.random() * affirmationsList.length);
      setAffirmation(affirmationsList[i]);
      setFade(true);
    }, 300);
  };

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!userId) {
      alert("Please login to save your favorites.");
      return;
    }

    const isFav = favorites.includes(affirmation);

    if (!isFav) {
      setFavorites((p) => [...p, affirmation]);

      try {
        await fetch(`${API}/api/affirmations/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, text: affirmation }),
        });
      } catch (err) {
        console.error("Add fav error:", err);
      }
    } else {
      setFavorites((p) => p.filter((f) => f !== affirmation));

      try {
        await fetch(`${API}/api/affirmations/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, text: affirmation }),
        });
      } catch (err) {
        console.error("Delete fav error:", err);
      }
    }
  };

  const deleteFavorite = async (text) => {
    if (!userId) return;

    const before = favorites;
    setFavorites(before.filter((f) => f !== text));

    try {
      await fetch(`${API}/api/affirmations/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, text }),
      });
    } catch (err) {
      console.error("Error deleting:", err);
      setFavorites(before);
    }
  };

  // Speak
  const speakAffirmation = () => {
    const speech = new SpeechSynthesisUtterance(affirmation);
    speech.rate = 0.9;
    speech.pitch = 1;
    speech.lang = "en-IN";
    window.speechSynthesis.speak(speech);
  };

  // Share
  const shareAffirmation = () => {
    const text = encodeURIComponent(
      `"${affirmation}"\n\nSent via Calmana 🌿\nhttps://calmana.in`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // Download
  const downloadAffirmationImage = () => {
    const canvas = document.createElement("canvas");
    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#D1FAE5");
    gradient.addColorStop(1, "#6EE7B7");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.roundRect(60, 560, 960, 800, 40);
    ctx.fill();

    ctx.fillStyle = "#065F46";
    ctx.font = "bold 56px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const lines = wrapText(ctx, `"${affirmation}"`, 880);
    lines.forEach((line, i) =>
      ctx.fillText(line, width / 2, 960 - ((lines.length - 1) * 30) + i * 70)
    );

    const logo = new Image();
    logo.src = "/assets/Calmana_green.png";
    logo.onload = () => {
      ctx.drawImage(logo, width / 2 - 135, 1400, 270, 70);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "affirmation.png";
      link.click();
    };
  };

  const wrapText = (ctx, text, maxWidth) => {
    const words = text.split(" ");
    const lines = [];
    let line = "";

    words.forEach((word) => {
      const testLine = line + word + " ";
      if (ctx.measureText(testLine).width > maxWidth) {
        lines.push(line.trim());
        line = word + " ";
      } else line = testLine;
    });

    lines.push(line.trim());
    return lines;
  };

  if (!isClient) return null;
  const isFavorite = favorites.includes(affirmation);

  return (
    <div className="min-h-[85vh] flex flex-col bg-emerald-50 text-gray-800">
      <main className="
        flex-grow
        flex flex-col
        items-center
        px-4
        py-10
        sm:py-14
        md:justify-center
      ">

        <h2 className="text-3xl font-bold text-emerald-700 mb-6">
          Daily Affirmations
        </h2>

        {/* Main Card */}
        <div className="
        bg-white shadow-lg rounded-2xl
          p-6 sm:p-8
          w-full max-w-xl
          text-center relative
        ">


          {/* Heart */}
          <button
            onClick={toggleFavorite}
            className="absolute right-4 top-4 text-2xl sm:text-3xl"
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>

          <p
            className={`text-lg text-gray-700 italic mb-6 transition-opacity duration-500 px-5 ${fade ? "opacity-100" : "opacity-0"
              }`}
          >
            "{affirmation}"
          </p>

          <div className="
            flex flex-col
            sm:flex-row
            flex-wrap
            gap-3
            justify-center
          ">

            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md"
              onClick={generateAffirmation}
            >
              New
            </button>
            <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md"
              onClick={speakAffirmation}
            >
              🔊 Read
            </button>
            <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md"
              onClick={shareAffirmation}
            >
              📤 Share
            </button>
            <button className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg shadow-md"
              onClick={downloadAffirmationImage}
            >
              📸 Download
            </button>
          </div>
        </div>

        {/* ⭐ Favorites Toggle */}
        <div className="mt-10">
          <button
            onClick={() => setShowFav(!showFav)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md flex gap-2"
          >
            {showFav ? "Hide Favorites" : "Show Favorites"} ⭐
          </button>
        </div>

        {/* ⭐ Collapsible Favorites Section */}
        <div
          className={`transition-all duration-500 overflow-hidden w-full max-w-xl ${showFav ? "max-h-[1000px] mt-6" : "max-h-0"
            }`}
        >
          <div className="bg-white shadow-lg rounded-2xl p-5 border border-emerald-100">
            <h3 className="text-xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
              🌟 Your Favorite Affirmations
            </h3>

            {loadingFavorites ? (
              <p className="text-gray-500 text-sm">Loading favorites...</p>
            ) : favorites.length === 0 ? (
              <p className="text-gray-500 text-sm italic">
                You have no favorites yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favorites.map((fav, index) => (
                  <div
                    key={index}
                    className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <p className="text-sm text-emerald-900 italic">"{fav}"</p>
                    <button
                      onClick={() => deleteFavorite(fav)}
                      className="mt-3 text-red-600 hover:text-red-800 self-end"
                    >
                      ✖ Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
