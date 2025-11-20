const dayField = document.querySelector("#dayField");
const timeField = document.querySelector("#timeField");
const submitButton = document.querySelector("#submitButton");
const deleteButton = document.querySelector("#deleteButton");

let objson;

async function getDayTime(){
    objson=await window.window4.getDayTime()
    console.log(objson)
    let dayTime=objson['DateString']
    let day=dayTime.split("T")[0]
    let time=dayTime.split("T")[1].split("+")[0]
    dayField.value=day
    timeField.value=time
    // let dayHTML=getHTML(dayField,day)
    // let timeHTML=getHTML(timeField,time)
    // for (const key in objson) {
    //     if (Object.hasOwnProperty.call(objson, key)) {
    //         const value = objson[key];
    //         if (key!=="issue" && key!=="series" && key!=="date"){
    //             getHTML(key,value)
    //         }
    //     }
    // }
    // issueName.innerHTML+=`${objson["series"]} #${objson["issue"]}`;
}

submitButton.addEventListener("click", async function () {
    // series=series.replaceAll("///","\'")
    // await window.thirdWindow.getInfo([issue,series])
    // console.log(pubList)
    await window.window4.editEntry([dayField.value, timeField.value, objson['IssueName'],objson['SeriesName'],objson['DateString']])
})

deleteButton.addEventListener("click", async function () {
    // series=series.replaceAll("///","\'")
    // await window.thirdWindow.getInfo([issue,series])
    // console.log(pubList)
    await window.window4.deleteEntry([objson['IssueName'],objson['SeriesName'],objson['DateString']])
})



getDayTime()