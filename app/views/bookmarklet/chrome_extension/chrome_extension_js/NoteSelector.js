console.log("note selector loaded");

var NoteSelector = function(selectorContainer, background, trailPreview, viewportHeight, trail) {
    this.shown = false;
    var thisNoteSelector = this;
    var noteElements = [];
    var snapped = {snapped: false};
    var currentNotePosition;
    var noteHeight = 50;
    var bottomLimit;
    var containerFooter = selectorContainer.find(".buffer.note-selector-footer");
    var noNotesDisplay = false;

    var HTML = {
        noteElement: function(note) {
            return $(
                "<tr class='snap selected' data-site-id='" + note.site.id + "' data-note-id='" + note.id + "' >" +
                    "<td class='note-content-cell'>" +
                        "<div class='note-content'>" +
                            "<img class='note-selector-favicon' src='" + note.site.faviconUrl + "' />" + note.content +
                        "</div>" +
                    "</td>" +
                    "<td class='note-comment-cell'>" +
                        "<div class='note-comment'>" +
                            note.comment +
                        "</div>" +
                    "</td>" +
                "</tr>")
        },
        noNotesInfo: $(
            "<tr class='snap selected no-notes-in-selector buffer'>" +
                "<th colspan='2'>" +
                    "Use this to scroll through and select notes...once you've taken a few!" +
                "</td>" +
            "</tr>")
    }

    this.show = function() {
        background.show();
        selectorContainer.css({visibility: "visible"});
        scrollToCurrentNote();
        bottomLimit = selectorContainer[0].scrollHeight - viewportHeight;
        thisNoteSelector.shown = true;
    };

    this.hide = function() {
        background.hide();
        selectorContainer.css({visibility: "hidden"});
        thisNoteSelector.shown = false;
    };

    this.getSelectedNote = function() {
        if (!noNotesDisplay) {
            var site = trail.getSite(noteElements[currentNotePosition].data("site-id"));
            var note = site.getNote(noteElements[currentNotePosition].data("note-id"));
            return note;
        } else {
            return false
        }

    }

    function insertNoteIntoSelector(note) {
        console.log("inserting note with id " + note.id);
        var noteElement = HTML.noteElement(note);
        if (noNotesDisplay) {
            noNotesDisplay.remove();
            noNotesDisplay = undefined;
        }
        containerFooter.before(noteElement);
        noteElements.push(noteElement);
    }

    function getNotePosition(scrollTop) {
        return Math.round(scrollTop / noteHeight);
    }

    function switchToPosition(newNotePosition) {
        if (newNotePosition !== currentNotePosition) {
            console.log("pos switching from " + currentNotePosition + " to " + newNotePosition);
            var oldNotePosition = currentNotePosition;
            currentNotePosition = newNotePosition;
            noteElements[currentNotePosition].addClass("selected");
            if (!(oldNotePosition == undefined)) {
                noteElements[oldNotePosition].removeClass("selected");
            }
        }
    }

    function scrollToCurrentNote() {
        var newPosition = false;
        $.each(noteElements, function(i, elem) {
            console.log("looking at note with id: " + elem.data("note-id"));
            if (elem.data("note-id") === trailPreview.getCurrentNote().id) {
                newPosition = i;
                return false
            }
        });
        if (newPosition !== false) {
            if (currentNotePosition !== newPosition) {
                selectorContainer.scrollTop(newPosition * 50);
                switchToPosition(newPosition);
            }
        } else if(!noNotesDisplay) {
            // no notes right now
            noNotesDisplay = HTML.noNotesInfo;
            containerFooter.before(noNotesDisplay);
        }
    }

    $.each(trail.getSites(), function(i, site) {
        $.each(site.getNotes(), function(i, note) {
            insertNoteIntoSelector(note);
        })
    });

    // setup the elipsis so that the content stays the same as the font size increases
    var snaps = selectorContainer.find(".snap");
    snaps.addClass("selected").find(".note-content, .note-comment").dotdotdot();
    snaps.removeClass("selected");

    snapped.snapped = true;

    selectorContainer.scrollsnap({
        snaps: '.snap',
        proximity: 50,
        offset: -1 * noteHeight,
        latency: 250,
        onSnap: function(elem) {
            console.log("snapping")
            elem.addClass("snapped");
        },
        snapped: snapped,
        shouldSnap: function() {
            var currentScroll = selectorContainer.scrollTop();
            return (currentScroll > 30) && (currentScroll < bottomLimit)
        }
    });

    selectorContainer.scroll(function(e) {
        if (!noNotesDisplay) {
            var currentScroll = selectorContainer.scrollTop();
            var newNotePosition = getNotePosition(currentScroll);

            if (newNotePosition === noteElements.length + 1) {
                newNotePosition =  noteElements.length
            }

            console.log("new note position is: " + newNotePosition);

            switchToPosition(newNotePosition);
        }
        if (snapped.snapped) {
            if ((currentScroll > 10) && currentScroll < bottomLimit) {
                console.log("snapped set to false");
                snapped.snapped = false;
            }
        }
    })

    $(document).on("newNote", function(e) {
        insertNoteIntoSelector(e.note);
    });
}