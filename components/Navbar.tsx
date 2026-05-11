"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "./ThemeToggle";

type NavLink = {
  href: string;
  label: string;
};

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
      className="shadow-sm px-6 py-4 flex items-center gap-4"
      style={{
        backgroundColor: "var(--nav-bg)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {backHref && (
        <Link
          href={backHref}
          className="transition"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          ←
        </Link>
      )}
      <h1 className="text-lg font-bold" style={{ color: "var(--text)" }}>
        {title}
      </h1>

      {showUserLinks && (
        <>
          <span className="text-sm ml-2" style={{ color: "var(--text-muted)" }}>
            Hi, {session?.user?.name}
          </span>
          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/transactions/add"
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
            >
              + Add
            </Link>
            <Link
              href="/history"
              className="text-sm hover:underline"
              style={{ color: "var(--text)" }}
            >
              History
            </Link>
            <Link
              href="/budgets"
              className="text-sm hover:underline"
              style={{ color: "var(--text)" }}
            >
              Budgets
            </Link>
            <Link
              href="/categories"
              className="text-sm hover:underline"
              style={{ color: "var(--text)" }}
            >
              Categories
            </Link>
            <Link
              href="/data"
              className="text-sm hover:underline"
              style={{ color: "var(--text)" }}
            >
              Data
            </Link>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </>
      )}

      {links && !showUserLinks && (
        <div className="ml-auto flex items-center gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-gray-600 hover:underline"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}

      {actions && (
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      )}
    </nav>
  );
}
