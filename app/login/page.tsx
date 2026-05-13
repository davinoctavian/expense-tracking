"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ButtonLoader from "@/components/ButtonLoader";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      username: form.username,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid username or password");
      return;
    }

    router.push("/");
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
        className="m-4 p-8 rounded-2xl shadow-md w-full max-w-md"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        <h1
          className="text-2xl font-bold mb-6"
          style={{ color: "var(--text)" }}
        >
          Welcome Back
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
            label="Login"
            loadingLabel="Logging in..."
          />
        </form>

        <p
          className="text-sm text-center mt-4"
          style={{ color: "var(--text-muted)" }}
        >
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
