var currentSiteDisplay = $("#usersPage");
var notes = {};
var heights = {};
var srcs = {};
$(function(){
    iframeTest();
})

function insertHTMLIntoIframe(html,iframe){
    var siteDoc = iframe[0].contentWindow.document;
    var siteBody = $('body', siteDoc);
    siteBody.html(html);
}

function loadIframes(){
    //site IDS defined in the html
    $.each(siteIDs, function(site) {
        $.ajax({
            url: "/async_site_load",
            type: "get",
            data: {
                "site_id" : site
            },
            success: readySite
        })
    })

}

function readySite(resp) {
    var iframe = $('<iframe class="usersPage" id='+'"'+resp["site_id"]+'"'+'></iframe>');
    $('.siteDisplayDiv').append( iframe );
    srcs[resp["site_id"]] = resp["src"];
    insertHTMLIntoIframe('<script>' +
       'document.domain = "google.com";'+
        '</script>', iframe
    );
    notes[resp["site_id"]] = $.parseJSON(resp["notes"]);
}

function iframeTest(){
    var iframe = $('<iframe class="usersPage" id="myID"></iframe>');
    $('.siteDisplayDiv').append( iframe );
    insertHTMLIntoIframe('<script>' +
        'thisFrame = $("#myID");'+
        'thisFrame[0].contentWindow.document.domain = "google.com";'+
        '</script>', iframe
    );
}

//'document.domain = "google.com";'+
//'var siteSrc = "'+ resp["url"]+'";' +
//        'thisFrame = $("#'+resp["site_id"]+'");'+
//        'thisFrame[0].contentWindow.document.domain = "google.com";'+
//        '$(thisFrame[0].contentWindow.document.body).append(srcs[resp["site_id"]]);'+
//        'thisFrame.ready(function () {' +
//        'heights["'+resp["site_id"]+'"] = thisFrame[0].contentWindow.document.body.scrollHeight;'+
//        '})' +

