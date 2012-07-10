var notes = {};
var heights = {};
var srcs = {};
var currentSiteIndex=0;
var currentSite;
var Notes = {};
var currentNoteIndex=0;
var presentationMode = false;
$(function(){
    currentSite = $("#"+String(siteIDs[0]));
    makeIframes();
    $("#nextSite").click(nextSite);
    $("#nextNote").click(nextNote);
    $("#presentationMode").click(switchToPresentationMode);
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
    $.each(siteIDs,function (i,siteID){
      loadIframes(siteID)
    })

}

function wrapHTMLInIframe(html,iframe){
    var siteDoc = iframe[0].contentWindow.document;
    var siteBody = $('body', siteDoc);
    siteBody.wrapInner(html);
}

function insertHTMLInIframe(html,iframe){
    var siteDoc = iframe[0].contentWindow.document;
    var siteBody = $('body', siteDoc);
    siteBody.append(html);
}



function readySite(data){
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
        var highlights = $(contWindow.document.body).find(".highlight")
        highlights.css("background-color","yellow");
        if (presentationMode){
            highlights.css({"z-index": "99999", position:"relative", "font-size": "1.4em"});
            highlights.css("background-color","white");
        }
        console.log(currentNoteIndex);
        if (currentNoteIndex < (Object.keys(Notes[ID]).length-1)){
            currentNoteIndex += 1;
        }
    }
}

function removeHighlight(node){
    node.find(".highlight").css("background-color","transparent").removeClass("highlight");
}

function switchToPresentationMode(){
//    $(currentSite[0].contentWindow.documenon-wrapping div full screennt.body).css({"height": "100%","width": "100%","z-index":"0"});
    insertHTMLInIframe("<div class=overlay style='background-color: #666666;z-index:99998; height: 100%; width: 100%;position: fixed; top:0; right: 0; opacity: .6;'>", currentSite);
    presentationMode = true
}
