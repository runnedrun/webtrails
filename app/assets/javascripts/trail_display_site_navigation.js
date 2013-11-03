function nextSite(){
    if (currentSiteIndex < siteIDs.length-1){
        var switchingToSiteID = siteIDs[currentSiteIndex+1];
        switchToSite(switchingToSiteID);
        return true;
    }
    return false;
}

function previousSite(){
    if (currentSiteIndex > 0){
        var switchingToSiteID = siteIDs[currentSiteIndex-1];
        switchToSite(switchingToSiteID);
        return true
    }
    return false
}

function showAllSites(){
    if ($('iframe').hasClass('shrunk')) {
        removeShrinkFromIframes();
        TrailPreview.dis
//        switchToSite(getCurrentSiteID());
    } else {
        if (noteViewActive){
            disableNoteViewMode();
        }
        shrinkIframes();
    }
}

function removeShrinkFromIframes() {
    console.log("unshrink");
    $('iframe').removeClass('shrunk').css({
        "left":"0px",
        "top":"0px",
        "-moz-transform": "scale(1, 1)",
        "-webkit-transform": "scale(1, 1)",
        "-o-transform": "scale(1, 1)",
        "-ms-transform": "scale(1, 1)",
        "transform": "scale(1, 1)"
    });
    $('.siteClickDiv').remove();
}

function shrinkIframes() {
    console.log("shrink");
    var percentPerIframe = .23;
    $('iframe').css({
        "-moz-transform": "scale(" + percentPerIframe + ", " + percentPerIframe + ")",
        "-webkit-transform": "scale(" + percentPerIframe + ", " + percentPerIframe + ")",
        "-o-transform": "scale(" + percentPerIframe + ", " + percentPerIframe + ")",
        "-ms-transform": "scale(" + percentPerIframe + ", " + percentPerIframe + ")",
        "transform": "scale(" + percentPerIframe + ", " + percentPerIframe + ")"
    });
    var iframesPerRow = 4;

    var marginOffset = (1 - iframesPerRow * percentPerIframe)/(2 * iframesPerRow);
    // console.log("offset:", marginOffset);
    $.each(siteIDs,function(index,siteID){
        var iframe  = $('iframe#'+siteID).addClass('shrunk')
        var row = Math.floor(index/iframesPerRow);
        var col = index - row * iframesPerRow;
        var leftProp = (1 + 2 * col) * marginOffset + col * percentPerIframe;
        var topProp = (1 + 2 * row) * marginOffset + row * percentPerIframe;
        // console.log(index, "left:", (leftProp * 100) + "%", "top:", (topProp * 100) + "%")
        $(iframe).css({left: (leftProp * 100) + "%" , top: (topProp * 100) + "%"});

        var $clickdiv = $(document.createElement('div'));
        $clickdiv.addClass('siteClickDiv');
        $clickdiv.css({left: (leftProp * 100) + "%" ,
            top: (topProp * 100) + "%",
            width: (percentPerIframe * 100) + "%",
            height: (percentPerIframe * 100) + "%"});
        $clickdiv.click(function(e){
            e.preventDefault();
            console.log("iframe click div clicked");
            removeShrinkFromIframes();
            switchToSite($(iframe).attr("data-site-id"));
        })
        $('#siteClickDivs').append($clickdiv);
    });
    $('iframe').removeClass('notCurrent');
}

// scrolls the favicon carousel to the appropriate place for the active favicon

function switchToSite(siteID){
//    closeNoteList();
    siteID = String(siteID);
    if ($('.currentSite').length > 0) {
        removeCurrentComment();
        removeHighlight($(iframeContentWindow().document.body));
    }
    if ($('#' + siteID).hasClass('shrunk')) {
        removeShrinkFromIframes();
    }
    $('iframe').addClass("notCurrent").removeClass("currentSite");
    console.log("switching to siteID", siteID);
    currentSite = $("#"+siteID);
    // console.log(currentSite);
    currentSite.removeClass("notCurrent").addClass("currentSite");
    highlightCurrentSiteFavicon(siteID);

    currentSiteIndex = siteIDs.indexOf(siteID);
    currentNoteIndex = -1;
    scroll_favicon_carousel(currentSiteIndex);
    $('#goToSite').attr("href", $('.activeFavicon').attr("data-site-url"));
    window.location.hash = "#" + currentSiteIndex;
    if(siteHash[getCurrentSiteID()]){
        //only run if sites notes have been loaded
        deactivateOrReactivateNextNoteIfNecessary();
        deactivateOrReactivatePreviousNoteIfNecessary();
        updateNoteCount();
    }
}

function deleteSiteFromTrail(siteIndex){
    if (!editAccess) { // in case called from console or something
        console.log("No access to editing this trail! No deleting sites!");
        return;
    }
    $.ajax({
        url: "/sites/delete",
        type: "post",
        data: {
            "id" : siteIDs[siteIndex]
        },
        success: function() {deleteSiteLocally(siteIndex);}
    });

}

function removeSite() {
    console.log("remove site pressed");
    deleteSiteFromTrail(currentSiteIndex);
}

function deleteSiteLocally(siteIndex) {
    var siteID = siteIDs[siteIndex];
    var iframe = $('#' + siteID);
    if (iframe.hasClass("currentSite")) {
        if (siteIndex < siteIDs.length - 1) {
            nextSite();
            currentSiteIndex--;
        } else {
            previousSite();
        }
    }
    siteIDs.splice(siteIndex,1);
    iframe.remove();
    removeSiteFromNoteList(siteID);
    deactivateOrReactivateNextNoteIfNecessary();
    deactivateOrReactivatePreviousNoteIfNecessary();
    $('#favicon' + siteID).remove();

}

