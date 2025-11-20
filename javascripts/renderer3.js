const urlPic = document.querySelector("#urlPic");
const issueInfo = document.querySelector("#issueInfo");
const issueName = document.querySelector("#issueName");
const editButton = document.querySelector("#editButton");

let objson;

async function getJSON(){
    objson=await window.window3.getJSON([])
    for (const key in objson) {
        if (Object.hasOwnProperty.call(objson, key)) {
            const value = objson[key];
            if (key!=="issue" && key!=="series" && key!=="date"){
                getHTML(key,value)
            }
        }
    }
    issueName.innerHTML+=`${objson["series"]} #${objson["issue"]}`;
}

editButton.addEventListener("click", async function () {
    // series=series.replaceAll("///","\'")
    // await window.thirdWindow.getInfo([issue,series])
    // console.log(pubList)
    let data=await window.fourthWindow.getTime([objson['issue'], objson['series'], objson['date']])
    await window.fourthWindow.showEdit()
})

const getHTML = (key,value) => {
    if (key==="URL"){
        if (value!=="None"){
            urlPic.src=value
        }
    }
    else{
        issueInfo.innerHTML+=`<label>${key}: ${value}</label>\n<br>\n`
    }
}


getJSON()