const supabaseMethods=require('./supabaseMethods')


async function getYearlyStats(year) {
    let totals=[]
    let newyear=`${year}-01-01 00:00:00+00`
    let nye=`${year}-12-31 23:59:59+00`
    let data;
    let pubs=await supabaseMethods.getPubList()
    let args={newyear:newyear, nye:nye}
    data=await supabaseMethods.callRPC("getyeartotal",args)
    totals.push(data[0])
    for (const publisher of pubs) {
        let pubArgs={searchpub:publisher['publisher'], newyear:newyear, nye:nye}
        data=await supabaseMethods.callRPC('getyearpub',pubArgs)
        totals.push(data[0])
    }
    data=await supabaseMethods.callRPC("getyearxmen",args)
    let xmen=data[0]
    data=await supabaseMethods.callRPC("getyearxmenadj",args)
    xmen+=data[0]
    totals.push(xmen)
    data=await supabaseMethods.callRPC("getyearseries",args)
    totals.push(data[0])
    return totals
}

async function getMonthlyStats(inDates) {
    let totals=[]
    let data;
    let start=inDates[0]
    let end=inDates[1]
    let startDate=formatInDate(start)
    let endDate=formatInDate(end)
    let startmonth=`${startDate} 00:00:00+00`
    let endmonth=`${endDate} 23:59:59+00`
    let pubs=await supabaseMethods.getPubList()
    let args={startmonth:startmonth, endmonth:endmonth}
    data=await supabaseMethods.callRPC("getmonthtotal",args)
    totals.push(data[0])
    for (const publisher of pubs) {
        let pubArgs={searchpub:publisher['publisher'], startmonth:startmonth, endmonth:endmonth}
        data=await supabaseMethods.callRPC("getmonthpub",pubArgs)
        totals.push(data[0])
    }
    data=await supabaseMethods.callRPC("getmonthxmen",args)
    let xmen=data[0]
    data=await supabaseMethods.callRPC("getmonthxmenadj",args)
    xmen+=data[0]
    totals.push(xmen)
    data=await supabaseMethods.callRPC("getmonthseries",args)
    totals.push(data[0])
    return totals
}

async function getOverviewStats() {
    let totals=[]
    let data;
    let pubs=await supabaseMethods.getPubList()
    let args={}
    data=await supabaseMethods.callRPC("getovertotal",args)
    totals.push(data[0])
    for (const publisher of pubs) {
        let pubArgs={searchpub:publisher['publisher']}
        let data=await supabaseMethods.callRPC("getoverpub",pubArgs)
        totals.push(data[0])
    }
    data=await supabaseMethods.callRPC("getoverxmen",args)
    let xmen=data[0]
    data=await supabaseMethods.callRPC("getoverxmenadj",args)
    xmen+=data[0]
    totals.push(xmen)
    data=await supabaseMethods.callRPC("getoverseries",args)
    totals.push(data[0])
    return totals
}

async function getSnapshotStats(startEnd) {
    let start=startEnd[0]
    let end=startEnd[1]
    let midnight=`${start} 00:00:00+00`
    let eod=`${end} 23:59:59+00`
    let totals=[]
    let data;
    let pubs=await supabaseMethods.getPubList()
    let args={midnight:midnight, eod:eod}
    data=await supabaseMethods.callRPC("getsnapshottotal",args)
    totals.push(data[0])
    for (const publisher of pubs) {
        let pubArgs={searchpub:publisher['publisher'], midnight:midnight, eod:eod}
        data=await supabaseMethods.callRPC("getsnapshotpub",pubArgs)
        totals.push(data[0])
    }
    data=await supabaseMethods.callRPC("getsnapshotxmen",args)
    let xmen=data[0]
    data=await supabaseMethods.callRPC("getsnapshotxmenadj",args)
    xmen+=data[0]
    totals.push(xmen)
    data=await supabaseMethods.callRPC("getsnapshotseries",args)
    totals.push(data[0])
    return totals
}

module.exports={
    getYearlyStats,
    getMonthlyStats,
    getOverviewStats,
    getSnapshotStats
}