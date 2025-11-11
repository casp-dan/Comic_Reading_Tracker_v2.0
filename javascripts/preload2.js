const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('window2', {
    seriesList: (value) => ipcRenderer.invoke("window2:seriesList", value),
    setSeriesID: (value) => ipcRenderer.invoke("window2:setSeriesID", value),
    closeWindow: () => ipcRenderer.invoke("window2:closeWindow")
})
