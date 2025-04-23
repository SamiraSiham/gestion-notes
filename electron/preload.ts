import { ipcRenderer, contextBridge, IpcRendererEvent } from 'electron'
// Define the API interface
interface ElectronAPI {
  sendMessage: (channel: string, data: any) => void
  receiveMessage: (channel: string, func: (...args: any[]) => void) => void
}
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

contextBridge.exposeInMainWorld('electronAPI', {
  // Add any IPC methods you need here
  sendMessage: (channel: string, data: any) => {
    ipcRenderer.send(channel, data)
  },
  receiveMessage: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_event: IpcRendererEvent, ...args: any[]) => func(...args))
  }
} as ElectronAPI)