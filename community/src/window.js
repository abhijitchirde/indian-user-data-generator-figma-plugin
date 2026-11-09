// A plugin window: title bar + the REAL plugin UI from dist/ui.html in an iframe.
// Run `npm run build` at the repo root first so dist/ui.html is current.
//
// On start the plugin UI asks its parent for the saved theme ("get-theme-pref") and saved
// choices ("get-ui-prefs"). This page answers both, so the same real UI can show light or
// dark, on either tab, with a chosen table layout.

(function () {
  const UI_URL = "../../dist/ui.html";
  const UI_WIDTH = 360;
  const UI_HEIGHT = 680;
  const setupFor = new Map(); // iframe window -> { theme, prefs }

  function answer(target, setup, type) {
    if (type === "get-theme-pref") {
      target.postMessage({ pluginMessage: { type: "theme-pref", value: setup.theme } }, "*");
    }
    if (type === "get-ui-prefs") {
      target.postMessage({ pluginMessage: { type: "ui-prefs", value: setup.prefs } }, "*");
    }
  }

  window.addEventListener("message", (event) => {
    const msg = event.data && event.data.pluginMessage;
    if (msg && setupFor.has(event.source)) answer(event.source, setupFor.get(event.source), msg.type);
  });

  /**
   * @param {{ theme?: "light"|"dark", icon?: number, scale?: number, tab?: "1"|"2",
   *           layout?: "columns"|"rows", height?: number }} opts
   *   height: crop the window to this many px of UI (before scaling); default: full height
   */
  window.pluginWindow = function (opts) {
    const theme = (opts && opts.theme) || "light";
    const scale = (opts && opts.scale) || 1;
    const icon = (opts && opts.icon) || 1;
    const height = (opts && opts.height) || UI_HEIGHT;
    const setup = {
      theme,
      prefs: { tab: (opts && opts.tab) || "1", tableLayout: (opts && opts.layout) || "columns" },
    };

    const win = document.createElement("div");
    win.className = "pw pw-" + theme;
    win.style.width = UI_WIDTH * scale + "px";

    const bar = document.createElement("div");
    bar.className = "pw-bar";
    bar.style.height = 40 * scale + "px";
    bar.style.fontSize = 13 * scale + "px";
    bar.style.padding = "0 " + 12 * scale + "px";
    bar.appendChild(window.renderIcon(icon, 18 * scale, { rounded: true }));
    const title = document.createElement("span");
    title.textContent = "Indian User Data Generator";
    bar.appendChild(title);
    const close = document.createElement("span");
    close.className = "pw-close";
    close.textContent = "✕";
    bar.appendChild(close);
    win.appendChild(bar);

    const body = document.createElement("div");
    body.className = "pw-body";
    body.style.width = UI_WIDTH * scale + "px";
    body.style.height = height * scale + "px";
    const frame = document.createElement("iframe");
    frame.src = UI_URL;
    frame.width = UI_WIDTH;
    frame.height = UI_HEIGHT;
    frame.style.transform = "scale(" + scale + ")";
    frame.addEventListener("load", () => {
      // Screenshots must not catch the UI halfway through its theme/accordion transitions
      try {
        const still = frame.contentDocument.createElement("style");
        still.textContent = "*, *::before, *::after { transition: none !important; animation: none !important; }";
        frame.contentDocument.head.appendChild(still);
      } catch (e) {
        // Needs --allow-file-access-from-files (render.mjs passes it)
      }
      setupFor.set(frame.contentWindow, setup);
      // Also push both, in case the UI asked before this window was registered
      answer(frame.contentWindow, setup, "get-theme-pref");
      answer(frame.contentWindow, setup, "get-ui-prefs");
    });
    setTimeout(() => frame.contentWindow && setupFor.set(frame.contentWindow, setup), 0);
    body.appendChild(frame);
    win.appendChild(body);
    return win;
  };
})();
