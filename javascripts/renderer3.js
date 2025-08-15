const urlPic = document.querySelector("#urlPic");
const issueInfo = document.querySelector("#issueInfo");
const issueName = document.querySelector("#issueName");


window.window3.getJSON([]).then((objson) => {
    for (const key in objson) {
        if (Object.hasOwnProperty.call(objson, key)) {
            const value = objson[key];
            if (key!=="issue" && key!=="series"){
                console.log(key)
                getHTML(key,value)
            }
        }
    }
    issueName.innerHTML+=`${objson["series"]} #${objson["issue"]}`;

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
