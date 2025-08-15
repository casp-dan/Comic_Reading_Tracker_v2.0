const publisherDrop = document.querySelector("#publisher");
const seriesDrop = document.querySelector("#titleButton");
const seriesField = document.querySelector("#seriesField");
const issueField = document.querySelector("#issueField");
const dateField = document.querySelector("#dateField");
const entryForm = document.querySelector("#entry-form");
const todayBox = document.querySelector("#todayBox");
const todayBoxDateView = document.querySelector("#todayBoxDateView");
const xmen = document.querySelector("#xmen");
const xmenAdj = document.querySelector("#xmenAdj");
const xmenBox = document.querySelector("#xmenBox");
const xmenAdjBox = document.querySelector("#xmenAdjBox");
const seriesDropViewTab = document.querySelector("#searchTitle");
const seriesFieldViewTab = document.querySelector("#seriesSearch");
const entryFormViewTab = document.querySelector("#entry-form");
const seriesSearch = document.querySelector("#series-search");
const seriesTable = document.querySelector("#seriesTable");
const issueCountTextSeries = document.querySelector("#issueCountSeries");
const dateFieldViewTab = document.querySelector("#dateSearch");
const dateSearch = document.querySelector("#date-search");
const dateTable = document.querySelector("#dateTable");
const issueCountTextDate = document.querySelector("#issueCountDate");
const monthsDrop=document.querySelector("#month");
const yearsDrop=document.querySelector("#year");
const total=document.querySelector("#totalValue");
const marvelTotal=document.querySelector("#marvelValue");
const dcTotal=document.querySelector("#dcValue");
const imageTotal=document.querySelector("#imageValue");
const darkHorseTotal=document.querySelector("#darkHorseValue");
const boomTotal=document.querySelector("#boomValue");
const xmenTotal=document.querySelector("#xmenValue");
const seriesTotal=document.querySelector("#seriesValue");
const statsForm = document.querySelector("#entry-form");
const totalsDisplay = document.querySelector("#totalsDisplay");
const snapshotBox = document.querySelector("#snapshotBox");
const percentBox = document.querySelector("#percentBox");
const monthBox = document.querySelector("#monthBoxDateView");
const searchSeriesButton = document.querySelector("#searchSeriesButton");
const snapshotStart = document.querySelector("#snapshotStart");
const xmenCheckBox = document.querySelector("#xmenCheckBox");
const xmenAdjCheckBox = document.querySelector("#xmenAdjCheckBox");
const snapshotEnd = document.querySelector("#snapshotEnd");
const logoutButton = document.querySelector("#logoutButton");
const today="";


let seriesList;
const months=["Overview","Yearly","January","February","March","April","May","June","July","August","September","October","November","December"];
const years=["2022","2023","2024", "2025"];
let totalValues=[]

document.getElementById('makeEntryTab').addEventListener('click', async () => {
    makeDropdowns("series");
    makeDropdowns("pub");    
});

entryForm.addEventListener("submit", event => {
    event.preventDefault();
    if (seriesField.value==="" || issueField.value==="" || dateField.value===""){
        // console.log(["Fields Empty", "Please Fill Out All Fields!"])
        window.dialogs.error(["Fields Empty", "Please Fill Out All Fields!"])

    }
    if (issueField.value.includes(",")){
        const issues=issueField.value.split(",");
        const dates=dateField.value.split(",");
        if (issues.length!==dates.length){
            window.dialogs.error(["Improper Entry", "Please ensure each set of issues has a correspondig date!"])
            // console.log("Improper Entry, Please ensure each set of issues has a correspondig date!");
        }
        else{
            let pubStr=publisherDrop.value
            let srsStr=seriesField.value
            let isXmen=xmenBox.checked
            let isXmenAdj=xmenAdjBox.checked
            let i=0;
            issues.forEach(function(issue){
                const date=dateFactory(dates[i], new Date().toJSON().split("T")[1].split('\.')[0]);
                if (date.validate()){
                    const entry=entryFactory(srsStr,issue,date,pubStr,isXmen,isXmenAdj)
                    makeEntry(entry)
                }
                i+=1;
            })
        }
    }
    else{
        const date=dateFactory(dateField.value, new Date().toJSON().split("T")[1].split('\.')[0]);
        if (date.validate()){
            const entry=entryFactory(seriesField.value,issueField.value,date,publisherDrop.value,xmenBox.checked,xmenAdjBox.checked)
            makeEntry(entry);
        }
    }
});

