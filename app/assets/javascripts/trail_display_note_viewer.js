NoteViewer = function (trailPreview, halfPageViewScale) {
    var noteViewActive = false;
    var $toggleNoteViewButton = $("#showNoteList");
    var Statics = {
        untoggledButtonText: "Research View",
        toggledButtonText: "Presentation View"
    }
    var $noteList = $(".noteViewer");
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
        if (noteComment.parent().parent().hasClass("selected-note")){
            editCommentText(noteComment);
            return false
        }
    }

    function editCommentText($commentElement) {
        $commentElement.unbind("click", editNoteIfSelected);

        var note = Trail.getNote($commentElement.data("note-id"));

        $commentElement.attr("contentEditable","true");

        $(document).click(function(e) {
            if ((e.target != $commentElement[0])){
                Request.updateNoteComment(note, $commentElement.html(), function(resp) {
                    noteUpdateCallback(resp, $commentElement);
                });
            }
        });

        $commentElement.keypress(function(e){
            console.log("got keypress");
            var code = (e.keyCode ? e.keyCode : e.which);
            if (code == 13 && !e.shiftKey){
                Request.updateNoteComment(note, $commentElement.html(), function(resp){
                    noteUpdateCallback(resp, $commentElement);
                });
                return false
            }
        });

        $commentElement.focus();
        return false
    }

    function noteUpdateCallback(resp, $commentElement) {
        var newComment = resp.comment || $commentElement.html();

        $commentElement.attr("contentEditable","false");
        $commentElement.click(editNoteIfSelected);
        $commentElement.blur(); // lose focus, and blue highlight
        var note = Trail.getNote($commentElement.data("note-id"));
        note.updateComment(newComment);
        trailPreview.getCurrentComment().update();
        $commentElement.html(newComment);
    }

    function clickJumpToNote(e){
        var noteWrapper = $(e.delegateTarget);
        if (!noteWrapper.hasClass("selected-note")) {
            var noteId = noteWrapper.data("note-id");
            trailPreview.displayNote(Trail.getNote(noteId));
        }
    }

    this.highlightNoteInList = function(note){
        unhighlightCurrentNoteInList();
        if(note.isBase) {
            $(".note-list-header[data-site-id=" + note.site.id + "]").addClass("selected-note");
        } else {
            var $noteElement = $(".noteInfo[data-note-id=" + note.id + "]");
            $noteElement.addClass("selected-note");

            $(".noteComment").css({
                "cursor":"pointer"
            })
            $noteElement.find(".noteComment").css({
                "cursor": "text"
            })

            var contentElement = $noteElement.find(".noteContent");
            contentElement.trigger("destroy.dot").css("max-height","none");
        }
    };

    function unhighlightCurrentNoteInList(){
        $(".selected-note").removeClass("selected-note").find(".noteContent").css("max-height","").dotdotdot();
    }

    function showNoteList(){
        $noteList.show().css({
            "width": 100-(halfPageViewScale * 100)+"%"
        });
        $(".noteContent").dotdotdot();
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
}
