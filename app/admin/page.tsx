"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import SpyModal from "@/components/SpyModal";

type User = {
  id: string;
  name: string;
  username: string;
  createdAt: string;
  _count: {
    transactions: number;
    categories: number;
    budgets: number;
  };
};

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [spyUser, setSpyUser] = useState<{ id: string; name: string } | null>(
    null,
  );

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteData = async (userId: string, name: string) => {
    if (!confirm(`Clear ALL data for ${name}? This cannot be undone.`)) return;
    setActionLoading(userId + "-data");
    await fetch(`/api/admin/users/${userId}/data`, { method: "DELETE" });
    setActionLoading(null);
    fetchUsers();
  };

  const handleDeleteAccount = async (userId: string, name: string) => {
    if (!confirm(`Delete account for ${name}? This cannot be undone.`)) return;
    setActionLoading(userId + "-account");
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setActionLoading(null);
    fetchUsers();
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "var(--bg)" }}>
      {/* Spy Modal */}
      {spyUser && (
        <SpyModal
          userId={spyUser.id}
          userName={spyUser.name}
          onClose={() => setSpyUser(null)}
        />
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
              Super Admin
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {users.length} registered users
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-blue-500 hover:underline cursor-pointer"
            >
              ← Back to App
            </button>
            <LogoutButton />
          </div>
        </div>

        <div
          className="rounded-2xl shadow-sm overflow-auto"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--bg)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {[
                  "User",
                  "Username",
                  "Transactions",
                  "Categories",
                  "Budgets",
                  "Joined",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-6 py-3 text-xs font-semibold uppercase tracking-wide ${
                      h === "User" || h === "Username"
                        ? "text-left"
                        : "text-center"
                    }`}
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center"
                    style={{ color: "var(--text-muted)" }}
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user, i) => (
                  <tr
                    key={user.id}
                    style={{
                      borderTop: i > 0 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <td
                      className="px-6 py-4 font-medium"
                      style={{ color: "var(--text)" }}
                    >
                      {user.name}
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ color: "var(--text-muted)" }}
                    >
                      @{user.username}
                    </td>
                    <td
                      className="px-6 py-4 text-center"
                      style={{ color: "var(--text)" }}
                    >
                      {user._count.transactions}
                    </td>
                    <td
                      className="px-6 py-4 text-center"
                      style={{ color: "var(--text)" }}
                    >
                      {user._count.categories}
                    </td>
                    <td
                      className="px-6 py-4 text-center"
                      style={{ color: "var(--text)" }}
                    >
                      {user._count.budgets}
                    </td>
                    <td
                      className="px-6 py-4 text-center"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        {/* Spy Button */}
                        <button
                          onClick={() =>
                            setSpyUser({ id: user.id, name: user.name })
                          }
                          className="px-3 py-1 text-xs rounded-lg transition cursor-pointer"
                          style={{
                            backgroundColor: "#e0e7ff",
                            color: "#4338ca",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#c7d2fe")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#e0e7ff")
                          }
                        >
                          🔍 Spy
                        </button>
                        <button
                          onClick={() => handleDeleteData(user.id, user.name)}
                          disabled={actionLoading === user.id + "-data"}
                          className="px-3 py-1 text-xs rounded-lg transition cursor-pointer disabled:opacity-50"
                          style={{
                            backgroundColor: "#fef9c3",
                            color: "#a16207",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#fef08a")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#fef9c3")
                          }
                        >
                          {actionLoading === user.id + "-data"
                            ? "Clearing..."
                            : "Clear Data"}
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteAccount(user.id, user.name)
                          }
                          disabled={actionLoading === user.id + "-account"}
                          className="px-3 py-1 text-xs rounded-lg transition cursor-pointer disabled:opacity-50"
                          style={{
                            backgroundColor: "#fee2e2",
                            color: "#b91c1c",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#fecaca")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#fee2e2")
                          }
                        >
                          {actionLoading === user.id + "-account"
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
