LocalStorageTrailAccess = new function(){
    this.getTrails = function() {
        var trailsObject = getUnhydratedTrails();
        hydrateSiteHtml(trailsObject);
        return trailsObject;
    }

    this.addOrUpdateTrails = function(trailsObject) {
        var deffereds = wt_$.map(trailsObject, function(trailObject, trailId) {
            return saveSiteHtmlForTrail(trailObject)
        });
        setTrailsToLocalStorage(trailsObject);
        return deffereds
    }

    function saveSiteHtmlForTrail(trailObject) {
        var oldTrailObject = getUnhydratedTrail(trailObject.trailId);
        return wt_$.map(trailObject.sites.siteObjects, function(siteId, siteObject) {
            var oldSiteRevisionMap;
            if (oldTrailObject && oldTrailObject.site.siteObjects[siteId]) {
                oldSiteRevisionMap = oldTrailObject.sites.siteObjects[siteId].revisionUrls;
            } else {
                oldSiteRevisionMap = {};
            }
            return wt_$.map(siteObject.revisionUrls, function(revisionNumber, revisionUrl) {
                var revisionAlreadExistsInStorage = oldSiteRevisionMap[revisionNumber];
                if (!revisionAlreadExistsInStorage){
                    console.log("getting new revision");
                    var deferred = wt_$.ajax({
                        url: revisionUrl,
                        type: "get",
                        success: function(html){
                            setSiteRevisionHtml(siteId, revisionNumber, html);
                        }
                    });
                    return deferred
                }
            })
        });
    }

    function hydrateSiteHtml(unhydratedTrailsObject) {
        wt_$.each(unhydratedTrailsObject, function(id, trailObject) {
            wt_$.each(trailObject.sites.siteObjects, function(siteId, siteObject) {
                siteObject.html = {}
                wt_$.each(siteObject.revisionUrls, function(revisionNumber, revisionUrl) {
                    siteObject.html[revisionNumber] = getSiteRevisionHtml(siteId, revisionUrl)
                });
            });
        })
    }

    function setTrailsToLocalStorage(trailsObject) {
        localStorage["trails"] = JSON.stringify(trailsObject);
    }

    function getUnhydratedTrails() {
        return JSON.parse(localstorage["trails"]) || {};
    }

    function setSiteRevisionHtml(siteId, revisionNumber, html) {
        localStorage["revisionHtml" + siteId + ":" + revisionNumber] = html
    }

    function getSiteRevisionHtml(siteId, revisionNumber) {
        return localStorage["revisionHtml:"+ siteId + ":" + revisionNumber] || "Site failed to load."
    }
}()