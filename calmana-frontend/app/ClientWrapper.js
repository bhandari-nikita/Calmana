//calmana-frontend/app/ClientWrapper.js
"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClientWrapper({ children }) {
  const pathname = usePathname();

  // ADMIN routes start with "/admin"
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow">{children}</main>
      {!isAdminRoute && <Footer />}
    </>
  );
}
