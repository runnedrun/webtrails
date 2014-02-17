console.log("initializing the toolbar");

var trailDisplay,
    faviconHolder,
    mouseDown = 0,
    previousNoteDisplay,
    previousNoteButton,
    currentSiteID="",
    trailSelect,
    saveSiteToTrailButton,
    nextNoteButton,
    previousNoteID,
    siteHTML = getCurrentSiteHTML(),
    siteSaved=false,
    TrailPreview = false,
    loggedIn = false;
    faviconsFetched = false;
//    webTrailsUrl = "http://www.webtrails.co";
    webTrailsUrl = "http://localhost:3000";
    wt_auth_token;
    // defined by the background script
    startingTrailID;
    toolbarShown;
    powerButtonUrl;
    contentScriptLoaded;
    toolbarHtml; // this is uri encoded
    noTrailsHelpUrl;

String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

$(initExtension());
//initExtension();

function initExtension(){
    console.log("init extension");
    initializeAutoResize();
//    debugger;
//    Toolbar = new WtToolbar(decodeURI(toolbarUrl));
    Toolbar = new WtToolbar(decodeURI(toolbarHtml), noTrailsHelpUrl);
    $(document.body).keydown(verifyKeypress);
    if (wt_auth_token) {
        getTrailDataFromLocalStorage(function(response){
            console.log("local storage response", response);
            Trails = new TrailsObject(response, startingTrailID);
            Toolbar.updateToolbarWithTrails(Trails);
        });
    }
}

function getTrailDataFromLocalStorage(callback){
    chrome.runtime.sendMessage({getTrailsObject:"get it!"}, function(response) {
        callback && callback(response);
    });
}

function updateTrailDataInLocalStorage(){
    console.log("send update message");
    chrome.runtime.sendMessage({updateTrailsObject:"update it!"}, function(response) {
        console.log("response: ", response);
    });
}

function verifyKeypress(e){
    console.log("verifiing keypress");
    var code = (e.keyCode ? e.keyCode : e.which);
    if (e.altKey){
        displaySaveButtonWhileKeyIsPressed()
    }
}

// if error returns null
function getComputedStyleOfElement(element,stylename){
    var style = document.defaultView.getComputedStyle(element,null);
    if (style) {
        return style[stylename];
    } else {
        return null;
    }
}

function getNodeLineHeight(element) {
    var fontsize = getComputedStyleOfElement(element, "font-size");
    if (fontsize) {
        return parseInt(fontsize.replace("px",""))*1.5 || 20; //default to 20
    } else {
        return 20;
    }
    
}
// returns true if the node is a text node, false if not
function isTextNode(node) {
    return node.nodeType == 3;
}

