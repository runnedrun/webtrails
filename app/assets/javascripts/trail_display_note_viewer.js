NoteViewer = function (trailPreview, halfPageViewScale) {
    var noteViewActive = false;
    var $toggleNoteViewButton = $("#showNoteList");
    var Statics = {
        untoggledButtonText: "Research View",
        toggledButtonText: "Presentation View"
    }
    var $noteList = $(".noteViewer");
    makeNotesDragable();
    var thisNoteViewer = this;

    this.initOrDisableNoteView = function() {
        if (noteViewActive){
            disableNoteViewMode();
        }else{
            initNoteViewMode()
        }
    };

    function initNoteViewMode(){
        if ($('iframe').hasClass('shrunk')) {
            PanelView.hidePanels();
        }
        trailPreview.enableHalfPageView();
        showNoteList();
        thisNoteViewer.highlightNoteInList(trailPreview.getCurrentNote());
        $toggleNoteViewButton.text(Statics.toggledButtonText);
        noteViewActive = true;
    }

    function disableNoteViewMode(){
        trailPreview.disableHalfPageView();
        hideNoteList();
        $toggleNoteViewButton.text(Statics.untoggledButtonText);
        noteViewActive = false;
    }

    function makeNoteCommentEditable(e){
        console.log("editing note");
        var noteInfo = $(e.delegateTarget);
        if (noteInfo.parent().parent().hasClass("selected-note")){
            editCurrentComment(noteInfo);
            return false
        }
    }

    function updateNoteOnClickAway(e,$commentText) {
        console.log("checking for click away", e.target);
        console.log($commentText.parent()[0]);
        if ((e.target != $commentText[0])){
            // if the click is anywhere but the comment then save the note and unselect
            console.log("saving note");
            saveCommentToServer($commentText);
        }
    }

    function clickJumpToNote(e){
        var noteWrapper = $(e.delegateTarget);
        console.log(noteWrapper.data());
        var noteID = noteWrapper.data("note-id");
        var siteID = noteWrapper.data("site-id");
        // close the last note
        console.log(getCurrentSiteID(),siteID);
        if ( String(siteID) != getCurrentSiteID()){
            console.log("switching sites")
            switchToSite(siteID);
        }
        scrollToAndHighlightNote(noteID);
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

    function removeSiteFromNoteList(site){
        var header = $(".note-list-header[data-site-id="+site.id+"]");
        var notes =  $(".noteInfo[data-site-id="+site.id+"]");

        header.remove();
        notes.remove();
    }

    function removeNoteFromNoteList(note){
        var note =  $(".noteInfo[data-note-id="+note.id+"]");
        note.remove();
    }

    function makeNotesDragable(){
        $(".noteWrapper").each(function(i,wrapper){
            $(wrapper).sortable({
                containment: $(wrapper),
                update: updateNoteOrder,
                items: ".noteInfo"
            });
        })
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
