console.log('toolbar ui loaded');
function WtToolbar(toolbarHtml) {
    var thisToolbar = this;
    var toolbarFrame;
    var toolbarBody;
    var toolbarHeight;
    var trailPreview;
    var previewContainer;
    var previewHeight = 150;
    var loggedIn = false;
    var siteBody = $(document.body);
    var shown = false;
    var noteSelector;
    var hasTrails = false;
    var hasBeenShown = false;

    this.bodyMarginTop = siteBody.css("margin-top");
    this.bodyPosition = siteBody.css("position");

    var S = {
        trailDropDownItemClass: "trail-dropdown-item",
        helpDiv: "help-div",
        helpMessage: "help-div .message-box",
        helpExplanation: "help-div .explanation"
    }

    var T = {
        noNotesOnSiteMessage: "No saved notes on this site. Hit the visit site button to go to the live version.",
        noNotesInTrailMessage: "No saved notes in this Trail. View this trail to see sites you've saved without notes.",
        noTrailsMessage: '<a target="_blank" href="http://www.webtrails.co">Create a Trail</a> to use the toolbar </br>',
        toolbarExplanation:
            "shift + esc: open/close toolbar</br>" +
            "highlight text + alt: show save note button</br>" +
            "hold shift then alt: scroll through notes</br>" +
            "<b>If anything goes wrong, press the webtrails icon on your toolbar to sync data (you also might need to refresh).</b>",
        noSitesInTrailMessage: 'No Sites in this trail. Take a note on this page, or hit the save site button.',
        loggedOutMessage: function(logInButton) {
            return "You are now logged out. " + logInButton[0].outerHTML + " with Google."
        },
        noTrailsDropdownText: "No trails" // make sure to sync this with toolbar.html
    };
    var C = {
        toolbarFrame: {
            position: "fixed",
            width: "100%",
            top: "0px",
            left: "0px",
            "z-index": "2147483644",
            "border-bottom": "2px solid grey",
            "visibility": "hidden"
        },
        faviconImg: {
            "height":"18px",
            "vertical-align":"top",
            "margin": "0px 2px",
            "display": "block",
            "border": "none",
            "float": "left"
        },
        helpDiv: {
            height: previewHeight + "px"
        }
    };
    var H = {
        toolbarFrame: $("<iframe class='wt-toolbar-frame webtrails'></iframe>").
            attr({'src': "about:blank", 'frameborder': 0}).
            css(C.toolbarFrame),
        faviconImg: function(faviconUrl) {
            return $("<img src='"+ faviconUrl + "' class=\"webtrails\">").css(C.faviconImg)
        },
        trailDropdownItem: function(trailName, trailId) {
            return $(
                '<li role="presentation" class="'+ S.trailDropDownItemClass + '" data-trail-id="' + trailId + '">' +
                    '<a role="menuitem" data-trail-id="' + trailId + '" tabindex="-1" href="#">' + trailName + '</a><' +
                '/li>'
            )
        },
        helpDiv: function() {
            return $("<div class='help-div'></div>")
            .css(C.helpDiv)
        },
        logInButton: $("<a class='preview-login-button'>Log in or create an account</a>")
    };

    var toolbarFrame = H.toolbarFrame
    siteBody.prepend(toolbarFrame);
    thisToolbar.setIframeContent(toolbarFrame, toolbarHtml);

    thisToolbar.runWhenLoaded(function(doc) {
        var $doc = $(doc);
        var toolbarHeight = $doc.find(".toolbar-buttons").outerHeight();
        console.log("loaded with height" + toolbarHeight + "px");
        toolbarFrame.css({height: toolbarHeight + previewHeight + "px"});
        $doc.find("body").css({height: toolbarHeight + previewHeight + "px"});
    }, thisToolbar.getIDoc(toolbarFrame)[0]);

    toolbarBody = i$('body');

    function i$(selector) {
        return thisToolbar.i$(toolbarFrame, selector)
    }

    var saveSiteButton = i$(".save-site-button");
    var siteSavingSpinner = i$(".site-saving-spinner");
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
    var commentBox = i$(".comment-box");
    var logoutButton = i$(".logout-button");
    var loginButton = i$(".login-button");

    var noteSelectorContainer = i$(".note-selector");
    var noteSelectorBackground = i$(".note-selector-background");

    commentBox.css({
        "margin-top": toolbarHeight,
        height: previewHeight
    });

    var previewContainer = i$(".trail-preview-container");
    trailPreview = new TPreview(
        previewContainer, previewHeight, nextNoteButton, previousNoteButton, showCommentButton, deleteNoteButton,
        commentBox, checkForToolbarRelatedKeypress, checkForToolbarRelatedKeyup, closeDropdowns, thisToolbar
    );

    saveSiteButton.click(function() {
        saveSiteToTrail(false);
    });

    visitSiteButton.click(function() {
        open(trailPreview.getCurrentNote().site.url, "_blank");
    });

    trailsDropdownButton.click(openOrCloseDropdown);

    settingsDropdownButton.click(openOrCloseDropdown);

    logoutButton.click(signOut);
    loginButton.click(signIn);

    function openOrCloseDropdown(e) {
        var dropdown = $(e.delegateTarget).next();
        var open = dropdown.hasClass("open");
        if (open) {
            dropdown.removeClass("open");
            dropdown.hide();
        } else {
            dropdown.addClass("open");
            dropdown.show()
        }
        return false
    }

    function closeDropdowns(e) {
        if(!$(e.target).hasClass("dropdown-toggle")){
            trailsDropdownList.removeClass("open");
            settingsDropdownList.removeClass("open");
            trailsDropdownList.hide();
            settingsDropdownList.hide();
        }
    }

    siteBody.click(closeDropdowns);
    thisToolbar.getIDoc(toolbarFrame).click(closeDropdowns);

    this.switchToTrail = function(trail) {
        clearFaviconHolder();
        $.each(trail.getSites(), function(i, site) {
            thisToolbar.addFavicon(site);
        });
        trailNameContainer.val(trail.name);
        viewTrailButton.off('click').click(function() {
            open(webTrailsUrl + "/trails/" + trail.id, "_blank");
        });
        Trails.switchToTrail(trail.id);
        trailPreview.initWithTrail(trail);
    };

    this.initializeToolbarWithTrails = function(trailsObject) {
        if (Trails.getCurrentTrail()){
            thisToolbar.switchToTrail(trailsObject.getCurrentTrail());
            $.each(trailsObject.getTrailHash(), function(id, trail) {
                addTrailToDropdown(trail);
            });
            createNewNoteSelector()
        } else {
            showNoTrailsHelp();
            var hasTrails = false;
        }
    };

    function createNewNoteSelector() {
        if (noteSelector) {
            noteSelector.remove()
            delete noteSelector
        }

        noteSelector = new NoteSelector(
            noteSelectorContainer,
            noteSelectorBackground,
            trailPreview,
            previewHeight,
            Trails.getCurrentTrail());
    }

    function addTrailToDropdown(trail) {
        var dropDownItem = H.trailDropdownItem(trail.name, trail.id);
        dropDownItem.off('click').click(function(){
            thisToolbar.switchToTrail(trail)
        });
        trailsDropdownList.append(dropDownItem);
    };

   function addTrail(addTrailEvent) {
       var trail = addTrailEvent.trail;
        addTrailToDropdown(trail);
        if (!hasTrails) {
            thisToolbar.switchToTrail(trail);
        }
       hasTrails = true;
    }
    $(document).on("trailAdded", addTrail);

    function removeTrail(removeTrailEvent) {
        var trail = removeTrailEvent.trail;
        if (trail.isCurrentTrail()) {
            var trailToSwitchTo = false;
            $.each(Trails.getTrailHash(), function(id, otherTrail) {
                if (trail.id.toString() !== id) {
                    trailToSwitchTo = otherTrail;
                }
            });
            if (trailToSwitchTo) {
                thisToolbar.switchToTrail(trailToSwitchTo);
            } else {
                hasTrails = false;
                trailPreview.clear();
                trailPreview.enableOrDisablePrevAndNextButtons;
                trailNameContainer.val(T.noTrailsDropdownText)
                createNewNoteSelector();
                showNoTrailsHelp();
            }
        }
        i$("." + S.trailDropDownItemClass + "[data-trail-id=" + trail.id + "]").remove()
    };
    $(document).on("trailDeleted", removeTrail);

    this.isShown = function() {
        return shown;
    };

    function setSaveButtonToSaving() {
        saveSiteButton.html("Saving").addClass("saving");
        siteSavingSpinner.css({
            "visibility": "visible"
        });
        saveSiteButton.unbind("click", saveSiteToTrail);
    };

    function setSaveButtonToSaved(siteId, trailId) {
        saveSiteButton.html("Site saved");
        siteSavingSpinner.css({
            "visibility": "hidden"
        });
        saveSiteButton.click(function() {
            open(webTrailsUrl + "/trails/" + trailId + "#" + siteId, "_blank");
        });
    };


    this.addFavicon = function(site) {
        var faviconImg = H.faviconImg(site.faviconUrl);
        faviconImg.click(function() {
            if (site.getLastNote()) {
                trailPreview.displayNote(site.getLastNote());
                trailPreview.enableOrDisablePrevAndNextButtons(site.getLastNote());
            } else {
                var noNoteFakeNote = new NoNoteNote(site, trailPreview.getCurrentNote());
                trailPreview.displayNote(noNoteFakeNote);
                trailPreview.enableOrDisablePrevAndNextButtons(noNoteFakeNote);
                showNoNotesOnSiteHelp();
            }
        });
        faviconContainer.append(faviconImg);
    }

    function showMessageScreen(message, explanation) {
        i$("." + S.helpMessage).html(message);
        i$("." + S.helpExplanation).html(explanation || "");
        // cant' use show, as the css styles may not have been applied yet
        i$("." + S.helpDiv).css({display: "block"});
    }

    function hideMessageScreen() {
        console.log("note displayed, hiding message");
        i$("." + S.helpDiv).css({display: "none"});
    }
    $(document).on("noteDisplayed", hideMessageScreen);

    function showNoNotesOnSiteHelp() {
        showMessageScreen(T.noNotesOnSiteMessage, T.toolbarExplanation);
    };

    function showNoTrailsHelp() {
        showMessageScreen(T.noTrailsMessage, T.toolbarExplanation);
    };

    this.showNoNotesInTrailHelp = function() {
        showMessageScreen(T.noNotesInTrailMessage, T.toolbarExplanation);
    };

    this.showNoSitesInTrailHelp = function() {
        showMessageScreen(T.noSitesInTrailMessage, T.toolbarExplanation);
    };

    this.initSignedInExperience = function() {
        loggedIn = true;
        console.log("signed in");
        loginButton.hide();
        logoutButton.show();

        i$(".fade-on-logout").prop('disabled', false);

        $(document).mousedown(function() {
            mouseDown = true
            possibleHighlightStart()
        });

        $(document).mouseup(function() {
            mouseDown = false
        });
    }

    this.initSignedOutExperience = function () {
        console.log("initing signed out experience");
        var previewLoginButton = H.logInButton;
        showMessageScreen(T.loggedOutMessage(previewLoginButton));
        i$("." + S.helpMessage + " .preview-login-button").click(signIn);

        trailNameContainer.val("choose a trail");
        clearFaviconHolder();

        loginButton.show();
        logoutButton.hide();

        i$(".fade-on-logout, .only-fade-on-logout").prop('disabled', true);

        loggedIn = false;
    }

    function signOut() {
        console.log("signing out");
        chrome.runtime.sendMessage({logout:"now!"}, function(response) {
            // no response handling needed, the background will send a message
            // to all tabs.
        });
    }

    function signIn() {
        console.log("signing in!");
        chrome.runtime.sendMessage({login:"login"}, function(response) {
            // no response handling needed, the background will send a message
            // to all tabs.
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
        shown = true;
        toolbarFrame.focus();
        toolbarFrame.css({
            visibility: "visibile"
        })
        toolbarBody.css({
            visibility: "visible"
        });
        trailPreview.show();
        if (loggedIn) {
            if (!mouseDown) { // if the mouse is not pressed (not highlighting)
                highlightedTextDetect(); // check to see if they highlighted anything for the addnote button
            } else { // mouse is down, must be highlighting
                possibleHighlightStart(); // get that highlight start event so when done highlighting, addnote appears
            }
            if (!hasBeenShown) {
                Trails.requestTrailsUpdate();
            }
        }
    }

    function hide(){
//        siteBody.css({
//            position: thisToolbar.bodyPosition,
//            "margin-top": thisToolbar.bodyMarginTop
//        });
        toolbarFrame.css({
            visibility: "hidden"
        });
        toolbarBody.css({
            visibility: "hidden"
        });
        trailPreview.hide();
        if (noteSelector) {
            noteSelector.hide();
        }
        shown = false;
        $(".inlineSaveButton").remove();
        siteBody.focus();
        closeOverlay();
    }

    function showOrHideNoteSelector() {
        if (noteSelector && shown) {
            if (noteSelector.shown) {
                var selectedNote = noteSelector.getSelectedNote();
                if (selectedNote && (selectedNote !== trailPreview.getCurrentNote())){
                    trailPreview.displayNote(noteSelector.getSelectedNote());
                    trailPreview.enableOrDisablePrevAndNextButtons(trailPreview.getCurrentNote());
                }
                noteSelector.hide();
            } else {
                noteSelector.show();
            }
        }
    }

    function clearFaviconHolder() {
        faviconContainer.html("");
    }

    function checkForToolbarRelatedKeypress(e){
        console.log("checking keypress");
        var code = (e.keyCode ? e.keyCode : e.which);
        console.log("key is " + code);
        if (code == 27 && e.shiftKey) {    //tilda = 192, esc is code == 27
            console.log("showing or hiding");
            showOrHide();
        }

        if (code == 18 && e.shiftKey && shown && noteSelector) {
            noteSelector.show();
        }
    }

    function checkForToolbarRelatedKeyup(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 18 && noteSelector && noteSelector.shown) {
            var selectedNote = noteSelector.getSelectedNote();
            if (selectedNote && (selectedNote !== trailPreview.getCurrentNote())){
                trailPreview.displayNote(noteSelector.getSelectedNote());
                trailPreview.enableOrDisablePrevAndNextButtons(trailPreview.getCurrentNote());
            }
            noteSelector.hide();
        }
    }

    if (wt_auth_token){
        thisToolbar.initSignedInExperience()
    } else {
        thisToolbar.initSignedOutExperience()
    }
//
//    $(document.body).keydown(checkForToolbarRelatedKeypress);
//    $(document.body).keyup(checkForToolbarRelatedKeyup);
//    thisToolbar.getIDoc(toolbarFrame).keydown(checkForToolbarRelatedKeypress);
//    thisToolbar.getIDoc(toolbarFrame).keyup(checkForToolbarRelatedKeyup);


    chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
        if (request.checkingDownloadStatus){
            setSaveButtonToSaving();
        }
        if (request.downloadComplete) {
            setSaveButtonToSaved();
        }
        if (request.downloadTimedOut) {
            butterBarNotification("Problem saving site, may not have saved correctly.");
            setSaveButtonToSaved();
        }
        if (request.openOrCloseToolbar) {
            showOrHide();
        }
        if (request.showNoteScroller) {
            showOrHideNoteSelector();
        }
    })

    //weird fix for some sites
    try {
        var bodymargin = $('body').css('margin-left')
        if (bodymargin) {
            trailDisplay.css("margin-left", "-" + bodymargin);
        }
    }catch (e) {}
}

WtToolbar.prototype = IframeManager