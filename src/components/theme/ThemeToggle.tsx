"use client";

import { useState } from "react";

import {
  normalizeThemePreference,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "@/lib/theme";

interface ThemeToggleProps {
  className?: string;
}

const options: Array<{ value: ThemePreference; label: string }> = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function applyTheme(theme: ThemePreference) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);

  const existingMeta = document.head.querySelector<HTMLMetaElement>(
    'meta[data-theme-color="manual"]',
  );

  if (theme === "system") {
    existingMeta?.remove();
    return;
  }

  const color = theme === "dark" ? "#0d0a12" : "#f5f1eb";
  const meta =
    existingMeta ??
    (() => {
      const created = document.createElement("meta");
      created.name = "theme-color";
      created.setAttribute("data-theme-color", "manual");
      document.head.appendChild(created);
      return created;
    })();

  meta.content = color;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemePreference>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    const domTheme = normalizeThemePreference(
      document.documentElement.getAttribute("data-theme"),
    );

    if (domTheme !== "system") {
      return domTheme;
    }

    return normalizeThemePreference(localStorage.getItem(THEME_STORAGE_KEY));
  });

  function setPreference(nextTheme: ThemePreference) {
    setTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <div suppressHydrationWarning className={`flex items-center gap-2 ${className}`}>
      <span className="text-[11px] tracking-[0.14em] text-[var(--color-text-faint)] uppercase">
        Theme
      </span>
      <div className="inline-flex border border-[var(--color-border)] bg-[var(--color-field-bg)] p-0.5">
        {options.map((option) => {
          const selected = theme === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setPreference(option.value)}
              className={`px-2.5 py-1.5 text-[11px] font-medium tracking-wide transition ${
                selected
                  ? "bg-[var(--color-saffron)] text-[var(--color-obsidian)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)]"
              }`}
              aria-pressed={selected}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
