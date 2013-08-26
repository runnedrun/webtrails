function getSitesObject(trailId){
    var sitesObject = {siteObjects:{},order:[]};
    var idList = getSiteIdListFromLocalStorage(trailId);
    wt_$.each(idList,function(i,siteId){
        var siteObject = sitesObject["siteObjects"][siteId] = {};
        siteObject["html"] = getSiteHtmlFromLocalStorage(siteId);
        siteObject["notes"] = getNotesObject(siteId);
        siteObject["id"] = siteId;
    })
    sitesObject["order"] = idList;
    return sitesObject;
}

function setSiteInLocalStorage(siteId,html){
    localStorage[siteId] = html;
    var siteIdList = localStorage["sideIdList"];
    if (siteIdList) {
        localStorage["siteIdList"] = siteIdList + "," + String(siteId);
    } else {
        localStorage["siteIdList"] = String(siteId);
    }
}

function getSitesForTrailFromLocalStorage(trailId){
    var siteIds = getSiteIdListFromLocalStorage(trailId);
    return getSiteDataFromLocalStorage(siteIds);
}

function getSiteIdListFromLocalStorage(trailId){
    var siteIdString = localStorage[String(trailId)+":siteIdList"];
    if (siteIdString){
        return siteIdString.split(",")
    } else {
        return [];
    }
}

function updateSiteData(newSiteIdList,siteIdsToHtmlLocation,trailId){
    var oldSiteIdList = getSiteIdListFromLocalStorage(trailId) || [];
    wt_$.each(oldSiteIdList,function(i,item){
        var indexInNewList = newSiteIdList.indexOf(item);
        if (!(indexInNewList > -1)){
            removeSiteHtmlFromLocalStorage(item);
        }
    });
    wt_$.each(newSiteIdList,function(i,item){
        var indexInOldList = oldSiteIdList.indexOf(item);
        if (!(indexInOldList > -1)){
            storeHtmlForSite(item,siteIdsToHtmlLocation[item]);
        }
    });
    localStorage[String(trailId)+":siteIdList"] = newSiteIdList.join(",");
}

function storeHtmlForSite(siteId,htmlLocation){
    localStorage[siteId+":siteHtml"] = "fetching page";
    wt_$.ajax({
        url: htmlLocation,
        type: "get",
        success: function(html){
            localStorage[siteId+":siteHtml"] = html;
        }
    })
}

function getSiteHtmlFromLocalStorage(siteId){
    return localStorage[String(siteId)+":siteHtml"];
}

function removeSiteHtmlFromLocalStorage(siteId){
    localStorage.removeItem(String(siteId)+":siteHtml");
}

function removeSiteDataFromLocalStorage(siteId){
    removeSiteHtmlFromLocalStorage(siteId);
    removeAllNotesForSite(siteId)
}