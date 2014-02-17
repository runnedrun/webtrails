LocalStorageTrailAccess = new function(){
    this.getTrails = function() {
        var trailsObject = getUnhydratedTrails();
        hydrateSiteHtml(trailsObject);
        return trailsObject;
    }

    this.addOrUpdateTrails = function(trailsObject) {
        var deffereds = $.map(trailsObject, function(trailObject, trailId) {
            return saveSiteHtmlForTrail(trailObject)
        });
        setTrailsToLocalStorage(trailsObject);
        return deffereds
    }

    function saveSiteHtmlForTrail(trailObject) {
        var oldTrailObject = getUnhydratedTrails()[trailObject.trailId];
        return $.map(trailObject.sites.siteObjects || [], function(siteObject, siteId) {
            var oldSiteRevisionMap;
            if (oldTrailObject && oldTrailObject.sites.siteObjects[siteId]) {
                oldSiteRevisionMap = oldTrailObject.sites.siteObjects[siteId].revisionUrls;
            } else {
                oldSiteRevisionMap = {};
            }
            return $.map(siteObject.revisionUrls, function(revisionUrl, revisionNumber) {
                var revisionAlreadExistsInStorage = oldSiteRevisionMap[revisionNumber];
                if (!revisionAlreadExistsInStorage){
                    console.log("getting new revision");
                    var deferred = $.ajax({
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
        $.each(unhydratedTrailsObject, function(id, trailObject) {
            $.each(trailObject.sites.siteObjects, function(siteId, siteObject) {
                siteObject.html = {};
                $.each(siteObject.revisionUrls, function(revisionNumber) {
                    siteObject.html[revisionNumber] = getSiteRevisionHtml(siteId, revisionNumber)
                });
            });
        })
    }

    function setTrailsToLocalStorage(trailsObject) {
        localStorage["trails"] = JSON.stringify(trailsObject);
    }

    function getUnhydratedTrails() {
        var trails = localStorage["trails"] || "{}";
        return JSON.parse(trails);
    }

    function setSiteRevisionHtml(siteId, revisionNumber, html) {
        localStorage["revisionHtml:" + siteId + ":" + revisionNumber] = html
    }

    function getSiteRevisionHtml(siteId, revisionNumber) {
        return localStorage["revisionHtml:" + siteId + ":" + revisionNumber] || "Site failed to load."
    }

    this.setCurrentTrailId = function(currentTrailId) {
        localStorage["currentTrailId"] = currentTrailId;
    };

    this.getCurrentTrailId = function() {
        return localStorage["currentTrailId"];
    }

    this.clearCurrentTrailId = function() {
        localStorage.removeItem("currentTrailId");
    }
}()