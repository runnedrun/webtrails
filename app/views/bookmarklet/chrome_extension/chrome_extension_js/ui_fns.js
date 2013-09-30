console.log("ui_fns loaded");

function showOrHidePathDisplay(){
    if (trailDisplay.is(":hidden")){
        showToolbar();
//        showToolbarOnAllTabs();
    }
    else {
        hideToolbar();
//        hideToolbarOnAllTabs();
    }
}

function showToolbar(){
    trailDisplay.show();
    toolbarShown = true
    if (loggedIn) {
        TrailPreview.show();
        if (mouseDown == 0) { // if the mouse is not pressed (not highlighting)
            highlightedTextDetect(); // check to see if they highlighted anything for the addnote button
        } else { // mouse is down, must be highlighting
            possibleHighlightStart(); // get that highlight start event so when done highlighting, addnote appears
        }
    }
}

function hideToolbar(){
    trailDisplay.hide();
    TrailPreview.hide();
    toolbarShown = false;
    wt_$(".inlineSaveButton").remove();
    closeOverlay();
}

function displaySaveButtonWhileKeyIsPressed(keycode){
    keycode = typeof keycode == "undefined" ? keycode : "18";
    var saveButton = highlightedTextDetect()
    wt_$(document.body).keyup(function(e){
        if (e.keycode == keycode && saveButton){
            saveButton.remove()
            wt_$(document).unbind("keyup",arguments.callee)
        }
    })

}

function addSiteFaviconToDisplay(domain,url) {
    var faviconLink = wt_$("<a href=\""+ url+ "\" class=\"webtrails\"></a>");
    applyDefaultCSS(faviconLink);
    var faviconImg  = wt_$("<img src='"+ domain + "' class=\"webtrails\">");
    applyDefaultCSS(faviconImg);
    faviconLink.css({
        "vertical-align":"top",
        "padding": "0px",
        "margin": "0 1%",
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
        nextNoteButton.css({
            "color": "#aaa",
            "cursor": "default"
        });
        nextNoteButton.attr("disabled","disabled");
    }else{
        previousNoteID = data.note_id;
        moveNoteToPrevious(data.note_content);
        nextNoteButton.removeAttr("disabled");
        nextNoteButton.css({
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
        // console.log(Trails.getCurrentTrailId(), typeof currentTrailID, wt_$(this).val());
        Trails.switchToTrail(parseInt(wt_$(this).val()));
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
        option.attr('value', id);
        option.text(name);
        if (String(id) == String(Trails.getCurrentTrailId())) {
            option.attr('selected', 'selected');
        }
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

function runWhenLoaded(fn, doc){
    var doc = doc || document;
    var loadedCheck = setInterval(function(){
        if (doc.readyState === "complete"){
            clearInterval(loadedCheck);
            fn();
        }
    },100);
}

function runWhenExists($query, callback){
    console.log("checking if site exists for query:", $query);
    var siteDocExistsCheck = setInterval(function(){
        console.log("checking for site doc");
        if(currentSiteFrame = wt_$($query).length){
            clearInterval(siteDocExistsCheck);
            callback()
        }
    },1000)
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.logOutAllTabs){
        initSignedOutExperience();
    }
    if (request.logInAllTabs){
        wt_auth_token = request.logInAllTabs[0]
        var newTrailID = request.logInAllTabs[1]
        if (Trails.getCurrentTrailId() != newTrailID){
            faviconsFetched = false;
            Trails.switchToTrail(newTrailID);
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

function updateStoredSites(resp){
    chrome.runtime.sendMessage({
        updateStoredTrailData:{
            trailObject: resp.trail_hash,
            userId: resp.user_id
        }
    })
}


