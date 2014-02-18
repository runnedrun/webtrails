console.log('toolbar ui loaded');
function WtToolbar(toolbarHtml, noTrailsHelpUrl, noNotesHelpUrl) {
    var thisToolbar = this;
    var toolbarFrame;
    var trailPreview;
    var previewContainer;
    var previewHeight = 200;
    var loggedIn = false
    var bodyMarginTop = $("body").css("margin-top");

    var CSS = {
        toolbarFrame: {
            position: "fixed",
            width: "100%",
            top: "0px",
            left: "0px",
            "z-index": "2147483644",
            "border-bottom": "2px solid grey"
        },
        faviconImg: {
            "height":"16px",
            "vertical-align":"top",
            "margin": "0px 2px",
            "display": "block",
            "border": "none",
            "float": "left"
        },
        helpFrame: {
            height: previewHeight + "px"
        }
    };
    var HTML = {
        toolbarFrame: $("<iframe class='wt-toolbar-frame'></iframe>").
            attr({'src': "about:blank", 'frameborder': 0}).
            css(CSS.toolbarFrame),
        faviconImg: function(faviconUrl) {
            return $("<img src='"+ faviconUrl + "' class=\"webtrails\">").css(CSS.faviconImg)
        },
        trailDropdownItem: function(trailName, trailId) {
            return $('<li role="presentation"><a role="menuitem" data-trail-id="' + trailId + '" tabindex="-1" href="#">' + trailName + '</a></li>')
        },
        helpFrame: function(srcUrl) {
            return $("<iframe class='help-frame'></iframe>").attr({
                src: srcUrl,
                frameborder: "0"
            }).css(CSS.helpFrame)
        }
    };

    var toolbarFrame = HTML.toolbarFrame
    $("body").prepend(toolbarFrame);
    thisToolbar.setIframeContent(toolbarFrame, toolbarHtml);

    thisToolbar.runWhenLoaded(function(doc) {
        var $doc = $(doc);
        var toolbarHeight = $doc.find(".wt-toolbar-buttons").height();
        console.log("loaded with height" + toolbarHeight + "px");
        toolbarFrame.css({height: toolbarHeight + 200 + "px"});
        $doc.find("body").css({height: toolbarHeight + 200 + "px"});
        var dropdowns = $doc.find(".dropdown-toggle");
        dropdowns.dropdown();
    }, thisToolbar.getIDoc(toolbarFrame)[0]);

    function i$(selector) {
        return thisToolbar.getIDoc(toolbarFrame).find(selector)
    }

    var trailsDropdownButton = i$(".trail-dropdown-button");
    var trailsDropdownList = i$(".trail-dropdown-list");
    var trailNameContainer = i$(".trail-name");
    var viewTrailButton = i$(".view-trail-button");
    var faviconContainer = i$(".favicons");
    var nextNoteButton = i$(".next-note-button")
    var previousNoteButton = i$(".prev-note-button")
    var showCommentButton = i$(".show-comment-button");
    var visitSiteButton = i$(".visit-site-button");
    var deleteNoteButton = i$(".delete-note-button");
    var settingsDropdownButton = i$(".settings-dropdown-button");
    var settingsDropdownList = i$(".settings-dropdown-list");

    var previewContainer = i$(".trail-preview-container");
    trailPreview = new TPreview(previewContainer, previewHeight, nextNoteButton, previousNoteButton, showCommentButton, deleteNoteButton);

    visitSiteButton.click(function() {
        open(trailPreview.getCurrentNote().site.url, "_blank");
    });

    trailsDropdownButton.click(function() {
        trailsDropdownList.toggle();
    });

    settingsDropdownButton.click(function() {
        settingsDropdownList.toggle();
    });

    var displayHeight = "25px";
    var shown = true;

    this.switchToTrail = function(trail) {
        clearFaviconHolder();
        $.each(trail.getSites(), function(i, site) {
            addFavicon(site);
        });
        trailNameContainer.html(trail.name)
        viewTrailButton.click(function() {
            open(webTrailsUrl + "/trails/" + trail.id, "_blank");
        })
        trailPreview.initWithTrail(trail);
    };

    this.updateToolbarWithTrails = function(trailsObject) {
        if (Trails.getCurrentTrail()){
            thisToolbar.switchToTrail(trailsObject.getCurrentTrail());
            $.each(trailsObject.getTrailHash(), function(id, trail) {
                var dropDownItem = HTML.trailDropdownItem(trail.name, trail.id);
                dropDownItem.click(function(){
                    thisToolbar.switchToTrail(trail)
                });
                trailsDropdownList.append(dropDownItem);
            });
        } else {
            showNoTrailsHelp();
        }
    };

    function addFavicon(site) {
        var faviconImg = HTML.faviconImg(site.faviconUrl);
        faviconImg.click(function() {
            if (site.getLastNote()) {
                trailPreview.displayNote(site.getLastNote());
            } else {
                var noNoteFakeNote = new NoNoteNote(site, trailPreview.getCurrentNote());
                trailPreview.displayNote(noNoteFakeNote);
                trailPreview.enableOrDisablePrevAndNextButtons(noNoteFakeNote);
                showNoNotesHelp();
            }
        });
        faviconContainer.append(faviconImg);
    }

    function showNoNotesHelp() {
        var helpIframe = HTML.helpFrame(noNotesHelpUrl);
        previewContainer.html(helpIframe);
    }

    function showNoTrailsHelp() {
        var helpIframe = HTML.helpFrame(noTrailsHelpUrl);
        previewContainer.html(helpIframe);
    }

    function initSignedInExperience() {
        loggedIn = true;
        $(document).mousedown(possibleHighlightStart);
    }

    function initSignedOutExperience() {
        console.log("signing out");
        loggedIn = false;
        trailDisplay.children().not(".wt_settingsButton").hide();
        settingsButtonWrapper.css("background-color","#FF8080")
        loggedOutMessage.show();
        $(document).unbind("mousedown");
        $(".inlineSaveButton").remove();
        settingsButtonWrapper.unbind("click");
        debugger;
        settingsButtonWrapper.click(function(){
            console.log("signing in");
            signIn()
            return false
        })
    }

    this.signOut = function(){
        chrome.runtime.sendMessage({logout:"now!"}, function(response) {
            initSignedOutExperience();
        });
    }

    this.signIn = function() {
        chrome.runtime.sendMessage({login:"login"}, function(response) {
            wt_auth_token = response.wt_auth_token;
            initSignedInExperience();
        });
    }

    function showOrHide(){
        console.log("showing or hiding toolbar");
        if (!shown){
            show();
        }
        else {
            console.log("hiding toolbar");
            hide();
        }
    }

    function show(){
        toolbarFrame.show();
        shown = true
        $("body").css({"margin-top": toolbarFrame.height() + "px"});
        if (loggedIn) {
            if (mouseDown == 0) { // if the mouse is not pressed (not highlighting)
                highlightedTextDetect(); // check to see if they highlighted anything for the addnote button
            } else { // mouse is down, must be highlighting
                possibleHighlightStart(); // get that highlight start event so when done highlighting, addnote appears
            }
        }
    }

    function hide(){
        $("body").css({"margin-top": bodyMarginTop});
        toolbarFrame.hide();
        shown = false;
        $(".inlineSaveButton").remove();
        closeOverlay();
    }

    function clearFaviconHolder() {
        faviconContainer.html("");
    }

    function checkForShowToolbarKeypress(e){
        console.log("verifiing keypress");
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 27 && e.shiftKey){    //tilda = 192, esc is code == 27
            showOrHide();
        }
    }

    if (wt_auth_token){
        initSignedInExperience()
    } else {
        initSignedOutExperience()
    }
//
    $(document.body).keydown(checkForShowToolbarKeypress);
//
//    $(document.body).mousedown(function() {
//        mouseDown=1;
//    });
//    $(document.body).mouseup(function(){
//        mouseDown=0;
//    });
//
    //weird fix for some sites
    try {
        var bodymargin = $('body').css('margin-left')
        if (bodymargin) {
            trailDisplay.css("margin-left", "-" + bodymargin);
        }
    }catch (e) {}
}
WtToolbar.prototype = IframeManager