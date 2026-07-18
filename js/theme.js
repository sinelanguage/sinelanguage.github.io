(function () {
  const STORAGE_KEY = "color-mode-override";
  const EVENING_START = 18;
  const MORNING_START = 6;

  function isEvening(date) {
    const hour = (date || new Date()).getHours();
    return hour < MORNING_START || hour >= EVENING_START;
  }

  function currentPeriod() {
    return isEvening() ? "evening" : "morning";
  }

  function autoTheme() {
    return isEvening() ? "dark" : "light";
  }

  function getOverride() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (
        (parsed.theme === "light" || parsed.theme === "dark") &&
        (parsed.period === "morning" || parsed.period === "evening")
      ) {
        return parsed;
      }
    } catch (error) {
      // Ignore malformed storage and fall back to auto.
    }
    return null;
  }

  function setOverride(theme) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ theme: theme, period: currentPeriod() })
    );
  }

  function clearOverride() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function resolveTheme() {
    const override = getOverride();
    if (override && override.period === currentPeriod()) {
      return override.theme;
    }
    if (override) {
      clearOverride();
    }
    return autoTheme();
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;

    const button = document.getElementById("theme-toggle");
    if (!button) {
      return;
    }

    const isDark = theme === "dark";
    button.setAttribute("aria-checked", isDark ? "true" : "false");
    button.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );
  }

  function init() {
    const button = document.getElementById("theme-toggle");
    if (!button) {
      return;
    }

    // Drop the previous Auto/Light/Dark storage key if present.
    localStorage.removeItem("color-mode");

    applyTheme(resolveTheme());

    button.addEventListener("click", function () {
      const next = resolveTheme() === "dark" ? "light" : "dark";
      setOverride(next);
      applyTheme(next);
    });

    // Morning/evening awareness stays on: when the period changes, auto wins again.
    window.setInterval(function () {
      applyTheme(resolveTheme());
    }, 60 * 1000);

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
        applyTheme(resolveTheme());
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
