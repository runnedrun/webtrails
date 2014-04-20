var extensionId = "licjjfdkiaomppkgbnodndielanmemej";

$(function() {
  $("#trail-create-button").click(makeTrail);
    $("#trail-name").keypress(function(e) {
        if(e.which == 13) {
            makeTrail();
        }
    })
  setupTrailScrolling();
  makeSitesDraggable();
  clampSiteTitles();


  $('.edit-trail-button').click(editTrailName);

  function editTrailName(e) {
    console.log("nice click");
    var trailID = $(this).attr('data-trail-id');
    var $trailname = $('#trail-name-' + trailID);
    $trailname.attr("contentEditable","true");

    $(this).find("i").removeClass("icon-pencil").addClass("icon-ok");
    $(this).unbind("click");
    $(this).click(function(){saveTrailNameToServer($trailname.text(), trailID);});

    $trailname.keypress(function(e){
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13 && !e.shiftKey){
            saveTrailNameToServer($trailname.text(), trailID);
            e.preventDefault();
        }
    });
    $trailname.click(function(e){
      e.preventDefault();
    });
    $trailname.focus();
    $trailname.select();
  }

  function createHelper(e, element){
      var clickedSite = $(element)
      var clickedSiteClone = clickedSite.clone();
      clickedSiteClone.css({
          position:"absolute"
      })
      clickedSite.addClass("dragging-clone");
      return clickedSite
    }

    function makeSitesDraggable(){
        $(".user-trails .sites-display").addClass("drag-between").sortable({
            connectWith: ".drag-between",
            zIndex: 99999,
            helper: createHelper,
            stop: moveSiteToNewTrail
        });
    }

    function moveSiteToNewTrail(event, ui){
        var siteThatWasDragged = ui.item;
        var newTrailContainer = siteThatWasDragged.parent()
        var trailID = newTrailContainer.data().trailId
        var siteArray = newTrailContainer.children().map(function(i,child){
            return $(child).data().siteId
        }).get();
        //replace the href so it goes to the new trail
        var siteLink = siteThatWasDragged.find(".site-link");
        var noteLink = siteThatWasDragged.find(".note-link");
        siteLink.attr("href", "/trails/" + String(trailID) + "#" + siteThatWasDragged.data().siteId);
        noteLink.attr("href",
            "/trails/" + String(trailID) + "#" + siteThatWasDragged.data().siteId + "-" + noteLink.data().noteId);
        //saving the new positions server sid3
        $.ajax({
            url:"/trails/update_site_list",
            method:"post",
            data:{
                "site_array": siteArray,
                "id" : trailID
            },
            success:function(){
                console.log("updated trail server side");
            }
        });
    }

  function saveTrailNameToServer(trailName, trailID) {
    console.log("saving to server", trailName, trailID);
    $.ajax({
        url: "/trails/update",
        type: "post",
        data: {
            "id" : trailID,
            "name": trailName
        },
        success: function(resp){console.log("trail saved");updateTrailCallback(trailID);}
    });
  }

  function updateTrailCallback(trailID) {
    var $trailname = $('#trail-name-' + trailID);
    var $editButton = $('#edit-trail-' + trailID);
    $trailname.attr("contentEditable","false");
    $editButton.find("i").removeClass("icon-ok").addClass("icon-pencil");
    $editButton.unbind("click");
    $editButton.click(editTrailName);
    $trailname.blur();
    $trailname.unbind();
  }

  $('.remove-trail-button').click(function(e) {
    $(this).attr('disabled', 'disabled');
    $(this).addClass('disabled');
    deleteTrail($(this).attr('data-trail-id'));
    e.preventDefault();
    $(this).unbind();
  });

  function deleteTrail(trailID) {
    $.ajax({
        url: "/trails/delete",
        type: "post",
        data: {
            "id" : trailID
        },
        success: function(){
            chrome.runtime.sendMessage(extensionId, {updateTrailsObject: true});
            deleteTrailLocally(trailID);
        }
    });
  }

  function deleteTrailLocally(trailID) {
   $("#trail-container-" + trailID).remove()
  }

    $('.delete-site-button').click(function(e) {
        $(this).attr('disabled', 'disabled');
        $(this).addClass('disabled');
        deleteSite($(this).data("site-id"));
        e.preventDefault();
        $(this).unbind();
    });

    function deleteSite(siteId) {
        $.ajax({
          url: "/sites/delete",
          type: "post",
          data: {
              "id" : siteId
          },
          success: function(){
              chrome.runtime.sendMessage(extensionId, {updateTrailsObject: true});
              deleteSiteLocally(siteId);
          }
        });
    }

    function deleteSiteLocally(siteId) {
        $(".site-display[data-site-id=" + siteId + "]").remove();
    }
});

function makeTrail(){
    var trailName = $("#trail-name").val();
    if (trailName == "") {
      $("#trail-create-control-group").addClass("error");
        // if type in trail-name, then no error
        $('#trail-name').keypress(function(){
          $("#trail-create-control-group").removeClass("error");
          $('#trail-name').unbind();
        });
      return;
    }
    $.ajax({
        url: "/trails",
        type: "post",
        data: {
            "name" : trailName
        },
        success: function(data) {
          // TODO: popup display of trail created or something
          chrome.runtime.sendMessage(extensionId, {updateTrailsObject: true})
          location.reload(true);
        }
    });
}

function setupTrailScrolling() {
  var portion = .5; // where mouse is horizontally on div
  var currentScrollInterval = null;

  $('.sites-display-container').mousemove(function(e){
    portion = (e.pageX - this.offsetLeft)/$(this).width();
  }).mouseleave(function() { 
    clearInterval(currentScrollInterval);
  }).mouseenter(function(e) {
    var $this = $(this);
    portion = (e.pageX - this.offsetLeft)/$(this).width();
    var $sitesDisplay = $(".sites-display", this);
    var containerWidth = $(this).width();

    currentScrollInterval = setInterval(function() {
      var scrollProp = .15; //proportion across the div that is scroll in each direction
      var scrollAmount = 50
      if (portion < scrollProp) {
        var scale = (1 - portion/scrollProp) * 2;
        var destLeft = $this.scrollLeft() - scrollAmount * scale;

        // $sitesDisplay.stop().animate({left: destLeft }, 110);
        $this.scrollLeft(destLeft);

      } else if (portion > 1 - scrollProp) {
        var scale = (1 - (1 - portion)/scrollProp) * 2;
        var destLeft = $this.scrollLeft() + scrollAmount * scale;
        console.log(destLeft, -($sitesDisplay.width() - containerWidth), $sitesDisplay.width(), containerWidth)
        // if (destLeft < -($sitesDisplay.width() - containerWidth) ) {
        //   destLeft = -($sitesDisplay.width() - containerWidth);
        // }
        // $sitesDisplay.stop().animate({left:  destLeft}, 110);
        $this.scrollLeft(destLeft);
      }
    }, 100);
  });
}

function clampSiteTitles() {
    $(".site-title").each(function(i, site) {
        $clamp(site, {clamp:2})
    });
}