const { createClient } = require('@supabase/supabase-js')

let supabase;

///////////////////////////////////////// SUPABASE FUNTIONS /////////////////////////////////////////

async function login(supabaseUrl, supabaseKey){
    supabase = createClient(supabaseUrl, supabaseKey)
}

async function getPubList() {
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
    // console.log(args)
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
    // console.log(seriesID)
    const { error } = await supabase
    .from('Series')
    .insert({SeriesName:seriesName, Publisher:publisher, Xmen:xmen, seriesID:seriesID})
    if (error!==null){
        console.log(error)
    }
    else{
        console.log("Added New Series: " + seriesName);

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
    else{
        console.log("Added New Issue: " + seriesName + " #" + issueName + " on " + date);

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

async function getLastDateTime(dateString){
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

async function getmonthdateentries(start,end){
    let midnight=`${start} 00:00:00+00`
    let eod=`${end} 23:59:59+00`
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

async function seriesExists(seriesName){
    let { count, error } = await supabase
    .from("Series")
    .select('*', { count: 'exact'})
    .eq(`SeriesName`,seriesName)
    if (count!==null){
        return count
    }
    else{
        console.log(error)
    }
}

async function getCreatorList(role) {
    try{
        let { data, error } = await supabase
            .from(`${role}`)
            .select(`${role}Name`)
            .order(`${role}Name`, { ascending: true })
        
        return data
    }
    catch (err){
        console.error(err.response.data); 
    }
}

async function getSeriesList() {
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

async function getTime(issue,series,midnight,eod){
    let { data, error } = await supabase
    .from("Entry")
    .select()
    .eq('IssueName',issue)
    .eq('SeriesName',series)
    .gte("DateString", midnight)
    .lte("DateString", eod)
    if (data!==null){
        dayTimeEdit=data[0]
        return data
    }
    else{
        console.log(error)
    }
}

async function editEntry(issue,series,dateTime,origDate){
    const { error } = await supabase  
    .from('Entry')  
    .update({ "DateString": dateTime })  
    .eq('IssueName',issue)
    .eq('SeriesName',series)
    .eq('DateString',origDate)
}

async function deleteEntry(issue,series,dateTime){
    const response = await supabase  
    .from('Entry')  
    .delete()  
    .eq('IssueName',issue)
    .eq('SeriesName',series)
    .eq('DateString',dateTime)
}

module.exports={
    login,
    getPubList,
    getRoleBools,
    getCreator,
    getCoverURL,
    getSeriesIDRPC,
    getSeriesPubRPC,
    issueExists,
    entryExists,
    creatorExists,
    callRPC,
    createSeriesRPC,
    createSeriesWithID,
    addIssueRPC,
    addEntryRPC,
    createPublisher,
    updateIssueCover,
    updateIssueID,
    insertIssueWriter,
    insertWriter,
    insertIssueColor,
    insertColor,
    insertIssuePenciller,
    insertPenciller,
    insertIssueInker,
    insertInker,
    insertIssueArtist,
    insertArtist,
    getLastDateTime,
    getdateentries,
    getmonthdateentries,
    nextpubnum,
    updateCreators,
    seriesExists,
    getCreatorList,
    getSeriesList,
    getTime,
    editEntry,
    deleteEntry
};