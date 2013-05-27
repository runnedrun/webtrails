var currentSiteIndex=0;
var currentSite;
var Notes = {};
var currentNoteIndex=-1;
var presentationMode = false;
var siteHash = {};
var currentCommentBox;
$(function(){
    if (window.location.hash) {
        var hash = window.location.hash.substring(1);
        currentSiteIndex = parseInt(hash) || 0;
        if (currentSiteIndex >= siteIDs.length || hash == "end") {
            currentSiteIndex = siteIDs.length - 1;
        } else if (currentSiteIndex < 0) {
            currentSiteIndex = 0;
        }
    }
    var currentSiteID = String(siteIDs[currentSiteIndex]);
    currentSite = $("#"+currentSiteID);
    setTimeout(makeIframes, 1);
    $("#nextSite").click(nextSite);
    $("#previousSite").click(previousSite);
    $("#nextNote").click(nextNote);
    $("#previousNote").click(previousNote);
    $("#showNoteList").click(expandOrCloseNoteList);
    $(".noteWrapper").click(clickJumpToNote);
    $(".faviconImage").click(clickJumpToSite);
    switchToSite(currentSiteID);
});

function loadIframes(siteID){
    $.ajax({
        url: "/async_site_load",
        type: "get",
        data: {
            "site_id" : siteID
        },
        success: readySite
    });
}

function makeIframes(){
    var currentSiteID = siteIDs[currentSiteIndex];
    loadIframes(currentSiteID);
    //site IDS defined in the html
    $.each(siteIDs,function (i,siteID){
        if (siteID != currentSiteID) {
            console.log(siteID, currentSiteID, siteID == currentSiteID);
            loadIframes(siteID);
        }
    });
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
}

function nextSite(){
    if (currentSiteIndex < siteIDs.length-1){
        var switchingToSiteID = siteIDs[currentSiteIndex+1];
        switchToSite(switchingToSiteID);
        currentNoteIndex = -1;
        return true;
    }
    return false;
}

function previousSite(){
    if (currentSiteIndex > 0){
        var switchingToSiteID = siteIDs[currentSiteIndex-1];
        switchToSite(switchingToSiteID);
        currentNoteIndex = -1;
    }
}

function showAllSites(){
    $(".siteFavicon").css("whitespace","");
}

// scrolls the favicon carousel to the appropriate place for the active favicon
function scroll_favicon_carousel(activeFaviconIndex){
    var scrollLeft = 150 - 14 + activeFaviconIndex*(-19);
    $(".siteFavicons").animate({"left": scrollLeft},100);
    //todo add actual scroll behavior here
}

function clickJumpToSite(e){
    var switchingToSiteWithExtraName = $(e.currentTarget).attr("id");
    var switchingToSiteID = switchingToSiteWithExtraName.replace(/\D+/,"");
    switchToSite(switchingToSiteID);
}

function switchToSite(siteID){
    closeNoteList();
    currentSite.addClass("notCurrent").removeClass("currentSite");
    currentSite = $("#"+String(siteID));
    currentSite.removeClass("notCurrent").addClass("currentSite");
    higlightCurrentSiteFavicon(siteID);

    currentSiteIndex = siteIDs.indexOf(siteID);
    currentNoteIndex = -1;
    scroll_favicon_carousel(currentSiteIndex);
    $('#goToSite').attr("href", $('.activeFavicon').attr("data-site-url"));
    window.location.hash = "#" + currentSiteIndex;
}

function getNoteIDsForCurrentSite(){
    return siteHash[getCurrentSiteID()]["noteIDs"];
}

function getCurrentNoteID(){
    return getNoteIDsForCurrentSite()[currentNoteIndex];
}

function getNumberOfNotesForCurrentSite(){
    return getNoteIDsForCurrentSite().length;
}

function nextNote(){
    if (currentNoteIndex < (getNumberOfNotesForCurrentSite()-1)){
        currentNoteIndex+=1;
        scrollToAndHighlightNote(getCurrentNoteID());
    } else {
        if(nextSite()){
           nextNote();
        }
    }
}

