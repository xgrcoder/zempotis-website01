"use client";
import { createContext, useContext } from "react";

export type ThemeTokens = {
  isDark:    boolean;
  accent:    string;
  accentBg:  string;
  bg:        string;
  surface:   string;
  surface2:  string;
  sidebar:   string;
  card:      string;
  topbar:    string;
  text:      string;
  muted:     string;
  faint:     string;
  border:    string;
  border2:   string;
  inputBg:   string;
  inputBdr:  string;
  green:     string;
  greenBg:   string;
  yellow:    string;
  yellowBg:  string;
  red:       string;
  redBg:     string;
  purple:    string;
  purpleBg:  string;
};

export const ACCENT = "#4f73ff";

export function getTokens(_isDark: boolean): ThemeTokens {
  // Portal is always dark — force dark tokens regardless of argument
  return {
    isDark:   true,
    accent:   ACCENT,
    accentBg: "rgba(79,115,255,0.12)",
    bg:       "#0c0c0f",
    surface:  "#111116",
    surface2: "#17171f",
    sidebar:  "#0e0e13",
    card:     "#111116",
    topbar:   "rgba(12,12,15,0.9)",
    text:     "#f1f1f4",
    muted:    "#7a7b8e",
    faint:    "#44455a",
    border:   "rgba(255,255,255,0.07)",
    border2:  "rgba(255,255,255,0.12)",
    inputBg:  "#17171f",
    inputBdr: "rgba(255,255,255,0.10)",
    green:    "#22c55e",
    greenBg:  "rgba(34,197,94,0.1)",
    yellow:   "#eab308",
    yellowBg: "rgba(234,179,8,0.1)",
    red:      "#f43f5e",
    redBg:    "rgba(244,63,94,0.1)",
    purple:   "#a78bfa",
    purpleBg: "rgba(167,139,250,0.1)",
  };
}

export const ThemeContext = createContext<ThemeTokens>(getTokens(true));
export const useTheme = () => useContext(ThemeContext);
