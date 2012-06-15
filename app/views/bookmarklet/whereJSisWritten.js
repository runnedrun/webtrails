function initMyBookmarklet() {
        trailDisplay = document.createElement("div");
        $(trailDisplay).css({
            height:"2%",
            width: "100%",
            position:"fixed",
            top:"0px",
            "text-align":"left",
            float:"left",
            "z-index": "1000",
            opacity: ".8",
            background: "#2E2E1F",
            color: "#CCCCA3"
        });
	    $(document.body).prepend(trailDisplay);
        cookieToPathDisplay();
        $(document.body).keypress(verifyKeyPress);
        addSiteToTrail();
	}

    function verifyKeyPress(e){
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 27){
        showOrHidePathDisplay();
    }
}

    function showOrHidePathDisplay(){
        if ($(trailDisplay).is(":hidden")){
            trailDisplay.show();
         }
        else {
            trailDisplay.hide();
        }

    }

    function addSiteToTrail(){
        currentSite = window.location.href;
        $.ajax({
            url: "http://192.168.1.3:3000/sites",
            type: "post",
            crossDomain: true,
            data: {
               "site[url]":currentSite,
               "site[trail_id]":trailID,
                notes: "none"
                    },
            success: addCurrentSiteFaviconToDisplay()
        })
    }
    function addCurrentSiteFaviconToDisplay(){
        searchName = currentSite.substring(7,currentSite.length-1);
        addSiteToCookie();
        addSiteFaviconToDisplay(searchName);
    }


    function addSiteFaviconToDisplay(url) {
        $(trailDisplay).append("<a href="+ url+ "\" class=\"siteFavicon\"><img src=\"http://www.google.com/s2/favicons?domain=" + url + "\"/></a>")
    }



    function cookieToPathDisplay(){
        var i,x,y,myCookies=document.cookie.split(";");
        var trail=includeTrailSubString(myCookies,"trail"+trailID);
        siteArray = trail.split(";");
        $.each(siteArray, function(i,site){
            addSiteFaviconToDisplay(site);
        })

    }

    function includeTrailSubString(arr,subString) {
        var trailArray = [];
        for(var i=0; i<arr.length; i++) {
            console.log(arr[i].split("=")[0]);
            if (arr[i].split("=")[0] == subString){
                return arr[i].split("=")[1];
            } ;
        }
        return ""
    }

    function addSiteToCookie(){
        siteArray.push(currentSite);
        document.cookie = "trail" + trailID + "=" + siteArray.join(";") + "; expires= Thu, 2 Aug 2021 20:47:11 UTC; path=/";
    }
