TrailsObject = function(trailsObject, currentTrailId){
    var baseTrailObject = trailsObject;
    var trails = {};
    var thisTrailsObject = this;

    this.setCurrentTrail = function(newTrailId) {
        currentTrailId = newTrailId;
    };

    this.switchToTrail = function(newTrailId){
        thisTrailsObject.setCurrentTrail(newTrailId);
        console.log("switching to trail:", newTrailId);
        chrome.runtime.sendMessage({setCurrentTrailID:newTrailId}, function(response) {
        });
    }

    this.getTrail = function(trailId) {
        return trails[trailId];
    }

    this.getTrailHash = function() {
        return trails
    }

    this.getCurrentSiteId = function() {
       return this.getCurrentTrail().getCurrentSiteId();
    }

    this.getCurrentTrail = function(){
        if (this.getCurrentTrailId()){
            return trails[this.getCurrentTrailId()];
        } else { return false }
    }
    this.getCurrentTrailId = function(){
        return currentTrailId || false;
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
        $.each(localStorageTrailsObject, function(trailId,trailObject){
            if (trails[trailId]){
                trails[trailId].updateSites(trailObject);
            } else {
                trails[trailId] = new Trail(trailObject, thisTrailsObject);
                $(document).trigger({type:"trailAdded", trail: trails[trailId]});
            }
        })
        $.each(trails, function(trailId, trail) {
            if (!localStorageTrailsObject[trailId]) {
                $(document).trigger({type:"trailDeleted", trail: trail});
                delete trails[trailId];
            }
        })
    };

    this.requestTrailsUpdate = function() {
        chrome.runtime.sendMessage({updateTrailsObject: true});
    };

    // these methods manipulate the note count for the current site, for the current trail
    this.incrementNoteCount = function() {
        return this.getCurrentTrail().currentSiteNoteCount ++
    };

    this.decrementNoteCount = function() {
        return this.getCurrentTrail().currentSiteNoteCount --
    };

    this.getNoteCount = function() {
        return this.getCurrentTrail().currentSiteNoteCount
    };

    this.setSiteSavedDeeply = function() {
        this.getCurrentTrail().currentSiteSavedDeeply = true
    };

    this.siteSavedDeeply = function() {
        return this.getCurrentTrail().currentSiteSavedDeeply
    };

    function initTrails(){
        $.each(baseTrailObject,function(trailId,trailObject){
            trails[trailId] = new Trail(trailObject, thisTrailsObject)
        });
        if (!trails[currentTrailId]) {
            if(Object.keys(trails).length) {
                thisTrailsObject.switchToTrail(Object.keys(trails)[0]);
            }
        }
        LocalStorageTrailAccess.onTrailDataChange(function(trailsObject) {
            thisTrailsObject.updateTrails(trailsObject);
        });
    }
    initTrails();
}