todayBox.addEventListener('change', function() {
    if (this.checked) {
        dateField.value=fillTodayField();
        // dateField.value=getToday();
    }
    else {
        dateField.value=""
    }
});

publisherDrop.addEventListener('change', function(){
    if (publisherDrop.value==="addPublisher"){
        window.dialogs.pubPrompt();
        makeDropdowns("pub");
        publisherDrop.value="";
    }
});

todayBoxDateView.addEventListener('change', function() {
    if (this.checked) {
        dateFieldViewTab.value=getToday();
    }
    else {
        dateFieldViewTab.value=""
    }
});

seriesField.addEventListener('input', function() {
    render(seriesList)
});

seriesDrop.addEventListener('change', function() {
    seriesField.value=this.value;
});

publisherDrop.addEventListener('change', function() {
    if (this.value==='Marvel'){
        xmenCheckBox.style.visibility="visible";
        xmenAdjCheckBox.style.visibility="visible";
    }
    else{
        xmenCheckBox.style.visibility="hidden";
        xmenAdjCheckBox.style.visibility="hidden";
    }
    xmenBox.checked=false;
    xmenAdjBox.checked=false;
});

seriesFieldViewTab.addEventListener('input', function() {
    renderView(seriesList)
});

seriesDropViewTab.addEventListener('change', function() {
    seriesFieldViewTab.value=this.value;
});

document.getElementById('seriesViewTab').addEventListener('click', async () => {
    makeDropdowns("seriesView");
})

seriesSearch.addEventListener('submit', event => {
    event.preventDefault();
    listSeriesViewItems()
});

dateSearch.addEventListener('submit', event => {
    event.preventDefault();
    listDateViewItems();
});

monthsDrop.addEventListener('change', function() {
    getTotals()
});

statsForm.addEventListener('submit', function() {
    getTotals()
});

yearsDrop.addEventListener('change', function() {
    getTotals()
});

document.getElementById('statsTab').addEventListener('click', async () => {
    makeTotalsDisplay().then(() => {
        console.log(totalValues)
    });
    getOverview();
});

percentBox.addEventListener('change', function() {
    if (this.checked) {
        let totalNum=parseInt(document.querySelector(`#${totalValues[0]}`).innerHTML)
        let xmenNum=parseInt(document.querySelector(`#${totalValues[totalValues.indexOf('xmenValue')]}`).innerHTML)
        let marvelNum=parseInt(document.querySelector(`#${totalValues[2]}`).innerHTML)
        totalValues.forEach(function(valueID){
            let label=document.querySelector(`#${valueID}`)
            let pubNum=parseInt(label.innerHTML)
            let percentage=pubNum/totalNum
            label.innerHTML=(`${(percentage*100).toFixed(2)}%`)
        });
        document.querySelector(`#${totalValues[0]}`).innerHTML=totalNum
        let xmenLabel=document.querySelector(`#${totalValues[totalValues.indexOf('xmenValue')]}`)
        let percentage=xmenNum/marvelNum
        xmenLabel.innerHTML=(`${(percentage*100).toFixed(2)}%`)
    }
    else {
        getTotals()
    }
});

snapshotBox.addEventListener('change', handleSnapshot);

logoutButton.addEventListener('click', async function() {
    await window.process.logout();
})








window.secondWindow.getSeriesName((value) => {
    seriesField.value=value
})


