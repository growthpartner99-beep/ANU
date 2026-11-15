const { BrowserWindow, screen } = require('electron');
const path = require('node:path');
const { WINDOW, ARCHIVE_WINDOW, CHANNELS } = require('../shared/constants');

function bottomRightPosition(size) {
  const { workArea } = screen.getPrimaryDisplay();
  return {
    x: workArea.x + workArea.width - size.WIDTH,
    y: workArea.y + workArea.height - size.HEIGHT,
  };
}

function createWindow() {
  const { WIDTH: width, HEIGHT: height } = WINDOW;
  const { x, y } = bottomRightPosition(WINDOW);

  const win = new BrowserWindow({
    width,
    height,
    x,
    y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    hasShadow: false,
    skipTaskbar: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.loadFile(path.join(__dirname, '../renderer/index.html'));
  win.once('ready-to-show', () => win.show());

  // Click-through by default; the renderer flips this off while the pointer is
  // over the character, pill, bubble or card.
  win.setIgnoreMouseEvents(true, { forward: true });

  // Global cursor is pushed from main so gaze works outside our own window.
  const cursorTimer = setInterval(() => {
    if (win.isDestroyed()) {
      clearInterval(cursorTimer);
      return;
    }
    const point = screen.getCursorScreenPoint();
    const bounds = win.getBounds();
    win.webContents.send(CHANNELS.CURSOR, {
      x: point.x - bounds.x,
      y: point.y - bounds.y,
    });
  }, 33);

  win.on('closed', () => clearInterval(cursorTimer));

  return win;
}

function createArchiveWindow() {
  const { WIDTH: width, HEIGHT: height } = ARCHIVE_WINDOW;
  const { workArea } = screen.getPrimaryDisplay();

  const win = new BrowserWindow({
    width,
    height,
    x: workArea.x + Math.round((workArea.width - width) / 2),
    y: workArea.y + Math.round((workArea.height - height) / 2),
    title: 'ANU — Archive',
    backgroundColor: '#0b1730',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'archive-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.loadFile(path.join(__dirname, '../ui/archive/archive.html'));
  win.once('ready-to-show', () => win.show());
  return win;
}

module.exports = { createWindow, createArchiveWindow };
