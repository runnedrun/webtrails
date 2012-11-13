console.log("ajax_fns loaded");

function saveSiteToTrail(successFunction){
    var currentSite = window.location.href;
    var currentHTML = getCurrentSiteHTML();
    console.log(currentHTML);
    $.ajax({
        url: "http://localhost:3000/sites",
        type: "post",
        crossDomain: true,
        data: {
            "site[id]":currentSiteTrailID,
            "site[url]":currentSite,
            "site[trail_id]":trailID,
            "site[title]": document.title,
            "user": userID,
            "notes": "none",
            "html": currentHTML,
            "shallow_save": currentSiteTrailID
        },
        success: successFunction
    });
    console.log(successFunction);
//    document.onmousemove = mouseStopDetect();
    if (!currentSiteTrailID){
        saveSiteToTrailButton.attr("disabled","disabled");
        saveSiteToTrailButton.html("Site saved");
//        noteDisplayWrapper.fadeTo(200,1);
        deleteNoteButton.fadeTo(200,1);
    }
}

function fetchFavicons(){
    var currentSite = window.location.href;
    $.ajax({
        url: "http://localhost:3000/trail/site_list",
        type: "get",
        crossDomain: true,
        data: {
            "trail_id": trailID,
            "current_url": currentSite
        },
        success: addFaviconsToDisplay
    })
}

function submitNoteAfterSave(e,site_data,content,comment,commentLocationX,commentLocationY){
    currentSiteTrailID = site_data.site_id;
    $.ajax({
        url: "http://localhost:3000/notes",
        type: "post",
        crossDomain: true,
        data: {
            "note[content]": content,
            "note[comment]": comment,
            "note[comment_location_x]": commentLocationX,
            "note[comment_location_y]": commentLocationY,
            "note[site_id]": currentSiteTrailID,
            "note[scroll_x]": window.scrollX,
            "note[scroll_y]": window.scrollY
        },
        success: updateNoteDisplay
    })
}

function deletePreviousNote(){
    $.ajax({
        url: "http://localhost:3000/notes/delete",
        type: "post",
        crossDomain: true,
        data: {
            "id": previousNoteID
        },
        success: updateNoteDisplay
    })
}