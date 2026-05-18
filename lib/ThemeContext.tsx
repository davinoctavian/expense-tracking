"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  loading: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  loading: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Apply cached theme instantly from localStorage
    const cached = localStorage.getItem("theme") as Theme | null;
    if (cached) {
      setTheme(cached);
      document.documentElement.setAttribute("data-theme", cached);
    }

    // 2. Then fetch from DB to sync
    fetch("/api/user/theme")
      .then((r) => r.json())
      .then((data) => {
        if (data.theme) {
          setTheme(data.theme);
          document.documentElement.setAttribute("data-theme", data.theme);
          localStorage.setItem("theme", data.theme);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const toggleTheme = async () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);

    await fetch("/api/user/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: next }),
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
