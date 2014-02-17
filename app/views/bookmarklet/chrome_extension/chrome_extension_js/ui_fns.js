console.log("ui_fns loaded");


function butterBarNotification(message) {
    var butterBarContainer = $("<div></div>").css({
        position: "fixed",
        top: "0px",
        "z-index": "2147483647",
        width: "100%",
        "text-align": "center"
    })
    var butterBar = $("<div>" + message + "</div>").css({
        "background-color": "#666666",
        color: "white",
        display: "inline",
        "font-family": "arial, sans-serif",
        padding: "5px"
    });
    butterBarContainer.append(butterBar);
    $(document.body).prepend(butterBarContainer);
    butterBar.hide();
    butterBar.fadeIn(400, function(){
        setTimeout(function(){
            butterBar.fadeOut(400, function(){
                butterBar.remove();
            });
        },2000);
    });
    console.log("butter bar is shown!", butterBar);
}

function displaySaveButtonWhileKeyIsPressed(keycode){
    if (!toolbarShown && wt_auth_token) {
        keycode = typeof keycode == "undefined" ? keycode : "18";
        var saveButton = highlightedTextDetect();
        $(document.body).keyup(function(e){
            if (e.keycode == keycode && saveButton){
                saveButton.remove()
                $(document).unbind("keyup",arguments.callee)
            }
        })
    }
}

function addSiteFaviconToDisplay(domain,url) {
    var faviconLink = $("<a href=\""+ url+ "\" class=\"webtrails\"></a>");
    applyDefaultCSS(faviconLink);
    var faviconImg  = $("<img src='"+ domain + "' class=\"webtrails\">");
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
    $.each(data.favicons_and_urls, function(i,favicon_and_url){
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



function trailSelectChanged() {
    try {
        // console.log(Trails.getCurrentTrailId(), typeof currentTrailID, $(this).val());
        Trails.switchToTrail(parseInt($(this).val()));
        clearFaviconHolder();
        fetchFavicons();
        if (!Trails.siteSavedDeeply()){
            activateSiteSiteButton();
        }
    } catch(e) {
        console.log("Uh oh. Not a number or something", $(this).val())
    }
}

function activateSiteSiteButton() {
    saveSiteToTrailButton.text("Save site").stop().css({opacity: 0}).animate({opacity: 1}, 700 );
    saveSiteToTrailButton.click(function(){saveSiteToTrail()});
    saveSiteToTrailButton.css({"cursor": "arrow"});
}

function deactivateSaveSiteButton() {
    saveSiteToTrailButton.text("Site saved!").stop().css({opacity: 0}).animate({opacity: 1}, 700 );
    saveSiteToTrailButton.unbind().click();
    saveSiteToTrailButton.css({"cursor": "pointer"});
}

function setTrailSelect(trails, adding) {
    console.log(adding,!adding);
    if (!adding){
        trailSelect.empty();
    }
    $.each(trails, function(id, name) {
        var option = $(document.createElement('option'));
        option.attr('value', id);
        option.text(name);
        if (String(id) == String(Trails.getCurrentTrailId())) {
            option.attr('selected', 'selected');
        } else if (!Trails.getCurrentTrailId()){
            option.attr('selected', 'selected');
            Trails.switchToTrail(id);
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

function runWhenExists($query, callback){
    console.log("checking if site exists for query:", $query);
    var siteDocExistsCheck = setInterval(function(){
        console.log("checking for site doc");
        if(currentSiteFrame = $($query).length){
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


