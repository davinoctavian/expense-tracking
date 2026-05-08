"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";

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
    <nav className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
      {backHref && (
        <Link href={backHref} className="text-gray-500 hover:text-gray-800">
          ←
        </Link>
      )}
      <h1 className="text-lg font-bold text-gray-800">{title}</h1>

      {showUserLinks && (
        <>
          <span className="text-sm text-gray-500 ml-2">
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
              className="text-sm text-gray-600 hover:underline"
            >
              History
            </Link>
            <Link
              href="/budgets"
              className="text-sm text-gray-600 hover:underline"
            >
              Budgets
            </Link>
            <Link
              href="/categories"
              className="text-sm text-gray-600 hover:underline"
            >
              Categories
            </Link>
            <Link
              href="/data"
              className="text-sm text-gray-600 hover:underline"
            >
              Data
            </Link>
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
