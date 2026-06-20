"use client";

import { useSyncExternalStore } from "react";
import { Switch } from "@/components/ui/switch";

type ThemeMode = "light" | "dark";

const THEME_CHANGE_EVENT = "jobbiton-theme-change";

function getCurrentTheme(): ThemeMode {
  if (typeof document === "undefined") {
    return "dark";
  }

  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(theme: ThemeMode): void {
  document.documentElement.dataset.theme = theme;

  try {
    window.localStorage.setItem("jobbiton-theme", theme);
  } catch (error) {
    console.error("[ThemeToggle] Unable to persist theme", error);
  }

  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

function subscribeToTheme(callback: () => void): () => void {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerTheme(): ThemeMode {
  return "dark";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getCurrentTheme,
    getServerTheme,
  );

  function handleToggle(): void {
    const nextTheme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-secondary px-2.5 py-1.5 text-[12px] font-semibold leading-4 text-text-secondary shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_5%,transparent)] transition hover:border-accent hover:text-text-primary">
      <Switch
        checked={theme === "dark"}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        onClick={handleToggle}
      />
      <span className="hidden min-w-9 text-left lg:inline">
        {theme === "dark" ? "Dark" : "Light"}
      </span>
    </span>
  );
}
