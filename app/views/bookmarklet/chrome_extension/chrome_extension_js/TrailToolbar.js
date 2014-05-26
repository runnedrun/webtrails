console.log('toolbar ui loaded');
function WtToolbar(toolbarHtml, previewShown) {
    var thisToolbar = this;
    var toolbarFrame;
    var toolbarBody;
    var toolbarHeight = 45; // 45 for the height of the toolbar, + 1px border
    var trailPreview;
    var previewContainer;
    var previewHeight = 150;
    var loggedIn = false;
    var siteBody = $(document.body);
    var shown = false;
    var infoDisplayShown = false;
    var noteSelector;
    var hasTrails = false;
    var hasBeenShown = false;

    this.toolbarInducedOffset = function() {
        return toolbarHeight + previewHeight + 2
    }

    this.bodyMarginTop = siteBody.css("margin-top");
    this.bodyPosition = siteBody.css("position");

    var S = {
        trailDropDownItemClass: "trail-dropdown-item",
        helpDiv: "help-div",
        helpMessage: "help-div .message-box",
        helpExplanation: "help-div .explanation"
    }

    var T = {
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
        noTrailsDropdownText: "No trails", // make sure to sync this with toolbar.html
        hidePreview: "Note Preview <span class='glyphicon glyphicon-chevron-up mini-chevron'></span>",
        showPreview: "Note Preview <span class='glyphicon glyphicon-chevron-down mini-chevron'></span>"
    };
    var C = {
        toolbarFrame: {
            position: "fixed",
            width: "100%",
            top: "0px",
            left: "0px",
            "z-index": "2147483644",
            "border": "none",
            "visibility": "hidden",
            "height": toolbarHeight + "px"
        },
        helpDiv: {
            height: previewHeight + "px"
        }
    };
    var H = {
        toolbarFrame: applyDefaultCSS($("<iframe class='wt-toolbar-frame webtrails'></iframe>")).
            attr({'src': "about:blank", 'frameborder': 0}).
            css(C.toolbarFrame),
        faviconImg: function(site) {
            return $("<img src='"+ site.faviconUrl + "' class='webtrails favicon-img' data-site-id='" + site.id + "'>")
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
        $doc.find(".info-display").css({top: toolbarHeight});
        var frameHeight = thisToolbar.toolbarInducedOffset();
        $doc.find("body").css({height: frameHeight});

        if(previewShown) {
            showInfoDisplay();
        } else {
            hideInfoDisplay();
        }
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
    var nextNoteButton = i$(".next-note-button");
    var noteSelectorButton = i$(".note-selector-button");
    var deleteNoteButton = i$(".delete-note-button");
    var previousNoteButton = i$(".prev-note-button")
    var viewInTrailButton = i$(".visit-site-button");
    var settingsDropdownButton = i$(".settings-dropdown-button");
    var settingsDropdownList = i$(".settings-dropdown-list");
    var addTrailDropdownInput = i$(".add-trail-dropdown-input");
    var logoutButton = i$(".logout-button");
    var loginButton = i$(".login-button");
    var showOrHideInfoDisplayButton = i$(".show-preview-button ");

    var infoDisplay = i$(".info-display");
    var noteSelectorContainer = i$(".note-selector");
    var noteSelectorBackground = i$(".note-selector-background");

    viewInTrailButton.disable = noteSelectorButton.disable = nextNoteButton.disable = previousNoteButton.disable = function() {
        this.prop('disabled', true);
        this.css({
            color: "grey"
        })
        this.enabled = false;
    };

    viewInTrailButton.enable = noteSelectorButton.enable = nextNoteButton.enable = previousNoteButton.enable = function() {
        this.prop('disabled', false);
        this.css({
            color: "black"
        })
        this.enabled = true;
    };

    deleteNoteButton.enable = function() {
        this.prop('disabled', false);
        this.css({
            color: "white"
        })
        this.enabled = true;
    };

    deleteNoteButton.disable = function() {
        this.prop('disabled', true);
        this.enabled = false;
    };

    var previewContainer = i$(".trail-preview-container");
    trailPreview = new TPreview(
        previewContainer, previewHeight, nextNoteButton, previousNoteButton, deleteNoteButton,
        clickOffDropdowns, thisToolbar
    );

    saveSiteButton.click(function() {
        saveSiteToTrail(false);
    });

    viewInTrailButton.click(function() {
        viewNoteInTrail(trailPreview.getCurrentNote());
    });

    function viewNoteInTrail(note) {
        if (note) {
            var trailId = note.site.trail.id;
            var siteId = note.site.id;
            var noteId = note.id;
            open(webTrailsUrl + "/trails/" + trailId + "#" + siteId + "-" + noteId, "_blank");
        }
    }

    addTrailDropdownInput.keydown(function(e) {
        console.log("verifiing keypress");
        var code = e.keyCode;
        if (code === 13){
            // enter has been pressed
            newTrail(addTrailDropdownInput.val(), function(resp) {
                addTrailDropdownInput.val("");
            });
        }
    })

    trailsDropdownButton.click(openOrCloseDropdown);

    settingsDropdownButton.click(openOrCloseDropdown);

    showOrHideInfoDisplayButton.click(showOrHideInfoDisplay);

    noteSelectorButton.click(showOrHideNoteSelector);

    logoutButton.click(signOut);
    loginButton.click(signIn);

    function openOrCloseDropdown(e) {
        var dropdown = $(e.delegateTarget).next();
        var open = dropdown.hasClass("open");
        if (!open) {
            dropdown.addClass("open");
            dropdown.show();
            adjustFrameHeightForDropdown(dropdown);
        } else {
            closeDropdowns();
        }
        return false
    }

    function adjustFrameHeightForDropdown(dropdown) {
        // need a bit of buffer on the bottom so that when a new trail is added it doesn't go below the fold
        toolbarFrame.css({height: Math.max(dropdown.height(), previewHeight) + toolbarHeight + 100 + "px"});
    }

    function closeDropdowns() {
        trailsDropdownList.removeClass("open");
        settingsDropdownList.removeClass("open");
        trailsDropdownList.hide();
        settingsDropdownList.hide();

        addTrailDropdownInput.val("")

        if (infoDisplayShown) {
            toolbarFrame.css({height: previewHeight + toolbarHeight + "px"});
        } else {
            toolbarFrame.css({height: toolbarHeight});
        }
    }

    function clickOffDropdowns(e) {
        var target = $(e.target);
        if (!target.hasClass("dropdown-toggle") && !target.hasClass("add-trail-dropdown-input")) {
            closeDropdowns()
        }
    }

    siteBody.click(clickOffDropdowns);
    thisToolbar.getIDoc(toolbarFrame).click(clickOffDropdowns);

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
            "width": "20px"
        });
        saveSiteButton.unbind("click", saveSiteToTrail);
    };

    function setSaveButtonToSaved(siteId, trailId) {
        saveSiteButton.html("Site saved");
        siteSavingSpinner.css({
            "width": "0px"
        });
        saveSiteButton.click(function() {
            open(webTrailsUrl + "/trails/" + trailId + "#" + siteId, "_blank");
        });
    };


    this.addFavicon = function(site) {
        var faviconImg = H.faviconImg(site);
        faviconImg.click(function() {
            if (infoDisplayShown) {
                trailPreview.displayNote(site.getFirstNote() || site.getBaseRevisionNote());
            }
        });
        faviconContainer.append(faviconImg);
    }

    function removeFavicon(siteDeletedEvent) {
        var site = siteDeletedEvent.site
        i$(".favicon-img[data-site-id=" + site.id + "]").remove();
    }
    $(document).on("siteDeleted", removeFavicon);

    function showMessageScreen(message, explanation) {
        trailPreview.displayNote(false);
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

    function showNoTrailsHelp() {
        showMessageScreen(T.noTrailsMessage);
    };

    this.showNoNotesInTrailHelp = function() {
        showMessageScreen(T.noNotesInTrailMessage);
    };

    this.showNoSitesInTrailHelp = function() {
        showMessageScreen(T.noSitesInTrailMessage);
    };

    this.initSignedInExperience = function() {
        loggedIn = true;
        console.log("signed in");
        loginButton.hide();
        logoutButton.show();

        i$(".fade-on-logout").prop('disabled', false);

//        $(document).mousedown(function() {
//            mouseDown = true
//            possibleHighlightStart()
//        });

//        $(document).mouseup(function() {
//            mouseDown = false
//        });
    }

    this.initSignedOutExperience = function () {
        console.log("initing signed out experience");
        var previewLoginButton = H.logInButton;
        showMessageScreen(T.loggedOutMessage(previewLoginButton));
        i$("." + S.helpMessage + " .preview-login-button").click(signIn);

        trailNameContainer.val("choose a trail");
        clearFaviconHolder();
        clearTrailDropdown();

        loginButton.show();
        logoutButton.hide();

        i$(".fade-on-logout, .only-fade-on-logout").prop('disabled', true);

        loggedIn = false;
    }

    function updateToolbarUiOnNoteChange(noteDisplayEvent) {
        var currentNote = noteDisplayEvent && noteDisplayEvent.note;

        if (currentNote){
            if(currentNote.nextNote()) {
                nextNoteButton.enable();
            } else {
                nextNoteButton.disable();
            }
            if(currentNote.previousNote()) {
                console.log("enabling previous note");
                previousNoteButton.enable();
            } else {
                previousNoteButton.disable();
            }

            i$(".favicon-img.active").removeClass("active");
            i$(".favicon-img[data-site-id=" + currentNote.site.id + "]").addClass("active");
            if (currentNote.isBase) {
                showNoNotesOverlay(currentNote.site);
                deleteNoteButton.disable();
            } else {
                hideNoNotesOverlay();
                deleteNoteButton.enable();
            }
        } else {
            nextNoteButton.disable();
            previousNoteButton.disable();
            viewInTrailButton.disable();
            deleteNoteButton.disable();
            noteSelectorButton.disable();
            hideNoNotesOverlay();
        }
    }
    $(document).on("noteDisplayed", updateToolbarUiOnNoteChange);
    $(document).on("trailPreviewCleared", function() { updateToolbarUiOnNoteChange(false) });

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

    function showNoNotesOverlay(site) {
        var overlay = i$(".no-notes-butter-bar-container");
        overlay.css({height: previewHeight - 2});

        i$(".delete-site-button").click(function(e) {
            deleteSite(site, function() {
                site.delete();
            })
        });

        i$(".info-view-site-button").click(function(e) {
            viewNoteInTrail(new BaseRevisionNote(site));
        });
    }

    function hideNoNotesOverlay() {
        var overlay = i$(".no-notes-butter-bar-container");
        overlay.css({height: 0});
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
        if (loggedIn) {
            if (!hasBeenShown) {
                if (infoDisplayShown) {
                    trailPreview.initializeView();
                }
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
        if (noteSelector) {
            noteSelector.hide();
        }
        shown = false;
        $(".inlineSaveButton").remove();
        siteBody.focus();
    }

    function showOrHideNoteSelector() {
        if (noteSelector && shown && infoDisplayShown) {
            if (noteSelector.shown) {
                var selectedNote = noteSelector.getSelectedNote();
                if (selectedNote && (selectedNote !== trailPreview.getCurrentNote())){
                    trailPreview.displayNote(noteSelector.getSelectedNote());
                }
                noteSelector.hide();
            } else {
                noteSelector.show();
            }
        }
    }

    function showOrHideInfoDisplay() {
        if (infoDisplayShown) {
            hideInfoDisplay();
        } else {
            showInfoDisplay();
        }
    }

    function showInfoDisplay() {
        toolbarFrame.css({height: thisToolbar.toolbarInducedOffset() + "px"});
        infoDisplay.css({height: previewHeight + 2 + "px"});
        infoDisplay.css({"border-bottom": "1px solid"});

        showOrHideInfoDisplayButton.html(T.hidePreview);

        nextNoteButton.enable();
        previousNoteButton.enable();
        deleteNoteButton.enable();
        noteSelectorButton.enable();
        viewInTrailButton.enable();

        if (shown && !trailPreview.viewInitialized()) {
            trailPreview.initializeView();
        }

        infoDisplayShown = true;
        LocalStorageTrailAccess.setPreviewShown(true);
    }

    function hideInfoDisplay() {
        toolbarFrame.css({height: toolbarHeight + "px"});
        infoDisplay.css({height: "0"});
        infoDisplay.css({"border-bottom": "none"});

        showOrHideInfoDisplayButton.html(T.showPreview);

        nextNoteButton.disable();
        previousNoteButton.disable();
        deleteNoteButton.disable();
        noteSelectorButton.disable();
        viewInTrailButton.disable();

        infoDisplayShown = false;
        LocalStorageTrailAccess.setPreviewShown(false);
    }

    function clearFaviconHolder() {
        faviconContainer.html("");
    }
    function clearTrailDropdown() {
        trailsDropdownList.html("")
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