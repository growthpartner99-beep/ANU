const { BrowserWindow, screen } = require('electron');
const path = require('node:path');
const { WINDOW } = require('../shared/constants');

function createWindow() {
  const { WIDTH: width, HEIGHT: height } = WINDOW;
  const { workArea } = screen.getPrimaryDisplay();

  const win = new BrowserWindow({
    width,
    height,
    x: workArea.x + workArea.width - width,
    y: workArea.y + workArea.height - height,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile(path.join(__dirname, '../renderer/index.html'));

  const cursorTimer = setInterval(() => {
    if (win.isDestroyed()) {
      clearInterval(cursorTimer);
      return;
    }
    const point = screen.getCursorScreenPoint();
    const bounds = win.getBounds();
    win.webContents.send('cursor', {
      x: point.x - bounds.x,
      y: point.y - bounds.y,
    });
  }, 33);
}

module.exports = { createWindow };