async function handleSnapshot() {
    if (this.checked) {
        let snapDates=await window.dialogs.snapPrompt()//.then((snapDates) => {
        let startDate=dateFactory(snapDates[0])
        let endDate=dateFactory(snapDates[1])
        getSnapshotStats(startDate,endDate)
        snapshotStart.style.visibility="visible";
        snapshotStart.innerHTML+=startDate
        snapshotEnd.style.visibility="visible";
        snapshotEnd.innerHTML+=endDate
    }
    else {
        getTotals()
        snapshotStart.style.visibility="hidden";
        snapshotEnd.style.visibility="hidden";
        snapshotStart.innerHTML="Snapshot Start Date: " 
        snapshotEnd.innerHTML="Snapshot End Date: " 
    }
}

async function makeDropdowns(type) {
    if (type==="series"){
        seriesList=await window.dropdownList.seriesList()
        let html=getDropdown(seriesList)
        seriesDrop.innerHTML = html;
    }
    else if (type==="seriesView"){
        seriesList=await window.dropdownList.seriesList()
        let html=getDropdown(seriesList)
        seriesDropViewTab.innerHTML = html;
    }
    else if (type==="pub"){
        const list=await window.dropdownList.pubList()
        let html=getDropdown(list)
        html+=`<option value=\"addPublisher\">Add Publisher</option> \n`
        publisherDrop.innerHTML = html;
    }
}

function getDropdown(list){
    let html=``;
    html+="<option value=\"\"></option> \n";
    list.forEach(function(listItem){
        html+=(`<option value=\"${listItem }\">${listItem}</option> \n`);
    })
    return html;
}

function render(series){
    const searchSeries=series.filter(function(title) {
        return title.toString().toLowerCase().replaceAll("\'","").includes(seriesField.value.toLowerCase().replaceAll("\'",""));
    });
    const htmlTitles=getDropdown(searchSeries);
    seriesDrop.innerHTML = htmlTitles;
}

function renderView(series){
    const searchSeries=series.filter(function(title) {
        return title.toString().toLowerCase().replaceAll("\'","").includes(seriesFieldViewTab.value.toLowerCase().replaceAll("\'",""));
    });
    const htmlTitles=getDropdown(searchSeries);
    seriesDropViewTab.innerHTML = htmlTitles;
}

async function makeEntry (entry){
    if (!seriesList.includes(entry.seriesName)){
        if (entry.publisher===""){
            window.dialogs.error(["No Publisher Selected", "Please Select a Publisher"])
            // console.log("No Publisher Selected", "Please Select a Publisher")
            return false
        }
        else{
            // getSeriesID(entry.seriesName,entry.publisher,entry.xmen);
            // window.secondWindow.selectSeries([entry.seriesName,entry.publisher,entry.xmen])
            window.entries.createSeries([entry.seriesName,entry.publisher,entry.xmen]);
            addBook(entry,entry.seriesName);
            clearFields();
            return true;
            // console.log(seriesID);
        }   
    }
    else{
        addBook(entry,entry.seriesName);
        clearFields();
        return true;
    }
}

searchSeriesButton.addEventListener('click',async function() {
    if (seriesField.value===""){
        window.dialogs.error(["No Publisher Selected", "Please Select a Publisher"])
    }
    else{
        let seriesName=await window.secondWindow.selectSeries([seriesField.value,publisherDrop.value])
        console.log(seriesName)
    }
})

async function getSeriesID(seriesName,publisher,xmen){
    let seriesID=await window.secondWindow.selectSeries([seriesName,publisher,xmen])
    console.log(seriesID)
}

