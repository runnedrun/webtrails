function getNotesObject(siteId){
    var notesObject = {noteObjects:{},order:[]};
    var noteIdList = getNoteList(siteId);
    wt_$.each(noteIdList,function(i,noteId){
        var noteObject = notesObject["noteObjects"][noteId] = {}
        var commentObject = getNoteCommentObject(noteId)
        noteObject["comment"] = commentObject["comment"];
        noteObject["clientSideId"] = commentObject["clientSideId"]
        noteObject["siteRevisionNumber"] = getRevisionNumber(noteId);
        noteObject["id"] = noteId;
    })
    notesObject["order"] = noteIdList;
    return notesObject;
}

function updateNoteData(noteIdsInOrder, noteDatas, siteId){

    var oldNoteList = getNoteList(siteId);
    wt_$.each(oldNoteList, function(i,noteId) {
        var noteInNewList = noteIdsInOrder.indexOf(noteId) > -1;
        if (!noteInNewList) {
            removeNote(noteId);
        }
    });

    wt_$.each(noteIdsInOrder, function(index, noteId){
        var noteData = noteDatas[noteId];
        addNoteCommentToLocalStorage(noteId, noteData["comment"], noteData["client_side_id"])
        setRevisionNumber(noteId, noteData.site_revision_number);
    });
    setNoteList(siteId, noteIdsInOrder);
}

function addNoteCommentToLocalStorage(noteId,noteComment,clientSideId){
    localStorage[String(noteId)+":commentAndClientSideId"] = String(clientSideId) + "/wt/" + noteComment;
}

function removeNoteCommentsFromLocalStorage(noteId){
    localStorage.removeItem(String(noteId)+":commentAndClientSideId");
}

function removeNote(noteId){
    removeNoteCommentsFromLocalStorage(noteId);
    removeRevisionNumber(noteId);
}

function removeAllNotesForSite(siteId){
    var noteIdList = getNoteList(siteId);
    wt_$.each(noteIdList,function(i,noteId){
        removeNote(noteId);
    });
    removeNoteList(siteId);
}

function setNoteList(siteId, noteList) {
    localStorage[String(siteId) + ":noteIdList"] = noteList.join(",");
}

function getNoteList(siteId){
    var noteIdString = localStorage[String(siteId)+":noteIdList"];
    if (noteIdString){
        return noteIdString.split(",")
    } else {
        return [];
    }
}

function removeNoteList(siteId) {
    localStorage.removeItem(String(siteId)+":noteIdList");
}

function setRevisionNumber(noteId, revisionNumber) {
    localStorage[String(noteId)+":siteRevisionNumber"] = revisionNumber;
}

function getRevisionNumber(noteId) {
    return localStorage[String(noteId)+":siteRevisionNumber"]
}

function removeRevisionNumber(noteId) {
    localStorage.removeItem(String(noteId)+":siteRevisionNumber");
}

function getNoteCommentObject(noteId){
    var noteCommentObject = {};
    var commentAndClientSideId =  localStorage[String(noteId) + ":commentAndClientSideId"];
    if (commentAndClientSideId){
        var split = commentAndClientSideId.split("/wt/");
        noteCommentObject["clientSideId"] = split[0];
        noteCommentObject["comment"] = split.slice(1).join("/wt/");
        return noteCommentObject;
    }
    else{
        return {};
    }
}
