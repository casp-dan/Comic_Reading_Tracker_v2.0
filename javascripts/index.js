const { app, BrowserWindow, ipcMain, dialog} = require('electron/main')
const { createClient } = require('@supabase/supabase-js')
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const prompt = require('electron-prompt');
const electronSquirrelStartup = require('electron-squirrel-startup');
const port=5000
let seriesSelectList;
let currentSeriesID=null;
let seriesSelectWindow;
let issueInfoWindow;
let win;
let objson="";
const supabaseUrl = 'https://tlsyuolttzxvfuemkvny.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsc3l1b2x0dHp4dmZ1ZW1rdm55Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQzNzA3OSwiZXhwIjoyMDczMDEzMDc5fQ.CKV8xVQf9RHyV1gtO-XKbABZ3XJLIsAP6TTZj6j0sj4"
const supabase = createClient(supabaseUrl, supabaseKey)


async function initialize () {
    
    var python = require('child_process').spawn('python3', ['./python/app.py']);
    python.stdout.on('data', function (data) {
        console.log("data: ", data.toString('utf8'))
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
    
    doLogin()


}

async function doLogin(){
    mainWindow()
    let loggedIn;
    while (loggedIn!=='string'){
        loggedIn=await login()
    }
    win.show()
}

async function mainWindow(){

    win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false, 
        webPreferences: {
            preload: path.join(__dirname, './preload.js'),
            nodeIntegration: true
        }
    })

    win.loadFile("html/tabs.html") 
    
    // win.webContents.openDevTools()
}

