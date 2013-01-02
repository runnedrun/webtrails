var currentSiteIndex=0;
var currentSite;
var Notes = {};
var currentNoteIndex=-1;
var presentationMode = false;
var noteIDs=[];
var siteHash = {};
$(function(){
    var currentSiteID = String(siteIDs[currentSiteIndex]);
    currentSite = $("#"+currentSiteID);
    higlightCurrentSiteFavicon(currentSiteID);
    makeIframes();
    $("#nextSite").click(nextSite);
    $("#previousSite").click(previousSite);
    $("#nextNote").click(nextNote);
    $("#previousNote").click(previousNote);
    $("#turnOffCommentsCheckbox").click(showOrHideCurrentComment);
    $("#showNoteList").click(expandOrCloseNoteList);
    $(".noteWrapper").click(clickJumpToNote);
    $(".siteFavicon").click(clickJumpToSite);

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
    var noteIDs=[];
    $.each(data.notes, function(i,note){
        noteIDs.push(String(note.note_id));
        Notes[note.note_id] = note;
    })
    var siteAttributes = {"noteIDs": noteIDs, "title" : data.title, "url" : data.url};
    siteHash[data.site_id]=siteAttributes;
    addMouseOverToFavicons();
}

function nextSite(){
    if (currentSiteIndex < siteIDs.length-1){
        closeNoteList();
        var switchingToSiteID = siteIDs[currentSiteIndex+1];
        switchToSite(switchingToSiteID);
        currentSiteIndex+=1;
        currentNoteIndex = -1;
    }
}

function previousSite(){
    if (currentSiteIndex > 0){
        closeNoteList();
        var switchingToSiteID = siteIDs[currentSiteIndex-1];
        switchToSite(switchingToSiteID);
        currentSiteIndex-=1;
        currentNoteIndex = -1;
    }
}

function clickJumpToSite(e){
    closeNoteList();
    var switchingToSiteWithExtraName = $(e.currentTarget).attr("id");
    var switchingToSiteID = switchingToSiteWithExtraName.replace(/\D+/,"");
    switchToSite(switchingToSiteID);
    currentSiteIndex = siteIDs.indexOf(switchingToSiteID);
    currentNoteIndex = -1;
}

function switchToSite(siteID){
    currentSite.addClass("notCurrent").removeClass("currentSite");
    currentSite = $("#"+String(siteID));
    currentSite.removeClass("notCurrent").addClass("currentSite");
    higlightCurrentSiteFavicon(siteID);
}

function nextNote(){
    var currentSiteID = getCurrentSiteID();
    if (currentNoteIndex < (Object.keys(siteHash[currentSiteID]["noteIDs"]).length-1)){
        currentNoteIndex+=1;
        var currentSiteID = getCurrentSiteID();
        var currentNoteID = siteHash[currentSiteID]["noteIDs"][currentNoteIndex];
        scrollToAndHighlightNote(currentNoteID);
    } else {
        nextSite();
    }
}

function previousNote(){
    if (currentNoteIndex > -1){
        currentNoteIndex-=1;
        var currentSiteID = getCurrentSiteID();
        var currentNoteID = siteHash[currentSiteID]["noteIDs"][currentNoteIndex];
        scrollToAndHighlightNote(currentNoteID);
    } else {
        previousSite();
    }
}

function scrollToAndHighlightNote(noteID){
    var contWindow = iframeContentWindow();
    var currentNote = Notes[noteID];
    if(currentNote){
        $(contWindow).scrollTop(currentNote.scroll_y);
        removeHighlight($(contWindow.document.body));
        //gotta remove all the notes as well
        var highlights = $(contWindow.document.body).find("."+currentNote.client_side_id);
        highlights.css("background-color","yellow");
//        if (){
//            highlights.css({"z-index": "99999", position:"relative", "font-size": "1.5em"});
//            highlights.css("background-color","white");
//        }
//        var offsets = highlights.offset();
        highlights.each(function(i,highlight){
            if ($(highlight).offset().top > currentNote.scroll_y){
                offsets = $(highlight).offset();
                return false
            }
        });
        var commentDisplay = showComment(currentNote.comment,offsets.left,offsets.top);
        if ($("#turnOffCommentsCheckbox").is(":checked")){
            commentDisplay.hide();
        }
        currentNoteIndex = siteHash[getCurrentSiteID()]["noteIDs"].indexOf(String(noteID));
    }else{
        removeComments();
        removeHighlight($(contWindow.document.body));
    }
}

function removeHighlight(node){
    node.find("wthighlight").css({"background-color":"transparent", "font-size": "1em","z-index":"0"});
}

function iframeContentWindow(){
    return $(".currentSite")[0].contentWindow
}

function higlightCurrentSiteFavicon(currentSiteID){
    $(".activeFavicon").removeClass("activeFavicon");
    var currentSiteFavicon = $("#favicon"+String(currentSiteID)).find("img");
    currentSiteFavicon.addClass("activeFavicon");
}

function expandOrCloseNoteList(){
    var currentSiteID = siteIDs[currentSiteIndex];
    var currentNoteList = $(".noteList#site"+currentSiteID);
    if (currentNoteList.hasClass("open")){
        closeNoteList();
    }else{
        openNoteList(currentNoteList);
    }
}

function closeNoteList(){
    var allNoteLists = $(".noteList");
    allNoteLists.slideUp(200);
    allNoteLists.removeClass("open");
}

function openNoteList(noteList){
    noteList.slideDown(200);
    noteList.addClass("open");
}

function clickJumpToNote(e){
    var noteWrapper = e.target;
    var noteID = noteWrapper.id.slice(4);
    scrollToAndHighlightNote(noteID);
}

function showComment(note,xPos,yPos){
    removeComments();
    if (note && (typeof note) == "string" && note != ""){
        return createCommentOverlay(note,xPos,yPos);
    }
}

function createCommentOverlay(commentText,xPos,yPos){
    var spacing = 25;
    var overlayMaxWidth = 400;

    var commentOverlay = $(document.createElement("div"));
    commentOverlay.css({
        "background": "white",
        "opacity": .9,
        "color":"black",
        "position":"absolute",
        "max-width": overlayMaxWidth,
        "border": "2px solid black"
    });
    commentOverlay.html(commentText);
    console.log(commentText);
    commentOverlay.addClass("commentOverlay");
    insertHTMLInIframe(commentOverlay,currentSite);

//    var overlayWidth = getComputedStyleOfElementInIframe(commentOverlay,"width");
    var overlayHeightString = getComputedStyleOfElementInIframe(commentOverlay[0],"height");
    var overlayHeightFloat = parseFloat(overlayHeightString.slice(0,overlayHeightString.length -2));
    var topPosition  =  yPos - spacing - overlayHeightFloat;
    var leftPosition = xPos;

    commentOverlay.css("top", topPosition+"px");
    commentOverlay.css("left", leftPosition+"px");
    return commentOverlay;
}

function removeComments(){
    $(currentSite[0].contentWindow.document).find(".commentOverlay").remove();
}

function showOrHideCurrentComment(){
    if($("#turnOffCommentsCheckbox").is(":checked")){
        $(iframeContentWindow().document).find(".commentOverlay").hide();
    }else{
        $(iframeContentWindow().document).find(".commentOverlay").show();
    }
}

function getComputedStyleOfElementInIframe(element,stylename){
    return $(".currentSite")[0].contentWindow.document.defaultView.getComputedStyle(element,null)[stylename];
}

function switchToPresentationMode(){
//    $(currentSite[0].contentWindow.documenon-wrapping div full screennt.body).css({"height": "100%","width": "100%","z-index":"0"});
    insertHTMLInIframe("<div class=overlay style='background-color: #666666;z-index:99998; height: 100%; width: 100%;position: fixed; top:0; right: 0; opacity: .6;'>", currentSite);
    presentationMode = true
}

function getCurrentSiteID(){
    return siteIDs[currentSiteIndex];
}

function addMouseOverToFavicons(){
    $.each($(".siteFavicon"),function(i,favicon){
              //add something here?
    })
}