"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

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

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Super Admin</h1>
            <p className="text-sm text-gray-500">
              {users.length} registered users
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to App
            </button>
            <LogoutButton />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">User</th>
                <th className="px-6 py-3 text-left">Username</th>
                <th className="px-6 py-3 text-center">Transactions</th>
                <th className="px-6 py-3 text-center">Categories</th>
                <th className="px-6 py-3 text-center">Budgets</th>
                <th className="px-6 py-3 text-center">Joined</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500">@{user.username}</td>
                  <td className="px-6 py-4 text-center">
                    {user._count.transactions}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user._count.categories}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user._count.budgets}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleDeleteData(user.id, user.name)}
                        disabled={actionLoading === user.id + "-data"}
                        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 disabled:opacity-50"
                      >
                        {actionLoading === user.id + "-data"
                          ? "Clearing..."
                          : "Clear Data"}
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(user.id, user.name)}
                        disabled={actionLoading === user.id + "-account"}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                      >
                        {actionLoading === user.id + "-account"
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
