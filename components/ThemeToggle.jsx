"use client";

import { useEffect, useState } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";

const ThemeToggle = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("yt-theme") || "light";
    setTheme(saved);
    document.documentElement.dataset.theme = saved === "dark" ? "dark" : "light";
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("yt-theme", next);
    document.documentElement.dataset.theme = next;
  };

  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      aria-label="Toggle theme"
      style={{
        width: 40, height: 40, display: "inline-grid", placeItems: "center",
        background: "transparent", border: "none", borderRadius: "50%",
        cursor: "pointer", color: "var(--yt-text)", fontSize: 19,
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "var(--yt-surface-2)")}
      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {theme === "dark" ? <MdLightMode /> : <MdDarkMode />}
    </button>
  );
};

export default ThemeToggle;
