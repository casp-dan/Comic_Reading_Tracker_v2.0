const {BrowserWindow, dialog} = require('electron/main')
const path = require('path');
const {nextpubnum, createPublisher}=require('./supabaseMethods')
const prompt = require('electron-prompt');




function makeSeriesSelectPopup(){
    seriesSelectWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, './preloads/preload2.js'),
            nodeIntegration: true
        }

    })

    seriesSelectWindow.loadFile("html/seriesSelect.html")

    seriesSelectWindow.on('close', async () => {
        if (currentSeriesID!==undefined){
            const response=await fetch(`http://127.0.0.1:${port}/getTrueName?seriesID=${currentSeriesID}`);
            const data=await response.text();
            let newSeriesName=data
            win.webContents.send('secondWindow:returnSeriesName', newSeriesName)
        }
    });

    return seriesSelectWindow;
}

function makeIssueInfoPopup(){
    issueInfoWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, './preloads/preload3.js'),
            nodeIntegration: true
        }
    })

    issueInfoWindow.loadFile("html/issuePage.html")

    return issueInfoWindow;
}

function makeIssueEditPopup(){
    issueEditWindow = new BrowserWindow({
        width: 500,
        height: 500,
        webPreferences: {
            preload: path.join(__dirname, './preloads/preload4.js'),
            nodeIntegration: true
        }
    })

    issueEditWindow.loadFile("html/issueEdit.html")

    return issueEditWindow;
}

async function makeLoginPrompt(cycle,type){
    let credential=await prompt({
        title: 'Login',
        label: `${cycle}:`,
        inputAttrs: {
            type: `${type}`,
            required: true
        },
        type: 'input'
    })
    return credential
}

async function makeConfirmPrompt(title,message){
    let confirm=await electronDialog.showMessageBox(issueEditWindow, {
        'type': 'question',
        'title': `${title}`,
        'message': `${message}`,
        'buttons': [
            'No',
            'Yes'
        ]
    })
    return confirm['response']
}

function errorMessage(msgTtl){
    let title=msgTtl[0]
    let message=msgTtl[1]
    dialog.showErrorBox(title, message)
}

function dialogMessage(msgTtl){
    let title=msgTtl[0]
    let dialogMessage=msgTtl[1]
    dialog.showMessageBox(win, {
        type: 'info',
        title: title,
        message: dialogMessage
    })
}

async function makeSnapPrompt(cycle){
    let date=await prompt({
        title: 'Snapshot',
        label: `${cycle} Date:`,
        inputAttrs: {
            type: 'text',
            required: true
        },
        type: 'input'
    })
    return date
}

function publisherPrompt(){
    prompt({
        title: 'Add Publisher',
        label: 'Publisher:',
        inputAttrs: {
            type: 'text',
            required: true
        },
        type: 'input'
    })
    .then((r) => {
        if(r === null) {
            console.log('user cancelled');
        } else {
            addPublisher(r)
        }
    })
    .catch(console.error);
}

async function addPublisher(publisher){
    let data=await nextpubnum()
    await createPublisher(publisher,data)
}

module.exports={
    makeSeriesSelectPopup,
    makeIssueInfoPopup,
    makeIssueEditPopup,
    makeLoginPrompt,
    makeConfirmPrompt,
    errorMessage,
    dialogMessage,
    makeSnapPrompt,
    publisherPrompt,
}