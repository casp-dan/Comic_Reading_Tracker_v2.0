const testerButt = document.querySelector("#testerButt");
const seriesTable = document.querySelector("#seriesTable");

window.window2.seriesList([]).then((gotRet) => {
    gotRet.forEach(function(item){
        let splitted=item.split("\', \'")
        const html=getHTML(splitted[1],splitted[0],splitted[2]);
        seriesTable.innerHTML+=html;
    })
})

const getHTML = (cover,series,id) => {
    series=series.replace("\'","");
    cover=cover.replaceAll("\'","");
    id=id.replaceAll("\'","");
    return `<tr class="normalRow">
                <td><img src="${cover}"  width="150.08"></img></th></td>
                <td>${series}</td>
                <td><button type="submit" id="${series}Button" onclick="sendID(${id})" />Select</td>
                </tr> \n`
}

// <td><input type="submit" class="btn_accent" value="Select" id="${series}Button" /></td>


function sendID(id){
    console.log(id)
    window.window2.setSeriesID(id)
    window.window2.closeWindow()
}