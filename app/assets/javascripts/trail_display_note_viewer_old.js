function initOrDisableNoteView(){
    if (noteViewActive){
        disableNoteViewMode();
    }else{
        initNoteViewMode(.6)
    }
}

function initNoteViewMode(scale){
    if ($('iframe').hasClass('shrunk')) {
        removeShrinkFromIframes();
        switchToSite(getCurrentSiteID());
    }
    initHalfSiteView(scale);
    showNoteList(scale);
    $("#showNoteList").text("Presentation View")
    noteViewActive = true;
}

function disableNoteViewMode(){
    disableHalfSiteView();
    hideNoteList();
    $("#showNoteList").text("Research View")
    noteViewActive = false;
}

function initHalfSiteView(scale){
    var iframes = $("iframe");
    scaleIframe(iframes,scale);
    iframes.each(disableSelectionInIframe);
//    $(".siteDisplayDiv").addClass("span6");
//    $(".siteDisplayDiv").css({width:"50%"});
}

function disableHalfSiteView(){
    var iframes = $("iframe");
    scaleIframe(iframes,1);
    iframes.each(enableSelectionInIframe);
    iframes.css({
        height:"100%",
        width:"100%"
    });
//    $(".siteDisplayDiv").css({width:"100%"});
//    $(".siteDisplayDiv").removeClass("span6");
}

function makeNoteCommentEditable(e){
    console.log("editing note");
    var noteInfo = $(e.delegateTarget);
    if (noteInfo.parent().parent().hasClass("selected-note")){
        editCurrentComment(noteInfo);
        return false
    }
}

function updateNoteOnClickAway(e,$commentText) {
    console.log("checking for click away", e.target);
    console.log($commentText.parent()[0]);
    if ((e.target != $commentText[0])){
        // if the click is anywhere but the comment then save the note and unselect
        console.log("saving note");
        saveCommentToServer($commentText);
    }
}

function clickJumpToNote(e){
    var noteWrapper = $(e.delegateTarget);
    console.log(noteWrapper.data());
    var noteID = noteWrapper.data("note-id");
    var siteID = noteWrapper.data("site-id");
    // close the last note
    console.log(getCurrentSiteID(),siteID);
    if ( String(siteID) != getCurrentSiteID()){
        console.log("switching sites")
        switchToSite(siteID);
    }
    scrollToAndHighlightNote(noteID);
}

function highlightNoteInList(noteID){
    var $noteElement = $(".noteInfo[data-note-id="+noteID+"]");
    $noteElement.addClass("selected-note");

    $(".noteComment").css({
        "cursor":"pointer"
    })
    $noteElement.find(".noteComment").css({
        "cursor": "text"
    })

    var contentElement = $noteElement.find(".noteContent");
    contentElement.trigger("destroy.dot").css("max-height","none");
}

function unhighlightCurrentNoteInList(){
    $(".selected-note").removeClass("selected-note").find(".noteContent").css("max-height","").dotdotdot();
}

function preventClick(e){
    var $target = $(e.target);
    // check if the clicked thing is the comment box, we need that clickable for editing
    if (!($target.is(".comment-text") || $target.parents(".comment-text").length)){
        console.log("default prevented")
        return false
    } else{
        console.log("clicked comment box, allowing");
        return true
    }
}

function disableSelectionInIframe(i,iframe){
    $(iframe.contentWindow.document.body).mousedown(preventClick);
}

function enableSelectionInIframe(i,iframe){
    $(iframe.contentWindow.document.body).unbind("mousedown",preventClick);
    $(iframe.contentWindow.document.body).css({
        "-webkit-touch-callout": "all",
        "-webkit-user-select": "all",
        "-khtml-user-select": "all",
        "-moz-user-select": "all",
        "-ms-user-select": "all",
        "user-select": "all"
    })
}

function scaleIframe($iframe,iframeScale){
    $iframe.css({
        "-moz-transform": "scale(" + iframeScale + ", " + iframeScale + ")",
        "-webkit-transform": "scale(" + iframeScale + ", " + iframeScale + ")",
        "-o-transform": "scale(" + iframeScale + ", " + iframeScale + ")",
        "-ms-transform": "scale(" + iframeScale + ", " + iframeScale + ")",
        "transform": "scale(" + iframeScale + ", " + iframeScale + ")",
        "-moz-transform-origin": "top left",
        "-webkit-transform-origin": "top left",
        "-o-transform-origin": "top left",
        "-ms-transform-origin": "top left",
        "transform-origin": "top left",
        "height": String($(window).height() *.93*2)+"px",
//        "width": String($(window).width())+"px"
    });
}

function showNoteList(scale){
    $(".noteViewer").show().css({
        "width": 100-(scale*100)+"%"
    });
    $(".noteContent").dotdotdot();
}

function hideNoteList(){
    $(".noteViewer").hide();
}

function removeSiteFromNoteList(siteID){
    var header = $(".note-list-header[data-site-id="+siteID+"]");
    var notes =  $(".noteInfo[data-site-id="+siteID+"]");

    header.remove();
    notes.remove();
}

function removeNoteFromNoteList(noteID){
    var note =  $(".noteInfo[data-note-id="+noteID+"]");
    note.remove();
}

function makeNotesDragable(){
    $(".noteWrapper").each(function(i,wrapper){
            $(wrapper).sortable({
                containment: $(wrapper),
                update: updateNoteOrder,
                items: ".noteInfo"
            });
        })
}

function updateNoteOrder(event, ui){
    console.log("updated note order");
    var noteThatWasDragged = $(ui.item);
    var noteID = noteThatWasDragged.data("note-id")
    var siteID = noteThatWasDragged.data("site-id");
    var noteArray = $(".noteInfo[data-site-id="+siteID+"]").map(function(i,note){
        return String($(note).data("note-id"));
    });
    noteArray = $.makeArray(noteArray);
    console.log("current note ID", getCurrentNoteID())
    console.log(noteArray);
    currentNoteIndex = noteArray.indexOf(getCurrentNoteID())
    siteHash[siteID]["noteIDs"] = noteArray;
    updateNoteCount();
    deactivateOrReactivatePreviousNoteIfNecessary();
    deactivateOrReactivateNextNoteIfNecessary();
    $.ajax({
        url:"/sites/update_note_list",
        method:"post",
        data:{
            "note_array": noteArray,
            "id" : siteID
        },
        success:function(){
            console.log("updated positions server side");
        }
    })
}