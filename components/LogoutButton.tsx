"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm text-red-500 cursor-pointer hover:underline"
    >
      Logout
    </button>
  );
}
