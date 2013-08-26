TrailsObject = function(trailsObject,currentTrailId){
    var trailsObject = trailsObject;
    var currentTrailId = currentTrailId;
    var trails = {}
    wt_$.each(trailsObject,function(trailId,trailObject){
        trails[trailId] = new Trail(trailObject)
    })
    this.switchToTrail = function(newTrailId){
        currentTrailId = newTrailId;
        chrome.runtime.sendMessage({setCurrentTrailID:newTrailId}, function(response) {
            console.log(response);
        });
    }
    this.getCurrentTrail  = function(){
        return trails[currentTrailId];
    }
    this.getCurrentTrailId = function(){
        return currentTrailId;
    }
}

Trail = function(trailObject){
    var trailObject = trailObject;
    var sites = {};
    var siteOrder = trailObject.sites.order;

    this.id = trailObject.id;

    var that = this;
    wt_$.each(trailObject.sites.siteObjects,function(siteId,siteObject){
        sites[siteId] = new Site(siteObject,that);
    })

    this.getSites = function(){
        var sitesInOrder = [];
        wt_$.each(siteOrder,function(i,siteId){
            sitesInOrder.push(sites[siteId]);
        })
        return sitesInOrder;
    }

    this.getSite = function(siteId){
        return sites[siteId];
    }

    this.getFirstSite = function(){
        var firstSite = this.getSites()[0];
        if (firstSite){
            return firstSite
        } else {
            return false
        }
    }

    this.getLastSite = function(){
        var sitesInOrder = this.getSites();
        if (sitesInOrder !== []){
            return sitesInOrder[sitesInOrder.length-1]
        } else {
            return false;
        }
    }

    this.getLastNote = function(){
        var lastSite = this.getLastSite();
        if (lastSite){
            return lastSite.getLastNote();
        }
    }
}

Site = function(siteObject,parentTrail){
    var siteObject = siteObject;
    var notes = {};
    var noteOrder = siteObject.notes.order;

    this.id = siteObject.id;
    this.html = siteObject.html;
    this.trail = parentTrail;

    var that = this;
    wt_$.each(siteObject.notes.noteObjects,function(noteId,noteObject){
        notes[noteId] = new Note(noteObject,that);
    })

    this.nextSite = function(){
        var sitesInOrder = this.trail.getSites();
        var currentIndex = sitesInOrder.index(this.id);
        if (currentIndex < (sitesInOrder.length - 1)){
            return this.trail.getSite(sitesInOrder[currentIndex+1]);
        } else {
            return false;
        }
    }

    this.previousSite = function(){
        var sitesInOrder = this.trail.getSites();
        var currentIndex = sitesInOrder.index(this.id);
        if (currentIndex > 0){
            return this.trail.getSite(sitesInOrder[currentIndex-1]);
        } else {
            return false;
        }
    }

    this.firstNote = function(){
        var firstNote = this.getNotes()[0];
        if (firstNote){
            return firstNote;
        } else {
            return false;
        }
    }

    this.getNotes = function(){
        var notesInOrder = [];
        wt_$.each(noteOrder,function(i,noteId){
            notesInOrder.push(notes[noteId]);
        })
        return notesInOrder;
    }

    this.getNote = function(noteId){
        return notes[noteId];
    }

    this.getLastNote = function(){
        var notesInOrder = this.getNotes();
        if (notesInOrder !== []){
            return notesInOrder[notesInOrder.length - 1];
        } else {
            return false;
        }

    }
}

Note = function(noteObject,parentSite){
    this.site = parentSite;
    this.id = noteObject.id;
    this.comment = noteObject.comment;
    this.clientSideId = noteObject.clientSideId

    this.nextNote = function(){
        var notesInOrder = this.site.getNotes();
        var currentIndex = notesInOrder.index(this.id);
        if (currentIndex < (notesInOrder.length - 1)){
            return this.site.getNote(notesInOrder[currentIndex+1]);
        } else {
            var newSite = this.site.nextSite();

            if (!newSite){
                return false
            }

            while (newSite.nextSite() && !newSite.firstNote()){
                newSite = newSite.nextSite();
            }

            if (newSite.firstNote()){
                return newSite.firstNote();
            } else {
                return false;
            }
        }
    }

    this.previousNote = function(){
        var notesInOrder = this.site.getNotes();
        var currentIndex = notesInOrder.index(this.id);
        if (currentIndex > 0){
            return this.site.getNote(notesInOrder[currentIndex-1]);
        } else {
            var newSite = this.site.previousSite();

            if (!newSite){
                return false;
            }

            while (newSite.nextSite() && !newSite.firstNote()){
                newSite = newSite.nextSite();
            }

            return newSite.firstNote();
        }
    }
}