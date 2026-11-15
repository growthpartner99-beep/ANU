const { contextBridge, ipcRenderer } = require('electron');

// Sandboxed preloads cannot require project files, so the channel names are
// inlined here. They must stay in sync with src/shared/constants.js.
const CHANNELS = {
  CURSOR: 'cursor',
  EVENT: 'anu:event',
  INTERACTIVE: 'window:interactive',
  ARCHIVE_ADD: 'archive:add',
};

// Narrow bridge: no generic IPC, no node handles.
contextBridge.exposeInMainWorld('anu', {
  onCursor: (callback) =>
    ipcRenderer.on(CHANNELS.CURSOR, (_event, point) => callback(point)),
  onEvent: (callback) => ipcRenderer.on(CHANNELS.EVENT, (_event, payload) => callback(payload)),
  setInteractive: (interactive) => ipcRenderer.send(CHANNELS.INTERACTIVE, Boolean(interactive)),
  logExchange: (entry) => ipcRenderer.send(CHANNELS.ARCHIVE_ADD, entry),
});