Trail = function(trailObject, trailsCollection){
    var baseTrailObject = trailObject;
    var sites = {};
    var siteOrder = trailObject.sites.order;
    var currentSiteRevision = 0;
    var currentSiteId = false

    this.id = trailObject.id;
    this.currentSiteSavedDeeply = false;
    this.currentSiteNoteCount = 0;
    this.favicons = trailObject.favicons;
    this.name = trailObject.name;

    this.getSites = function(){
        var sitesInOrder = [];
        $.each(siteOrder,function(i,siteId){
            sitesInOrder.push(sites[siteId]);
        })
        return sitesInOrder;
    }

    this.getSite = function(siteId) {
        return sites[siteId];
    }

    this.getCurrentSiteId = function() {
       return currentSiteId
    }

    this.setCurrentSiteId = function(id) {
        console.log("setting site id");
        currentSiteId = id
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
        var newAndUpdatedSites = $.map(newTrailObject.sites.order, function(siteId, i){
            var siteToUpdate;
            var newSiteBaseObject = newTrailObject.sites.siteObjects[siteId];
            if (!(siteToUpdate = sites[siteId])){
                console.log("creating new site");
                siteToUpdate = sites[siteId] = new Site(newSiteBaseObject, thisTrailObject)
                Toolbar.addFavicon(sites[siteId]);
            } else {
                console.log("updating existing site");
                siteToUpdate.updateSite(newSiteBaseObject);
            }
            return siteToUpdate;
        });
        siteOrder = newTrailObject.sites.order;
        $.each(newAndUpdatedSites, function(i, site) {
            site.fireNewNoteEvents();
        })
    }

    this.isCurrentTrail = function(){
        return trailsCollection.getCurrentTrail() == thisTrailObject && !!Toolbar;
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
    thisTrailObject.updateSites(trailObject);
//    $.each(trailObject.sites.siteObjects,function(siteId,siteObject){
//        sites[siteId] = new Site(siteObject, thisTrailObject);
//    })
}

Site = function(siteObject, parentTrail){
    var notes = {};
    var noteOrder = [];
    this.html = siteObject.html;
    this.id = siteObject.id;
    this.trail = parentTrail;
    this.faviconUrl = siteObject.faviconUrl;
    this.url = siteObject.url;
    this.baseRevisionNumber = siteObject.baseRevisionNumber;

    var thisSiteObject = this;

    this.addNote = function(baseNoteObject){
        var newNote = notes[baseNoteObject.id] = new Note(baseNoteObject, thisSiteObject);
        noteOrder.push(baseNoteObject.id);
        if (thisSiteObject.trail.isCurrentTrail()) {
            newNote.fireNewNoteEvent();
        }
        return newNote
    };

    this.removeNote = function(note) {
        delete notes[note.id];
        noteOrder.splice(noteOrder.indexOf(note.id),1);
    };

    this.isCurrentSite = function() {
        return thisSiteObject.id == thisSiteObject.trail.getCurrentSiteId();
    };

    this.nextSite = function(){
        var sitesInOrder = thisSiteObject.trail.getSites();
        var currentIndex = sitesInOrder.indexOf(thisSiteObject);
        if (currentIndex < (sitesInOrder.length - 1)){
            return thisSiteObject.trail.getSite(sitesInOrder[currentIndex+1].id);
        } else {
            return false;
        }
    };

    this.previousSite = function(){
        var sitesInOrder = thisSiteObject.trail.getSites();
        var currentIndex = sitesInOrder.indexOf(thisSiteObject);
        if (currentIndex > 0){
            return thisSiteObject.trail.getSite(sitesInOrder[currentIndex-1].id);
        } else {
            return false;
        }
    };

    this.getFirstNote = function(){
        var firstNote = thisSiteObject.getNotes()[0];
        if (firstNote){
            return firstNote;
        } else {
            return false;
        }
    };

    this.getNotes = function(){
        var notesInOrder = [];
        $.each(noteOrder,function(i,noteId){
            notesInOrder.push(notes[noteId]);
        });
        return notesInOrder;
    };

    this.getNote = function(noteId){
        return notes[noteId];
    };

    this.getLastNote = function(){
        var notesInOrder = thisSiteObject.getNotes();
        if (notesInOrder.length){
            return notesInOrder[notesInOrder.length - 1];
        } else {
            return false;
        }
    };

    this.getNoteCount = function() {
        return noteOrder.length;
    };

    this.getNotePosition = function(note) {
        return noteOrder.indexOf(note.id) + 1;
    };

    this.updateSite = function(newSiteBaseObject){
        thisSiteObject.html = newSiteBaseObject.html;
        siteObject = newSiteBaseObject;
        $.each(newSiteBaseObject.notes.order, function(i, noteId){
            var existingNoteObject = notes[noteId];
            var newBaseNoteObject = newSiteBaseObject.notes.noteObjects[noteId];
            if (!(existingNoteObject)){
                thisSiteObject.addNote(newBaseNoteObject);
                console.log("adding new note");
            } else {
                notes[noteId].update(newBaseNoteObject);
            }
        });
        noteOrder = newSiteBaseObject.notes.order;
    };

    this.getRevisionHtml = function(revisionNumber){
        return LocalStorageTrailAccess.getSiteRevisionHtml(thisSiteObject.id, revisionNumber);
    };

    this.getFirstRevisionHtml = function() {
        if (thisSiteObject.getFirstNote()) {
            return thisSiteObject.getFirstNote().getSiteRevisionHtml();
        } else {
            return false
        }
    };

    this.fireNewNoteEvents = function() {
        $.each(thisSiteObject.getNotes(), function(i, note) {
            note.fireNewNoteEvent();
        })
    }

    $.each(siteObject.notes.order, function(i,noteId) {
        thisSiteObject.addNote(siteObject.notes.noteObjects[noteId]);
    });
}

Note = function(baseNoteObject, parentSite){
    var siteRevisionNumber = baseNoteObject.siteRevisionNumber;
    var thisNoteObject = this;
    var newNote = true;  //used to know if a new note event should be fired, from site.
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

            while (newSite.nextSite() && !newSite.getFirstNote()){
                newSite = newSite.nextSite();
            }

            if (newSite.getFirstNote()){
                return newSite.getFirstNote();
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

    this.getPositionInSite = function() {
        return this.site.getNotePosition(this)
    };

    this.update = function(baseNoteObject){
        this.id = baseNoteObject.id;
        this.comment = baseNoteObject.comment;
        this.content = baseNoteObject.content;
        this.clientSideId = baseNoteObject.clientSideId
        this.scrollX = baseNoteObject.scrollX;
        this.scrollY = baseNoteObject.scrollY;
    };

    this.delete = function() {
        this.site.removeNote(this);
    };

    this.update(baseNoteObject);

    this.fireNewNoteEvent = function() {
        if (newNote) {
            newNote = false;
            $(document).trigger({
                type:"newNote",
                note: thisNoteObject
            });
        }
    };
}