TrailsObject = function(trailsObject,currentTrailId){
    var baseTrailObject = trailsObject
    var currentTrailId = currentTrailId;
    var trails = {}
    var thisTrailsObject = this;

    this.switchToTrail = function(newTrailId){
        currentTrailId = newTrailId;
        chrome.runtime.sendMessage({setCurrentTrailID:newTrailId}, function(response) {
        });
    }
    this.getCurrentTrail = function(){
        return trails[currentTrailId];
    }
    this.getCurrentTrailId = function(){
        return currentTrailId;
    }
    this.getCurrentRevision = function(){
        this.getCurrentTrail().getCurrentRevision();
    }
    this.incrementRevision = function(){
        this.getCurrentTrail().incrementRevision();
    }

    // returns current revision and increments the revision
    this.getAndIncrementRevision = function(){
        return this.getCurrentTrail().getAndIncrementRevision();
    }

    this.updateTrails = function(localStorageTrailsObject){
        wt_$.each(localStorageTrailsObject,function(trailId,trailObject){
            if (trails[trailId]){
                trails[trailId].updateSites(trailObject);
            } else {
                trails[trailId] = new Trail(trailObject);
            }

        })
    };

    this.initTrails = function(){
        wt_$.each(baseTrailObject,function(trailId,trailObject){
            trails[trailId] = new Trail(trailObject)
        })
        chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
            if (request.updateTrails){
                thisTrailsObject.updateTrails(request.updateTrails);
            }
        })
    }
}

Trail = function(trailObject){
    var baseTrailObject = trailObject;
    var sites = {};
    var siteOrder = trailObject.sites.order;
    var currentSiteRevision = 0;

    this.id = trailObject.id;

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
        if (sitesInOrder.length){
            return sitesInOrder[sitesInOrder.length-1]
        } else {
            return false;
        }
    }

    this.getLastNote = function(){
        var lastSite = this.getLastSite();
        var lastNote = false;
        while (lastSite && !(lastNote = lastSite.getLastNote())){
            lastSite = lastSite.previousSite()
        }
        return lastNote
    }

    this.updateSites = function(newTrailObject){
        wt_$.each(newTrailObject.sites.order, function(i,siteId){
            var siteToUpdate;
            var newSiteBaseObject = newTrailObject.sites.siteObjects[siteId];
            if (!(siteToUpdate  = sites[siteId])){
                console.log("creating new site");
                TrailPreview.addSiteToPreview(sites[siteId] = new Site(newSiteBaseObject, thisTrailObject));
            } else {
                console.log("updating existing site");
                siteToUpdate.updateNotes(newSiteBaseObject);
            }
        })
    }

    this.isCurrentTrail = function(){
        return Trails.getCurrentTrail() == this && TrailPreview;
    };

    this.getCurrentRevision = function() {
        return currentSiteRevision;
    };

    this.incrementRevision = function() {
        return currentSiteRevision += 1;
    };

    // gets the current revision and increments the revision
    // not the best way to do this. should have mutex, but better than doing not at the same time
    this.getAndIncrementRevision = function() {
        var rev = this.getCurrentRevision();
        this.incrementRevision();
        return rev;
    };

    var thisTrailObject = this;
    wt_$.each(trailObject.sites.siteObjects,function(siteId,siteObject){
        sites[siteId] = new Site(siteObject, thisTrailObject);
    })
}

Site = function(siteObject, parentTrail){
    var siteObject = siteObject;
    var notes = {};
    var noteOrder = [];
    this.revisions = siteObject.html;
    this.id = siteObject.id;
    this.trail = parentTrail;

    var thisSiteObject = this;

    this.addNote = function(baseNoteObject){
        var newNote = notes[baseNoteObject.id] = new Note(baseNoteObject, thisSiteObject);
        noteOrder.push(baseNoteObject.id);
        return newNote
    };

    this.nextSite = function(){
        var sitesInOrder = this.trail.getSites();
        var currentIndex = sitesInOrder.indexOf(this);
        if (currentIndex < (sitesInOrder.length - 1)){
            return this.trail.getSite(sitesInOrder[currentIndex+1].id);
        } else {
            return false;
        }
    };

    this.previousSite = function(){
        var sitesInOrder = this.trail.getSites();
        var currentIndex = sitesInOrder.indexOf(this);
        if (currentIndex > 0){
            return this.trail.getSite(sitesInOrder[currentIndex-1].id);
        } else {
            return false;
        }
    };

    this.firstNote = function(){
        var firstNote = this.getNotes()[0];
        if (firstNote){
            return firstNote;
        } else {
            return false;
        }
    };

    this.getNotes = function(){
        var notesInOrder = [];
        wt_$.each(noteOrder,function(i,noteId){
            notesInOrder.push(notes[noteId]);
        })
        return notesInOrder;
    };

    this.getNote = function(noteId){
        return notes[noteId];
    };

    this.getLastNote = function(){
        var notesInOrder = this.getNotes();
        if (notesInOrder.length){
            return notesInOrder[notesInOrder.length - 1];
        } else {
            return false;
        }
    };

    this.updateNotes = function(newSiteBaseObject){
        wt_$.each(newSiteBaseObject.notes.order, function(i, noteId){
            var existingNoteObject;
            var newBaseNoteObject = newSiteBaseObject.notes.noteObjects[noteId];
            if (!(existingNoteObject = notes[noteId])){
                var newNote = thisSiteObject.addNote(newBaseNoteObject);
                if (thisSiteObject.trail.isCurrentTrail()){
                    TrailPreview.updateWithNewNote(newNote);
                }
            } else {
                notes[noteId].update(newBaseNoteObject);
            }
        })
    };

    this.getRevisionHtml = function(revisionNumber){
        return this.revisions[revisionNumber]
    };

    this.getFirstRevisionHtml = function(){
        if (this.firstNote()) {
            return this.firstNote().getSiteRevisionHtml();
        } else {
            return false
        }
    };

    wt_$.each(siteObject.notes.noteObjects, function(noteId, noteObject){
        thisSiteObject.addNote(noteObject);
    })
}

Note = function(baseNoteObject, parentSite){
    var siteRevisionNumber = baseNoteObject.siteRevisionNumber;
    this.site = parentSite;

    this.getSiteRevisionHtml = function() {
        return this.site.getRevisionHtml(siteRevisionNumber)
    }

    this.nextNote = function(){
        var notesInOrder = this.site.getNotes();
        var currentIndex = notesInOrder.indexOf(this);
        if (currentIndex < (notesInOrder.length - 1)){
            return this.site.getNote(notesInOrder[currentIndex+1].id);
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
    };

    this.previousNote = function(){
        var notesInOrder = this.site.getNotes();
        var currentIndex = notesInOrder.indexOf(this);
        if (currentIndex > 0){
            return this.site.getNote(notesInOrder[currentIndex-1].id);
        } else {
            var newSite = this.site.previousSite();

            if (!newSite){
                return false;
            }

            while (newSite.previousSite() && !newSite.getLastNote()){
                newSite = newSite.previousSite();
            }

            return newSite.getLastNote();
        }
    };

    this.update = function(baseNoteObject){
        this.id = baseNoteObject.id;
        this.comment = baseNoteObject.comment;
        this.clientSideId = baseNoteObject.clientSideId
    };

    this.update(baseNoteObject);
    if (this.site.trail.isCurrentTrail()) { TrailPreview.updateWithNewNote(this) }
}