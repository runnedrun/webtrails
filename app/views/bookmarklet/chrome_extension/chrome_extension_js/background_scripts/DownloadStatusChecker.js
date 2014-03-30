DownloadStatusChecker = function(archiveLocation, tabId, siteId, revisionNumber) {
    var retries = 0;
    var maxRetries = 15;

    alertTabOfDownloadStart();
    checkStatus()

    function checkStatus() {
        $.ajax({
            url: archiveLocation,
            type: "get",
            crossDomain: true,
            success: function(data) {
                alertTabOfDownloadComplete(data);
            },
            error: function(data) {
                if (retries < maxRetries) {
                    retries += 1
                    setTimeout(checkStatus, 1000)
                } else {
                    alertTabOfDownloadTimeout();
                }
            }
        })
    }

    function alertTabOfDownloadStart() {
        chrome.tabs.sendRequest(tabId, {checkingDownloadStatus: true});
    }

    function alertTabOfDownloadComplete(html) {
        chrome.tabs.sendRequest(tabId, {downloadComplete: true});
        var prefetched = {};
        prefetched[siteId + revisionNumber] = {html: html, siteId: siteId, revisionNumber: revisionNumber};
        retrieveTrailData(prefetched);
    }

    function alertTabOfDownloadTimeout() {
        chrome.tabs.sendRequest(tabId, {downloadTimedOut: true})
    }
}