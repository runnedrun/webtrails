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
            console.log("trail data changed, checking if we should fire callback");

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
                                var possiblyNewSites = trailObject.sites;
                                var newSiteIds = arrayDiff(possiblyNewSites.order, oldSites.order)
                                if (newSiteIds.length > 0) {
                                    fireCallback = false;
                                    return false
                                }

                                // check for new notes
                                $.each(possiblyNewSites.siteObjects, function(siteId, siteObject) {
                                    if (oldSites.siteObjects[siteId]) {
                                        var oldNotes = oldSites.siteObjects[siteId].notes;
                                        var possiblyNewNotes = siteObject.notes;
                                        var newNoteIds = arrayDiff(possiblyNewNotes.order, oldNotes.order)
                                        if (newNoteIds.length > 0) {
                                            fireCallback = false;
                                            return false
                                        }
                                    }
                                });
                            }
                        });
                        if (fireCallback) {
                            console.log("firing trail change callback")
                            callback(storageChange.newValue);
                        }
                    }
                } else {
                    console.log("firing trail change callback")
                    LocalStorageTrailAccess.getTrails().done(callback);
                }
            }
        })
        function arrayDiff(a1, a2) {
            return a1.filter(function(i) {return a2.indexOf(i) < 0;})
        }
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

    this.clearCurrentTrailId = function() {
        chrome.storage.local.remove("currentTrailId");
    };

    this.setAuthToken = function(authToken) {
        chrome.storage.local.set({"authToken": authToken});
    }

    this.clearAuthToken = function() {
        chrome.storage.local.remove("authToken");
    }

    this.getAuthToken = function() {
        var deferred = $.Deferred();
        chrome.storage.local.get("authToken", function(authTokenObject) {
            deferred.resolve(authTokenObject["authToken"]);
        });
        return deferred.promise()
    }

    this.getExtensionInitializationData = function() {
        var deferred = $.Deferred();
        chrome.storage.local.get(["trails", "currentTrailId", "authToken"], function(initializationObject) {
            var returnObject = $.extend({trails: {}}, initializationObject);
            deferred.resolve(returnObject);
        });
        return deferred.promise()
    }
}()