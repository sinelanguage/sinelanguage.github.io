(function () {
  const STORAGE_KEY = "color-mode";
  const MODES = ["auto", "light", "dark"];
  const EVENING_START = 18;
  const MORNING_START = 6;

  function isEvening(date) {
    const hour = (date || new Date()).getHours();
    return hour < MORNING_START || hour >= EVENING_START;
  }

  function resolveTheme(mode) {
    if (mode === "light" || mode === "dark") {
      return mode;
    }
    return isEvening() ? "dark" : "light";
  }

  function getMode() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return MODES.includes(stored) ? stored : "auto";
  }

  function applyMode(mode) {
    const theme = resolveTheme(mode);
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.mode = mode;

    const button = document.getElementById("theme-toggle");
    if (!button) {
      return;
    }

    const label = button.querySelector(".theme-toggle__label");
    if (label) {
      label.textContent = mode;
    }

    const period = isEvening() ? "evening" : "morning";
    const autoHint =
      mode === "auto"
        ? `, following ${period} (${theme})`
        : "";
    button.setAttribute(
      "aria-label",
      `Color mode: ${mode}${autoHint}. Click to change.`
    );
  }

  function nextMode(mode) {
    return MODES[(MODES.indexOf(mode) + 1) % MODES.length];
  }

  function init() {
    const button = document.getElementById("theme-toggle");
    if (!button) {
      return;
    }

    applyMode(getMode());

    button.addEventListener("click", function () {
      const mode = nextMode(getMode());
      localStorage.setItem(STORAGE_KEY, mode);
      applyMode(mode);
    });

    // Keep Auto in sync when morning/evening crosses while the tab is open.
    window.setInterval(function () {
      if (getMode() === "auto") {
        applyMode("auto");
      }
    }, 60 * 1000);

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && getMode() === "auto") {
        applyMode("auto");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
