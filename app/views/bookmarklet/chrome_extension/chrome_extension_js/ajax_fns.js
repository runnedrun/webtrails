console.log("ajax_fns loaded");

function signRequestWithWtAuthToken(xhr,ajaxRequest){
    xhr.setRequestHeader("WT_AUTH_TOKEN", wt_auth_token);
    xhr.setRequestHeader("Accept","application/json");
}

function saveSiteToTrail(note){
    var currentSite = window.location.href;
    if (Trails.siteSavedDeeply() && !Trails.getCurrentSiteId()) {
        console.log("saved already, but not returned yet");
        setTimeout(function(){saveSiteToTrail(note)}, 100);
        return
    }

    var currentRevisionNumber = Trails.getAndIncrementRevision();
    if (note) {
        note = $.extend(note, {site_revision_number: currentRevisionNumber});
    }

    console.log("note is ", note);
    if (!Trails.getCurrentSiteId()){
        $.ajax({
            url: webTrailsUrl + "/sites/get_new_site_id",
            type: "post",
            crossDomain: true,
            beforeSend: signRequestWithWtAuthToken,
            data: {
                "site[url]":currentSite,
                "site[trail_id]":Trails.getCurrentTrailId(),
                "site[title]": document.title,
                "site[domain]": document.domain,
                "site[html_encoding]": document.characterSet,
                "note":  note || {}
            },
            success: function(resp){
//                Trails.switchToTrail(resp.current_trail_id);
                $(document).trigger({
                    type: "noteIdReceived",
                    noteDetails: {
                        noteId: resp.note_id,
                        clientSideId: note.client_side_id
                    }
                });
                Trails.getTrail(resp.current_trail_id).setCurrentSiteId(resp.current_site_id);
                parsePageBeforeSavingSite($.extend(resp, {
                    isBaseRevision: true,
                    revision_number: currentRevisionNumber
                }));
            }
        })
    }  else {
        $.ajax({
            url: webTrailsUrl + "/notes",
            type: "post",
            crossDomain: true,
            beforeSend: signRequestWithWtAuthToken,
            data: {
                "note": $.extend(note, {site_id: Trails.getCurrentSiteId()})
            },
            success: function(resp){
                parsePageBeforeSavingSite($.extend(resp,{
                    current_site_id: Trails.getCurrentSiteId(),
                    current_trail_id: Trails.getCurrentTrailId(),
                    shallow_save: true,
                    revision_number: currentRevisionNumber,
                    update_on_finish: true,
                    client_side_id: note.client_side_id
                }));
//                updateTrailDataWhenNoteReady(resp.note_id);
            }
        })
    }
}

function fetchFavicons(){
    //also gets the users latest trail id, if none is saved in localstorage
    var currentSite = window.location.href;
    $.ajax({
        url: webTrailsUrl + "/trail/site_list",
        type: "get",
        crossDomain: true,
        data: {
            "trail_id": Trails.getCurrentTrailId(),
            "current_url": currentSite
        },
        beforeSend: signRequestWithWtAuthToken,
        success: function(resp){
            addFaviconsToDisplay(resp);
            setTrailSelect(resp.trails);
        }
    });
}

function deleteNoteRequest(note, callback){
    $.ajax({
        url: webTrailsUrl + "/notes/delete",
        type: "post",
        crossDomain: true,
        beforeSend: signRequestWithWtAuthToken,
        data: {
            "id": note.id
        },
        success: function(resp) {
            LocalStorageTrailAccess.addOrUpdateTrails(resp.update_hash);
            callback && callback(resp)
        },
        error: function(){ butterBarNotification("Failed to delete note, please try again") }
    });
}

function deleteSite(site, callback) {
    $.ajax({
        url:  webTrailsUrl + "/sites/delete",
        type: "post",
        data: {
            "id" : site.id
        },
        beforeSend: signRequestWithWtAuthToken,
        success: callback
    });
};

function newTrail(trailName, callback) {
    $.ajax({
        url:  webTrailsUrl + "/trails",
        type: "post",
        data: {
            "name" : trailName
        },
        beforeSend: signRequestWithWtAuthToken,
        success: callback
    });
}

function updateNoteText(newComment, id, callback) {
    $.ajax({
        url:  webTrailsUrl + "/notes/update",
        type: "post",
        data: {
            "id" : id,
            "comment": newComment
        },
        success: function(e) { console.log("note saved"); callback(e) }
    });
}


