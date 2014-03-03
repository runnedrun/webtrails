
// the intitialization code for the trail display page
// the rest of the functionality is split up in the various trail_display_<functionality>.js files

var currentSiteIndex=0;
var currentSite;
var Notes = {};
var currentNoteIndex=-1;
var presentationMode = false;
var siteHash = {};
var currentCommentBox;
var nextNoteActivated = true;
var previousNoteActivated = true;
var noteViewActive = false;
// var siteIDs
// var requestUrl
// var editAccess
// var trailID
// are all declared in the html, using erb

$(function(){
    // We should have the siteIDs set from the server page.
    // If we don't we probably shouldn't run this code on that page.
    if (typeof siteIDs == "undefined") {
        console.log("No SiteIDs, returning");
        return;
    }

    fetchSiteHtml();


    //check for hash to set correct site
//    if (window.location.hash) {
//        var hash = window.location.hash.substring(1);
//        currentSiteIndex = parseInt(hash) || 0;
//        if (currentSiteIndex >= siteIDs.length || hash == "end") {
//            currentSiteIndex = siteIDs.length - 1;
//        } else if (currentSiteIndex < 0) {
//            currentSiteIndex = 0;
//        }
//    }
//    var currentSiteID = String(siteIDs[currentSiteIndex]);

    rangy.init();
    initializeAutoResize();

//    currentSite = $("#"+currentSiteID);
//    setTimeout(makeIframes, 1);
//    $("#nextSite").click(nextSite);
//    $("#previousSite").click(previousSite);
//    $("#nextNote").click(nextNote);
//    $("#previousNote").click(previousNote);
//    if (editAccess) {
//        $("#removeSite").click(removeSite);
//    } else {
//        $("#removeSite").remove();
//    }
//    $('#showAllSitesButton').click(showAllSites);
////    $("#showNoteList").click(expandOrCloseNoteList);
//    $("#showNoteList").click(initOrDisableNoteView);
//    $(".noteInfo").click(clickJumpToNote);
//    $(".noteComment").click(makeNoteCommentEditable);
//
//    $(".click-to-change-site").click(clickJumpToSite);

    makeFaviconsDragable();
    makeNotesDragable();
//    switchToSite(currentSiteID);
});

function initializeNoteTaking(siteID){
    console.log("initializing note taking")
    var iframeDocumentBeingInitialized = $("#"+String(siteID))[0].contentWindow.document;
    $(iframeDocumentBeingInitialized.body).mousedown(function() {
        mouseDown=1;
    });
    $(iframeDocumentBeingInitialized.body).mouseup(function(){
        mouseDown=0;
    });
    $(iframeDocumentBeingInitialized).mousedown(possibleHighlightStart);
}

function removeLoadingFromSite(siteID) {
    console.log("removing loading from site:", siteID);
    $('#loading-' + siteID).remove();
    $('iframe#' + siteID).css('background-image', 'none');
}

function fetchSiteHtml() {
    var deferreds = $.map(trailDisplayHash.sites.siteObjects, function(site,id){
        return $.map(site.revisionUrls, function(url, revisionNumber) {
            return $.ajax({
                url: url,
                type: "get",
                dataType: "html",
                crossDomain: true,
                success: function(resp){
                    console.log("succceded in fetch");
                    trailDisplayHash.sites.siteObjects[id]["html"][revisionNumber] =  resp;
                } ,
                error: function(resp){
                    console.log("failed to fetch");
                    trailDisplayHash.sites.siteObjects[id]["html"][revisionNumber] =  "Sometimes things go wrong, please reload!";
                }
            })
        })
    });

    $.when.apply($, deferreds).always(function(){
        console.log("html retrieval complete");
        var trailsHash = {};
        trailsHash[trailDisplayHash.id] = trailDisplayHash;

        Trails = new TrailsObject(trailsHash, trailDisplayHash.id);
        Trails.initTrails();
        Trail = Trails.getCurrentTrail();
        TrailPreview = new TPreview();
        PanelView = new PanelView(TrailPreview);
        NoteViewer = TrailPreview.noteViewer;
        Toolbar = new TToolBar(TrailPreview, PanelView, NoteViewer);
        Trails.switchToTrail(Trail.id);
    })
}


// this is an attempt to fix the weird highligh/scroll bug which pops up when you go into not view mode
function lockScrollPositionOfSiteDisplayDiv(){
    console.log("locking scroll position");
    $(".siteDisplayDiv").scroll(function(e){
        console.log("scrolleddddd");
//            e.target.scrollTop = 0;
    })
}

function getIDoc($iframe) {
    return $($iframe[0].contentWindow.document);
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

function canEdit() {
    if (!editAccess) { // in case called from console or something
        console.log("No access to editing this trail!");
        return false;
    } else { return true}
}