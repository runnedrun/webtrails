PanelView = function(trailPreview) {
    var shown = false;
    var percentPerIframe = .23;

    this.showOrHide = function() {
        console.log("showing or hiding panels");
        if (shown) {
            hidePanels();
        } else {
//            if (noteViewActive){
//                disableNoteViewMode();
//            }
            displayPanels();
        }
    };

    this.isShown = function() {
        return shown
    };

    this.update = function() {
        console.log("updating panels");
        $('.wt-site-panel').remove();
        $('.siteClickDiv').remove();
        displayPanels();
    }

    function hidePanels() {
        console.log("unshrink");
        $('.wt-site-panel').remove();
        $('.siteClickDiv').remove();
        trailPreview.show();
        shown = false;
    }

    function displayPanels() {
        console.log("shrink");
        trailPreview.hide();
        var iframesPerRow = 4;
        var marginOffset = (1 - iframesPerRow * percentPerIframe)/(2 * iframesPerRow);

        $.each(Trail.getSites(),function(index, site){
            var iframe  = appendShrunkenIframe(site);
            var row = Math.floor(index/iframesPerRow);
            var col = index - row * iframesPerRow;
            var leftProp = (1 + 2 * col) * marginOffset + col * percentPerIframe;
            var topProp = (1 + 2 * row) * marginOffset + row * percentPerIframe;
            // console.log(index, "left:", (leftProp * 100) + "%", "top:", (topProp * 100) + "%")
            $(iframe).css({left: (leftProp * 100) + "%" , top: (topProp * 100) + "%"});

            var $clickdiv = $(document.createElement('div'));
            $clickdiv.addClass('siteClickDiv');
            $clickdiv.css({left: (leftProp * 100) + "%" ,
                top: (topProp * 100) + "%",
                width: (percentPerIframe * 100) + "%",
                height: (percentPerIframe * 100) + "%"});
            $clickdiv.click(function(e){
                e.preventDefault();
                console.log("iframe click div clicked");
                hidePanels();
                TrailPreview.showSite(site);
            });
            $('#siteClickDivs').append($clickdiv);
        });
        shown = true;
    }

    function appendShrunkenIframe(site) {
        var panel = makeEmptyIframePanel(site);
        var iDoc = getIDoc(panel)[0];
        iDoc.open();
        iDoc.writeln(site.getBaseRevisionHtml());
        iDoc.close();
        return panel;
    }

    function makeEmptyIframePanel(site) {
        var panelIframe = $("<iframe data-site-id='" + site.id + "' class='wt-site-panel webtrails shrunk'>");
        panelIframe.css({
            width: "100%",
            height: "100%"
        }).css(Statics.CSS.shrunkenIframe);
        panelIframe.attr('src',"about:blank");
        $(".siteDisplayDiv").append(panelIframe);
        return panelIframe
    }

    Statics = {
        CSS : {
            shrunkenIframe: {
                "-moz-transform": "scale(" + percentPerIframe + ", " + percentPerIframe + ")",
                "-webkit-transform": "scale(" + percentPerIframe + ", " + percentPerIframe + ")",
                "-o-transform": "scale(" + percentPerIframe + ", " + percentPerIframe + ")",
                "-ms-transform": "scale(" + percentPerIframe + ", " + percentPerIframe + ")",
                "transform": "scale(" + percentPerIframe + ", " + percentPerIframe + ")"
            }
        }
    }
}

