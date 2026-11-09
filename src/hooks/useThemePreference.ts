import * as React from "react";

/** "auto" follows Figma's theme (themeColors); "light"/"dark" override it. */
export type ThemePreference = "auto" | "light" | "dark";

const ORDER: ThemePreference[] = ["auto", "light", "dark"];

export function isThemePreference(value: unknown): value is ThemePreference {
  return ORDER.indexOf(value as ThemePreference) !== -1;
}

function applyToDocument(pref: ThemePreference) {
  const root = document.documentElement;
  if (pref === "auto") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", pref);
}

/**
 * Theme preference saved per user via the plugin's figma.clientStorage
 * (the UI iframe can't rely on localStorage inside Figma).
 */
export function useThemePreference() {
  const [preference, setPreference] = React.useState<ThemePreference>("auto");

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const msg = event.data?.pluginMessage;
      if (msg?.type === "theme-pref" && isThemePreference(msg.value)) {
        setPreference(msg.value);
      }
    };
    window.addEventListener("message", onMessage);
    parent.postMessage({ pluginMessage: { type: "get-theme-pref" } }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, []);

  React.useEffect(() => applyToDocument(preference), [preference]);

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(preference) + 1) % ORDER.length];
    setPreference(next);
    parent.postMessage({ pluginMessage: { type: "set-theme-pref", value: next } }, "*");
  };

  return { preference, cycle };
}
