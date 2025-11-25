const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('window4', {
    getDayTime: () => ipcRenderer.invoke("window4:getDayTime"),
    editEntry: (value) => ipcRenderer.invoke("window4:editEntry",value),
    deleteEntry: (value) => ipcRenderer.invoke("window4:deleteEntry", value)
    // getJSON: () => ipcRenderer.invoke("window3:getJSON"),
})