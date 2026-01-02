// calmana-frontend/app/admin/layout.js
"use client";
import { useEffect, useState } from "react";

import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) router.push("/admin/login");
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);


  const menuItems = [
    ["Dashboard", "/admin/dashboard"],
    ["Users", "/admin/users"],
    ["Journals", "/admin/journals"],
    ["Moods", "/admin/moods"],
    ["Quizzes", "/admin/quizzes"],
    ["Breathing", "/admin/breathing"],
    ["Affirmations", "/admin/affirmations"],
  ];

  return (

    <div className="flex min-h-screen bg-gray-50 text-gray-800">

      {/* Sidebar */}
      <aside
        className={`
        fixed md:static z-40
        h-full md:h-auto
        w-64 md:w-56
        bg-green-200 text-green-900
        p-5 flex flex-col justify-between shadow-md
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >


        <div>
          <h2 className="text-xl font-extrabold mb-6">Calmana Admin</h2>

          <nav className="space-y-1.5 text-[15px] font-medium">
            {menuItems.map(([label, link]) => {
              const isActive = pathname === link;

              return (
                <a
                  key={label}
                  href={link}
                  className={`block px-3 py-2 rounded-md transition
                    ${isActive
                      ? "bg-green-400/80 font-semibold text-primary font-semibold border-l-4 border-green-700"
                      : "hover:bg-green-300"
                    }
                  `}
                >
                  {label}
                </a>
              );
            })}
          </nav>
        </div>

        <div>
          <button
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md transition"
            onClick={() => {
              localStorage.removeItem("adminToken");
              router.push("/admin/login");
            }}
          >
            Logout
          </button>

          <p className="mt-3 text-xs text-green-800/70 text-center">
            Admin Logged In
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col">

        {/* TOP NAV BAR */}
        {/* TOP NAV BAR */}
        <div className="w-full bg-white shadow px-4 md:px-6 h-14 flex justify-between items-center">

          <div className="flex items-center gap-3">
            {/* Hamburger — ONLY visible on mobile */}
            <button
              className="md:hidden text-green-800 text-xl"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>

            <h1 className="text-lg font-semibold text-green-800">
              Admin Panel
            </h1>
          </div>

          <div className="flex items-center gap-2 text-sm">

            <span className="font-medium">Admin</span>
            <div className="w-8 h-8 bg-green-300 rounded-full flex items-center justify-center font-bold text-green-900">
              A
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="px-4 py-4 w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
