const { contextBridge, ipcRenderer } = require('electron/renderer')



contextBridge.exposeInMainWorld('dropdownList', {
    seriesList: () => ipcRenderer.invoke('dropdownList:series'),
    pubList: () => ipcRenderer.invoke('dropdownList:publishers')
})

contextBridge.exposeInMainWorld('views', {
    seriesEntries: (value) => ipcRenderer.invoke('views:series', value),
    dateEntries: (value) => ipcRenderer.invoke('views:date', value)
})

contextBridge.exposeInMainWorld('stats', {
    yearlyStats: (value) => ipcRenderer.invoke('stats:yearly', value),
    monthlyStats: (value) => ipcRenderer.invoke('stats:monthly', value),
    overviewStats: () => ipcRenderer.invoke('stats:overview'),
    snapshotStats: (value) => ipcRenderer.invoke('stats:snapshot',value)
})

contextBridge.exposeInMainWorld('entries',{
    createSeries: (value) => ipcRenderer.invoke("entries:createSeries", value),
    getLastDateTime: (value) => ipcRenderer.invoke("entries:getLastDateTime", value),
    entryExists: (value) => ipcRenderer.invoke("entries:entryExists", value),
    addIssue: (value) => ipcRenderer.invoke("entries:addIssue", value)
})

contextBridge.exposeInMainWorld('dialogs',{
    error: (value) => ipcRenderer.invoke("dialogs:errorMessage", value),
    dialog: (value) => ipcRenderer.invoke("dialogs:dialogMessage", value),
    pubPrompt: () => ipcRenderer.invoke("dialogs:pubPrompt"),
    snapPrompt: () => ipcRenderer.invoke("dialogs:snapPrompt"),
})

contextBridge.exposeInMainWorld('secondWindow', {
    selectSeries: (value) => ipcRenderer.invoke("secondWindow:selectSeries", value),
    getSeriesName: (callback) => ipcRenderer.on('secondWindow:returnSeriesName', (_event, value) => callback(value)),
})

contextBridge.exposeInMainWorld('thirdWindow', {
    getInfo: (value) => ipcRenderer.invoke("thirdWindow:getInfo", value),
    showInfo: () => ipcRenderer.invoke("thirdWindow:showInfo"),
})

contextBridge.exposeInMainWorld('process', {
    dothelogin: () => ipcRenderer.invoke("process:dothelogin"),
    logout: () => ipcRenderer.invoke("process:logout")
})

