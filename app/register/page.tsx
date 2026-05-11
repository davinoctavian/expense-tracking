"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ButtonLoader from "@/components/ButtonLoader";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    router.push("/login");
  };

  const inputStyle = {
    backgroundColor: "var(--bg)",
    color: "var(--text)",
    border: "1px solid var(--border)",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div
        className="p-8 rounded-2xl shadow-md w-full max-w-md"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        <h1
          className="text-2xl font-bold mb-6"
          style={{ color: "var(--text)" }}
        >
          Create Account
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--text)" }}
            >
              Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={inputStyle}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--text)" }}
            >
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={inputStyle}
              placeholder="johndoe"
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--text)" }}
            >
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={inputStyle}
              placeholder="••••••••"
              required
            />
          </div>

          <ButtonLoader
            loading={loading}
            label="Register"
            loadingLabel="Creating account..."
          />
        </form>

        <p
          className="text-sm text-center mt-4"
          style={{ color: "var(--text-muted)" }}
        >
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
