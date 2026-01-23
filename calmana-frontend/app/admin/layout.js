//calmana-frontend/app/admin/layout.js
"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  /* 🔐 AUTH CHECK */
  useEffect(() => {
    // Allow login page without admin layout
    if (pathname === "/admin/login") {
      setCheckingAuth(false);
      return;
    }

    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.replace("/admin/login");
      setIsAuth(false);
    } else {
      setIsAuth(true);
    }

    setCheckingAuth(false);
  }, [pathname, router]);

  /* 📱 Close sidebar on route change */
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "hidden";
  }, [sidebarOpen]);


  /* ⛔ BLOCK RENDER UNTIL AUTH CHECK DONE */
  if (checkingAuth) return null;

  /* ⛔ BLOCK ADMIN UI IF NOT AUTHENTICATED */
  if (!isAuth && pathname !== "/admin/login") return null;

  /* ✅ LOGIN PAGE SHOULD NOT USE ADMIN UI */
  if (pathname === "/admin/login") {
    return children;
  }

  /* 🔗 Sidebar Link */
  function SidebarLink({ label, link }) {
    const isActive = pathname === link;

    return (
      <a
        href={link}
        className={`block px-3 py-2 rounded-md transition
          ${isActive
            ? "bg-green-50 text-green-700 font-medium"
            : "hover:bg-gray-100 text-gray-700"
          }
        `}
      >
        {label}
      </a>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 overflow-hidden">

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static z-40
          h-screen
          w-60
          bg-white
          border-r border-gray-200
          p-4 flex flex-col justify-between
          transform transition-transform duration-300
          ${sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        <div>
          {/* MOBILE CLOSE BUTTON */}
          <button
            className="md:hidden absolute top-3 right-4 text-2xl text-gray-600 hover:text-gray-900"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>

          <h2 className="text-sm font-bold tracking-wide text-green-800 mb-6">
            CALMANA ADMIN
          </h2>

          <nav className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1">
                OVERVIEW
              </p>
              <SidebarLink label="Dashboard" link="/admin/dashboard" />
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1">
                MANAGEMENT
              </p>
              <SidebarLink label="Users" link="/admin/users" />
              <SidebarLink label="Journals" link="/admin/journals" />
              <SidebarLink label="Moods" link="/admin/moods" />
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1">
                ENGAGEMENT
              </p>
              <SidebarLink label="Quizzes" link="/admin/quizzes" />
              <SidebarLink label="Breathing" link="/admin/breathing" />
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1">
                CONTENT
              </p>
              <SidebarLink
                label="Affirmations"
                link="/admin/affirmations"
              />
            </div>
          </nav>
        </div>

        {/* LOGOUT */}
        <div className="pt-4 border-t border-gray-200">
          <button
            className="w-full text-sm text-red-600 hover:bg-red-50  rounded-md transition"
            onClick={() => {
              localStorage.removeItem("adminToken");
              router.replace("/admin/login");
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <div className="w-full shadow px-4 md:px-6 h-14 flex justify-between items-center bg-green-50 border-b border-green-200">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-gray-700 text-2xl leading-none"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>



            <h1 className="text-lg font-semibold text-gray-800">
              Admin Panel
            </h1>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Admin</span>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="px-4 py-4 min-h-full">
            {children}
          </div>
        </div>

      </main>
    </div>
  );
}
