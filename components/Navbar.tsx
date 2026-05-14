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
          className="flex items-center justify-center w-9 h-9 rounded-xl transition active:scale-95"
          style={{
            backgroundColor: "var(--bg)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--border)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--bg)")
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
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
        <Link
          href="/profile"
          className="flex items-center justify-center w-9 h-9 rounded-xl transition active:scale-95"
        >
          👤
        </Link>
        <ThemeToggle />
        {!actions && (
          <div className="md:block">
            <LogoutButton />
          </div>
        )}
        {actions}
      </div>
    </nav>
  );
}
