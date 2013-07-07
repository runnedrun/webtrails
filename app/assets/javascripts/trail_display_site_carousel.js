function scroll_favicon_carousel(activeFaviconIndex){
    var scrollLeft = 150 - 14 + activeFaviconIndex*(-19);
    $(".siteFavicons").animate({"left": scrollLeft},100);
    //todo add actual scroll behavior here
}

function clickJumpToSite(e){
    var switchingToSiteID = $(e.currentTarget).data("site-id")
    switchToSite(switchingToSiteID);
}

function changeSiteOrder(event, ui){
    var faviconThatWasDragged = ui.item;
    var siteID;
    var siteArray = []

    $(".siteFavicons").children().each(function(faviconIndex,child){
        var $child = $(child);
        var $faviconImage = $child.find(".faviconImage");
        siteID = $faviconImage.attr("id").replace(/\D+/,"")
        siteArray.push(siteID);
        siteIDs[faviconIndex] = siteID
        if ($faviconImage.hasClass("activeFavicon")){
            currentSiteIndex = faviconIndex;
            window.location.hash = faviconIndex;
        }
    });

    //saving the new positions server sid3
    $.ajax({
        url:"/trails/update_site_list",
        method:"post",
        data:{
            "site_array": siteArray,
            "id" : trailID
        },
        success:function(){
            console.log("updated positions server side");
        }
    });

    //rearranging the iframes if show all sites is toggled

    if ($('iframe').hasClass('shrunk')) {
        shrinkIframes();
    }
}

function highlightCurrentSiteFavicon(currentSiteID){
    $(".activeFavicon").removeClass("activeFavicon");
    var currentSiteFavicon = $("#favicon"+String(currentSiteID));
    currentSiteFavicon.addClass("activeFavicon");
}

function makeFaviconsDragable(){
    $(".siteFavicons").sortable({
        containment: ".siteFaviconsHolder",
        update: changeSiteOrder
    });
}