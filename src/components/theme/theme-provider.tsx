"use client";

// Theme provider — light / dark / system cycling.
// ------------------------------------------------------------
// Three modes the user can pick from the toggle:
//   "light"  — force light
//   "dark"   — force dark
//   "system" — follow prefers-color-scheme
//
// The actual <html class="dark"> is set by an inline script in
// layout.tsx BEFORE hydration to avoid a flash. This provider
// just keeps state in sync with localStorage + matchMedia after
// mount, and exposes `useTheme()` so components can read + change.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (next: ThemeMode) => void;
  toggle: () => void;
};

const STORAGE_KEY = "fixpass-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* localStorage blocked — fall through */
  }
  return "system";
}

function resolveMode(mode: ThemeMode): ResolvedTheme {
  if (mode === "light" || mode === "dark") return mode;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const initialMode = readStoredMode();
    setModeState(initialMode);
    setResolved(resolveMode(initialMode));
  }, []);

  const applyMode = useCallback((next: ThemeMode) => {
    const resolvedNext = resolveMode(next);
    setResolved(resolvedNext);
    const root = document.documentElement;
    if (resolvedNext === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      if (next === "system") window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* quota or private mode — non-fatal */
    }
  }, []);

  const setMode = useCallback(
    (next: ThemeMode) => {
      setModeState(next);
      applyMode(next);
    },
    [applyMode],
  );

  // Listen for OS scheme changes when in "system" mode.
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyMode("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode, applyMode]);

  // system → light → dark → system
  const toggle = useCallback(() => {
    setMode(mode === "system" ? "light" : mode === "light" ? "dark" : "system");
  }, [mode, setMode]);

  const value = useMemo(
    () => ({ mode, resolved, setMode, toggle }),
    [mode, resolved, setMode, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      mode: "system",
      resolved: "light",
      setMode: () => {},
      toggle: () => {},
    };
  }
  return ctx;
}
