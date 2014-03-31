LocalStorageTrailAccess = new function(){
    this.getTrails = function() {
        var deferredTrailsObject = getUnhydratedTrails();
        return deferredTrailsObject;
    };

    this.addOrUpdateTrails = function(trailsObject, prefetchedHtml) {
        prefetchedHtml = prefetchedHtml || {};
        var htmlDeferreds = $.map(trailsObject, function(trailObject, trailId) {
            return saveSiteHtmlForTrail(trailObject, prefetchedHtml)
        });
        setTrailsToLocalStorage(trailsObject, prefetchedHtml);

        return htmlDeferreds;
    };

    function saveSiteHtmlForTrail(trailObject, prefetchedHtml) {
        return getUnhydratedTrails().then(function(oldTrailObjects) {
            var oldTrailObject = oldTrailObjects[trailObject.id];
            return $.map(trailObject.sites.siteObjects || [], function(siteObject, siteId) {
                var oldSiteRevisionMap;

                if (oldTrailObject && oldTrailObject.sites.siteObjects[siteId]) {
                    oldSiteRevisionMap = oldTrailObject.sites.siteObjects[siteId].revisionUrls;
                } else {
                    oldSiteRevisionMap = {};
                }

                return $.map(siteObject.revisionUrls, function(revisionUrl, revisionNumber) {
                    var revisionAlreadyExistsInStorage = oldSiteRevisionMap[revisionNumber];
                    if (!revisionAlreadyExistsInStorage && !prefetchedHtml[siteObject.id + revisionNumber]){
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
        });
    }

    function prepareHtmlObject(unhydratedTrailsObject) {
        $.each(unhydratedTrailsObject, function(id, trailObject) {
            $.each(trailObject.sites.siteObjects, function(siteId, siteObject) {
                siteObject.html = {};
                $.each(siteObject.revisionUrls, function(revisionNumber) {
                    siteObject.html[revisionNumber] = ""; // the actual html will be hydrated on demand
                });
            });
        })
    }

    function setTrailsToLocalStorage(trailsObject, prefetchedHtml) {
        chrome.storage.local.set({"trails": trailsObject}, function(){
            console.log("trails saved to storage");
            $.each(prefetchedHtml, function(k, prefetchObject) {
                setSiteRevisionHtml(prefetchObject.siteId, prefetchObject.revisionNumber, prefetchObject.html);
            });
        });
    }

    function getUnhydratedTrails() {
        var deferred = $.Deferred()
        chrome.storage.local.get("trails", function(items) {
            deferred.resolve(items["trails"] || {});
        });
        return deferred.promise()
    }

    function setSiteRevisionHtml(siteId, revisionNumber, html) {
        var htmlObject = {}
        htmlObject["revisionHtml:" + siteId + ":" + revisionNumber] = html
        chrome.storage.local.set(htmlObject, function() {
            console.log("set revisions in local storage");
        });
    }

    this.onTrailDataChange = function(callback) {
        chrome.storage.onChanged.addListener(function(changes, namespace) {
            for (key in changes) {

                // only fire callback for trail object changes if there are not
                // new notes or sites. Otherwise, wait for the revision html change
                // to fire
                if (key == "trails") {
                    var fireCallback = true

                    var storageChange = changes[key];
                    if (storageChange) {
                        var newTrails = storageChange.newValue;
                        var oldTrails = storageChange.oldValue;

                        // check for new sites
                        $.each(newTrails, function(trailId, trailObject) {
                            if (oldTrails[trailId]){
                                var oldSites = oldTrails[trailId].sites;
                                var newSites = trailObject.sites;
                                if (newSites.order !== oldSites.order) {
                                    fireCallback = false;
                                    return false
                                }

                                // check for new notes
                                $.each(newSites.siteObjects, function(siteId, siteObject) {
                                    if (oldSites.siteObjects[siteId]) {
                                        var oldNotes = oldSites[siteId].notes;
                                        var newNotes = siteObject.notes
                                        if (newNotes.order !== oldNotes.order) {
                                            fireCallback = false;
                                            return false
                                        }
                                    }
                                });
                            }
                        });
                        if (fireCallback) {
                            callback(storageChange.newValue);
                        }
                    }
                } else {
                    LocalStorageTrailAccess.getTrails().done(callback);
                }
            }
        })
    };

    this.getSiteRevisionHtml = function(siteId, revisionNumber) {
        var key = "revisionHtml:" + siteId + ":" + revisionNumber;
        var deferred = $.Deferred();
        chrome.storage.local.get(key, function(htmlObject) {
            deferred.resolve(htmlObject[key] || "site failed to load");
        });
        return deferred.promise();
    }

    this.setCurrentTrailId = function(currentTrailId) {
        chrome.storage.local.set({"currentTrailId": currentTrailId});
    };

//    this.getCurrentTrailId = function() {
//        chrome.storage.local.get("currentTrailId", function(items) {
//            deferred.resolve(items["currentTrailId"] || {});
//        });
//    }

    this.clearCurrentTrailId = function() {
        chrome.storage.local.remove("currentTrailId");
    };

    this.setAuthToken = function(authToken) {
        chrome.storage.local.set({"authToken": authToken});
    }

    this.getExtensionInitializationData = function() {
        var deferred = $.Deferred();
        chrome.storage.local.get(["trails", "currentTrailId", "authToken"], function(initializationObject) {
            deferred.resolve(initializationObject);
        });
        return deferred.promise()
    }
}()