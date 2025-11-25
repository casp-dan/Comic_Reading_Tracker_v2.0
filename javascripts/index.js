const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { get } = require('http');
const popups=require('./popups')
const statsMethods=require('./statsMethods')
const userJSON = require('../userInfo.json')
const electronDialog = require('electron').dialog;
const supabaseMethods=require('./supabaseMethods')
const electronSquirrelStartup = require('electron-squirrel-startup');
const { app, BrowserWindow, ipcMain, dialog} = require('electron/main')


const port=5000
let seriesSelectList;
let currentSeriesID=null;
let seriesSelectWindow;
let issueInfoWindow;
let issueEditWindow;
let win;
let objson="";
let dayTimeEdit;
let userInfo;

async function initialize () {
    
    var python = require('child_process').spawn('python3', ['./python/app.py']);
    python.stdout.on('data', function (data) {
        console.log("data: ", data.toString('utf8'))
    });
    python.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    // let python;
    // python = path.join(process.cwd(), 'app.exe')
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
    

    doLogin()


}

async function doLogin() {
    mainWindow();
    let loggedIn;
    while (loggedIn !== "string") {
        loggedIn = await login();
    }
    supabaseMethods.login(userInfo['supabaseUrl'], userInfo['supabaseKey'])
    win.show();
}

async function mainWindow(){

    win = new BrowserWindow({ 
        width: 800,
        height: 600,
        show: false, 
        webPreferences: {
            preload: path.join(__dirname, './preloads/preload.js'),
            nodeIntegration: true
        }
    })

    win.loadFile("html/tabs.html") 
    
    // win.webContents.openDevTools()
}

app.whenReady().then(() => {
    ipcMain.handle('dropdownList:series', getSeriesList)
    ipcMain.handle('dropdownList:publishers', getPubList)
    ipcMain.handle("dropdownList:creators", getCreatorList);

    ipcMain.handle('process:dothelogin', login)
    ipcMain.handle('process:logout', logout)

    ipcMain.handle('views:series', getSeriesEntries)
    ipcMain.handle('views:date', getDateEntries)
    ipcMain.handle("views:creator", getCreatorEntries);
    ipcMain.handle("views:seriesExists", seriesExists);
    
    ipcMain.handle('stats:yearly', getYearlyStats)
    ipcMain.handle('stats:monthly', getMonthlyStats)
    ipcMain.handle('stats:overview', getOverviewStats)
    ipcMain.handle("stats:snapshot", getSnapshotStats)
    
    ipcMain.handle("entries:createSeries", createSeries)
    ipcMain.handle("entries:getLastDateTime", getLastDateTime)
    ipcMain.handle("entries:addIssue", addIssue)
    
    ipcMain.handle("dialogs:errorMessage", errorMessage)
    ipcMain.handle("dialogs:dialogMessage", dialogMessage)
    ipcMain.handle("dialogs:pubPrompt", publisherPrompt)
    ipcMain.handle("dialogs:snapPrompt", snapshotPrompts)
    
    ipcMain.handle("secondWindow:selectSeries", fetchSeriesList)
    
    ipcMain.handle("thirdWindow:getInfo", getInfo)
    ipcMain.handle("thirdWindow:showInfo", showInfo)
    
    ipcMain.handle("fourthWindow:getTime", getTime)
    ipcMain.handle("fourthWindow:showEdit", showEdit)
    
    ipcMain.handle("window2:seriesList", createSeriesSelect)
    ipcMain.handle("window2:setSeriesID", setSeriesID)
    ipcMain.handle("window2:closeWindow", closeSeriesSelect)
    
    ipcMain.handle("window3:getJSON", getObjJSON)

    ipcMain.handle("window4:getDayTime", getDayTimeObj)
    ipcMain.handle("window4:editEntry", editEntry)
    ipcMain.handle("window4:deleteEntry", deleteEntry)

    ipcMain.on('counter-value', (_event, value) => {
    
        return value
    })
    initialize()    

})

app.on("window-all-closed", () => closeApp)

function closeApp(){
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
}

async function getYearlyStats(_event, year){
    return await statsMethods.getYearlyStats(year)
}

async function getMonthlyStats(_event, inDates){
    return await statsMethods.getMonthlyStats(inDates)
}

async function getOverviewStats(_event){
    return await statsMethods.getOverviewStats()
}

async function getSnapshotStats(_event, startEnd){
    return await statsMethods.getSnapshotStats(startEnd)
}

async function getSeriesList() {
    return await supabaseMethods.getSeriesList()
}

async function getPubList(_test) {
    return await supabaseMethods.getPubList()
}