function previousNote(){
    if (currentNoteIndex > -1){
        currentNoteIndex-=1;
        scrollToAndHighlightNote(getCurrentNoteID());
    } else {
        previousSite();
        gotoLastNoteforCurrentSite();
    }
}

function gotoLastNoteforCurrentSite(){
    var final_note_index = getNumberOfNotesForCurrentSite()-1;
    scrollToAndHighlightNote(getNoteIDsForCurrentSite()[final_note_index]);
    currentNoteIndex = final_note_index;
}

function scrollToAndHighlightNote(noteID){
    var contWindow = iframeContentWindow();
    var currentNote = Notes[noteID];
    removeHighlight($(contWindow.document.body));
    removeCurrentComment();
    if(currentNote){
        var highlights = $(contWindow.document.body).find("."+currentNote.client_side_id);
        highlights.css("background-color","yellow");

        //go through all the highlighted elements and find the first one above the scroll position, then put the comment box there.
        offsets = $(highlights[0]).offset();
        highlights.each(function(i,highlight){
            if ($(highlight).offset().top > currentNote.comment_location_y){
                offsets = $(highlight).offset();
                return false;
            }
        });

        var windowHeight = $(window).height();
        var scrollPosition = offsets.top - windowHeight/2;
        console.log(scrollPosition);
        $(contWindow).scrollTop(scrollPosition);

        var commentDisplay = showComment(currentNote.comment,offsets.left,offsets.top);
        if ($("#turnOffCommentsCheckbox").is(":checked")){
            commentDisplay.hide();
        }
        currentCommentBox = commentDisplay;
        currentNoteIndex = siteHash[getCurrentSiteID()]["noteIDs"].indexOf(String(noteID));
    }
}

function removeHighlight(node){
    node.find("wthighlight").css({"background-color":"transparent", "font-size": "1em","z-index":"0"});
}

function iframeContentWindow(){
    return $(".currentSite")[0].contentWindow;
}

function higlightCurrentSiteFavicon(currentSiteID){
    $(".activeFavicon").removeClass("activeFavicon");
    var currentSiteFavicon = $("#favicon"+String(currentSiteID));
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
    if (note && (typeof note) == "string" && note != ""){
        return createCommentOverlay(note,xPos,yPos);
    }
}

