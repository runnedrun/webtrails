function nextNote(){
    if (currentNoteIndex < (getNumberOfNotesForCurrentSite()-1)){
        currentNoteIndex+=1;
        scrollToAndHighlightNote(getCurrentNoteID());
    } else {
        if (currentSiteIndex < siteIDs.length-1){
            closeCurrentNoteAndRemoveHighlight();
            nextSite()
            if (getNumberOfNotesForCurrentSite() > 0) {
                nextNote();
            }
        }
    }
}

function previousNote(){
    if (currentNoteIndex > 0){
        currentNoteIndex-=1;
        scrollToAndHighlightNote(getCurrentNoteID());
    } else {
        closeCurrentNoteAndRemoveHighlight();
        if (previousSite()) {
            gotoLastNoteforCurrentSite();
        }else{
            updateNoteCount();
        }
    }
}

function gotoLastNoteforCurrentSite(){
    var final_note_index = getNumberOfNotesForCurrentSite()-1;
    scrollToAndHighlightNote(getNoteIDsForCurrentSite()[final_note_index]);
    currentNoteIndex = final_note_index;
}

function scrollToAndHighlightNote(noteID){
    console.log('scrolling to note', noteID);
    var contWindow = iframeContentWindow();
    if(Notes[noteID]){
        currentNote = Notes[noteID];
        removeHighlight($(contWindow.document.body));
        removeCurrentComment();
        var highlights = $(contWindow.document.body).find("."+currentNote.client_side_id);
        highlights.css("background-color","yellow");

        //go through all the highlighted elements and find the first one above the scroll position, then put the comment box there.
        var topHighlight = $(highlights[0]);
        var bottomHighlight = $(highlights[highlights.length-1]);
        var topOfHighlight = topHighlight.offset().top;
        var windowHeight = $(window).height();
        var scrollPosition = topOfHighlight - windowHeight/2;
        $(contWindow).scrollTop(scrollPosition);

        var bottomHighlightOffsets = bottomHighlight.offset();
        console.log(bottomHighlightOffsets);
        var bottomHighlightBottom = bottomHighlightOffsets.top + bottomHighlight.height();
        var commentDisplay = createCommentOverlay(currentNote.comment,bottomHighlightOffsets.left,bottomHighlightBottom);
        currentCommentBox = commentDisplay;
        currentNoteIndex = getNoteIDsForCurrentSite().indexOf(String(noteID));
        updateNoteCount();
        deactivateOrReactivateNextNoteIfNecessary();
        deactivateOrReactivatePreviousNoteIfNecessary();
    }
}

function removeHighlight(node){
    node.find("wthighlight").css({"background-color":"transparent", "font-size": "1em","z-index":"0"});
}

function expandOrCloseNoteList(){
    var currentNoteList = $(".noteList#site"+getCurrentSiteID());
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
    $('#showNoteList').text("Show Note List");
}

function openNoteList(noteList){
    noteList.slideDown(200);
    noteList.addClass("open");
    $('#showNoteList').text("Hide Note List");
}

function updateNoteCount(){
    var numberOfNotes = getNumberOfNotesForCurrentSite();
    if (numberOfNotes > 0){
        var currentNote = currentNoteIndex + 1;
        $(".note-count").html(currentNote+"/"+numberOfNotes);
    }else{
        $(".note-count").html("0");
    }

}

function clickJumpToNote(e){
    var noteWrapper = $(e.delegateTarget);
    console.log(noteWrapper.data());
    var noteID = noteWrapper.data("note-id");
    var siteID = noteWrapper.data("site-id");
    // close the last note
    $(".selected-note").removeClass("selected-note").find(".noteContent").css("max-height","").dotdotdot();
    highlightNoteInList(noteWrapper);
    scrollToAndHighlightNote(noteID);
}

function highlightNoteInList($noteElement){
    $noteElement.addClass("selected-note");
    var contentElement = $noteElement.find(".noteContent");
    contentElement.trigger("destroy.dot").css("max-height","none");
}

function deleteCurrentNoteFromTrail(){
    var currentNoteID = getCurrentNoteID();
//    console.log(currentNote);
    deleteNoteFromTrail(currentNoteID);
}

function deleteNoteFromTrail(noteID){
    if (!editAccess) { // in case called from console or something
        console.log("No access to editing this trail! No deleting notes!");
        return;
    }
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
    console.log("closing and removing highlight");
    removeCurrentComment();
    removeHighlight($(iframeContentWindow().document.body));
    if ((getCurrentSiteID() == siteIDs[0]) && (currentNoteIndex==0)){
        currentNoteIndex = -1;
        deactivatePreviousNoteButton();
    }
}

function deleteCurrentNoteLocally(){
    getNoteIDsForCurrentSite().splice(currentNoteIndex,1);
}

function reactivateNextNoteButton(){
    var nextNoteButton = $("#nextNote");
    nextNoteButton.addClass("btn-success").css("opacity","1");
    nextNoteButton.click(nextNote);
    nextNoteActivated = true
}

function reactivatePreviousNoteButton(){
    var previousNoteButton = $("#previousNote");
    previousNoteButton.addClass("btn-info").css("opacity",1);
    previousNoteButton.click(previousNote);
    previousNoteActivated = true
}

function deactivateNextNoteButton(){
    var nextNoteButton = $("#nextNote");
    nextNoteButton.removeClass("btn-success").css("opacity",".5");
    nextNoteButton.unbind("click",nextNote);
    nextNoteActivated = false;
}

function deactivatePreviousNoteButton(){
    var previousNoteButton = $("#previousNote");
    previousNoteButton.removeClass("btn-info").css("opacity",".5");
    previousNoteButton.unbind("click",previousNote);
    previousNoteActivated = false;
}

function deactivateOrReactivatePreviousNoteIfNecessary(){
    var firstSiteId = siteIDs[0];
    console.log(firstSiteId,getCurrentSiteID());
    console.log(getCurrentNoteID(), -1);
    console.log(previousNoteActivated);
    if ((getCurrentSiteID() == firstSiteId) && (currentNoteIndex==-1) && previousNoteActivated){
        console.log("deactivating");
        deactivatePreviousNoteButton();

    } else if (!((getCurrentSiteID() == firstSiteId) && (currentNoteIndex==-1)) && !previousNoteActivated) {
        reactivatePreviousNoteButton();
    }
}

function deactivateOrReactivateNextNoteIfNecessary(){
    var lastSiteId = siteIDs[siteIDs.length-1];
    var currentNoteIDs = getNoteIDsForCurrentSite();
    if ((getCurrentSiteID() == lastSiteId) && (currentNoteIndex==getNumberOfNotesForCurrentSite()-1) && nextNoteActivated){
        deactivateNextNoteButton();
    } else if (!((getCurrentSiteID() == lastSiteId) && (currentNoteIndex==-1)) && !nextNoteActivated){
        reactivateNextNoteButton();
    }
}