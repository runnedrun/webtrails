var currentSiteIndex=0;
var currentSite;
var Notes = {};
var currentNoteIndex=0;
var presentationMode = false;
var noteIDs=[];
$(function(){
    currentSite = $("#"+String(siteIDs[0]));
    makeIframes();
    $("#nextSite").click(nextSite);
    $("#nextNote").click(nextNote);
    $("#presentationMode").click(switchToPresentationMode);
    $("#showNoteList").click(expandOrCloseNoteList);
    $(".noteWrapper").click(clickJumpToNote);
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
    console.log(data.notes);
    $.each(data.notes, function(i,note){
        noteIDs.push(note.note_id);
        Notes[note.note_id] = note;
    })
}
function nextSite(){
    expandOrCloseNoteList();
    currentSite.addClass("notCurrent").removeClass("currentSite");
    var currentSiteID = siteIDs[currentSiteIndex+1];
    currentSite = $("#"+String(currentSiteID));
    currentSite.removeClass("notCurrent").addClass("currentSite");
    if (currentSiteIndex < siteIDs.length-1){
        currentSiteIndex+=1;
        currentNoteIndex = 0;
        console.log(currentNoteIndex);
    }
}

function nextNote(){
    var currentSiteID = noteIDs[currentNoteIndex];
    scrollToAndHighlightNote(currentSiteID);
}

function scrollToAndHighlightNote(noteID){
    console.log(noteID);
    var currentNote = Notes[noteID];
    console.log(currentNote);
    if(currentNote){
        var contWindow = $(".currentSite")[0].contentWindow
        $(contWindow).scrollTop(currentNote.scroll_y);
        removeHighlight($(contWindow.document.body));
        doHighlight(contWindow.document,"trailHighlight",currentNote.content);
        var highlights = $(contWindow.document.body).find(".trailHighlight")
        highlights.css("background-color","yellow");
        if (presentationMode){
            highlights.css({"z-index": "99999", position:"relative", "font-size": "1.5em"});
            highlights.css("background-color","white");
        }
        showComment(currentNote);
        if (currentNoteIndex < (Object.keys(Notes[noteID]).length-1)){
            currentNoteIndex += 1;
        }
    }
}

function removeHighlight(node){
    node.find(".trailHighlight").css({"background-color":"transparent", "font-size": "1em","z-index":"0"}).removeClass("trailHighlight");
}

function switchToPresentationMode(){
//    $(currentSite[0].contentWindow.documenon-wrapping div full screennt.body).css({"height": "100%","width": "100%","z-index":"0"});
    insertHTMLInIframe("<div class=overlay style='background-color: #666666;z-index:99998; height: 100%; width: 100%;position: fixed; top:0; right: 0; opacity: .6;'>", currentSite);
    presentationMode = true
}

function expandOrCloseNoteList(){
    var currentSiteID = siteIDs[currentSiteIndex];
    var currentNoteList = $(".noteList#site"+currentSiteID);
    if (currentNoteList.hasClass("open")){
        currentNoteList.slideUp(300);
        currentNoteList.removeClass("open");
    }else{
        currentNoteList.slideDown(300);
        currentNoteList.addClass("open");
    }
}

function clickJumpToNote(e){
    var noteWrapper = e.target;
    var noteID = noteWrapper.id.slice(4);
    scrollToAndHighlightNote(noteID);
}

function showComment(note){
    removeComments();
    createCommentOverlay(note.comment,note.comment_location_x,note.comment_location_y);
}

function createCommentOverlay(commentText,xPos,yPos){
    var spacing = 25;
    var overlayWidth = 400;

    var topPosition  =  yPos + spacing
    var leftPosition = xPos > overlayWidth ? (xPos - overlayWidth) : xPos;


    var commentOverlay = $(document.createElement("div"));
    commentOverlay.css({
        "background": "white",
        "opacity": .9,
        "color":"black",
        "position":"absolute",
        "max-width": overlayWidth,
        "border": "2px solid black"
    });
    commentOverlay.html(commentText);
    commentOverlay.css("top", topPosition+"px");

    commentOverlay.css("left", leftPosition+"px");
    commentOverlay.addClass("commentOverlay");
    insertHTMLInIframe(commentOverlay,currentSite);
}

function removeComments(){
    $(currentSite[0].contentWindow.document).find(".commentOverlay").remove();
}