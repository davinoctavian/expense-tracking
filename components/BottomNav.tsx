"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const navItems = [
  { href: "/", icon: "📊", label: "Dashboard" },
  { href: "/history", icon: "📋", label: "History" },
  { href: "/transactions/add", icon: "➕", label: "Add" },
  { href: "/budgets", icon: "💰", label: "Budgets" },
  { href: "/categories", icon: "🏷️", label: "Categories" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Don't show on auth pages or when not logged in
  if (status === "loading") return null;
  if (!session) return null;
  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{
        backgroundColor: "var(--bg-card)",
        borderTop: "1px solid var(--border)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const isAdd = item.href === "/transactions/add";

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition"
              style={{
                color: isActive ? "#2563eb" : "var(--text-muted)",
                minWidth: "3rem",
              }}
            >
              {isAdd ? (
                <span
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg -mt-5"
                  style={{ backgroundColor: "#2563eb", color: "white" }}
                >
                  ➕
                </span>
              ) : (
                <>
                  <span className="text-xl">{item.icon}</span>
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: isActive ? "#2563eb" : "var(--text-muted)",
                    }}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
