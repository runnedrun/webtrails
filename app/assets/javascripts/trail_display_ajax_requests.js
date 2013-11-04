Request = new function(){
    this.deleteSite = function(site, callback){
        $.ajax({
            url: "/sites/delete",
            type: "post",
            data: {
                "id" : site.id
            },
            success: callback
        });
    };

    this.updateSiteOrder = function(trail, siteOrder) {
        $.ajax({
            url:"/trails/update_site_list",
            method:"post",
            data:{
                "site_array": siteOrder,
                "id" : trail.id
            },
            success:function(){
                console.log("updated positions server side");
            }
        });
    };

    this.updateNoteComment = function(note, newComment, callback) {
        $.ajax({
            url: "/notes/update",
            type: "post",
            data: {
                "id" : note.id,
                "comment": newComment
            },
            success: function(e) { console.log("note saved"); callback(e) }
        });
    };

    this.deleteNote = function(note, callback) {
        $.ajax({
            url: "/notes/delete",
            type: "post",
            data: {
                "id" : note.id
            },
            success: function(e){ console.log("note deleted"), callback(e)}
        })
    };
}();