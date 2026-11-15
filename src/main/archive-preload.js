const { contextBridge, ipcRenderer } = require('electron');

// Sandboxed preload: channel names inlined, see src/shared/constants.js.
const CHANNELS = {
  ARCHIVE_LIST: 'archive:list',
  ARCHIVE_ENTRY: 'archive:entry',
  ARCHIVE_CLOSE: 'archive:close',
};

contextBridge.exposeInMainWorld('archiveApi', {
  list: () => ipcRenderer.invoke(CHANNELS.ARCHIVE_LIST),
  onEntry: (callback) => ipcRenderer.on(CHANNELS.ARCHIVE_ENTRY, (_event, entry) => callback(entry)),
  close: () => ipcRenderer.send(CHANNELS.ARCHIVE_CLOSE),
});