async function addBook(entry,series){
    const date=entry.date;
    // let todayDate=new Date().toJSON().split("T")[0];
    let time="";
    // if (date.toString()!==today){
    window.entries.getLastDateTime(date.toSearchString()).then(async (lastDate) => {
        console.log(lastDate);
        if ((lastDate)!=="None"){
            time=lastDate.split(" ")[1];
            date.setTime(time);
            date.fastForward();
        }
        for (const issue of entry.issues){
            date.fastForward();
            const curIssue=issue;
            const curSeries=series;
            const curXmenAdj=entry.xmenAdj;
            const curDate=date.toDateTimeString();
            await window.entries.addIssue([curIssue,curSeries,curXmenAdj,curDate]);
        }
        window.dialogs.dialog(["Finished", `All entries for ${series} completed`])
    });
}

function clearFields() {
    seriesField.value="";
    seriesDrop.value="";
    issueField.value="";
    dateField.value=""; 
    publisherDrop.value="";
    todayBox.checked=false;
    xmenBox.checked=false;
    xmenAdjBox.checked=false;
    xmenCheckBox.style.visibility="hidden";
    xmenAdjCheckBox.style.visibility="hidden";
    render(seriesList)
}

const getSeriesHTML = (series,issue,date,cover) => {
    let outSeries=series.replaceAll("\', None","")
    outSeries=outSeries.replaceAll(")]', None","")
    outSeries=outSeries.replaceAll(")]","")
    sendSeries=outSeries.replaceAll("\'", "///")
    issue=issue.replaceAll("///","\'")
    if (cover===undefined){
        cover="../assets/funnyCover.jpg"
    }
    return `<tr class="normalRow">
                <td><img src="${cover}"  width="150.08"></img></th></td>
                <td>${outSeries}</td>
                <td><a onclick="getIssueInfo(\'${issue}\',\'${sendSeries}\')">${issue}</a></td>
                <td>${date.toString()}</td>
                </tr> \n`
}

const getDateHTML = (series,issue,date,cover) => {
    let outSeries=series.replaceAll("\', None","")
    outSeries=outSeries.replaceAll(")]', None","")
    outSeries=outSeries.replaceAll(")]","")
    sendSeries=outSeries.replaceAll("\'", "///")
    issue=issue.replaceAll("///","\'")
    if (cover==="None"){
        cover="../assets/funnyCover.jpg"
    }
    return `<tr class="normalRow">
                <td><img src="${cover}"  width="150.08"></img></th></td>
                <td>${outSeries}</td>
                <td><a onclick="getIssueInfo(\'${issue}\',\'${sendSeries}\')">${issue}</a></td>
                <td>${date.toString()}</td>
                </tr> \n`
}

function clearSeriesTable(){
    seriesTable.innerHTML="";
    issueCountTextSeries.innerText="Issues Read:"
}

async function listSeriesViewItems(){
    let issueCount=0;
    clearSeriesTable();
    const series=seriesList.filter(function(series){return series.toString()===seriesFieldViewTab.value;})[0];
    let issueList=await window.views.seriesEntries(series)
    issueList.forEach(function(item){
        const html=getSeriesHTML(series,item[0],item[1],item[2]);
        seriesTable.innerHTML+=html;
        issueCount+=1;
    });
    issueCountTextSeries.innerText+=" "+issueCount;
}

async function listDateViewItems(){
    let issueCount=0;
    clearDateTable();
    let issueList;
    if (monthBox.checked){
        let searchDate=dateFieldViewTab.value.toString();
        searchDate=searchDate.replaceAll('/','//')
        issueList=await window.views.dateEntries(searchDate)
        createDateViewTable(issueList, issueCount)
    }
    else{
        const searchDate=dateFactory(dateFieldViewTab.value.toString())
        if (searchDate.validate()){
            issueList=await window.views.dateEntries(searchDate.toString())
            createDateViewTable(issueList, issueCount)
        }
        else{
            window.dialogs.error(["Invalid Date", "Please Properly Enter Date!"])
        }
    }
}

function createDateViewTable(issueList,issueCount){
    if (issueList.length===0){
        window.dialogs.error(["Nothing Read", "You did not read any issues on this date!"])
    }
    else{
        issueList.forEach(function(item){
            const html=getDateHTML(item[1],item[0],item[3],item[2]);
            dateTable.innerHTML+=html;
            issueCount+=1;
        })
        issueCountTextDate.innerText+=" "+issueCount;
    }
}

