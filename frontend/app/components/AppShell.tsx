"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const publicRoutes = ["/login", "/register"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    const loggedIn = !!token && !!user;
    setIsAuthenticated(loggedIn);

    if (!loggedIn && !publicRoutes.includes(pathname)) {
      router.replace("/login");
      return;
    }

    if (loggedIn && (pathname === "/login" || pathname === "/register")) {
      router.replace("/dashboard");
      return;
    }

    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return null;
  }

  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#f6f8fc]">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}