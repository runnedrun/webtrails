function getSitesObject(trailId){
    var sitesObject = {siteObjects:{},order:[]};
    var idList = getSiteIdListFromLocalStorage(trailId);
    $.each(idList,function(i,siteId){
        var siteObject = sitesObject["siteObjects"][siteId] = {};
        var htmlHash = {};
        $.each(getRevisionList(siteId), function(i, revisionNumber) {
            htmlHash[revisionNumber] = getRevisionFromLocalStorage(siteId, revisionNumber);
        });
        siteObject["html"] = htmlHash;
        siteObject["notes"] = getNotesObject(siteId);
        siteObject["baseRevisionNumber"] = getBaseRevision(siteId);
        siteObject["id"] = siteId;
    })
    sitesObject["order"] = idList;
    return sitesObject;
}
function getSiteIdListFromLocalStorage(trailId){
    var siteIdString = localStorage[String(trailId)+":siteIdList"];
    if (siteIdString){
        return siteIdString.split(",")
    } else {
        return [];
    }
}

function updateSiteData(newSiteIdList, siteHashes, trailId){
    var oldSiteIdList = getSiteIdListFromLocalStorage(trailId) || [];
    $.each(oldSiteIdList,function(i, siteId){
        var siteExistsInNewList = newSiteIdList.indexOf(siteId) > -1;
        if (!(siteExistsInNewList)){
            removeSiteDataFromLocalStorage(siteId);
        }
    });
    var deferreds = $.map(newSiteIdList,function(siteId,id){
        return updatedStoredHtmlForSite(siteId, siteHashes[siteId]);
    });
    setSiteListInLocalStorage(trailId, newSiteIdList)
    return deferreds
}

function updatedStoredHtmlForSite(siteId, siteHash){
    var oldSiteRevisionList = getRevisionList(siteId);

    $.each(oldSiteRevisionList, function(revisionNumber){
        var revisionExistsInNewList = siteHash.revisionUrls[revisionNumber];
        if (!revisionExistsInNewList){
            removeRevisionFromLocalStorage(siteId, revisionNumber);
        }
    });
    var deferreds = $.map(siteHash.revisionUrls, function(revisionNumber, revisionUrl) {
        var revisionAlreadExistsInStorage = oldSiteRevisionList.indexOf(revisionNumber) > -1
        if (!revisionAlreadExistsInStorage){
            console.log("getting new revision");
            var deferred = $.ajax({
                url: revisionUrl,
                type: "get",
                success: function(html){
                    setRevisionInLocalStorage(siteId, revisionNumber, html);
                }
            })
            return deferred
        }
    });
    setRevisionList(siteId, Object.keys(siteHash.revisionUrls));
    setBaseRevision(siteId, siteHash.baseLocation);
    return deferreds;
}

function removeSiteHtmlFromLocalStorage(siteId) {
    $.each(getRevisionList(siteId), function(i, revisionNumber) {
        removeRevisionFromLocalStorage(siteId, revisionNumber)
    })
}

function removeSiteDataFromLocalStorage(siteId) {
    removeSiteHtmlFromLocalStorage(siteId);
    removeRevisionList(siteId);
    removeBaseRevision(siteId);
    removeAllNotesForSite(siteId)
}

function setSiteListInLocalStorage(trailId, siteList) {
    localStorage[String(trailId)+":siteIdList"] = siteList.join(",");
}


function addSiteIdToSiteList(siteId){
    var siteIdString = localStorage["siteIdList"];
    if (siteIdString) {
        var siteIdList = siteIdString.split(",");
        if (siteIdList.indexOf(siteId) == -1) {
            siteIdList.push(siteId).join(",")
            localStorage["siteIdList"] = siteIdList;
        }
    } else {
        localStorage["siteIdList"] = String(siteId);
    }
}

function getRevisionList(siteId) {
    var revisionString;
    if (revisionString = localStorage[String(siteId) + ":revisions"]) {
        return revisionString.split(",")
    } else {
        return []
    }

}

function setRevisionList(siteId, revisionList) {
    localStorage[String(siteId) + ":revisions"] = revisionList.join(",")
}

function removeRevisionList(siteId) {
    localStorage.removeItem(String(siteId) + ":revisions");
}

function setRevisionInLocalStorage(siteId, revisionNumber, html) {
    localStorage[siteId + ":siteHtml:" + String(revisionNumber)] = html;
}

function getRevisionFromLocalStorage(siteId, revisionNumber) {
    return localStorage[String(siteId) + ":siteHtml:" + String(revisionNumber)]
}

function removeRevisionFromLocalStorage(siteId, revisionNumber) {
    // there's a small possibility of race condition, since I don't also remove the
    // revision number from the revision list here. But deleting an individual item
    // is expensive, it's better to just overwrite the entire list at once.
    localStorage.removeItem(String(siteId) + ":siteHtml:" + String(revisionNumber));
}

function setBaseRevision(siteId, baseRevisionNumber) {
    localStorage[String(siteId) + ":baseRevision"] = String(baseRevisionNumber);
}

function getBaseRevision(siteId, baseRevisionNumber) {
    return localStorage[String(siteId) + ":baseRevision"]
}

function removeBaseRevision(siteId){
    localStorage.removeItem(String(siteId) + ":baseRevision");
}