function clearDateTable(){
    dateTable.innerHTML="";
    issueCountTextDate.innerText="Issues Read:"
}

function getTotals(){
    let action=false;
    if (monthsDrop.value===months[0] || monthsDrop.value===""){
        yearsDrop.style.visibility="hidden";
        getOverview()
        action=true;
    }
    else if (monthsDrop.value===months[1]){
        yearsDrop.style.visibility="visible";
        if (yearsDrop.value!==""){
            getYearlyStats(yearsDrop.value)
            action=true;
        }
    }
    else{
        if (yearsDrop.value===""){
            yearsDrop.style.visibility="visible";
        }
        else{
            getMonthlyStats(yearsDrop.value,monthsDrop.value);
            action=true;
        }
    }
    if (percentBox.checked && action){
        percentBox.checked=false;
    }
}

async function getYearlyStats(year){
    let totals=await window.stats.yearlyStats(year)
    let pubList= await window.dropdownList.pubList()
    setValues(pubList,totals)
}

async function getSnapshotStats(startDate,endDate){
    let totals=await window.stats.snapshotStats([startDate.toSearchString(),endDate.toSearchString()])
    let pubList= await window.dropdownList.pubList()
    setValues(pubList,totals)
}

async function getMonthlyStats(year,month){
    let num=(months.indexOf(month)-1);
    let monthNum;
    if (num<10){
        monthNum=`0${num}` ;
    }
    else{
        monthNum=`${num}`;
    }
    let totals=await window.stats.monthlyStats([year.toString(),monthNum])
    let pubList= await window.dropdownList.pubList()
    setValues(pubList,totals)
}

async function getOverview(){
    let totals=await window.stats.overviewStats()
    let pubList= await window.dropdownList.pubList()
    setValues(pubList,totals)
}

async function makeTotalsDisplay(){
    let pubList= await window.dropdownList.pubList()
    let totals=[]
    pubList.forEach(function(_item){
        totals.push(0)
    })
    totals.push(0)
    totals.push(0)
    totals.push(0)
    setValues(pubList,totals)
}

function setValues(pubList,totals){
    totalValues=[]
    let html=''
    html=`<p>Total: </p>\n
    <p id="totalValue">${totals[0]}</p>\n`;
    totalValues.push("totalValue")
    totals.shift()
    pubList.forEach(function(listItem){
        let idName=listItem.replaceAll(' ','_')
        idName=idName.replaceAll(',','')
        html+=(`<p>Total ${listItem}: <p>\n
            <p id="${idName}Value">${totals[0]}</p>\n`
        );
        totals.shift()
        totalValues.push(`${idName}Value`)
    })
    html+=`<p>Total X-Men: </p>\n
    <p id="xmenValue">${totals[0]}</p>\n`
    totalValues.push(`xmenValue`)
    totals.shift()
    html+=`<p>Total Series: </p>\n
    <p id="seriesValue">${totals[0]}</p>\n`
    totalsDisplay.innerHTML = html;
}

function fillTodayField(){
    let issues=issueField.value;
    let date;
    if (issues.includes(',')){
        date='';
        let num=issues.split(',').length
        let x=0;
        while (x<num-1){
            date+=getToday()+",";
            x++
        }
        date+=getToday();
    }
    else{
        date=getToday();
    }
    return date;
}

function getToday(){
    const date = new Date();
    let day=date.getDate().toString();
    let month=(date.getMonth()+1).toString();
    let year=date.getFullYear().toString().substring(2);
    return `${month}/${day}/${year}`
}

async function getIssueInfo(issue, series){
    series=series.replaceAll("///","\'")
    await window.thirdWindow.getInfo([issue,series])
    // console.log(pubList)
    await window.thirdWindow.showInfo()
}


