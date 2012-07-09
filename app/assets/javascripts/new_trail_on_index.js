$(function (){
    $(".createTrailButton").click(makeTrail);
})

function makeTrail(){
    trailName = $(".trailNameInput").val();
    $.ajax({
        url: "/trails",
        type: "post",
        data: {
            "name" : trailName
        },
        success: createBookmarklet
    })
}

function createBookmarklet(data){
    $(".trailNameOrBookmarklet").html(data["bookmarklet"]);
}
