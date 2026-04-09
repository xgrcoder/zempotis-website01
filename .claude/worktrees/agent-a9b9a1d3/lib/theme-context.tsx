"use client";
import { createContext, useContext } from "react";

export type ThemeTokens = {
  isDark:   boolean;
  accent:   string;
  bg:       string;
  sidebar:  string;
  card:     string;
  topbar:   string;
  text:     string;
  muted:    string;
  border:   string;
  inputBg:  string;
  inputBdr: string;
};

export const ACCENT = "#2563eb";

export function getTokens(isDark: boolean): ThemeTokens {
  if (isDark) return {
    isDark: true, accent: ACCENT,
    bg: "#13100e", sidebar: "#1c1814", card: "#221e1b",
    topbar: "rgba(19,16,14,0.96)", text: "#f0ebe5", muted: "#8a7b71",
    border: "rgba(255,210,170,0.08)", inputBg: "#1c1814", inputBdr: "rgba(255,210,170,0.14)",
  };
  return {
    isDark: false, accent: ACCENT,
    bg: "#f7f8fa", sidebar: "#ffffff", card: "#ffffff",
    topbar: "rgba(255,255,255,0.96)", text: "#0f172a", muted: "#9ca3af",
    border: "rgba(0,0,0,0.065)", inputBg: "#f8faff", inputBdr: "rgba(37,99,235,0.15)",
  };
}

export const ThemeContext = createContext<ThemeTokens>(getTokens(false));
export const useTheme = () => useContext(ThemeContext);
