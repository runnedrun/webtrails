var notes = {};
var heights = {};
var srcs = {};
var currentSiteIndex=0;
var currentSite;
var Notes = {};
var currentNoteIndex=0;
$(function(){
    makeIframes();
    $("#nextSite").click(nextSite);
    $("#nextNote").click(nextNote);
})

function loadIframes(siteID){
    $.ajax({
        url: "/async_site_load",
        type: "get",
        data: {
            "site_id" : siteID
        },
        success: readySite
    })
}

function makeIframes(){
    //site IDS defined in the html
}

function readySite(data){
    var iframe = $("#"+String(data.site_id));
    insertHTMLIntoIframe(data.src,iframe);
    $(iframe[0].contentWindow.document.head).prepend('<meta http-equiv="Content-type" content="text/html;charset=UTF-8">')
    Notes[data.site_id] = data.notes;
}
function nextSite(){
    currentSite.addClass("notCurrent").removeClass("currentSite");
    currentSiteID = siteIDs[currentSiteIndex+1];
    currentSite = $("#"+String(currentSiteID));
    currentSite.removeClass("notCurrent").addClass("currentSite");
    if (currentSiteIndex < siteIDs.length-1){
        currentSiteIndex+=1;
        currentNoteIndex = 0;
        console.log(currentNoteIndex);
    }
}

function nextNote(){
    ID = currentSite.attr("id");
    var currentNote = Notes[ID][currentNoteIndex];
    if(currentNote){
        var contWindow = $(".currentSite")[0].contentWindow
        $(contWindow).scrollTop(currentNote.scroll_y);
        removeHighlight($(contWindow.document.body));
        console.log(currentNote.content);
        doHighlight(contWindow.document,"highlight",currentNote.content);
        $(contWindow.document.body).find(".highlight").css("background-color","yellow");
        console.log(currentNoteIndex);
        if (currentNoteIndex < (Object.keys(Notes).length-1)){
            currentNoteIndex += 1;
        }
    }
}

function removeHighlight(node){
    node.find(".highlight").css("background-color","transparent").removeClass("highlight");
}