const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('anu', {
  onCursor: (callback) =>
    ipcRenderer.on('cursor', (_event, point) => callback(point)),
});
