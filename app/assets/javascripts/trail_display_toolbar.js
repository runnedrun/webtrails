TToolBar  = function(trailPreview, panelView, noteViewer, canEdit){
    var allNotesShown = false;

    var thisToolbar = this;
    var nextNoteButton = $("#nextNote").click(trailPreview.showNextNote);
    var previousNoteButton = $("#previousNote").click(trailPreview.showPreviousNote);
//    var nextSiteButton = $("#nextSite").click(trailPreview.showNextSite);
//    var previousSiteButton = $("#previousSite").click(trailPreview.showPreviousSite);
    var showCommentButton = $(".showCommentButton").click(trailPreview.toggleOrUntoggleCommentBox);
    var removeSiteButton = $("#removeSite").click(trailPreview.deleteCurrentSite);
    var visitSiteButton = $("#goToSite").click(function() {
        open(trailPreview.getCurrentNote().site.url)
    });
    var showAllNotesButton = $("#show-all-notes-button");
    showAllNotesButton.click(function() {
        if (!allNotesShown) {
            trailPreview.displayAllNotes();
        } else {
            trailPreview.turnOffAllNotesDisplay();
        }
    });
    var showAllSitesbutton = $("#showAllSitesButton").click(panelView.showOrHide);
    var siteFavicons = $(".click-to-change-site").click(changeToSiteOnClick);
    var faviconContainer = $(".siteFavicons").sortable({
        containment: ".siteFaviconsHolder",
        update: changeSiteOrder
    });
    var noteViewModeButton = $("#noteViewMode").click(noteViewer.initOrDisableNoteView);

    if (canEdit) {
        removeSiteButton.show();
    }

    $(document).on("showAllNotesOn", function() {
        allNotesShown = true;
        showAllNotesButton.removeClass("inactive");
    });
    $(document).on("showAllNotesOff", function() {
        allNotesShown = false;
        showAllNotesButton.addClass("inactive");
    });

    function changeSiteOrder(event, ui){
        var faviconThatWasDragged = ui.item;
        var siteID;
        var siteArray = []

        $(".siteFavicons").children().each(function(faviconIndex,child){
            var $child = $(child);
            var $faviconImage = $child.find(".faviconImage");
            siteID = $faviconImage.data("site-id");
            siteArray.push(siteID);
            if ($faviconImage.hasClass("activeFavicon")){
                window.location.hash = faviconIndex;
            }
        });

        Trail.updateSiteOrder(siteArray);
        Request.updateSiteOrder(Trail, siteArray);
        //rearranging the iframes if show all sites is toggled
        thisToolbar.update(trailPreview.getCurrentNote());
    }

    function changeToSiteOnClick(e) {
        var faviconElement = $(e.delegateTarget);
        trailPreview.showSite(Trail.getSite(faviconElement.data("site-id")));
    }

    function enableOrDisableButtons(currentNote) {
        if(currentNote && currentNote.nextNote()) {
            nextNoteButton.enable();
        } else {
            nextNoteButton.disable();
        }

        if(currentNote && currentNote.previousNote()) {
            console.log("enabling previous note");
            previousNoteButton.enable();
        } else {
            previousNoteButton.disable();
        }

        if (currentNote) {
            removeSiteButton.enable();
            visitSiteButton.enable();
            showAllSitesbutton.enable();
        } else {
            removeSiteButton.disable();
            visitSiteButton.disable();
            showAllSitesbutton.disable();
        }

        if (currentNote.site.getFirstNote()) {
            showAllNotesButton.enable();
        } else {
            showAllNotesButton.disable();
        }
    }

    function updateNoteCount(currentNote){
        if (currentNote && currentNote.site.getNoteCount() > 0){
            $(".note-count").html(currentNote.getPositionInSite() + "/" + currentNote.site.getNoteCount());
        } else {
            $(".note-count").html("0");
        }
    }

    function expandCurrentSiteFavicon(currentNote) {
        $(".faviconImage").removeClass("active-favicon");
        if (currentNote) {
            $(".faviconImage[data-site-id=" + currentNote.site.id + "]").addClass("active-favicon");
        }
    }

    this.removeFavicon = function(site) {
        $('[data-site-id=' + site.id + ']').remove();
    };

    this.update = function(currentNote) {
        enableOrDisableButtons(currentNote);
        updateNoteCount(currentNote);
        expandCurrentSiteFavicon(currentNote);
        if (panelView.isShown()) {
            panelView.update();
        }
    };

    function toggle(onFunction, offFunction) {
        var toggled = false;
        return function() {
            if (toggled) {
                toggled = false;
                offFunction();
            } else {
                toggled = true;
                onFunction();
            }
        }
    }

    showAllSitesbutton.disable =
        visitSiteButton.disable =
            previousNoteButton.disable =
                showAllNotesButton.disable = function() {
        this.prop('disabled', true);
        this.removeClass("btn-info").css("opacity",".5");
        this.enabled = false;
    };

    showAllSitesbutton.enable =
        visitSiteButton.enable =
            previousNoteButton.enable =
                showAllNotesButton.enable = function() {
        this.prop('disabled', false);
        this.addClass("btn-info").css("opacity",1);
        this.enabled = true;
    };

    nextNoteButton.enable = function() {
        this.prop('disabled', false);
        this.addClass("btn-success").css("opacity",1);
        this.enabled = true;
    };

    nextNoteButton.disable = function() {
        this.prop('disabled', true);
        this.removeClass("btn-success").css("opacity",".5");
        this.enabled = false;
    };

    removeSiteButton.disable = function() {
        this.prop('disabled', true);
        this.removeClass("btn-danger").css("opacity",".5");
        this.enabled = false;
    };

    removeSiteButton.enable = function() {
        this.prop('disabled', false);
        this.addClass("btn-danger").css("opacity",1);
        this.enabled = true;
    };

    nextNoteButton.disable();
    previousNoteButton.disable();
    removeSiteButton.disable();
    visitSiteButton.disable();
    showAllSitesbutton.disable();
};