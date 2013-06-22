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
// var siteIDS
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

    rangy.init();
    initializeAutoResize();

    currentSite = $("#"+currentSiteID);
    setTimeout(makeIframes, 1);
    $("#nextSite").click(nextSite);
    $("#previousSite").click(previousSite);
    $("#nextNote").click(nextNote);
    $("#previousNote").click(previousNote);
    if (editAccess) {
        $("#removeSite").click(removeSite);
    } else {
        $("#removeSite").remove();
    }
    $('#showAllSitesButton').click(showAllSites);
    $("#showNoteList").click(expandOrCloseNoteList);
    $(".noteWrapper").click(clickJumpToNote);
    $(".faviconImage").click(clickJumpToSite);

    makeFaviconsDragable();
    switchToSite(currentSiteID);
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

function loadIframes(siteID){
    $('iframe#' + siteID).load(function() {
        removeLoadingFromSite(siteID);
        initializeNoteTaking(siteID);
    });
    $('iframe#' + siteID).attr("src", requestUrl + "/sites/" + siteID);
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
    console.log("making iframes")
    var currentSiteID = siteIDs[currentSiteIndex];
    loadIframes(currentSiteID);
    //site IDS defined in the html
    $.each(siteIDs,function (i,siteID){
        if (siteID != currentSiteID) {
            loadIframes(siteID);
        }
    });
}

function wrapHTMLInIframe(html,iframe){
    var siteDoc = iframe[0].contentWindow.document;
    var siteBody = $('body', siteDoc);
    siteBody.wrapInner(html);
}

function insertHTMLInIframe(html,$iframe){
    var siteDoc = $iframe[0].contentWindow.document;
    var siteBody = $('body', siteDoc);
    siteBody.append(html);
}

function readySite(data){
    console.log("readying site:", data.site_id);
    var noteIDs=[];
    $.each(data.notes, function(i,note){
        noteIDs.push(String(note.id));
        Notes[note.id] = note;
    })
    var siteAttributes = {"noteIDs": noteIDs, "title" : data.title, "url" : data.url};
    siteHash[data.site_id]=siteAttributes;
    if (data.site_id == getCurrentSiteID()){
        console.log("updating note count and disabling buttons");
        updateNoteCount();
        deactivateOrReactivateNextNoteIfNecessary();
        deactivateOrReactivatePreviousNoteIfNecessary();
    }
}

function switchToPresentationMode(){
//    $(currentSite[0].contentWindow.documenon-wrapping div full screennt.body).css({"height": "100%","width": "100%","z-index":"0"});
    insertHTMLInIframe("<div class=overlay style='background-color: #666666;z-index:99998; height: 100%; width: 100%;position: fixed; top:0; right: 0; opacity: .6;'>", currentSite);
    presentationMode = true;
}
