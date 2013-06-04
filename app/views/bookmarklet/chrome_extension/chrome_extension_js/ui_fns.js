console.log("ui_fns loaded");

function showOrHidePathDisplay(){
    if (trailDisplay.is(":hidden") && (window.location.host != 'localhost:3000') && (window.location.host.indexOf('webtrails.co') == -1) ){
        showToolbar();
        showToolbarOnAllTabs();
    }
    else {
        hideToolbar();
        hideToolbarOnAllTabs();
    }
}

function showToolbar(){
    trailDisplay.show();
    toolbarShown = true
    if (loggedIn) {
        if (mouseDown == 0) { // if the mouse is not pressed (not highlighting)
            highlightedTextDetect(); // check to see if they highlighted anything for the addnote button
        } else { // mouse is down, must be highlighting
            possibleHighlightStart(); // get that highlight start event so when done highlighting, addnote appears
        }
    }
}

function hideToolbar(){
    trailDisplay.hide();
    toolbarShown = false;
    wt_$(".inlineSaveButton").remove();
    closeOverlay();
}

function addSiteFaviconToDisplay(domain,url) {
    var faviconLink = wt_$("<a href=\""+ url+ "\" class=\"webtrails\"></a>");
    applyDefaultCSS(faviconLink);
    var faviconImg  = wt_$("<img src='"+ domain + "' class=\"webtrails\">");
    applyDefaultCSS(faviconImg);
    faviconLink.css({
        "vertical-align":"top",
        "padding": "0px",
        "margin": "0 3px",
        "overflow": "hidden",
        "display": "block",
        "border": "none",
        "float": "left"
    });
    faviconImg.css({
        "height":"16px",
        "margin": "0",
        "margin-top":"2px",
        "vertical-align":"top",
        "padding": "0px"
    });

    faviconLink.append(faviconImg);
    faviconHolder.append(faviconLink);
}

function addFaviconsToDisplay(data){
    wt_$.each(data.favicons_and_urls, function(i,favicon_and_url){
            addSiteFaviconToDisplay(favicon_and_url[0],favicon_and_url[1]);
        }
    )
}

function moveNoteToPrevious(noteContent){
    previousNoteDisplay.fadeOut(100);
    previousNoteDisplay.html(noteContent);
    previousNoteDisplay.fadeIn(100);
}

function updateNoteDisplay(data){
    console.log("update note display", data)
    if (data.note_id == "none") {
        console.log("deleting the note text")
        moveNoteToPrevious("No more notes on this page.  Go ahead and take a few.");
        deleteNoteButton.css({
            "color": "#aaa",
            "cursor": "default"
        });
        deleteNoteButton.attr("disabled","disabled");
    }else{
        previousNoteID = data.note_id;
        moveNoteToPrevious(data.note_content);
        deleteNoteButton.removeAttr("disabled");
        deleteNoteButton.css({
            "color": "#333",
            "cursor": "pointer"
        });
    }
}

function growFaviconHolder() {
    faviconHolder.stop().animate({"height": "200px"});
}

function shrinkFaviconHolder() {
    faviconHolder.stop().animate({"height": "20px"});
}

function clearFaviconHolder() {
    faviconHolder.html("");
}

function trailSelectChanged() {
    try {
        // console.log(currentTrailID, typeof currentTrailID, wt_$(this).val());
        setCurrentTrailID(parseInt(wt_$(this).val()));
        clearFaviconHolder();
        fetchFavicons();
    } catch(e) {
        console.log("Uh oh. Not a number or something", wt_$(this).val())
    }
}

function setTrailSelect(trails, adding) {
    console.log(adding,!adding);
    if (!adding){
        trailSelect.empty();
    }
    wt_$.each(trails, function(id, name) {
        var option = wt_$(document.createElement('option'));
        applyDefaultCSS(option),
        option.attr('value', id);
        option.text(name);
        if (String(id) == String(currentTrailID)) {
            option.attr('selected', 'selected');
        }
        console.log
        trailSelect.append(option);

//            trailSelect.prepend(option);
    });
}

function showToolbarOnAllTabs(){
    chrome.runtime.sendMessage({showToolBarOnAllTabs:"now!"}, function(response) {
        console.log("toolbar showed on all tabs")
    });
}

function hideToolbarOnAllTabs(){
    chrome.runtime.sendMessage({hideToolBarOnAllTabs:"now!"}, function(response) {
        console.log("toolbar hidden on all tabs")
    });
}


chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.logOutAllTabs){
        initSignedOutExperience();
    }
    if (request.logInAllTabs){
        wt_auth_token = request.logInAllTabs[0]
        var newTrailID = request.logInAllTabs[1]
        if (currentTrailID != newTrailID){
            faviconsFetched = false;
            currentTrailID = newTrailID;
        }
        initSignedInExperience();
    }
    if (request.showToolBarOnAllTabs){
        showToolbar();
    }
    if (request.hideToolBarOnAllTabs){
        hideToolbar();
    }
    if (request.addNewTrail){
        console.log(request.addNewTrail);
        setTrailSelect(request.addNewTrail,true);
    }
});