async function getCreatorList(_event, role) {
    return await supabaseMethods.getCreatorList(role)
}

async function getSeriesEntries(_event, seriesName) {
    try{
        let data=await supabaseMethods.callRPC("getseriesentries",{searchseries:seriesName})
        let toRet=formatOutDates(data)
        return toRet
    }
    catch(err){
        console.error(err);
    }
}

async function getDateEntries(_event, dateType) {
    try{
        let startDate=dateType[0]
        let endDate=dateType[1]
        let type=dateType[2]
        let start=formatInDate(startDate)
        let end=formatInDate(endDate)
        let data;
        if (type==='month'){
            data=await supabaseMethods.getmonthdateentries(start,end)
        }
        else{
            data=await supabaseMethods.getdateentries(start)
        }
        let toRet=formatOutDates(data)
        return toRet
    }
    catch(err){
        console.error(err);
    }
}

async function seriesExists(_event, seriesName){
    let count=await supabaseMethods.seriesExists(seriesName)
    return count
}

async function getCreatorEntries(_event, nameRole) {
    try {
        let name=nameRole[0]
        let role=nameRole[1].toLowerCase()
        let toRet
        data=await supabaseMethods.callRPC(`get${role}entries`,{creatorname:name})
        toRet=formatCreatorDates(data)
        return toRet
    } catch (err) {
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
        searchTerm=seriesName.split("(")[0]
        startYear=seriesName.split("(")[1].split(")")[0]
    }
    await makeSeriesSelectList(searchTerm,publisher,startYear)
    seriesSelectWindow=popups.makeSeriesSelectPopup();
}

async function showInfo(_event){
    issueInfoWindow=popups.makeIssueInfoPopup();
}

async function showEdit(_event){
    issueEditWindow=popups.makeIssueEditPopup();
}

async function editEntry(_event, values){
    let day=values[0]
    let time=values[1]
    let issue=values[2]
    let series=values[3]
    let origDate=values[4]
    let dateTime=`${day} ${time}`
    let confirm=await popups.makeConfirmPrompt('Edit Entry','Are you sure you want to edit this entry?')
    if (confirm){
        await supabaseMethods.editEntry(issue,series,dateTime,origDate)
        issueEditWindow.close()
    }
}

async function deleteEntry(_event, values){
    let issue=values[0]
    let series=values[1]
    let dateTime=values[2]
    let confirm=await popups.makeConfirmPrompt('Delete Entry','Are you sure you want to delete this entry?')
    if (confirm){
        await supabaseMethods.deleteEntry(issue,series,dateTime)
        issueEditWindow.close()
        issueInfoWindow.close()
    }
    else{
        console.log('no')
    }
}

async function getTime(_event,values){
    let issue=values[0]
    let series=values[1]
    let inDate=values[2]
    let date=formatInDate(inDate)
    let midnight=`${date} 00:00:00`
    let eod=`${date} 23:59:59`
    return await supabaseMethods.getLastDateTime(issue,series,midnight,eod)
}

async function createSeries(_event, values){
    let seriesName=values[0]
    let publisher=values[1]
    let xmen=values[2]
    if (currentSeriesID===null){
        await supabaseMethods.createSeriesRPC(seriesName, publisher, xmen)
    }
    else{
        await supabaseMethods.createSeriesWithID(seriesName, publisher, xmen, currentSeriesID )
    }
    console.log(`Series created: ${seriesName}`)
    currentSeriesID=undefined
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
    return await supabaseMethods.getLastDateTime(dateString)
}

async function addIssue(_event, values){
    let issue=values[0]
    let series=values[1]
    let xmenAdj=values[2]
    let date=values[3]
    let data;
    let newIssue;
    let day=date.split(' ')[0]
    data=await supabaseMethods.issueExists(series,issue)
    if (data===0){
        newIssue=true
        await supabaseMethods.addIssueRPC(issue,series,xmenAdj)
    }
    data=await supabaseMethods.entryExists(series,issue,day)
    if (data===0){
        date+="+00"
        await supabaseMethods.addEntryRPC(issue,series,date)
    }
    if (newIssue){
        let seriesID;
        let issueData=[]
        seriesID=await supabaseMethods.getSeriesIDRPC(series)
        let publisher=await supabaseMethods.getSeriesPubRPC(series)
        let startYear=series.split("(")[1].split(")")[0]

        if (seriesID===undefined){
            let response=await fetch(`http://127.0.0.1:${port}/getSeriesInfo?year=${year}&pub=${pub}&seriesName=${seriesName}`);
            seriesID=await response.text().toString();
        }
        if (seriesID!==undefined){
            const response2=await fetch(`http://127.0.0.1:${port}/issueAPI?issue=${issue}&seriesID=${seriesID}`);
            const data2=await response2.json();
            if (data2["coverURL"]!==''){
                await supabaseMethods.updateIssueCover(series,issue,data2['coverURL'])
            }
            if (data2["issueID"]!==''){
                await supabaseMethods.updateIssueID(series,issue,data2['issueID'])
            }
            await supabaseMethods.updateCreators(issue,series,data2)
        }
    }
}

