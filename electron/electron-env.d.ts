/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}
interface Window {
  ipcRenderer: import('electron').IpcRenderer,
  // electronAPI: ElectronAPI
}
// Used in Renderer process, expose in `preload.ts`
interface ElectronAPI {
  sendMessage: (channel: string, data: any) => void
  receiveMessage: (channel: string, func: (...args: any[]) => void) => void
}

