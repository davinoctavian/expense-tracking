"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "./ThemeToggle";

type NavLink = { href: string; label: string };

type Props = {
  title?: string;
  backHref?: string;
  links?: NavLink[];
  actions?: React.ReactNode;
  showUserLinks?: boolean;
};

export default function Navbar({
  title = "💸 Expenses",
  backHref,
  links,
  actions,
  showUserLinks = false,
}: Props) {
  const { data: session } = useSession();

  return (
    <nav
      className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
      style={{
        backgroundColor: "var(--nav-bg)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(8px)",
      }}
    >
      {backHref && (
        <Link
          href={backHref}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition"
          style={{ color: "var(--text-muted)", backgroundColor: "var(--bg)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          ←
        </Link>
      )}

      <h1
        className="text-base font-bold flex-1 truncate"
        style={{ color: "var(--text)" }}
      >
        {title}
      </h1>

      {/* Desktop only user links */}
      {showUserLinks && (
        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            Hi, {session?.user?.name}
          </span>
          <Link
            href="/data"
            className="text-sm hover:underline"
            style={{ color: "var(--text-muted)" }}
          >
            Data
          </Link>
          <Link
            href="/history"
            className="text-sm hover:underline"
            style={{ color: "var(--text-muted)" }}
          >
            Transaction
          </Link>
          <Link
            href="/budgets"
            className="text-sm hover:underline"
            style={{ color: "var(--text-muted)" }}
          >
            Budgets
          </Link>
          <Link
            href="/categories"
            className="text-sm hover:underline"
            style={{ color: "var(--text-muted)" }}
          >
            Categories
          </Link>
        </div>
      )}

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {showUserLinks && (
          <div className="hidden md:block">
            <LogoutButton />
          </div>
        )}
        {actions}
      </div>
    </nav>
  );
}
