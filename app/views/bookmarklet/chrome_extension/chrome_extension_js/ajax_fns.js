console.log("ajax_fns loaded");

function saveSiteToTrail(successFunction){
    var currentSite = window.location.href;
    var currentHTML = getCurrentSiteHTML();
    $.ajax({
        url: "http://localhost:3000/sites",
        type: "post",
        crossDomain: true,
        data: {
            "site[id]":currentSiteTrailID, //this is probably unnecesary
            "site[url]":currentSite,
            "site[trail_id]":trailID,
            "site[title]": document.title,
            "user": userID,
            "notes": "none",
            "html": currentHTML,
            "shallow_save": currentSiteTrailID  //this is empty string if it's the first time the site is saved.
        },
        success: successFunction
    });
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
    wt_$.ajax({
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

function submitNoteAfterSave(site_data,content,comment,commentLocationX,commentLocationY){
    currentSiteTrailID = site_data.site_id;
    console.log(site_data.site_id);
    wt_$.ajax({
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
            "note[scroll_y]": window.scrollY,
            "note[client_side_id]": "client_side_id_"+noteCount
        },
        success: incrementNoteCountAfterSave
    })
}

function deletePreviousNote(){
    wt_$.ajax({
        url: "http://localhost:3000/notes/delete",
        type: "post",
        crossDomain: true,
        data: {
            "id": previousNoteID
        },
        success: decrementNoteCountAfterDelete()
    })
}

function incrementNoteCountAfterSave(data){
    noteCount +=1;
    updateNoteDisplay(data);
}

function decrementNoteCountAfterDelete(data){
    noteCount -=1;
    updateNoteDisplay(data);
}