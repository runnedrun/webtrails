console.log('toolbar ui loaded');
function WtToolbar(toolbarHtml, messageScreenHtml) {
    var thisToolbar = this;
    var toolbarFrame;
    var toolbarBody;
    var toolbarHeight;
    var trailPreview;
    var previewContainer;
    var previewHeight = 150;
    var loggedIn = false
    var siteBody = $(document.body);
    var shown = false;

    this.bodyMarginTop = siteBody.css("margin-top");
    this.bodyPosition = siteBody.css("position");

    var Text = {
        noNotesOnSiteMessage: "No saved notes on this site. Hit the visit site button to go to the live version.",
        noNotesInTrailMessage: "No saved notes in this Trail. View this trail to see sites you've saved without notes.",
        noTrailsMessage: '<a href="http://www.webtrails.co">Create a Trail</a> to use the toolbar',
        noSitesInTrailMessage: 'No Sites in this trail. Take a note on this page, or hit the save site button.',
        loggedOutMessage: function(logInButton) {
            return "You are now logged out. " + logInButton[0].outerHTML + " with Google, or create an account."
        }
    };
    var CSS = {
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
        helpFrame: {
            height: previewHeight + "px"
        }
    };
    var HTML = {
        toolbarFrame: $("<iframe class='wt-toolbar-frame webtrails'></iframe>").
            attr({'src': "about:blank", 'frameborder': 0}).
            css(CSS.toolbarFrame),
        faviconImg: function(faviconUrl) {
            return $("<img src='"+ faviconUrl + "' class=\"webtrails\">").css(CSS.faviconImg)
        },
        trailDropdownItem: function(trailName, trailId) {
            return $('<li role="presentation"><a role="menuitem" data-trail-id="' + trailId + '" tabindex="-1" href="#">' + trailName + '</a></li>')
        },
        helpFrame: function() {
            return $("<iframe class='help-frame'></iframe>").attr({
                src: "about:blank",
                frameborder: "0"
            }).css(CSS.helpFrame)
        },
        logInButton: $("<a class='preview-login-button'>Log In</a>")
    };

    var toolbarFrame = HTML.toolbarFrame
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

    commentBox.css({
        "margin-top": toolbarHeight,
        height: previewHeight
    });

    var previewContainer = i$(".trail-preview-container");
    trailPreview = new TPreview(
        previewContainer, previewHeight, nextNoteButton, previousNoteButton, showCommentButton, deleteNoteButton,
        commentBox, checkForShowToolbarKeypress, closeDropdowns, thisToolbar
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
            addFavicon(site);
        });
        trailNameContainer.val(trail.name);
        viewTrailButton.off('click').click(function() {
            open(webTrailsUrl + "/trails/" + trail.id, "_blank");
        });
        trailPreview.initWithTrail(trail);
    };

    this.updateToolbarWithTrails = function(trailsObject) {
        if (Trails.getCurrentTrail()){
            thisToolbar.switchToTrail(trailsObject.getCurrentTrail());
            $.each(trailsObject.getTrailHash(), function(id, trail) {
                var dropDownItem = HTML.trailDropdownItem(trail.name, trail.id);
                dropDownItem.off('click').click(function(){
                    thisToolbar.switchToTrail(trail)
                });
                trailsDropdownList.append(dropDownItem);
            });
        } else {
            showNoTrailsHelp();
        }
    };

    this.isShown = function() {
        return shown;
    };

    this.setSaveButtonToSaving = function() {
        saveSiteButton.html("Site saving").addClass("saving");
        siteSavingSpinner.css({
            "visibility": "visible"
        });
        saveSiteButton.unbind("click", saveSiteToTrail);
    };

    this.setSaveButtonToSaved = function(siteId, trailId) {
        saveSiteButton.html("Site saved");
        siteSavingSpinner.css({
            "visibility": "hidden"
        });
        siteSavingSpinner.hide();
        saveSiteButton.click(function() {
            open(webTrailsUrl + "/trails/" + trailId + "#" + siteId, "_blank");
        });
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
                showNoNotesOnSiteHelp();
            }
        });
        faviconContainer.append(faviconImg);
    }

    function showMessageScreen(message) {
        var helpIframe = HTML.helpFrame();
        previewContainer.html(helpIframe);
        var messageScreenDoc = thisToolbar.setIframeContent(helpIframe, messageScreenHtml);
        thisToolbar.i$(helpIframe, ".message-box").html(message);
        return messageScreenDoc;
    }

    function showNoNotesOnSiteHelp() {
        showMessageScreen(Text.noNotesOnSiteMessage);
    };

    function showNoTrailsHelp() {
        showMessageScreen(Text.noTrailsMessage);
    };

    this.showNoNotesInTrailHelp = function() {
        showMessageScreen(Text.noNotesInTrailMessage);
    };

    this.showNoSitesInTrailHelp = function() {
        showMessageScreen(Text.noSitesInTrailMessage);
    };

    this.initSignedInExperience = function() {
        loggedIn = true;
        console.log("signed in");
        loginButton.hide();
        logoutButton.show();

        i$(".fade-on-logout").prop('disabled', false);

        $(document).mousedown(possibleHighlightStart);
    }

    this.initSignedOutExperience = function () {
        console.log("initing signed out experience");
        var previewLoginButton = HTML.logInButton;
        var messageScreenDoc = showMessageScreen(Text.loggedOutMessage(previewLoginButton));
        $(messageScreenDoc).find(".preview-login-button").click(signIn);

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
        shown = true
        toolbarFrame.focus();
        toolbarFrame.css({
            visibility: "visibile"
        })
        toolbarBody.css({
            visibility: "visible"
        });
        trailPreview.show();
        if (loggedIn) {
            if (mouseDown == 0) { // if the mouse is not pressed (not highlighting)
                highlightedTextDetect(); // check to see if they highlighted anything for the addnote button
            } else { // mouse is down, must be highlighting
                possibleHighlightStart(); // get that highlight start event so when done highlighting, addnote appears
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
        shown = false;
        $(".inlineSaveButton").remove();
        siteBody.focus();
        closeOverlay();
    }

    function clearFaviconHolder() {
        faviconContainer.html("");
    }

    function checkForShowToolbarKeypress(e){
        console.log("verifying keypress");
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 27 && e.shiftKey){    //tilda = 192, esc is code == 27
            showOrHide();
        }
    }

    if (wt_auth_token){
        thisToolbar.initSignedInExperience()
    } else {
        thisToolbar.initSignedOutExperience()
    }
//
    $(document.body).keydown(checkForShowToolbarKeypress);
    thisToolbar.getIDoc(toolbarFrame).keydown(checkForShowToolbarKeypress);

    //weird fix for some sites
    try {
        var bodymargin = $('body').css('margin-left')
        if (bodymargin) {
            trailDisplay.css("margin-left", "-" + bodymargin);
        }
    }catch (e) {}
}

WtToolbar.prototype = IframeManager