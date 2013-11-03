TToolBar  = function(trailPreview){
    var nextNoteButton = $("#nextNote").click(trailPreview.showNextNote);
    var previousNoteButton = $("#previousNote").click(trailPreview.showPreviousNote);
    var nextSiteButton = $("#nextSite").click(trailPreview.showNextSite);
    var previousSiteButton = $("#previousSite").click(trailPreview.showPreviousSite);
    var showCommentButton = $(".showCommentButton").click(trailPreview.toggleOrUntoggleCommentBox);
    var removeSiteButton = $("#removeSite").click(trailPreview.deleteCurrentSite);

    this.enableOrDisablePrevAndNextButtons = function(currentNote) {
        if(currentNote && currentNote.nextNote()) {
            nextNoteButton.enable();
        } else {
            nextNoteButton.disable();
        }
        if(currentNote && !(currentNote.previousNote() == "base")) {
            console.log("enabling previous note");
            previousNoteButton.enable();
        } else {
            previousNoteButton.disable();
        }
        this.updateNoteCount(currentNote);
    };

    this.updateNoteCount = function(currentNote){
        if (currentNote && currentNote.site.getNoteCount() > 0){
            $(".note-count").html(currentNote.getPositionInSite() + "/" + currentNote.site.getNoteCount());
        } else {
            $(".note-count").html("0");
        }
    };

    nextNoteButton.disable = previousNoteButton.disable = function() {
        this.prop('disabled', true);
        this.removeClass("btn-info").css("opacity",".5");
        this.enabled = false;
    }

    nextNoteButton.enable = previousNoteButton.enable = function() {
        this.prop('disabled', false);
        this.addClass("btn-info").css("opacity",1);
        this.enabled = true;
    }
}