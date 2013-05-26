var currentSiteIndex=0;
var currentSite;
var Notes = {};
var currentNoteIndex=-1;
var presentationMode = false;
var noteIDs=[];
var siteHash = {};
var currentCommentBox;
$(function(){
    if (window.location.hash) {
        var hash = window.location.hash.substring(1);
        console.log(hash, hash == "end")
        currentSiteIndex = parseInt(hash) || 0;
        if (currentSiteIndex >= siteIDs.length || hash == "end") {
            currentSiteIndex = siteIDs.length - 1;
        } else if (currentSiteIndex < 0) {
            currentSiteIndex = 0;
        }
    }
    var currentSiteID = String(siteIDs[currentSiteIndex]);
    currentSite = $("#"+currentSiteID);
    makeIframes();
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
    //site IDS defined in the html
    $.each(siteIDs,function (i,siteID){
      loadIframes(siteID)
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
        return true
    }
    return false
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
    console.log("scrolling")
    var scrollLeft = 150 - 14 + activeFaviconIndex*(-19);
    console.log(activeFaviconIndex, scrollLeft);
    $(".siteFavicons").animate({"left": scrollLeft},100);
    //todo add actual scroll behavior here
}

function clickJumpToSite(e){
    var switchingToSiteWithExtraName = $(e.currentTarget).attr("id");
    var switchingToSiteID = switchingToSiteWithExtraName.replace(/\D+/,"");
    switchToSite(switchingToSiteID);
}

function switchToSite(siteID){
    console.log('switching to site', siteID);
    closeNoteList();
    currentSite.addClass("notCurrent").removeClass("currentSite");
    currentSite = $("#"+String(siteID));
    currentSite.removeClass("notCurrent").addClass("currentSite");
    higlightCurrentSiteFavicon(siteID);

    currentSiteIndex = siteIDs.indexOf(siteID);
    currentNoteIndex = -1;
    scroll_favicon_carousel(currentSiteIndex);
    $('#goToSite').attr("href", $('.activeFavicon').attr("data-site-url"));
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

function getComputedStyleOfElementInIframe(element,stylename){
    return $(".currentSite")[0].contentWindow.document.defaultView.getComputedStyle(element,null)[stylename];
}

function switchToPresentationMode(){
//    $(currentSite[0].contentWindow.documenon-wrapping div full screennt.body).css({"height": "100%","width": "100%","z-index":"0"});
    insertHTMLInIframe("<div class=overlay style='background-color: #666666;z-index:99998; height: 100%; width: 100%;position: fixed; top:0; right: 0; opacity: .6;'>", currentSite);
    presentationMode = true;
}

function getCurrentSiteID(){
    return siteIDs[currentSiteIndex];
}