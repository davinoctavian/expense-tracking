"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function PageContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const needsBottomPadding = session && !isAuthPage;

  return (
    <div className={needsBottomPadding ? "pb-20 md:pb-0" : ""}>{children}</div>
  );
}