function createCommentOverlay(commentText,xPos,yPos){
    var spacing = 25;
    var overlayMaxWidth = 400;

    var commentContainer = $("<div>")
    commentContainer.css({
        "background": "white",
        "color":"black",
        "position":"absolute",
        "z-index": "2147483647",
    });
    commentContainer.addClass("commentOverlay");


    var commentOverlay = $("<div>");
    commentOverlay.html(commentText);
    commentOverlay.css({
        "font-family": '"Helvetica Neue", Helvetica, Arial, sans-serif',
        "border": "2px solid black",
        "background": "white",
        "max-width": overlayMaxWidth,
        display:"inline",
        padding:"3px 3px 3px 3px",
        "font-size":"13px",
        "-webkit-border-top-left-radius": "5px",
        "-webkit-border-bottom-left-radius": "5px",
        "-moz-border-radius-topleft": "5px",
        "-moz-border-radius-bottomleft": "5px",
        "border-top-left-radius": "5px",
        "border-bottom-left-radius": "5px",
        "line-height": "normal"
    })


    console.log(commentOverlay);

    var closeCommentX = $("<div>");
    closeCommentX.css({
        "font-family": '"Helvetica Neue", Helvetica, Arial, sans-serif',
        display:"inline",
        border: "2px solid black",
        "border-left": "none",
        "border-right": "none",
        padding: "0 2px 3px 2px",
        "background-color": "#f0f0f0",
        "font-size": "16px",
        "margin": "0",
        "vertical-align":"baseline",
        "line-height": "normal",
        "cursor": "pointer"
    })
    closeCommentX.html("&times;");
    closeCommentX.click(closeCurrentNoteAndRemoveHighlight);

    var deleteCommentContainer = $("<div>");
    deleteCommentContainer.css({
        "font-family": '"Helvetica Neue", Helvetica, Arial, sans-serif',
        display:"inline",
        border: "2px solid black",
        "border-left": "1px solid black",
        padding: "0px 2px 3px 2px",
        "background-color": "#f0f0f0",
        "-webkit-border-top-right-radius": "5px",
        "-webkit-border-bottom-right-radius": "5px",
        "-moz-border-radius-topright": "5px",
        "-moz-border-radius-bottomright": "5px",
        "border-top-right-radius": "5px",
        "border-bottom-right-radius": "5px",
        "margin": "0",
        "vertical-align":"baseline",
        "line-height": "normal",
        "font-size": "16px",
        "cursor": "pointer"
    })

    var deleteComment = $("<img>");
    deleteComment.css({
        height: "16px",
        "line-height": "normal",
        border: "0",
        margin: "0",
        padding: "0",
        "vertical-align": "bottom",
        "font-size": "16px",
    })
    deleteComment.attr("src","/images/trashcan.png");
    deleteCommentContainer.append(deleteComment);
    deleteCommentContainer.click(deleteCurrentNoteFromTrail);

    commentContainer.append(commentOverlay);
    commentContainer.append(closeCommentX);
    commentContainer.append(deleteCommentContainer);


    insertHTMLInIframe(commentContainer,currentSite);

//    var overlayWidth = getComputedStyleOfElementInIframe(commentOverlay,"width");
    var overlayHeightString = getComputedStyleOfElementInIframe(commentContainer[0],"height");
    var overlayHeightFloat = parseFloat(overlayHeightString.slice(0,overlayHeightString.length -2));
    var topPosition  =  yPos - spacing - overlayHeightFloat;
    var leftPosition = xPos;

    commentContainer.css("top", topPosition+"px");
    commentContainer.css("left", leftPosition+"px");
    return commentContainer;
}

function removeCurrentComment(){
    if (currentCommentBox){
        currentCommentBox.remove();
    }
}

// Not used, removed from the UI on the view toolbar
function showOrHideCurrentComment(){
    if($("#turnOffCommentsCheckbox").is(":checked")){
        $(iframeContentWindow().document).find(".commentOverlay").hide();
    }else{
        $(iframeContentWindow().document).find(".commentOverlay").show();
    }
}

// will return null if error
function getComputedStyleOfElementInIframe(element,stylename){
    var style = $(".currentSite")[0].contentWindow.document.defaultView.getComputedStyle(element,null);
    if (style) {
        return style[stylename];
    } else {
        return null;
    }
}

function switchToPresentationMode(){
//    $(currentSite[0].contentWindow.documenon-wrapping div full screennt.body).css({"height": "100%","width": "100%","z-index":"0"});
    insertHTMLInIframe("<div class=overlay style='background-color: #666666;z-index:99998; height: 100%; width: 100%;position: fixed; top:0; right: 0; opacity: .6;'>", currentSite);
    presentationMode = true;
}

function getCurrentSiteID(){
    return siteIDs[currentSiteIndex];
}

function deleteCurrentNoteFromTrail(){
    var currentNoteID = getCurrentNoteID();
//    console.log(currentNote);
    deleteNoteFromTrail(currentNoteID);
}

function deleteNoteFromTrail(noteID){
    console.log(noteID);
    $.ajax({
        url: "/notes/delete",
        type: "post",
        data: {
            "id" : noteID
        },
        success: function(){deleteCurrentNoteLocally(); closeCurrentNoteAndRemoveHighlight()}
    })
}

function closeCurrentNoteAndRemoveHighlight(){
    removeCurrentComment();
    removeHighlight($(iframeContentWindow().document.body));
}

function deleteCurrentNoteLocally(){
    getNoteIDsForCurrentSite().splice(currentNoteIndex,1);
}