const dateFactory=(dateString, inTime) => {
    return {
        _dateString: dateString,
        _month:parseInt(dateString.split('/')[0]),
        _day:parseInt(dateString.split('/')[1]),
        _year:parseInt(dateString.split('/')[2]),
        _time:inTime,
        START:"1/1/22",
        THIRTYONE:[1,3,5,7,8,10,12],
        THIRTY:[4,6,9,11],

        get month(){
            return this._month;
        },

        get day(){
            return this._day;
        },


        get year(){
            return this._year;
        },

        get time(){
            return this._time;
        },

        get start(){
            return this.START;
        },

        toString(){
            return this._month.toString()+"/"+this._day.toString()+"/"+this._year.toString()
        },

        toSearchString(){
            let sMonth=this._month.toString();
            let sDay=this._day.toString();
            if (this.month<10){
                sMonth="0"+sMonth;
            }
            if (this.day<10){
                sDay="0"+sDay;
            }
            return "20"+this._year.toString()+"-"+sMonth+"-"+sDay;
        },

        toDateTimeString(){
            let sMonth=this._month.toString();
            let sDay=this._day.toString();
            if (this.month<10){
                sMonth="0"+sMonth;
            }
            if (this.day<10){
                sDay="0"+sDay;
            }
            return "20"+this._year.toString()+"-"+sMonth+"-"+sDay+" "+this._time;
        },

        withinRange(){
            let validDate=false;
            const startDate=dateFactory(this.START, new Date().toJSON().split("T")[1].split('\.')[0]);
            const today=dateFactory(this.getToday(), new Date().toJSON().split("T")[1].split('\.')[0]);
            if (!this.tooEarly(startDate)){
                if (!this.tooLate(today)){
                    validDate=true;
                }
            }
            return validDate;
        },

        compareTo(otherDate) {
            if (this.tooEarly(otherDate)){
                return -1;
            }
            else if (this.tooLate(otherDate)){
                return 1;
            }
            else{
                return 0;
            }
        },

        equals(otherDate) {
            if (this.toString().equals(otherDate.toString())){
                return true;
            }
            else{
                return false;
            }
        },

        tooEarly(start) {
            let tooEarly=false;
            if (this.year>=start.year){
                if (this.year==start.year){
                    if (this.month<start.month){
                        tooEarly=true;
                    }
                    else if (this.day<start.day){
                        tooEarly=true;
                    }
                    else{
                        tooEarly=false;
                    }
                }
            }
            else{
                tooEarly=true;
            }
            return tooEarly;
        },

        tooLate(today) {
            let tooLate=false;
            if (this.year==today.year){
                if (this.month>today.month){
                    tooLate=true;
                }
                else if (this.month===today.month){
                    if (this.day>today.day){
                        tooLate=true;
                    }
                }
                else{
                    tooLate=false;
                }
            }
            else if (this.year>today.year){
                tooLate=true;
            }
            else{
                tooLate=false;
            }
            return tooLate;
        },

        validate() {
            let valid=true;
            const comps=this.breakdown();
            comps.forEach(function(num){
                if (isNaN(num)){
                    valid=false
                }
            })
            let i=0;
            if (comps!=null){
                let numComps=[];
                while (i<comps.length){
                    try{
                        numComps[i]=parseInt(comps[i]);
                    }catch(e){
                        valid=false;
                    }
                    i++;
                }
                if (valid){
                    valid=this.withinRange();
                }
            }
            else{
                valid=false;
            }
            if (!this.realDate()){
                valid=false
            }
            return valid;
        },

        realDate(){
            let real=true;
            if (this.month>12){
                real=false;
            }
            else if (this.month==2){
                real=this.leapYear();
            }
            else if (this.THIRTYONE.includes(this.month)){
                if (this.day>31){
                    real=false;
                }
            }
            else if (this.THIRTY.includes(this.month)){
                if (this.day>30){
                    real=false;
                }
            }
            return real;
        },

        leapYear(){
            if (this.year%4==0){
                if (this.day>29){
                    return false;
                }
            }
            else{
                if (this.day>28){
                    return false;
                }
            }
            return true;
        },

        getToday(){
            const date = new Date();
            let day=date.getDate().toString();
            let month=(date.getMonth()+1).toString();
            let year=date.getFullYear().toString().substring(2);
            return `${month}/${day}/${year}`;
        },

        breakdown(){
            let comps=this.toString().split("/");
            if (comps.length===3){
                if (comps[2].length>2){
                    comps[2]=comps[2].split("0")[1];
                }
            }
            else{
                comps=null;
            }
            return comps;
        },

        equals(otherDate){
            if (this.toString() !== otherDate.toString()){
                return false;
            }
            else if (this.month!==otherDate.month){
                return false;
            }
            else if (this.day !== otherDate.day){
                return false;
            }
            else if (this.year !== otherDate.year){
                return false;
            }
            return true;
        },

        fastForward(){
            timeList=this._time.split(":");
            hrStr=timeList[0];
            minStr=timeList[1];
            secStr=timeList[2];
            sec=parseInt(timeList[2]);
            min=parseInt(timeList[1]);
            hr=parseInt(timeList[0]);
            if (sec+1<=59){
                sec++;
                if (sec<10){
                    secStr="0"+sec.toString();
                }
                else{
                    secStr=sec.toString();
                }
            }
            else{
                secStr="0"+(sec+1+-60).toString();
                if (min+1<=59){
                    min++;
                    if (min<10){
                        minStr="0"+min.toString();
                    }
                    else{
                        minStr=min.toString();
                    }
                }
                else{
                    secStr="0"+(sec+1-60).toString();
                    minStr="0"+(min+1-60).toString();
                    if (hr+1<=23){
                        hr++;
                        if (hr<10){
                            hrStr="0"+hr.toString();
                        }
                        else{
                            hrStr=hr.toString(hr);
                        }
                    }
                }
            }
            this._time=hrStr+":"+minStr+":"+secStr;
        },

        setTime(newTime){
            this._time=newTime;
        }
    }
}

