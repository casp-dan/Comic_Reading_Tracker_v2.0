const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('window3', {
    getJSON: (value) => ipcRenderer.invoke("window3:getJSON", value)
    // getJSON: () => ipcRenderer.invoke("window3:getJSON"),
})
