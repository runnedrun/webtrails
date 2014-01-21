function getTrailsObject(userId){
    var trailsObject = {}
    var trailIdList = getTrailIdListFromLocalStorage(userId);
    wt_$.each(trailIdList, function(i,trailId){
        var trailObject = trailsObject[trailId] = {};
        trailObject["sites"] = getSitesObject(trailId);
        trailObject["id"] = trailId;
    })
    return trailsObject;
}

function updateTrailIdList(newTrailIdList,userId){
    var oldTrailIdList = getTrailIdListFromLocalStorage(userId) || [];
    wt_$.each(oldTrailIdList,function(i,item){
        if (!(newTrailIdList.indexOf(item) > -1)){
            removeTrailDataFromLocalStorage(item);
        }
    });
    localStorage[String(userId)+":trailIdList"] = newTrailIdList.join(",");
}

function getTrailIdListFromLocalStorage(userId){
    return (localStorage[String(userId)+":trailIdList"] || "").split(",")
}

function removeTrailDataFromLocalStorage(trailId){
    var siteIdList = getSiteIdListFromLocalStorage(trailId);
    wt_$.each(siteIdList,function(i,siteId){
        removeSiteDataFromLocalStorage(siteId)
    })
}