const entryFactory=(seriesName, issues, date, publisher, xmen, xmenAdj) => {
    return {
        _seriesName: seriesName,
        _issues: issues,
        _date: date,
        _publisher: publisher,
        _xmen: xmen,
        _xmenAdj: xmenAdj,

        get seriesName(){
            return this._seriesName;
        },
        get issues(){
            return this.makeIssueList();
        },
        get date(){
            return this._date;
        },
        get publisher(){
            return this._publisher;
        },
        get xmen(){
            return this._xmen;
        },
        get xmenAdj(){
            return this._xmenAdj;
        },

        equals(otherEntry){
            if (this.seriesName !== otherEntry.seriesName){
                return false;
            }
            else if (this.seriesName !== otherEntry.seriesName){
                return false;
            }
            else if (this.seriesName !== otherEntry.seriesName){
                return false;
            }
            else if (this.seriesName !== otherEntry.seriesName){
                return false;
            }
            else if (this.xmen && !otherEntry.xmen){
                return false;
            }
            else if (this.xmenAdj && !otherEntry.xmenAdj){
                return false;
            }
            return true;
        },


        makeIssueList(){
            if (this._issues.includes("-") && this._issues.split("-")[0]!=""){
                const issuesList=this._issues.split("-");
                let issue=parseInt(issuesList[0]);
                let issueEnd=parseInt(issuesList[1]);
                issues=[];
                while (issue<=issueEnd){
                    issues.push(issue.toString());
                    issue++;
                }
            }
            else{
                issues=[];
                issues.push(this._issues);
            }
            return issues;
        }
    }
}

const htmlMonths = getDropdown(months);
const htmlYears = getDropdown(years);
monthsDrop.innerHTML = htmlMonths;
yearsDrop.innerHTML = htmlYears;