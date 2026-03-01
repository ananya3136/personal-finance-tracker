import React from "react";
import { useTheme } from "./ThemeContext";
import "./ThemeToggle.css";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      className={`theme-toggle ${isDark ? "theme-toggle--dark" : "theme-toggle--light"}`}
      onClick={toggleTheme}
      title={isDark ? "Switch to Golden Hour" : "Switch to Deep Space"}
      aria-label="Toggle theme"
    >
      <div className="theme-toggle__track">
        <span className="theme-toggle__icon theme-toggle__icon--left">🌙</span>
        <span className="theme-toggle__icon theme-toggle__icon--right">☀️</span>
        <div className="theme-toggle__thumb">
          <span className="theme-toggle__thumb-icon">
            {isDark ? "🌙" : "☀️"}
          </span>
        </div>
      </div>
    </button>
  );
}

export default ThemeToggle;
