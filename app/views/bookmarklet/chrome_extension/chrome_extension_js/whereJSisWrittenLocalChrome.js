console.log("initializing the toolbar");

var faviconHolder,
    mouseDown = 0,
    TrailPreview = false,
//    webTrailsUrl = "http://www.webtrails.co";
    webTrailsUrl = "http://localhost:3000";
    wt_auth_token = undefined;
    commentDropdownCssInserted = false;

Highlights = new HighlightManager(document);

String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

$(function() {
    rangy.init();
    console.log("initializing the extension");
    var deferredData = LocalStorageTrailAccess.getExtensionInitializationData();
    chrome.runtime.sendMessage({getToolbarHtml: true});

    var messageReceived = false;
    chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
        if (!messageReceived && request.htmlObject) {
            messageReceived = true;
            deferredData.done(function(initializationObject) {
                initToolbar(initializationObject, request.htmlObject)
            });
        }
    })
});

function initToolbar(initializationObject, htmlObject){
    wt_auth_token = initializationObject.authToken;
    console.log("init extension");
    initializeAutoResize();

    var showPreview;
    if (initializationObject.previewShown === undefined) {
        showPreview = true // always show the preview the first time a user opens the toolbar
    } else {
        showPreview =initializationObject.previewShown
    }

    Toolbar = new WtToolbar(decodeURI(htmlObject.toolbarHtml), initializationObject.previewShown);

    chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
        if (request.logOutAllTabs){
            console.log("getting log out request from another tab");
            Toolbar.initSignedOutExperience();
        }
        if (request.logInAllTabs){
            console.log("signing in");
            wt_auth_token = request.logInAllTabs.authToken;
            var startingTrailId = request.logInAllTabs.startingTrailId;
            var trailsObject = request.logInAllTabs.trailsObject;
            Toolbar.initSignedInExperience();
            initializeTrails(trailsObject, startingTrailId);
        }
    });

    if (wt_auth_token) {
        initializeTrails(initializationObject.trails, initializationObject.currentTrailId);
    }
}

function initializeTrails(baseTrailsObject, startingTrailId) {
    console.log("local storage response", baseTrailsObject);
    Trails = new TrailsObject(baseTrailsObject, startingTrailId);
    Toolbar.initializeToolbarWithTrails(Trails);
}

function updateTrailDataInLocalStorage(){
    console.log("send update message");
    chrome.runtime.sendMessage({updateTrailsObject:"update it!"}, function(response) {
        console.log("response: ", response);
    });
}

//function verifyKeypress(e){
//    console.log("verifiing keypress");
//    var code = (e.keyCode ? e.keyCode : e.which);
//    if (e.altKey){
//        displaySaveButtonWhileKeyIsPressed()
//    }
//}

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

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.downloadComplete) {
        console.log("got download complete event from background");
        $(document).trigger({type:"downloadComplete", noteDetails: request.downloadComplete});
    }
    if (request.downloadTimedOut) {
        butterBarNotification("Problem saving, may not have saved correctly.");
        $(document).trigger({type:"downloadTimedOut", noteDetails: request.downloadTimedOut});
    }
})
