const { app, BrowserWindow, ipcMain, dialog} = require('electron/main')
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const prompt = require('electron-prompt');
const electronSquirrelStartup = require('electron-squirrel-startup');
const port=5011

let seriesSelectList;
let currentSeriesID=null;
let seriesSelectWindow;
let issueInfoWindow;
let win;
let objson="";

async function createLogin () {
    
    var python = require('child_process').spawn('python3', ['./python/app.py']);
    python.stdout.on('data', function (data) {
        console.log("data: ", data.toString('utf8'));
    });
    python.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    // let python;
    // python = path.join(process.cwd(), 'python/dist/app.exe')
    // var execfile = require("child_process").execFile;
    // execfile(
    //     python, 
    //     {
    //         windowsHide: true,
    //     },
    //     (err, stdout, stderr) => {
    //         if (err) {
    //             console.log(err);
    //         }
    //         if (stdout) {
    //             console.log(stdout);
    //         }
    //         if (stderr) {
    //             console.log(stderr);
    //         }
    //     }
    // )

    const loggedIn=await login()
    console.log(loggedIn)
    mainWindow()
    win.loadFile("html/tabs.html") 

    // console.log('aasdfasdf')
}

async function mainWindow(){

    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, './preload.js'),
            nodeIntegration: true
        }
    })

    
    
    ipcMain.handle('dropdownList:series', () => {
        return getSeriesList('hello')
    })
    
    ipcMain.handle('dropdownList:publishers', () => {
        return getPubList('hello')
    })

    // win.webContents.openDevTools()
}

app.whenReady().then(() => {
    ipcMain.handle('process:dothelogin', login)
    ipcMain.handle('process:logout', logout)

    ipcMain.handle('views:series', getSeriesEntries)
    ipcMain.handle('views:date', getDateEntries)
    
    ipcMain.handle('stats:yearly', getYearlyStats)
    ipcMain.handle('stats:monthly', getMonthlyStats)
    ipcMain.handle('stats:overview', getOverviewStats)
    ipcMain.handle("stats:snapshot", getSnapshotStats)
    
    ipcMain.handle("entries:createSeries", createSeries)
    ipcMain.handle("entries:getLastDateTime", getLastDateTime)
    ipcMain.handle("entries:entryExists", entryExists)
    ipcMain.handle("entries:addIssue", addIssue)
    
    ipcMain.handle("dialogs:errorMessage", errorMessage)
    ipcMain.handle("dialogs:dialogMessage", dialogMessage)
    ipcMain.handle("dialogs:pubPrompt", publisherPrompt)
    ipcMain.handle("dialogs:snapPrompt", snapshotPrompts)
    
    ipcMain.handle("secondWindow:selectSeries", fetchSeriesList)
    
    ipcMain.handle("thirdWindow:getInfo", getInfo)
    ipcMain.handle("thirdWindow:showInfo", showInfo)
    
    ipcMain.handle("window2:seriesList", createSeriesSelect)
    ipcMain.handle("window2:setSeriesID", setSeriesID)
    ipcMain.handle("window2:closeWindow", closeSeriesSelect)
    
    ipcMain.handle("window3:getJSON", getObjJSON)
    ipcMain.on('counter-value', (_event, value) => {
    
        return value
    })
    createLogin()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createLogin()
    })
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        const { exec } = require('child_process');
        exec('taskkill /f /t /im app.exe', (err, stdout, stderr) => {
            if (err) {
                console.log(err)
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        });
        app.quit()
    }
})

async function getSeriesList(test) {
    try{
        let response=await axios.post(`http://127.0.0.1:${port}/seriesList`, test);
        let x=response.data
        let rep=x.replaceAll("\"","'")
        rep=rep.replaceAll("['","")
        rep=rep.replaceAll("']","")
        let toRet = rep.split("', '");
        return toRet
    }
    catch (err){
        console.error(err.response.data); 
    }
}

async function getPubList(test) {
    try{
        let response= await axios.post(`http://127.0.0.1:${port}/pubList`, test);
        let x=response.data
        let rep=x.replaceAll("\"","'")
        rep=rep.replaceAll("['","")
        rep=rep.replaceAll("']","")
        let toRet = rep.split("', '");
        return toRet
    }
    catch (err){
        console.error(err.response.data); 
    }
}

