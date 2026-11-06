// DIAGNOSTIC: Check Electron API availability in the main process
const electronModule = require('electron');
console.log('[DIAG] process.versions.electron =', process.versions.electron);
console.log('[DIAG] process.type =', process.type);
console.log('[DIAG] process.execPath =', process.execPath);
console.log('[DIAG] process.resourcesPath =', process.resourcesPath);
console.log('[DIAG] process.defaultApp =', process.defaultApp);
console.log('[DIAG] process.env.ELECTRON_RUN_AS_NODE =', process.env.ELECTRON_RUN_AS_NODE);
console.log('[DIAG] typeof require("electron") =', typeof electronModule);
console.log('[DIAG] typeof require("electron").app =', typeof electronModule.app);
console.log('[DIAG] typeof require("electron").BrowserWindow =', typeof electronModule.BrowserWindow);
console.log('[DIAG] typeof require("electron").ipcMain =', typeof electronModule.ipcMain);
console.log('[DIAG] typeof require("electron").screen =', typeof electronModule.screen);

const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const { createWindow } = require('./window');

console.log('[DIAG] app =', typeof app);
console.log('[DIAG] BrowserWindow =', typeof BrowserWindow);

app.whenReady().then(() => {
  console.log('[DIAG] app.whenReady() fired');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