app.whenReady().then(() => {


    ipcMain.handle('dropdownList:series', getSeriesList)
    ipcMain.handle('dropdownList:publishers', getPubList)
    
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

async function getSeriesList(test) {
    let { data, error } = await supabase
        .from('Series')
        .select("SeriesName")
        .order('SeriesName', { ascending: true })
    if (data!==null){
        return data
    }
    else{
        console.log(error)
    }
}

async function getPubList(test) {
    try{
        let { data, error } = await supabase
            .from('publisher')
            .select("publisher")
            .order('list_order', { ascending: true })
        
        return data
    }
    catch (err){
        console.error(err.response.data); 
    }
}

async function getSeriesEntries(_event, seriesName) {
    try{
        let data=await callRPC("seriesName",{})
        let toRet=formatOutDates(data)
        return toRet
    }
    catch(err){
        console.error(err);
    }
}

async function getDateEntries(_event, inDate) {
    try{
        let date=formatInDate(inDate)
        let data=await getdateentries(date)
        let toRet=formatOutDates(data)
        return toRet
    }
    catch(err){
        console.error(err);
    }
}

async function getYearlyStats(_event, year) {
    let totals=[]
    let newyear=`${year}-01-01 00:00:00+00`
    let nye=`${year}-12-31 23:59:59+00`
    let data;
    let pubs=await getPubList()
    let args={newyear:newyear, nye:nye}
    data=await callRPC("getyeartotal",args)
    totals.push(data[0])
    for (const publisher of pubs) {
        let pubArgs={searchpub:publisher['publisher'], newyear:newyear, nye:nye}
        data=await callRPC('getyearxmen',pubArgs)
        totals.push(data[0])
    }
    data=await callRPC("getyearxmen",args)
    let xmen=data[0]
    data=await callRPC("getyearxmenadj",args)
    xmen+=data[0]
    totals.push(xmen)
    data=await callRPC("getyearseries",args)
    totals.push(data[0])
    return totals
}

async function getMonthlyStats(_event, monthYear) {
    let totals=[]
    let data;
    let year=monthYear[0]
    let month=monthYear[1]
    let startmonth=`${year}-${month}-01 00:00:00+00`
    let endmonth=`${year}-${month}-31 23:59:59+00`
    let pubs=await getPubList()
    let args={startmonth:startmonth, endmonth:endmonth}
    data=await callRPC("getmonthtotal",args)
    totals.push(data[0])
    for (const publisher of pubs) {
        let pubArgs={searchpub:publisher['publisher'], startmonth:startmonth, endmonth:endmonth}
        data=await callRPC(getmonthpub,pubArgs)
        totals.push(data[0])
    }
    data=await callRPC("getmonthxmen",args)
    let xmen=data[0]
    data=await callRPC("getmonthxmenadj",args)
    xmen+=data[0]
    totals.push(xmen)
    data=await callRPC("getmonthseries",args)
    totals.push(data[0])
    return totals
}

async function getOverviewStats(_event) {
    let totals=[]
    let data;
    let pubs=await getPubList()
    let args={}
    data=await callRPC("getovertotal",args)
    totals.push(data[0])
    for (const publisher of pubs) {
        let pubArgs={searchpub:publisher['publisher']}
        let data=await callRPC("getoverpub",pubArgs)
        totals.push(data[0])
    }
    data=await callRPC("getoverxmen",args)
    let xmen=data[0]
    data=await callRPC("getoverxmenadj",args)
    xmen+=data[0]
    totals.push(xmen)
    data=await callRPC("getoverseries",args)
    totals.push(data[0])
    return totals
}

async function getSnapshotStats(_event, startEnd) {
    let start=startEnd[0]
    let end=startEnd[1]
    let midnight=`${start} 00:00:00+00`
    let eod=`${end} 23:59:59+00`
    let totals=[]
    let data;
    let pubs=await getPubList()
    let args={midnight:midnight, eod:eod}
    data=await callRPC("getsnapshottotal",args)
    totals.push(data[0])
    for (const publisher of pubs) {
        let pubArgs={searchpub:publisher['publisher'], midnight:midnight, eod:eod}
        data=await callRPC("getsnapshotpub",pubArgs)
        totals.push(data[0])
    }
    data=await callRPC("getsnapshotxmen",args)
    let xmen=data[0]
    data=await callRPC("getsnapshotxmenadj",args)
    xmen+=data[0]
    totals.push(xmen)
    data=await callRPC("getsnapshotseries",args)
    totals.push(data[0])
    return totals
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
    seriesSelectWindow=makeSeriesSelectPopup();
}

async function showInfo(_event){
    issueInfoWindow=makeIssueInfoPopup();
}

async function createSeries(_event, values){
    let seriesName=values[0]
    let publisher=values[1]
    let xmen=values[2]
    if (currentSeriesID===null){
        await createSeriesRPC(seriesName, publisher, xmen)
    }
    else{
        await createSeriesWithID(seriesName, publisher, xmen, currentSeriesID )
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
    let midnight=`${dateString} 00:00:00+00`
    let eod=`${dateString} 23:59:59+00`
    const { data, error } = await supabase.rpc('getlastdatetime', {midnight:midnight, eod:eod})
    if (data!==null){
        return data
    }
    else{
        console.log(error)
    }
}

async function addIssue(_event, values){
    let issue=values[0]
    let series=values[1]
    let xmenAdj=values[2]
    let date=values[3]
    let data;
    let newIssue;
    let day=date.split(' ')[0]
    data=await issueExists(series,issue)
    if (data===0){
        newIssue=true
        await addIssueRPC(issue,series,xmenAdj)
    }
    data=await entryExists(series,issue,day)
    if (data===0){
        date+="+00"
        await addEntryRPC(issue,series,date)
    }
    if (newIssue){
        let seriesID;
        let issueData=[]
        seriesID=await getSeriesIDRPC(series)
        let publisher=await getSeriesPubRPC(series)
        let startYear=series.split("(")[1].split(")")[0]

        if (seriesID===undefined){
            let response=await fetch(`http://127.0.0.1:${port}/getSeriesInfo?year=${year}&pub=${pub}&seriesName=${seriesName}`);
            seriesID=await response.text().toString();
        }
        if (seriesID!==undefined){
            const response2=await fetch(`http://127.0.0.1:${port}/issueAPI?issue=${issue}&seriesID=${seriesID}`);
            const data2=await response2.json();
            if (data2["coverURL"]!==''){
                await updateIssueCover(series,issue,data2['coverURL'])
            }
            if (data2["issueID"]!==''){
                await updateIssueID(series,issue,data2['issueID'])
            }
            await updateCreators(issue,series,data2)
        }
    }
}

async function getInfo(_event, values){
    let issue=values[0]
    let series=values[1]
    let names={}
    let roles=["Color","Inker","Penciller","Writer","Artist"]
    let myResult=await getRoleBools(issue,series,roles)
    let isRole=myResult[0]
    for (const role of roles) {
        if (isRole[role]===true){
            let creatorNames=await getCreator(role,issue,series)
            if (creatorNames.length!==0){
                names[role]=[]
                creatorNames.forEach(function(creator){
                    names[role].push(creator[`${role}Name`])
                })
            }
        }
    }
    let urlData=await getCoverURL(issue,series)
    names['URL']=urlData[0]['coverURL']
    names["issue"]=issue
    names["series"]=series
    objson=names;
    return names;
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
    let data;
    if (fs.existsSync("userInfo.txt")) {
        let readInfo = fs.readFileSync(`userInfo.txt`).toString();
        readInfo=readInfo.split('\n')
        readInfo.forEach(function(listItem){
            let splitted=listItem.split(": ")
            credentials[splitted[0]]=splitted[1]
        })
        let db=await makeLoginPrompt("Database",'text')
        response=await fetch(`http://127.0.0.1:${port}/loginThingy?user=${credentials["sql_user"]}&password=${credentials["password"]}&db=${db}&host=${credentials["host"]}&mok_user=${credentials["mok_user"]}&mok_password=${credentials["mok_password"]}`)//.catch(console.log("error"))
        data=await response.text();  
    }
    else{
        let user=await makeLoginPrompt("User",'text')
        let mok_user=await makeLoginPrompt("Mokkari User",'text')
        let host=await makeLoginPrompt("Host",'text')
        let db=await makeLoginPrompt("Database",'text')
        let password=await makeLoginPrompt("Password",'password')
        response=await fetch(`http://127.0.0.1:${port}/loginThingy?user=${user}&password=${password}&db=${db}&host=${host}&mok_user=${mok_user}`);
        data=await response.text();
    }
    return data;
}

async function logout(){
    win.close()
    win=null
    await fetch(`http://127.0.0.1:${port}/logout`);
    doLogin()
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
    let data=await nextpubnum()
    await createPublisher(publisher,data)
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

async function updateCreators(issueName,seriesName,data2){
    let writerList=data2["Writer"]
    let coloristList=data2["Colorist"]
    let pencillerList=data2["Penciller"]
    let inkerList=data2["Inker"]
    let artistList=data2["Artist"]
    for (const name of writerList){
        const { error } = await supabase
        .from('RealIssue')
        .update({ "Writer": 1 })
        .eq('SeriesName',seriesName)
        .eq('IssueName',issueName)
        await insertIssueWriter(issueName,seriesName,name)
        if (!creatorExists("Writer",name)){
            insertWriter(issueName,seriesName,name)
        }
    }

    for (const name of coloristList){
        const { error } = await supabase
        .from('RealIssue')
        .update({ "Color": 1 })
        .eq('SeriesName',seriesName)
        .eq('IssueName',issueName)
        await insertIssueColor(issueName,seriesName,name)
        if (!creatorExists("Color",name)){
            insertColor(issueName,seriesName,name)
        }
    }

    for (const name of pencillerList){
        const { error } = await supabase
        .from('RealIssue')
        .update({ "Penciller": 1 })
        .eq('SeriesName',seriesName)
        .eq('IssueName',issueName)
        await insertIssuePenciller(issueName,seriesName,name)
        if (!creatorExists("Penciller",name)){
            insertPenciller(issueName,seriesName,name)
        }
    }

    for (const name of inkerList){
        const { error } = await supabase
        .from('RealIssue')
        .update({ "Inker": 1 })
        .eq('SeriesName',seriesName)
        .eq('IssueName',issueName)
        await insertIssueInker(issueName,seriesName,name)
        if (!creatorExists("Inker",name)){
            insertInker(issueName,seriesName,name)
        }
    }

    for (const name of artistList){
        const { error } = await supabase
        .from('RealIssue')
        .update({ "Artist": 1 })
        .eq('SeriesName',seriesName)
        .eq('IssueName',issueName)
        await insertIssueArtist(issueName,seriesName,name)
        if (!creatorExists("Artist",name)){
            insertArtist(issueName,seriesName,name)
        }
    }
}

async function getdateentries(date){
    let midnight=`${date} 00:00:00+00`
    let eod=`${date} 23:59:59+00`
    const { data, error } = await supabase.rpc('getdateentries', {midnight:midnight, eod:eod})
    if (data!==null){
        return data
    }
    else{
        console.log(error)
    }
}

async function nextpubnum(){
    const { data, error } = await supabase.rpc('nextpubnum')
    if (data!==null){
        return data+1
    }
    else{
        console.log(error)
    }
}

///////////////////////////////////////// SUPABASE FUNTIONS /////////////////////////////////////////

async function getRoleBools(searchissue, searchseries, roles){
    let { data, error } = await supabase
    .from("RealIssue")
    .select(`${roles[0]}, ${roles[1]}, ${roles[2]}, ${roles[3]}, ${roles[4]}`)
    .eq('IssueName',searchissue)
    .eq('SeriesName',searchseries)
    if (data!==null){
        return data
    }
    else{
        console.log(error)
    }
}

async function getCreator(roleName,searchissue,searchseries){
    let { data, error } = await supabase
    .from(`Issue${roleName}`)
    .select(`${roleName}Name`)
    .eq('IssueName',searchissue)
    .eq('SeriesName',searchseries)
    if (data!==null){
        return data
    }
    else{
        console.log(error)
    }
}

async function getCoverURL(searchissue,searchseries){
    let { data, error } = await supabase
    .from('RealIssue')
    .select('coverURL')
    .eq('SeriesName',searchseries)
    .eq('IssueName',searchissue)
    if (data!==null){
        return data
    }
    else{
        console.log(error)
    }
}


async function getSeriesIDRPC(searchseries){
    let { data, error } = await supabase
    .from("Series")
    .select('seriesID')
    .eq('SeriesName',searchseries)
    if (data[0]['seriesID']!==null){
        return data[0]['seriesID']
    }
    else{
        console.log(error)
    }
}

async function getSeriesPubRPC(searchseries){
    let { data, error } = await supabase
    .from("Series")
    .select('Publisher')
    .eq('SeriesName',searchseries)
    if (data[0]['Publisher']!==null){
        return (data[0]['Publisher'])
    }
    else{
        console.log(error)
    }
}

async function issueExists(searchseries,searchissue){
    let { count, error } = await supabase
    .from('RealIssue')
    .select('*', { count: 'exact'})
    .eq('SeriesName',searchseries)
    .eq('IssueName',searchissue)
    if (count!==null){
        return count
    }
    else{
        console.log(error)
    }
}

async function entryExists(searchseries,searchissue,date){
    let midnight=`${date} 00:00:00`
    let eod=`${date} 23:59:59`
    let { count, error } = await supabase
    .from('Entry')
    .select('*', { count: 'exact'})
    .eq('SeriesName', searchseries)
    .eq('IssueName', searchissue)
    .gte("DateString", midnight)
    .lte("DateString", eod)
    if (count!==null){
        return count
    }
    else{
        console.log(error)
    }
}

async function creatorExists(role,searchcreator){
    let { count, error } = await supabase
    .from(role)
    .select('*', { count: 'exact'})
    .eq(`${role}Name`,searchcreator)
    if (count!==null){
        return count
    }
    else{
        console.log(error)
    }
}

async function callRPC(func,args){
    const { data, error } = await supabase.rpc(func, args)
    if (data!==null){
        return data
    }
    else{
        console.log(error)
    }
}

async function createSeriesRPC(seriesName, publisher, xmen){
    const { error } = await supabase
    .from('Series')
    .insert({SeriesName:seriesName, Publisher:publisher, Xmen:xmen})
    if (error!==null){
        console.log(error)
    }
}

async function createSeriesWithID(seriesName, publisher, xmen, seriesID ){
    const { error } = await supabase
    .from('Series')
    .insert({SeriesName:seriesName, Publisher:publisher, Xmen:xmen, seriesID:seriesID})
    if (error!==null){
        console.log(error)
    }
}

async function addIssueRPC(issueName, seriesName, xmenAdj){
    const { error } = await supabase
    .from('RealIssue')
    .insert({IssueName:issueName, SeriesName:seriesName, XmenAdj:xmenAdj})
    if (error!==null){
        console.log(error)
    }
}

async function addEntryRPC(issueName, seriesName, date){
    const { error } = await supabase
    .from('Entry')
    .insert({IssueName:issueName, SeriesName:seriesName, DateString:date})
    if (error!==null){
        console.log(error)
    }
}

async function createPublisher(publisher, num){
    const { error } = await supabase
    .from('publisher')
    .insert({publisher:publisher, list_order:num+1})
    if (error!==null){
        console.log(error)
    }
}

async function updateIssueCover(series,issue,url){
    const { error } = await supabase
    .from('RealIssue')
    .update({ coverURL: url })
    .eq('SeriesName',series)
    .eq('IssueName',issue)
}

async function updateIssueID(series,issue,id){
    const { error } = await supabase
    .from('RealIssue')
    .update({ issueID: id })
    .eq('SeriesName',series)
    .eq('IssueName',issue)
}
    
///////////////////////////////////////// CREATOR FUNTIONS /////////////////////////////////////////

async function insertIssueWriter(issueName,seriesName,creator){
    const { error } = await supabase
    .from(`IssueWriter`)
    .insert({IssueName:issueName, SeriesName:seriesName, WriterName:creator})
    if (error!==null){
        console.log(error)
    }
}

async function insertWriter(issueName,seriesName,creator){
    const { error } = await supabase
    .from(`Writer`)
    .insert({IssueName:issueName, SeriesName:seriesName, Writer:creator})
    if (error!==null){
        console.log(error)
    }
}

async function insertIssueColor(issueName,seriesName,creator){
    const { error } = await supabase
    .from(`IssueColor`)
    .insert({IssueName:issueName, SeriesName:seriesName, ColorName:creator})
    if (error!==null){
        console.log(error)
    }
}

async function insertColor(issueName,seriesName,creator){
    const { error } = await supabase
    .from(`Color`)
    .insert({IssueName:issueName, SeriesName:seriesName, Color:creator})
    if (error!==null){
        console.log(error)
    }
}

async function insertIssuePenciller(issueName,seriesName,creator){
    const { error } = await supabase
    .from(`IssuePenciller`)
    .insert({IssueName:issueName, SeriesName:seriesName, PencillerName:creator})
    if (error!==null){
        console.log(error)
    }
}

async function insertPenciller(issueName,seriesName,creator){
    const { error } = await supabase
    .from(`Penciller`)
    .insert({IssueName:issueName, SeriesName:seriesName, Penciller:creator})
    if (error!==null){
        console.log(error)
    }
}

async function insertIssueInker(issueName,seriesName,creator){
    const { error } = await supabase
    .from(`IssueInker`)
    .insert({IssueName:issueName, SeriesName:seriesName, InkerName:creator})
    if (error!==null){
        console.log(error)
    }
}

async function insertInker(issueName,seriesName,creator){
    const { error } = await supabase
    .from(`Inker`)
    .insert({IssueName:issueName, SeriesName:seriesName, Inker:creator})
    if (error!==null){
        console.log(error)
    }
}

async function insertIssueArtist(issueName,seriesName,creator){
    const { error } = await supabase
    .from(`IssueArtist`)
    .insert({IssueName:issueName, SeriesName:seriesName, ArtistName:creator})
    if (error!==null){
        console.log(error)
    }
}

async function insertArtist(issueName,seriesName,creator){
    const { error } = await supabase
    .from(`Artist`)
    .insert({IssueName:issueName, SeriesName:seriesName, Artist:creator})
    if (error!==null){
        console.log(error)
    }
}


app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        console.log('poopoop')
    }
})
