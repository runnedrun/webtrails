NoteViewer = function (trailPreview, halfPageViewScale) {
    var noteViewActive = false;
    var fullCommentsToggled = false
    var $toggleNoteViewButton = $("#showNoteList");
    var $toggleFullCommentsButton = $(".show-full-comments");
    var $noteViewerToolbar = $(".note-viewer-toolbar");
    var $noteViewerToolbarMouseOverTarget = $(".note-viewer-toolbar-mouseover-target");

    $toggleFullCommentsButton.click(toggleFullComments);
    $noteViewerToolbarMouseOverTarget.mouseenter(showNoteViewerToolbar);
    $noteViewerToolbar.mouseleave(hideNoteViewerToolbar);

    var Statics = {
        untoggledButtonText: "Research View",
        toggledButtonText: "Presentation View"
    }
    var $noteList = $(".noteViewer");
    var $noteViewerToolbar = $(".note-viewer-toolbar");
    $(".noteInfo").click(clickJumpToNote);

    if (canEdit()) {
        makeNotesDragable();
        $(".note-view-comment").click(editNoteIfSelected);
    }

    var thisNoteViewer = this;

    this.initOrDisableNoteView = function() {
        if (noteViewActive){
            thisNoteViewer.disableNoteViewMode();
        }else{
            initNoteViewMode()
        }
    };

    this.addNote = function(note, noteElementString) {
        var noteElement = $(noteElementString);
        $(".noteWrapper[data-site-id=" + note.site.id + "]").append(noteElement);
        noteElement.click(clickJumpToNote);
        noteElement.find(".noteContent").dotdotdot();
        noteElement.find(".noteComment").dotdotdot();
        if (canEdit()) {
            makeNoteElementDragable(noteElement);
            noteElement.find(".note-view-comment").click(editNoteIfSelected);
        }
    };

    function initNoteViewMode(){
        if (PanelView.isShown()) {
            PanelView.hidePanels();
        }
        trailPreview.enableHalfPageView();
        showNoteList();
        thisNoteViewer.highlightNoteInList(trailPreview.getCurrentNote());
        $toggleNoteViewButton.text(Statics.toggledButtonText);
        noteViewActive = true;
    }

    this.disableNoteViewMode = function() {
        trailPreview.disableHalfPageView();
        hideNoteList();
        $toggleNoteViewButton.text(Statics.untoggledButtonText);
        noteViewActive = false;
    }

    function editNoteIfSelected(e){
        console.log("editing note");
        var noteComment = $(e.delegateTarget);
        if (noteComment.parent().closest(".noteInfo").hasClass("selected-note")){
            editCommentText(noteComment);
            return false
        }
    }

    function editCommentText($commentElement) {
        $commentElement.unbind("click", editNoteIfSelected);

        var note = Trail.getNote($commentElement.data("note-id"));

        $commentElement.attr("contentEditable","true");

        function updateNoteOnClick(e) {
            if ((e.target != $commentElement[0])){
                Request.updateNoteComment(note, $commentElement.html(), function(resp) {
                    noteUpdateCallback(resp, $commentElement);
                });
                unbindEditEvents()
            }
        }

        function updateNoteOnKeypress(e) {
            console.log("got keypress");
            var code = (e.keyCode ? e.keyCode : e.which);
            if (code == 13 && !e.shiftKey){
                Request.updateNoteComment(note, $commentElement.html(), function(resp){
                    noteUpdateCallback(resp, $commentElement);
                });
                unbindEditEvents()
                return false
            }
        }

        function unbindEditEvents() {
            $(document).unbind("click", updateNoteOnClick);
            $commentElement.unbind("keypress", updateNoteOnKeypress);
        }

        $commentElement.keypress(updateNoteOnKeypress);
        $(document).click(updateNoteOnClick);
        $commentElement.focus();
        return false
    }

    function noteUpdateCallback(resp, $commentElement) {
        console.log("updated content of notes");
        var newComment = resp.updateHash.comment || $commentElement.html();

        $commentElement.attr("contentEditable","false");
        $commentElement.click(editNoteIfSelected);
        $commentElement.blur(); // lose focus, and blue highlight
        var note = Trail.getNote($commentElement.data("note-id"));
        var currentComment = trailPreview.getCurrentComment();

        // TODO: Just use the event triggered by the note update to update the inline comment
        // it may be that the user has changed to a new comment, in which we don't need to update anything
        if (currentComment.sourceNote == note) {
            currentComment.update()
        }

        $commentElement.html(newComment);
    }

    function clickJumpToNote(e) {
        var noteWrapper = $(e.delegateTarget);
        if (!noteWrapper.hasClass("selected-note")) {
            var noteId = noteWrapper.data("note-id");
            trailPreview.displayNote(Trail.getNote(noteId));
        }
    }

    function toggleFullComments() {
        if (fullCommentsToggled) {
            hideFullComments();
        } else {
            showFullComments();
        }
        fullCommentsToggled = !fullCommentsToggled;
    }

    function showFullComments() {
        $(".note-view-comment").trigger("destroy.dot").css("max-height","none");
        $toggleFullCommentsButton.val("Hide Full Comments")
    }

    function hideFullComments() {
        // ellipsize all the comments except the selected one
        $(".noteInfo:not(.selected-note)").find(".note-view-comment").css("max-height","").dotdotdot();
        $toggleFullCommentsButton.val("Show Full Comments")
    }

    function showNoteViewerToolbar() {
        console.log("showing the toolbar");
        $noteViewerToolbar.animate({"top": "0"}, 100);
    }

     function hideNoteViewerToolbar() {
         console.log("hiding the toolbar");
        // make sure to sync the top with the height of the element in css
         $noteViewerToolbar.animate({"top": "-32px"}, 100);
    }

    this.highlightNoteInList = function(note){
        unhighlightNoteInList();
        if(note.isBase) {
            // selecting a site
            $(".note-list-header [data-site-id=" + note.site.id + "]").addClass("selected-note");
        } else {
            var $noteElement = $(".noteInfo[data-note-id=" + note.id + "]");
            $noteElement.addClass("selected-note");

            var commentElement = $noteElement.find(".noteComment");
            commentElement.trigger("destroy.dot").css("max-height","none");
        }
    };

    function updateNote(note) {
        $("[data-note-id="+note.id+"].noteComment").html(note.comment);
    }

    function unhighlightNoteInList(selector){
        $(".selected-note").removeClass("selected-note").find(".noteComment").css("max-height","").dotdotdot();
    }

    function showNoteList(){
        $noteList.show().css({
            "width": 100-(halfPageViewScale * 100)+"%"
        });
        $noteViewerToolbar.css({
            "width": 100-(halfPageViewScale * 100)+"%"
        });
        $noteViewerToolbarMouseOverTarget.css({
            "width": 100-(halfPageViewScale * 100)+"%"
        });

        $(".noteContent").dotdotdot();
        $(".noteComment").dotdotdot();
        $(".note-header-wrapper").dotdotdot();
    }

    function hideNoteList(){
        $noteList.hide();
    }

    this.removeSiteFromNoteList = function(site) {
        $(".note-list-header[data-site-id="+site.id+"]").remove();
        $(".noteInfo[data-site-id="+site.id+"]").remove();
    }

    this.removeNoteFromNoteList = function(note) {
        $(".noteInfo[data-note-id="+note.id+"]").remove();
    }

    function makeNotesDragable(){
        $(".noteWrapper").each(function(i,wrapper){
            makeNoteElementDragable($(wrapper));
        })
    }

    function makeNoteElementDragable($noteElement) {
        $noteElement.sortable({
            containment: $noteElement,
            update: updateNoteOrder,
            items: ".noteInfo"
        });
    }

    function updateNoteOrder(event, ui) {
        console.log("updated note order");
        var noteThatWasDragged = $(ui.item);
        var siteId = noteThatWasDragged.data("site-id");
        var noteArray = $.makeArray($(".noteInfo[data-site-id="+siteId+"]").map(function(i,note){
            return parseInt($(note).data("note-id"));
        }));
        console.log(noteArray);
        Trail.getSite(siteId).updateNoteOrder(noteArray);
        Toolbar.update(trailPreview.getCurrentNote());
        Request.updateNoteOrder(noteArray, siteId);
    }

    $(document).on("note.update", function(event) {
        updateNote(event.note);
    })
}
