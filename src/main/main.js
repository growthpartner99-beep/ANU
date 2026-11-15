const { app, BrowserWindow, Menu, Tray, globalShortcut, ipcMain, nativeImage, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { HOTKEY, CHANNELS, EVENTS } = require('../shared/constants');
const { createWindow, createArchiveWindow } = require('./window');

let mainWindow = null;
let archiveWindow = null;
let tray = null;
let hook = null;

const MAX_ENTRIES = 500;
const MAX_TEXT = 4000;
const archiveEntries = [];

const archiveFile = () => path.join(app.getPath('userData'), 'archive.jsonl');

// ------------------------------------------------------------- archive store
function loadArchive() {
  try {
    const lines = fs.readFileSync(archiveFile(), 'utf8').split('\n').filter(Boolean);
    for (const line of lines.slice(-MAX_ENTRIES)) {
      try {
        archiveEntries.push(JSON.parse(line));
      } catch {
        // ignore a corrupt line rather than losing the whole history
      }
    }
  } catch {
    // first run: no archive yet
  }
}

function addArchiveEntry(entry) {
  const clean = {
    at: new Date().toISOString(),
    user: String(entry.user || '').slice(0, MAX_TEXT),
    anu: String(entry.anu || '').slice(0, MAX_TEXT),
    kind: ['bubble', 'card', 'error'].includes(entry.kind) ? entry.kind : 'bubble',
    receipt: String(entry.receipt || '').slice(0, 200),
  };
  archiveEntries.push(clean);
  if (archiveEntries.length > MAX_ENTRIES) archiveEntries.shift();
  fs.appendFile(archiveFile(), `${JSON.stringify(clean)}\n`, () => {});
  if (archiveWindow && !archiveWindow.isDestroyed()) {
    archiveWindow.webContents.send(CHANNELS.ARCHIVE_ENTRY, clean);
  }
}

function openArchive() {
  if (archiveWindow && !archiveWindow.isDestroyed()) {
    archiveWindow.show();
    archiveWindow.focus();
    return;
  }
  archiveWindow = createArchiveWindow();
  archiveWindow.on('closed', () => {
    archiveWindow = null;
  });
}

// ------------------------------------------------------------------ events
function sendEvent(payload) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (!mainWindow.isVisible()) mainWindow.show();
  if (payload.type === EVENTS.HOTKEY) mainWindow.focus();
  mainWindow.webContents.send(CHANNELS.EVENT, payload);
}

function loadHotkey() {
  try {
    const file = path.join(__dirname, '../../config/anu.json');
    const cfg = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (typeof cfg.hotkey === 'string' && cfg.hotkey.trim()) return cfg.hotkey.trim();
  } catch {
    // no config file: use the default
  }
  return HOTKEY.DEFAULT;
}

// Global key hook: tap summons the pill, holding starts push-to-talk.
// uiohook-napi is needed because a key-up is required for hold-to-talk.
function startKeyHook({ tapSummons }) {
  try {
    const { uIOhook, UiohookKey } = require('uiohook-napi');
    let holdTimer = null;
    let holding = false;
    let active = false;

    uIOhook.on('keydown', (event) => {
      if (event.keycode !== UiohookKey.Space || !event.ctrlKey || !event.altKey) return;
      if (holding) return;
      holding = true;
      holdTimer = setTimeout(() => {
        active = true;
        sendEvent({ type: EVENTS.PTT_DOWN });
      }, HOTKEY.HOLD_MS);
    });

    uIOhook.on('keyup', (event) => {
      if (event.keycode !== UiohookKey.Space) return;
      if (!holding && !active) return;
      const wasActive = active;
      holding = false;
      active = false;
      if (holdTimer) clearTimeout(holdTimer);
      holdTimer = null;
      if (wasActive) sendEvent({ type: EVENTS.PTT_UP });
      else if (tapSummons) sendEvent({ type: EVENTS.HOTKEY });
    });

    uIOhook.start();
    hook = uIOhook;
    return true;
  } catch (error) {
    console.warn('[ANU] global key hook unavailable (hold-to-talk disabled):', error.message);
    return false;
  }
}

function registerHotkeys() {
  const hotkey = loadHotkey();
  const usesDefault = hotkey === HOTKEY.DEFAULT;
  const hookReady = startKeyHook({ tapSummons: usesDefault });
  // Without the hook (or with a custom hotkey) fall back to Electron's shortcut.
  if (!usesDefault || !hookReady) {
    const ok = globalShortcut.register(hotkey, () => sendEvent({ type: EVENTS.HOTKEY }));
    if (!ok) console.warn(`[ANU] could not register global shortcut "${hotkey}"`);
  }
}

function createTray() {
  const iconPath = path.join(__dirname, '../../assets/icons/tray.png');
  let icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) {
    console.warn('[ANU] tray icon missing at', iconPath);
    icon = nativeImage.createEmpty();
  }
  try {
    tray = new Tray(icon);
  } catch (error) {
    console.warn('[ANU] tray unavailable:', error.message);
    return;
  }
  tray.setToolTip('ANU');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Open archive', click: openArchive },
      {
        label: 'Show ANU',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      { type: 'separator' },
      { label: 'Quit ANU', click: () => app.quit() },
    ])
  );
  tray.on('double-click', openArchive);
}

// ------------------------------------------------------------------- ipc
let lastIgnoreMouse = true;

function setInteractive(interactive) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  lastIgnoreMouse = !interactive;
  mainWindow.setIgnoreMouseEvents(!interactive, { forward: true });
}

function registerIpc() {
  ipcMain.on(CHANNELS.INTERACTIVE, (event, interactive) => {
    if (!mainWindow || event.sender !== mainWindow.webContents) return;
    setInteractive(Boolean(interactive));
  });

  ipcMain.on(CHANNELS.ARCHIVE_ADD, (event, entry) => {
    if (!mainWindow || event.sender !== mainWindow.webContents) return;
    addArchiveEntry(entry || {});
  });

  ipcMain.handle(CHANNELS.ARCHIVE_LIST, () => archiveEntries);

  ipcMain.on(CHANNELS.ARCHIVE_CLOSE, (event) => {
    if (archiveWindow && event.sender === archiveWindow.webContents) archiveWindow.close();
  });
}

function allowMicrophoneOnly() {
  // Only our own file:// pages may use the microphone; everything else is denied.
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(permission === 'media' && webContents.getURL().startsWith('file://'));
  });
  session.defaultSession.setPermissionCheckHandler(
    (webContents, permission) => permission === 'media' && webContents.getURL().startsWith('file://')
  );
}

// ------------------------------------------------------------------ lifecycle
function init() {
  loadArchive();
  allowMicrophoneOnly();
  registerIpc();

  mainWindow = createWindow();
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createTray();
  registerHotkeys();

  // Env-gated hooks so the Playwright e2e driver can reach main-process-only
  // UI paths (tray menu, OS click-through state) without adding production APIs.
  if (process.env.ANU_TEST_HOOKS) {
    global.__anuTest = {
      openArchive,
      sendEvent,
      lastIgnoreMouse: () => lastIgnoreMouse,
      hookActive: () => Boolean(hook),
    };
  }
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    mainWindow.show();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    init();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) init();
    });
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    if (hook) {
      try {
        hook.stop();
      } catch {
        // the hook may already be gone at shutdown
      }
      hook = null;
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
