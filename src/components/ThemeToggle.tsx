import * as React from "react";
import { ThemePreference, useThemePreference } from "../hooks/useThemePreference";

const ICON: Record<ThemePreference, string> = { auto: "🌗", light: "☀️", dark: "🌙" };
const LABEL: Record<ThemePreference, string> = {
  auto: "Auto (follows Figma)",
  light: "Light",
  dark: "Dark",
};
const NEXT: Record<ThemePreference, ThemePreference> = { auto: "light", light: "dark", dark: "auto" };

const ThemeToggle = () => {
  const { preference, cycle } = useThemePreference();
  const title = `Theme: ${LABEL[preference]}. Click for ${LABEL[NEXT[preference]]}`;

  return (
    <button className="icon-button" onClick={cycle} title={title} aria-label={title}>
      {ICON[preference]}
    </button>
  );
};

export default ThemeToggle;
