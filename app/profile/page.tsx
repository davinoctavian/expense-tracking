"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import FormCard from "@/components/FormCard";
import ErrorMessage from "@/components/ErrorMessage";
import ButtonLoader from "@/components/ButtonLoader";
import LogoutButton from "@/components/LogoutButton";

// ✅ Move OUTSIDE the page component
type PasswordInputProps = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  show: boolean;
  onToggle: () => void;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
};

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
  inputStyle,
  labelStyle,
}: PasswordInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={labelStyle}>
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={inputStyle}
          placeholder="••••••••"
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-lg cursor-pointer"
          style={{ color: "var(--text-muted)" }}
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );
}

function getStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function getStrengthLabel(password: string): string {
  const s = getStrength(password);
  if (s === 1) return "Weak — add uppercase, numbers or symbols";
  if (s === 2) return "Fair — getting better";
  if (s === 3) return "Good — almost there";
  if (s === 4) return "Strong password!";
  return "";
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/user/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setSuccess("Password changed successfully!");
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const inputStyle = {
    backgroundColor: "var(--bg)",
    color: "var(--text)",
    border: "1px solid var(--border)",
  };

  const labelStyle = { color: "var(--text)" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Navbar title="Profile" backHref="/" />

      <div className="max-w-lg mx-auto p-4 md:p-6 pb-8 space-y-4">
        {/* User Info Card */}
        <div
          className="rounded-2xl p-5 shadow-sm flex items-center gap-4"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{ backgroundColor: "#2563eb22", color: "#2563eb" }}
          >
            {session?.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="font-semibold truncate"
              style={{ color: "var(--text)" }}
            >
              {session?.user?.name}
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              @{session?.user?.username}
            </p>
          </div>
        </div>

        {/* Change Password */}
        <FormCard title="Change Password">
          {error && <ErrorMessage message={error} />}

          {success && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
            >
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput
              label="Current Password"
              value={form.currentPassword}
              onChange={(val) => setForm({ ...form, currentPassword: val })}
              show={showCurrent}
              onToggle={() => setShowCurrent(!showCurrent)}
              inputStyle={inputStyle}
              labelStyle={labelStyle}
            />
            <PasswordInput
              label="New Password"
              value={form.newPassword}
              onChange={(val) => setForm({ ...form, newPassword: val })}
              show={showNew}
              onToggle={() => setShowNew(!showNew)}
              inputStyle={inputStyle}
              labelStyle={labelStyle}
            />
            <PasswordInput
              label="Confirm New Password"
              value={form.confirmPassword}
              onChange={(val) => setForm({ ...form, confirmPassword: val })}
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
              inputStyle={inputStyle}
              labelStyle={labelStyle}
            />

            {/* Strength indicator */}
            {form.newPassword && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => {
                    const strength = getStrength(form.newPassword);
                    return (
                      <div
                        key={level}
                        className="h-1.5 flex-1 rounded-full transition-all"
                        style={{
                          backgroundColor:
                            strength >= level
                              ? strength === 1
                                ? "#ef4444"
                                : strength === 2
                                  ? "#f97316"
                                  : strength === 3
                                    ? "#eab308"
                                    : "#22c55e"
                              : "var(--border)",
                        }}
                      />
                    );
                  })}
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {getStrengthLabel(form.newPassword)}
                </p>
              </div>
            )}

            {/* Match indicator */}
            {form.confirmPassword && (
              <p
                className="text-xs"
                style={{
                  color:
                    form.newPassword === form.confirmPassword
                      ? "#22c55e"
                      : "#ef4444",
                }}
              >
                {form.newPassword === form.confirmPassword
                  ? "✅ Passwords match"
                  : "❌ Passwords do not match"}
              </p>
            )}

            <ButtonLoader
              loading={loading}
              label="Change Password"
              loadingLabel="Changing..."
            />
          </form>
        </FormCard>
      </div>
    </div>
  );
}
