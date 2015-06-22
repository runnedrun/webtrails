ResourceDowloaderDomain = "http://localhost:5000";
//ResourceDowloaderDomain = "http://webtrails.co";

Request = new function(){
    var thisRequest = this;

    this.deleteSite = function(site, callback){
        $.ajax({
            url: "/sites/delete",
            type: "post",
            data: {
                "id" : site.id
            },
            success: function() {
                chrome.runtime.sendMessage(extensionId, {updateTrailsObject: true});
                callback
            }
        });
    };

    this.updateSiteOrder = function(trail, siteOrder) {
        $.ajax({
            url:"/trails/update_site_list",
            method:"post",
            data:{
                "site_array": siteOrder,
                "id" : trail.id
            },
            success:function(){
                console.log("updated positions server side");
            }
        });
    };

    this.updateNoteComment = function(note, newComment, callback) {
        $.ajax({
            url: "/notes/update",
            type: "post",
            data: {
                "id" : note.id,
                "comment": newComment
            },
            success: function(resp) {
                console.log("note saved");
                note.update(resp.updateHash);
                callback(resp);
            }
        });
    };

    this.deleteNote = function(note, callback) {
        $.ajax({
            url: "/notes/delete",
            type: "post",
            data: {
                "id" : note.id
            },
            success: function(e){
                chrome.runtime.sendMessage(extensionId, {updateTrailsObject: true});
                console.log("note deleted"), callback(e)
            }
        })
    };

    this.addNote = function(newNote, currentSite, currentHtml, callback) {
        $.ajax({
            url: "/sites/new_note_from_view_page",
            type: "post",
            data: {
                "site[id]": currentSite.id, //this is probably unnecesary
                "site[trail_id]": currentSite.trail.id,
                "note": newNote
            },
            success: function(resp) {
                thisRequest.mirrorHtml(newNote, currentSite, currentHtml, function() {
//                    chrome.runtime.sendMessage(extensionId, {updateTrailsObject: true});
                    // sending the message here doesn't work because the revision number has not yet been added
                    // because the mirroring happens asynchronously. I need to use the same download tracker that
                    // I user for the extension.
                    callback(resp)
                })
            }
        });
    };

    this.mirrorHtml = function(newNote, currentSite, currentHtml, callback) {
        $.ajax({
            url: ResourceDowloaderDomain + "/resource_downloader",
            type: "post",
            beforeSend: signRequestWithWtAuthTokenInHeader,
            data: {
                "siteID": currentSite.id, //this is probably unnecesary
                "html": {html: currentHtml},
                "revision": newNote.site_revision_number,
                "isIframe": "false"
            },
            success: callback
        });
    };

    this.updateNoteOrder = function(newNoteOrder, siteId){
        $.ajax({
            url:"/sites/update_note_list",
            method:"post",
            data:{
                "note_array": newNoteOrder,
                "id" : siteId
            },
            success:function(){
                console.log("updated positions server side");
            }
        })
    };

    function signRequestWithWtAuthTokenInHeader(xhr){
        xhr.setRequestHeader("WT_AUTH_TOKEN", readCookie("wt_auth_token"));
        xhr.setRequestHeader("Accept","application/json");
    }
}();