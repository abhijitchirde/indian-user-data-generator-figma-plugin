import * as React from "react";
import { DEFAULT_PREFS, sanitizePrefs, UiPrefs } from "../prefs";

/**
 * UI choices (open tab, table fields, user count, profession domains), loaded from the
 * plugin's figma.clientStorage on open and saved shortly after every change.
 * prefs is null until loaded, so the tabs render once with the right values.
 */
export function usePrefs() {
  const [prefs, setPrefs] = React.useState<UiPrefs | null>(null);
  const changedByUser = React.useRef(false);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const msg = event.data?.pluginMessage;
      if (msg?.type === "ui-prefs") setPrefs(sanitizePrefs(msg.value));
    };
    window.addEventListener("message", onMessage);
    parent.postMessage({ pluginMessage: { type: "get-ui-prefs" } }, "*");

    // Outside Figma (e.g. ui.html opened in a browser) nothing answers: use the defaults
    const fallback = window.setTimeout(() => setPrefs((p) => p ?? DEFAULT_PREFS), 500);

    return () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(fallback);
    };
  }, []);

  // Save after changes (not after loading); short delay so typing doesn't save every key
  React.useEffect(() => {
    if (!prefs || !changedByUser.current) return;
    const timer = window.setTimeout(() => {
      parent.postMessage({ pluginMessage: { type: "set-ui-prefs", value: prefs } }, "*");
    }, 150);
    return () => window.clearTimeout(timer);
  }, [prefs]);

  const update = React.useCallback((patch: Partial<UiPrefs>) => {
    changedByUser.current = true;
    setPrefs((prev) => ({ ...(prev ?? DEFAULT_PREFS), ...patch }));
  }, []);

  return { prefs, update };
}