async function getSeriesEntries(_event, seriesName) {
    try{
        const response = await fetch(`http://127.0.0.1:${port}/seriesEntries?seriesName=${seriesName}`);
        const data = await response.text();
        let rep=data.replaceAll("\"","'");
        rep=rep.replaceAll("[('","");
        rep=rep.replaceAll("')]","");
        let toRet = rep.split("), (");
        return formatOutDates(toRet)
    }
    catch(err){
        console.error(err);
    }
}

async function getDateEntries(_event, inDate) {
    try{
        let date=formatInDate(inDate)
        const response = await fetch(`http://127.0.0.1:${port}/dateEntries?date=${date}`);
        const data = await response.text();
        let outArr=[]
        if (data!=="[]"){
            let rep=data.replaceAll("\"","'")
            rep=rep.replaceAll("[('","")
            rep=rep.replaceAll("')]","")
            let inArr= rep.split("), (");
            inArr.forEach(function(listItem){
                listItem=listItem.replaceAll("\"","\'")
                listItem=listItem.replace("None","\'None\'")
                // listItem=listItem.replaceAll("', \"","', '")
                // listItem=listItem.replaceAll("\", \"","', '")
                // listItem=listItem.replaceAll("\", '","', '")
                let splitted=listItem.split("', '")
                splitted[0]=splitted[0].replaceAll("'","");
                if (splitted[2]!==undefined){
                    splitted[2]=splitted[2].replaceAll("'","");

                }
                
                let baseDate=splitted[3]
                baseDate=baseDate.replaceAll('\'',"")
                let splitBaseDate=baseDate.split(" ")[0]
                let dateSplit=splitBaseDate.split('-')
                dateSplit[0]=dateSplit[0].replace('20',"")
                if (dateSplit[1][0]=='0'){
                    dateSplit[1]=dateSplit[1].replaceAll('0','')
                }
                if (dateSplit[2][0]=='0'){
                    dateSplit[2]=dateSplit[2].replaceAll('0','')
                }
                splitted[3]=`${dateSplit[1]}/${dateSplit[2]}/${dateSplit[0]}`
                outArr.push(splitted)
            })
        }
        return outArr

        // return formatDates(toRet)
    }
    catch(err){
        console.error(err);
    }
}

async function getYearlyStats(_event, year) {
    try{
        const response=await fetch(`http://127.0.0.1:${port}/yearlyStats?year=${year}`);
        const data=await response.text();
        let rep=data.replaceAll("[","")
        rep=rep.replaceAll("]","")
        let toRet= rep.split(", ");
        return toRet
    }
    catch(err){
        console.error(err);
    }
}

async function getMonthlyStats(_event, monthYear) {
    try{
        let year=monthYear[0]
        let month=monthYear[1]
        const response=await fetch(`http://127.0.0.1:${port}/monthlyStats?year=${year}&month=${month}`);
        const data=await response.text();
        let rep=data.replaceAll("[","")
        rep=rep.replaceAll("]","")
        let toRet= rep.split(", ");
        return toRet
    }
    catch(err){
        console.error(err);
    }
}

async function getOverviewStats(_event) {
    try{
        const response=await fetch(`http://127.0.0.1:${port}/overviewStats`);
        const data=await response.text();
        let rep=data.replaceAll("[","")
        rep=rep.replaceAll("]","")
        let toRet= rep.split(", ");
        return toRet
    }
    catch(err){
        console.error(err);
    }
}

async function getSnapshotStats(_event, startEnd) {
    try{
        let start=startEnd[0]
        let end=startEnd[1]
        const response=await fetch(`http://127.0.0.1:${port}/snapshotStats?start=${start}&end=${end}`);
        const data=await response.text();
        let rep=data.replaceAll("[","")
        rep=rep.replaceAll("]","")
        let toRet= rep.split(", ");
        return toRet
    }
    catch(err){
        console.error(err);
    }
}

async function fetchSeriesList(_event, values){
    let seriesName=values[0]
    let publisher=values[1]
    const yearRegex=/\(\d\d\d\d\)/
    let searchTerm=seriesName;
    let startYear="";
    if (yearRegex.test(seriesName)){
    // if (seriesName.includes(yearRegex)){
        searchTerm=seriesName.split("(")[0]
        startYear=seriesName.split("(")[1].split(")")[0]
    }
    await makeSeriesSelectList(searchTerm,publisher,startYear)
    seriesSelectWindow=makeSeriesSelectPopup();
}

