function getNotesObject(siteId){
    var notesObject = {noteObjects:{},order:[]};
    var noteIdList = getNoteIdListFromLocalStorage(siteId);
    wt_$.each(noteIdList,function(i,noteId){
        var noteObject = notesObject["noteObjects"][noteId] = {}
        var commentObject = getNoteCommentObject(noteId)
        noteObject["comment"] = commentObject["comment"];
        noteObject["clientSideId"] = commentObject["clientSideId"]
        noteObject["id"] = noteId;
    })
    notesObject["order"] = noteIdList;
    return notesObject;
}

function updateNoteData(newNoteIdList,noteIdsToCommentsAndClientSideIds,siteId){
    wt_$.each(newNoteIdList, function(i,noteId){
        var commentAndClientSideId = noteIdsToCommentsAndClientSideIds[noteId];
        addNoteCommentToLocalStorage(noteId, commentAndClientSideId["comment"], commentAndClientSideId["client_side_id"])
    })
    localStorage[String(siteId)+":noteIdList"] = newNoteIdList.join(",");
}

function addNoteCommentToLocalStorage(noteId,noteComment,clientSideId){
    localStorage[String(noteId)+":commentAndClientSideId"] = String(clientSideId) + "/wt/" + noteComment;
}

function getNoteIdListFromLocalStorage(siteId){
    var noteIdString = localStorage[String(siteId)+":noteIdList"];
    if (noteIdString){
        return noteIdString.split(",")
    } else {
        return [];
    }
}

function removeNoteCommentsFromLocalStorage(noteId){
    localStorage.removeItem(String(noteId)+":commentAndClientSideId");
}

function removeAllNotesForSite(siteId){
    var noteIdList = getNoteIdListFromLocalStorage(siteId);
    wt_$.each(noteIdList,function(i,noteId){
        removeNoteCommentsFromLocalStorage(noteId);
    })
    removeNoteList(siteId);
}

function removeNoteList(siteId){
    localStorage.removeItem(String(siteId)+":noteIdList");
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
