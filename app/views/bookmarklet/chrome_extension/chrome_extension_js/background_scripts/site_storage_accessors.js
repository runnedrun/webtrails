function getSitesObject(trailId){
    var sitesObject = {siteObjects:{},order:[]};
    var idList = getSiteIdListFromLocalStorage(trailId);
    wt_$.each(idList,function(i,siteId){
        var siteObject = sitesObject["siteObjects"][siteId] = {};
        var htmlHash = {};
        wt_$.each(getRevisionList(siteId), function(i, revisionNumber) {
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

function updateSiteData(newSiteIdList, siteIdsToHtmlLocationAndRevisions, trailId){
    var oldSiteIdList = getSiteIdListFromLocalStorage(trailId) || [];
    wt_$.each(oldSiteIdList,function(i, siteId){
        var siteExistsInNewList = newSiteIdList.indexOf(siteId) > -1;
        if (!(siteExistsInNewList)){
            removeSiteDataFromLocalStorage(siteId);
        }
    });
    wt_$.each(newSiteIdList,function(i,siteId){
        updatedStoredHtmlForSite(siteId, siteIdsToHtmlLocationAndRevisions[siteId]);
    });
    setSiteListInLocalStorage(trailId, newSiteIdList)
}

function updatedStoredHtmlForSite(siteId, htmlLocationAndRevisions){
    var revisions = htmlLocationAndRevisions.revision_numbers;
    var base_location = htmlLocationAndRevisions.base_location;
    var oldSiteRevisionList = getRevisionList(siteId);

    wt_$.each(oldSiteRevisionList, function(i, revision){
        var revisionExistsInNewList = revisions.indexOf(String(revision)) > -1;
        if (!(revisionExistsInNewList)){
            removeRevisionFromLocalStorage(siteId, revision);
        }
    });

    wt_$.each(revisions, function(i, revision) {
        var revisionAlreadExistsInStorage = oldSiteRevisionList.indexOf(revision) > -1
        if (!revisionAlreadExistsInStorage){
            localStorage[siteId+ ":siteHtml:" + String(revision)] = "fetching page";
            wt_$.ajax({
                url: base_location+"/"+revision,
                type: "get",
                success: function(html){
                    setRevisionInLocalStorage(siteId, revision, html);
                }
            })
        }
    });
    setRevisionList(siteId, revisions);
    setBaseRevision(siteId, htmlLocationAndRevisions.base_revision);
}

function removeSiteHtmlFromLocalStorage(siteId) {
    wt_$.each(getRevisionList(siteId), function(i, revisionNumber) {
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