async function showInfo(_event){
    // console.log(value)
    issueInfoWindow=makeIssueInfoPopup();
}

async function createSeries(_event, values){
    let seriesName=values[0]
    let publisher=values[1]
    let xmen=values[2]
    // let searchTerm=seriesName.split("(")[0]
    // let startYear=seriesName.split("(")[1].split(")")[0]
    // console.log(seriesName,publisher,xmen,currentSeriesID)
    let response=null;
    if (currentSeriesID===null){
        response=await fetch(`http://127.0.0.1:${port}/createSeries?seriesName=${seriesName}&publisher=${publisher}&xmen=${xmen}&seriesID=None`);
    }
    else{
        response=await fetch(`http://127.0.0.1:${port}/createSeries?seriesName=${seriesName}&publisher=${publisher}&xmen=${xmen}&seriesID=${currentSeriesID}`);
    }
    const data=await response.text();
    console.log(`Series created: ${data}`)
    currentSeriesID=null
    return data;
    // const response2=await fetch(`http://127.0.0.1:${port}/seriesAPI?seriesName=${seriesName}&publisher=${publisher}&year=${startYear}`);
    // const data2=await response2.text();
    // console.log(`Series ID is: ${data2}`)
}

async function makeSeriesSelectList(searchTerm,publisher,startYear){
    const response=await fetch(`http://127.0.0.1:${port}/selectSeries?seriesName=${searchTerm}&publisher=${publisher}&startYear=${startYear}`);    
    const data=await response.text();
    let form=data.replaceAll('[[',"")
    form=form.replaceAll(']]',"")
    form=form.replaceAll('\"',"\'")
    out=form.split("], [")
    seriesSelectList=out;
}

async function getLastDateTime(_event, dateString){
    const response=await fetch(`http://127.0.0.1:${port}/getLastDateTime?dateString=${dateString}`);
    const data=await response.text();
    console.log(`date is ${data}`)
    return data
}

async function entryExists(_event, values){
    let series=values[0]
    let issue=values[1]
    let date=values[2]
    // series=${series}&issue=${issue}&date=${date}
    const response=await fetch(`http://127.0.0.1:${port}/entryExists?series=${series}&issue=${issue}&date=${date}`);
    const data=await response.text();
    if (data==="True"){
        return true;
    }
    else{
        return false;
    }
}

async function addIssue(_event, values){
    let issue=values[0]
    let series=values[1]
    let xmenAdj=values[2]
    let date=values[3]
    const response=await fetch(`http://127.0.0.1:${port}/addIssue?issue=${issue}&series=${series}&xmenAdj=${xmenAdj}&date=${date}`);
    const data=await response.text();
    console.log(`Issue added: ${data}`)
    if (data==="True"){
        let startYear=series.split("(")[1].split(")")[0]
        const response2=await fetch(`http://127.0.0.1:${port}/issueAPI?issue=${issue}&series=${series}&year=${startYear}`);
        const data2=await response2.text();
        console.log(`Series ID is: ${data2}`)
    }
}

async function getInfo(_event, values){
    let issue=values[0]
    let series=values[1]
    const response=await fetch(`http://127.0.0.1:${port}/getInfo?issue=${issue}&series=${series}`);
    const data=await response.text();
    theObj={}
    if (data!==""){
        let roleList=data.split('], ')
        roleList.forEach(function(i){
            splitted=i.split(": [")
            role=splitted[0]
            creators=splitted[1]
            creators=creators.replace("]","")  
            theObj[role]=creators
        })
    }
    const url=await fetch(`http://127.0.0.1:${port}/getURL?issue=${issue}&series=${series}`);
    const urlData=await url.text();
    theObj["URL"]=urlData;
    theObj["issue"]=issue
    theObj["series"]=series
    objson=theObj;
    return theObj;
}

function errorMessage(_event, msgTtl){
    let title=msgTtl[0]
    let message=msgTtl[1]
    dialog.showErrorBox(title, message)
}