async function getInfo(_event, values){
    let issue=values[0]
    let series=values[1]
    let date=values[2]
    let names={}
    let roles=["Color","Inker","Penciller","Writer","Artist"]
    let myResult=await supabaseMethods.getRoleBools(issue,series,roles)
    let isRole=myResult[0]
    for (const role of roles) {
        if (isRole[role]===true){
            let creatorNames=await supabaseMethods.getCreator(role,issue,series)
            if (creatorNames.length!==0){
                names[role]=[]
                creatorNames.forEach(function(creator){
                    names[role].push(creator[`${role}Name`])
                })
            }
        }
    }
    let urlData=await supabaseMethods.getCoverURL(issue,series)
    names['URL']=urlData[0]['coverURL']
    names["issue"]=issue
    names["series"]=series
    names["date"]=date
    objson=names;
    return names;
}

function errorMessage(_event, msgTtl){
    popups.errorMessage(msgTtl)
}

function dialogMessage(_event, msgTtl){
    popups.dialogMessage(msgTtl)
}

function publisherPrompt(){
    popups.publisherPrompt()
}

async function snapshotPrompts(){
    let start=await popups.makeSnapPrompt("Start")
    let end=await popups.makeSnapPrompt("End")
    return [start,end]
}

async function login(_event) {
    let response;
    let data;
    userInfo=userJSON
    userInfo['userPass']=undefined
    creds=["mok_user", "mok_password", "password", "supabaseUrl", "supabaseKey"]
    creds.forEach(async function (listItem) {
        if (userInfo[listItem]===undefined){
            if (listItem==='mok_password'){
                userInfo[listItem]=await popups.makeLoginPrompt(listItem, "password");
            }
            else if (listItem==='password'){
                let entered=await popups.makeLoginPrompt("Password", "password");
                userInfo['userPass']=entered
                userInfo['password']=entered
            }
            else{
                userInfo[listItem]=await popups.makeLoginPrompt(listItem, "text");
            }
        }
    });
    if (userInfo['userPass']===undefined){
        userInfo['userPass']=await popups.makeLoginPrompt("Password", "password");
    } 
    response = await fetch(
        `http://127.0.0.1:${port}/loginThingy?password=${userInfo["password"]}&userPass=${userInfo["userPass"]}&mok_user=${userInfo["mok_user"]}&mok_password=${userInfo["mok_password"]}`
    ); 
    data = await response.text();
    return data;
}

async function logout(){
    win.close()
    win=null
    await fetch(`http://127.0.0.1:${port}/logout`);
    doLogin()
}

function formatOutDates(data){
    data.forEach(function(listItem){
        let baseDate=listItem['DateString']
        let splitBaseDate=baseDate.split("T")[0]
        let dateSplit=splitBaseDate.split('-')
        dateSplit[0]=dateSplit[0].replace('20',"")
        if (dateSplit[1][0]=='0'){
            dateSplit[1]=dateSplit[1].replaceAll('0','')
        }
        if (dateSplit[2][0]=='0'){
            dateSplit[2]=dateSplit[2].replaceAll('0','')
        }
        listItem['DateString']=`${dateSplit[1]}/${dateSplit[2]}/${dateSplit[0]}`
        
    })
    return data
}

function formatCreatorDates(data){
    data.forEach(function(listItem){
        let baseDate=listItem['datestring']
        let splitBaseDate=baseDate.split("T")[0]
        let dateSplit=splitBaseDate.split('-')
        dateSplit[0]=dateSplit[0].replace('20',"")
        if (dateSplit[1][0]=='0'){
            dateSplit[1]=dateSplit[1].replaceAll('0','')
        }
        if (dateSplit[2][0]=='0'){
            dateSplit[2]=dateSplit[2].replaceAll('0','')
        }
        listItem['datestring']=`${dateSplit[1]}/${dateSplit[2]}/${dateSplit[0]}`
        
    })
    return data
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

function createSeriesSelect(){
    return seriesSelectList;
}

function getObjJSON(){
    return objson;
}

function getDayTimeObj(){
    return dayTimeEdit;
}

function setSeriesID(_event, value){
    currentSeriesID=parseInt(value)
}

function closeSeriesSelect(){
    seriesSelectWindow.close()
}
