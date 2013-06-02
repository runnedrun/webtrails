console.log("ajax_fns loaded");


function signRequestWithWtAuthToken(xhr,ajaxRequest){
    xhr.setRequestHeader("WT_AUTH_TOKEN",wt_auth_token);
    xhr.setRequestHeader("Accept","application/json");
}

function saveSiteToTrail(successFunction, note){
    console.log("saving site to trail:", currentSiteTrailID);
    var currentSite = window.location.href;
    var currentHTML = getCurrentSiteHTML();
    if (siteSavedDeeply && !currentSiteTrailID) {
        console.log("saved already, but not returned yet");
        setTimeout(function(){saveSiteToTrail(successFunction)}, 100);
        return;
    }
    wt_$.ajax({
        url: webTrailsUrl + "/sites",
        type: "post",
        crossDomain: true,
        beforeSend: signRequestWithWtAuthToken,
        data: {
            "site[id]":currentSiteTrailID, //this is probably unnecesary
            "site[url]":currentSite,
            "site[trail_id]":currentTrailID,
            "site[title]": document.title,
            "note": note || "none",
            "html": currentHTML,
            "shallow_save": currentSiteTrailID  //this is empty string if it's the first time the site is saved.
        },
        success: function(resp){
            setCurrentTrailID(resp.trail_id);
            successFunction(resp);
        }
    });
//    document.onmousemove = mouseStopDetect();

    if (!siteSavedDeeply){
        siteSavedDeeply = true;
        saveSiteToTrailButton.text("Site saving");
        saveSiteToTrailButton.unbind();
        saveSiteToTrailButton.css({"cursor": "default"});

        // now check to see if site is actually saved, and update the UI accordingly
        var updateSiteSavedButton = function() {
            if (currentSiteTrailID) {
                wt_$.ajax({
                    url: webTrailsUrl + '/site/exists',
                    type: "get",
                    crossDomain: true,
                    beforeSend: signRequestWithWtAuthToken,
                    data: {
                        "id": currentSiteTrailID
                    },
                    success: function(data) {
                            if (data.exists) {
                              // Our page exists, and we should correct the save site button
                              saveSiteToTrailButton.text("Site saved!").stop().css({opacity: 0}).animate({opacity: 1}, 700 );
                              saveSiteToTrailButton.unbind().click(function(){window.open(webTrailsUrl + '/trails/' + currentTrailID + "#end", '_blank');});
                              saveSiteToTrailButton.css({"cursor": "pointer"});
                            } else {
                                setTimeout(updateSiteSavedButton, 5000); // check again
                            }
                        }
                });
            } else {
                setTimeout(updateSiteSavedButton, 5000); // check again
            }
        }
        setTimeout(updateSiteSavedButton, 5000);
    }
}

function fetchFavicons(){
    //also gets the users latest trail id, if none is saved in localstorage
    var currentSite = window.location.href;
    wt_$.ajax({
        url: webTrailsUrl + "/trail/site_list",
        type: "get",
        crossDomain: true,
        data: {
            "trail_id": currentTrailID,
            "current_url": currentSite
        },
        beforeSend: signRequestWithWtAuthToken,
        success: function(resp){
            setCurrentTrailID(resp.trail_id);
            addFaviconsToDisplay(resp);
            setTrailSelect(resp.trails);
        }
    });
}

function submitNoteAfterSave(site_data,content,comment,commentLocationX,commentLocationY, noteCountAtSave){
    console.log("SETTING THE CURRENT TRAIL ID:", site_data.site_id);
    console.log("note count:", noteCount, "note count at save:", noteCountAtSave);
    currentSiteTrailID = site_data.site_id;
    wt_$.ajax({
        url: webTrailsUrl + "/notes",
        type: "post",
        crossDomain: true,
        beforeSend: signRequestWithWtAuthToken,
        data: {
            "note[content]": content,
            "note[comment]": comment,
            "note[comment_location_x]": commentLocationX,
            "note[comment_location_y]": commentLocationY,
            "note[site_id]": currentSiteTrailID,
            "note[scroll_x]": window.scrollX,
            "note[scroll_y]": window.scrollY,
            "note[client_side_id]": "client_side_id_"+ (noteCountAtSave - 1)
        },
        success: updateNoteDisplay
    })
}

function deletePreviousNote(){
    noteCount--;
    wt_$.ajax({
        url: "http://localhost:3000/notes/delete",
        type: "post",
        crossDomain: true,
        beforeSend: signRequestWithWtAuthToken,
        data: {
            "id": previousNoteID
        },
        success: updateNoteDisplay
    })
}

