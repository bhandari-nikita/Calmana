// calmana-frontend/components/Navbar.js
"use client";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Logged-in state
  const [username, setUsername] = useState(null);

  // Initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (token && storedUsername) {
      setUsername(storedUsername);
    } else {
      setUsername(null);
    }
  }, []);

  // ⭐ Update navbar instantly on login/logout (custom event)
  useEffect(() => {
    const handleAuthEvent = () => {
      const token = localStorage.getItem("token");
      const storedUsername = localStorage.getItem("username");

      if (token && storedUsername) {
        setUsername(storedUsername);
      } else {
        setUsername(null);
      }
    };

    window.addEventListener("authEvent", handleAuthEvent);
    return () => window.removeEventListener("authEvent", handleAuthEvent);
  }, []);

  // ⭐ Also listen for localStorage updates (other tabs)
  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem("token");
      const storedUsername = localStorage.getItem("username");

      if (token && storedUsername) {
        setUsername(storedUsername);
      } else {
        setUsername(null);
      }
    };

    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const isActive = (path) =>
    pathname === path ? "text-[#4e937a] font-semibold" : "text-[#2f5d4a]";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ⭐ Logout
  const handleLogout = () => {
    // localStorage.removeItem("token");
    // localStorage.removeItem("username");
    // localStorage.removeItem("userId");

    localStorage.clear();


    // Trigger navbar update immediately
    localStorage.setItem("authEvent", Date.now());
    window.dispatchEvent(new Event("authEvent"));

    router.push("/login");
  };

return (
  <nav className="bg-[#d4f0d4] border-b border-[#a8d5ba] shadow-md">
    <div className="max-w-7xl mx-auto px-6 py-3">

      {/* Top Row */}
      <div className="flex items-center justify-between">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <Image
            src="/assets/Calmana_green.png"
            alt="Calmana Logo"
            width={120}
            height={36}
            priority
          />
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="/" className={isActive("/")}>Home</a>
          <a href="/about" className={isActive("/about")}>About</a>
          <a href="/quiz" className={isActive("/quiz")}>Quiz</a>

          {/* Tools Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-[#2f5d4a] hover:text-[#4e937a]"
            >
              Tools ▾
            </button>

            {isDropdownOpen && (
              <div className="absolute bg-white shadow-lg rounded-lg border border-[#a8d5ba] mt-2 w-44 z-20">
                {[
                  ["Mood Tracker", "/mood-tracker"],
                  ["Journal", "/journal"],
                  ["Affirmations", "/affirmations"],
                  ["Breathing", "/breathing"],
                ].map(([label, link]) => (
                  <a
                    key={link}
                    href={link}
                    className={`block px-4 py-2 hover:bg-[#d4f0d4] ${isActive(link)}`}
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <a href="/support" className={isActive("/support")}>Support</a>
          {username && <a href="/dashboard" className={isActive("/dashboard")}>Dashboard</a>}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3 text-sm">
          {username ? (
            <>
              {/* <span className="text-[#2f5d4a]">
                <b>{username}</b>
              </span> */}

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>

              <a
                href="/settings"
                className="px-3 py-2 bg-[#4e937a] text-white rounded-lg hover:bg-[#3f7f68]"
              >
                Settings
              </a>
            </>
          ) : (
            <>
              <a href="/login" className="px-4 py-2 bg-[#4e937a] text-white rounded-lg">
                Login
              </a>
              <a
                href="/register"
                className="px-4 py-2 border border-[#4e937a] text-[#4e937a] rounded-lg hover:bg-[#4e937a] hover:text-white"
              >
                Register
              </a>
            </>
          )}
        </div>

        {/* Hamburger (Mobile) */}
        <button
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
          className="md:hidden text-2xl text-[#2f5d4a]"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 space-y-3 text-sm border-t border-[#a8d5ba] pt-4">

          {[
            ["Home", "/"],
            ["About", "/about"],
            ["Quiz", "/quiz"],
            ["Mood Tracker", "/mood-tracker"],
            ["Journal", "/journal"],
            ["Affirmations", "/affirmations"],
            ["Breathing", "/breathing"],
            ["Support", "/support"],
          ].map(([label, link]) => (
            <a
              key={link}
              href={link}
              className={`block ${isActive(link)}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {label}
            </a>
          ))}

          <div className="pt-3 border-t border-[#a8d5ba]">
            {username ? (
              <>
                <a href="/dashboard" className="block mb-2">Dashboard</a>
                <a href="/settings" className="block mb-2">Settings</a>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="block mb-2">Login</a>
                <a href="/register" className="block">Register</a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  </nav>
);
}