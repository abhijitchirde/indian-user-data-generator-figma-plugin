// Icon options for Indian User Data. Each icon is an SVG on a 100×100 grid.
// renderIcon(option, sizePx, { rounded }) returns an element.
// No maps or flags: India's map outline is politically sensitive and the national flag
// can't be used as branding, so the Indian flavour comes from colour and craft (kolam).

(function () {
  // Unique ids per rendered icon, so many copies of one icon on a page don't share gradients
  let uid = 0;

  // Option 4: a person drawn with kolam-style dots on a faint dot grid
  function kolamDots() {
    const dots = [];
    const inHead = (x, y) => (x - 50) ** 2 + (y - 36) ** 2 <= 17.5 ** 2;
    const inBody = (x, y) => y >= 60 && ((x - 50) / 35) ** 2 + ((y - 92) / 30) ** 2 <= 1;
    for (let y = 8; y <= 92; y += 7) {
      for (let x = 8; x <= 92; x += 7) {
        const on = inHead(x, y) || inBody(x, y);
        dots.push(
          on
            ? `<circle cx="${x}" cy="${y}" r="2.7" fill="url(#k-${"ID"})" />`
            : `<circle cx="${x}" cy="${y}" r="1.1" fill="#fff" opacity="0.2" />`
        );
      }
    }
    return dots.join("");
  }

  const OPTIONS = [
    {
      id: 1,
      name: "ID card",
      note: "A profile card with a photo and details: reads as 'user data' at any size. Indigo with a saffron avatar.",
      svg: () => `
        <defs>
          <linearGradient id="bg-ID" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#6d6cff" /><stop offset="1" stop-color="#3527c7" />
          </linearGradient>
          <linearGradient id="av-ID" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#ffb347" /><stop offset="1" stop-color="#ff6a3d" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#bg-ID)" />
        <circle cx="18" cy="8" r="58" fill="#fff" opacity="0.09" />
        <rect x="12" y="26" width="76" height="50" rx="9" fill="#fff" />
        <rect x="18" y="32" width="26" height="38" rx="5.5" fill="#fff1e6" />
        <circle cx="31" cy="45.5" r="7" fill="url(#av-ID)" />
        <path d="M20.5 67 C21.5 57.5 40.5 57.5 41.5 67 Z" fill="url(#av-ID)" />
        <rect x="50" y="37" width="31" height="7" rx="3.5" fill="#3527c7" />
        <rect x="50" y="50" width="24" height="5.5" rx="2.75" fill="#c7cdfa" />
        <rect x="50" y="60.5" width="28" height="5.5" rx="2.75" fill="#c7cdfa" />`,
    },
    {
      id: 2,
      name: "User list",
      note: "Three users in rows, like a user set or table. Warm saffron to rose.",
      svg: () => `
        <defs>
          <linearGradient id="bg-ID" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#ffb03a" /><stop offset="1" stop-color="#f0436a" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#bg-ID)" />
        <circle cx="85" cy="0" r="50" fill="#fff" opacity="0.10" />
        ${[
          [19, "#f0436a", 44],
          [41.5, "#ff8a1f", 34],
          [64, "#0f766e", 40],
        ]
          .map(
            ([y, color, w], i) => `
          <rect x="13" y="${y}" width="74" height="17" rx="6" fill="#fff" opacity="${1 - i * 0.06}" />
          <circle cx="23.5" cy="${y + 8.5}" r="5" fill="${color}" />
          <rect x="33" y="${y + 6}" width="${w}" height="5" rx="2.5" fill="#f6d5cf" />`
          )
          .join("")}`,
    },
    {
      id: 3,
      name: "Spark",
      note: "A person with a spark: users made for you in a click. Deep navy with a saffron sparkle.",
      svg: () => `
        <defs>
          <linearGradient id="bg-ID" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#26346e" /><stop offset="1" stop-color="#0f172a" />
          </linearGradient>
          <linearGradient id="sp-ID" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#ffc145" /><stop offset="1" stop-color="#ff7a1f" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#bg-ID)" />
        <circle cx="44" cy="43" r="15" fill="#fff" />
        <path d="M15 88 C17 64.5 71 64.5 73 88 Z" fill="#fff" />
        <path d="M77 11 C78.6 21.5 81.5 24.4 92 26 C81.5 27.6 78.6 30.5 77 41 C75.4 30.5 72.5 27.6 62 26 C72.5 24.4 75.4 21.5 77 11 Z" fill="url(#sp-ID)" />
        <path d="M88 47 C88.6 51 89.9 52.4 94 53 C89.9 53.6 88.6 55 88 59 C87.4 55 86.1 53.6 82 53 C86.1 52.4 87.4 51 88 47 Z" fill="url(#sp-ID)" opacity="0.85" />`,
    },
    {
      id: 4,
      name: "Kolam",
      note: "A person drawn in kolam (rangoli) dots: an Indian craft and literal data points. Marigold on peacock teal.",
      svg: () => `
        <defs>
          <linearGradient id="bg-ID" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#0f8f86" /><stop offset="1" stop-color="#0b4a52" />
          </linearGradient>
          <linearGradient id="k-ID" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#ffd166" /><stop offset="1" stop-color="#ff8a1f" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#bg-ID)" />
        ${kolamDots()}`,
    },
  ];

  window.ICON_OPTIONS = OPTIONS;

  window.renderIcon = function (option, size, opts) {
    const def = OPTIONS.find((o) => o.id === Number(option)) || OPTIONS[0];
    const id = "i" + uid++;
    const wrap = document.createElement("div");
    wrap.className = "icon-wrap" + (opts && opts.rounded ? " rounded" : "");
    wrap.style.width = size + "px";
    wrap.style.height = size + "px";
    wrap.innerHTML = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${def
      .svg()
      .replace(/ID/g, id)}</svg>`;
    return wrap;
  };
})();
