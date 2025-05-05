import { app, BrowserWindow } from 'electron'
import  path from 'path'
import url from 'url'
import {startServer} from './server'
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │


let win: BrowserWindow | null


function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'dist-electron/preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  console.log(__dirname);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    startServer()
    createWindow()
  }
})

app.whenReady().then(createWindow).then(startServer)