function dialogMessage(_event, msgTtl){
    let title=msgTtl[0]
    let dialogMessage=msgTtl[1]
    dialog.showMessageBox(win, {
        type: 'info',
        title: title,
        message: dialogMessage
    })
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

async function snapshotPrompts(){
    let start=await makeSnapPrompt("Start")
    let end=await makeSnapPrompt("End")
    return [start,end]
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

async function login(_event){
    let credentials={}
    let response
    if (fs.existsSync("userInfo.txt")) {
        let readInfo = fs.readFileSync(`userInfo.txt`).toString();
        readInfo=readInfo.split('\n')
        readInfo.forEach(function(listItem){
            let splitted=listItem.split(": ")
            credentials[splitted[0]]=splitted[1]
        })
        let db=await makeLoginPrompt("Database",'text')
        response=await fetch(`http://127.0.0.1:${port}/loginThingy?user=${credentials["sql_user"]}&password=${credentials["password"]}&db=${db}&host=${credentials["host"]}&mok_user=${credentials["mok_user"]}`)//.catch(console.log("error"))
        console.log('somthing')
        // response=await axios.post(`http://127.0.0.1:${port}/loginThingy?user=${credentials["sql_user"]}&password=${credentials["password"]}&db=${db}&host=${credentials["host"]}&mok_user=${credentials["mok_user"]}`,"test")//.catch(console.log("error"))
        const data=await response.text();  
        console.log(data)
    }
    else{
        let user=await makeLoginPrompt("User",'text')
        let mok_user=await makeLoginPrompt("Mokkari User",'text')
        let host=await makeLoginPrompt("Host",'text')
        let db=await makeLoginPrompt("Database",'text')
        let password=await makeLoginPrompt("Password",'password')
        response=await fetch(`http://127.0.0.1:${port}/loginThingy?user=${user}&password=${password}&db=${db}&host=${host}&mok_user=${mok_user}`);
        console.log('asdfasdfasdfasdf')
        const data=await response.text();
        console.log(data)
    }
    return data;
}

async function logout(){
    await fetch(`http://127.0.0.1:${port}/logout`);
    login()

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

async function addPublisher(publisher){
    const response=await fetch(`http://127.0.0.1:${port}/addPublisher?publisher=${publisher}`);
    const data=await response.text();
    console.log(`Issue added: ${data}`)
}

function formatOutDates(inArr){
    outArr=[]
    inArr.forEach(function(listItem){
        splitted=listItem.split("', '")
        date=splitted[1].split(' ')[0]
        splDate=date.split('-')
        if (parseInt(splDate[1])<10){
            splDate[1]=splDate[1 ][1]
        }
        if (parseInt(splDate[2])<10){
            splDate[2]=splDate[2][1]
        }
        splDate[0]=splDate[0].split("0")[1]
        reConf=splDate[1]+'/'+splDate[2]+'/'+splDate[0]
        splitted[0]=splitted[0].replaceAll("'","");
        if (splitted[2]!==undefined){
            splitted[2]=splitted[2].replaceAll("'","");

        }
        outArr.push([splitted[0],reConf,splitted[2]])
    })
    return outArr
}

function formatInDate(inDate){
    let splitted=inDate.split('/')
    if (parseInt(splitted[0])<10){
            splitted[0]='0'+splitted[0]
        }
    if (parseInt(splitted[1])<10){
        splitted[1]='0'+splitted[1]
    }
    splitted[2]='20'+splitted[2]
    reConf=splitted[2]+'-'+splitted[0]+'-'+splitted[1]
    return reConf
}

function makeSeriesSelectPopup(){
    seriesSelectWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, './preload2.js'),
            nodeIntegration: true
        }

    })

    seriesSelectWindow.loadFile("html/seriesSelect.html")

    seriesSelectWindow.on('close', async () => {
        if (currentSeriesID!==undefined){
            const response=await fetch(`http://127.0.0.1:${port}/getTrueName?seriesID=${currentSeriesID}`);
            const data=await response.text();
            console.log(`${data}`)
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
            preload: path.join(__dirname, './preload3.js'),
            nodeIntegration: true
        }
    })

    issueInfoWindow.loadFile("html/issuePage.html")

    return issueInfoWindow;
}

function createSeriesSelect(){
    return seriesSelectList;
}

function getObjJSON(){
    return objson;
}

function setSeriesID(_event, value){
    currentSeriesID=parseInt(value)
}

function closeSeriesSelect(){
    seriesSelectWindow.close()
}

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        console.log('poopoop')
    }
})
