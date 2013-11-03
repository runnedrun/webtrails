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
    }
}()