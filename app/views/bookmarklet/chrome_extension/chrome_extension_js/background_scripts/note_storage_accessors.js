function getNotesObject(siteId){
    var notesObject = {noteObjects:{},order:[]};
    var noteIdList = getNoteList(siteId);
    wt_$.each(noteIdList,function(i,noteId){
        notesObject["noteObjects"][noteId] = getNoteCommentObject(noteId);
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
        addNoteToLocalStorage(noteId, noteData)
    });
    setNoteList(siteId, noteIdsInOrder);
}

function addNoteToLocalStorage(noteId, noteData){
    localStorage[String(noteId)+":note"] = JSON.stringify(noteData);
}

function removeNote(noteId){
    localStorage.removeItem(String(noteId)+":note");
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

function getNoteCommentObject(noteId){
    var noteCommentObject = {};
    var commentJSON=  localStorage[String(noteId) + ":note"];
    if (commentJSON){
        var commentObject  = JSON.parse(commentJSON);
        noteCommentObject["comment"]  = commentObject.comment;
        noteCommentObject["clientSideId"]  = commentObject.client_side_id;
        noteCommentObject["scrollX"] = commentObject.scrollX;
        noteCommentObject["scrollY"] = commentObject.scrollY;
        noteCommentObject["siteRevisionNumber"] = commentObject.site_revision_number;
        noteCommentObject["id"] = commentObject.id;
        return noteCommentObject;
    }
    else{
        return {};
    }
}
