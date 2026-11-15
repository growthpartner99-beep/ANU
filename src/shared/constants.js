// Shared contract between main, preload and renderer. Loaded as a classic
// script in the renderer and required by the main process.
(function () {
  const ANU = {
    // One fixed window, never resized: character + bubble + pill all live here.
    WINDOW: { WIDTH: 520, HEIGHT: 640 },
    ARCHIVE_WINDOW: { WIDTH: 560, HEIGHT: 680 },
    // Tap summons the pill, holding (>= HOLD_MS) starts push-to-talk.
    HOTKEY: { DEFAULT: 'Control+Alt+Space', HOLD_MS: 250 },
    SLEEP_AFTER_MS: 5 * 60 * 1000,
    CHANNELS: {
      CURSOR: 'cursor',
      EVENT: 'anu:event',
      INTERACTIVE: 'window:interactive',
      ARCHIVE_ADD: 'archive:add',
      ARCHIVE_LIST: 'archive:list',
      ARCHIVE_ENTRY: 'archive:entry',
      ARCHIVE_OPEN: 'archive:open',
      ARCHIVE_CLOSE: 'archive:close',
    },
    // Event names the main process pushes to the renderer.
    EVENTS: {
      HOTKEY: 'hotkey',
      PTT_DOWN: 'ptt:down',
      PTT_UP: 'ptt:up',
      AI_STATUS: 'ai:status',
      DISMISS: 'dismiss',
    },
  };

  if (typeof window !== 'undefined') window.ANU = ANU;
  if (typeof module !== 'undefined' && module.exports) module.exports = ANU;
})();
