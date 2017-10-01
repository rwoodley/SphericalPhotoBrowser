var _videoUUID = 0;
function singleVideo(meshName, pid, textureConsumers) {
    var that = this;
    this.init = function(meshName, pid, textureConsumers) {
        // this.textureConsumers = [];
        _videoUUID++;
        that.video  = document.createElement('video');
        // that.video  = document.getElementById('video'+_videoUUID);
        that.video.id = 'video_____' + meshName
        that.videoSource = document.createElement('source');
        that.video.appendChild(that.videoSource);
        that.video.addEventListener('ended', function() { that.onVideoEnded() } );
        this.setVideoSourceFromPid(pid);

        that.videoTexture = new THREE.Texture(that.video);
        for (var index in textureConsumers) {
            textureConsumers[index](that.videoTexture);
        }
    }
    this.setVideoSourceFromPid = function(pid) {
        var pathToTexture = 'media/' + pid;
        if (pid.indexOf('.') == -1)
            pathToTexture = 'media/' + pid + '.mp4';
        console.log('loading: ' + pathToTexture);
        that.videoFileName = pid;
        if (pid == 'MCA')
            that.videoSource.setAttribute('src', window.URL.createObjectURL(_cameraStream));
        else
            that.videoSource.setAttribute('src', pathToTexture);
        that.video.load();
        // that.video.pause();     
        that.video.play();    
    }
    this.onVideoEnded = function() {
        console.log("The video ended. I have nothing to do so I'm doing nothing. Over-ride this to do something.")
    }
    this.loadNewVideo = function(pid) {
        that.unloadVideo();
        this.setVideoSourceFromPid(pid);
    }
    this.unloadVideo = function() {
        that.video.pause();
    }
    this.video_play = function() {
        // all this messing around to avoid a chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=593273
        // console.log("1 Is video paused? " + that.video.paused);
        // that.video.pause();             
        // setTimeout(function () {      
        //     that.video.pause();             
        //     console.log("2 Is video paused? " + that.video.paused);
    	// 	that.video.play();
        //     console.log("3 Is video paused? " + that.video.paused);
        // }, 150);        
        that.video.play();
    }
    this.video_restart = function() {
        that.video.currentTime = 0;
        that.video_play();
    }
    this.video_stop = function() {
		that.video.pause();    	
    }
    this.video_skip = function(value) {
        that.video.currentTime += value;
    }
    this.video_rewind = function() {
    	that.video_skip(-10);
    }
    this.video_ff = function() {
    	that.video_skip(10);
    }
    this.animate = function() {
		if (that.video.readyState === that.video.HAVE_ENOUGH_DATA ) {
            if (that.videoTexture) that.videoTexture.needsUpdate = true; 
            var timeRemaining = (that.video.duration - that.video.currentTime).toFixed(0);
            var statusString = that.video.currentTime.toFixed(0) + '<br/>' + timeRemaining;
            return statusString;
		}
    }
    this.init(meshName, pid, textureConsumers);
}
function videoManager(mu) {
    var that = this;
    this.mediaUtils = mu;
    this.textureConsumers = [];
    // that.video  = document.getElementById('video');
    // that.videoSource = document.createElement('source');
    // that.video.appendChild(that.videoSource);
    // that.video.addEventListener('ended', function() { that.onVideoEnded() } );
    // this.videoDisplayed = false;

    this.videos = {};
    this.addVideo = function(meshName, pid, textureConsumers) {
        if (meshName in this.videos) {
            this.videos[meshName].loadNewVideo(pid);
        }
        else {
            this.videos[meshName] = new singleVideo(meshName, pid, textureConsumers);
        }
        that.videoDisplayed = true;
    }

    this.animate = function(meshName) {
        var str = '';
        $.map(that.videos, function(val,key) {
            var telemetry = val.animate();
            if (key === meshName)
                str = telemetry;
        });
        // this is just to update the timer on the screen. maybe move some into videoManager?
		// if (that.videoDisplayed &&  that.video.readyState === that.video.HAVE_ENOUGH_DATA ) {
        //     if (that.videoTexture) that.videoTexture.needsUpdate = true; 
        //     var timeRemaining = (that.video.duration - that.video.currentTime).toFixed(0);
        //     var statusString = that.video.currentTime.toFixed(0) + '<br/>' + timeRemaining;
        //     return statusString;
		// }
        return { meshName, str} ;
    }
    this.getCurrentTime = function(meshName) { return that.videos[meshName].currentTime; }
    this.onVideoEnded = function() {
        console.log("The video ended. I have nothing to do so I'm doing nothing. Over-ride this to do something.")
    }
    this.unloadVideos = function(i,val) {
        that.videoDisplayed = false;
        $.map(that.videos, function(val,key){val.unloadVideo()});
    }
    this.video_play = function(i,val) {
        that.videos[that.mediaUtils.activeMeshName].video_play();
        // $.map(that.videos, function(val,key){val.video_play()});
    }
    this.video_restart = function(i,val) {
        that.videos[that.mediaUtils.activeMeshName].video_restart();
        // $.map(that.videos, function(val,key){val.video_restart()});
    }
    this.video_stop = function(i,val) {
        that.videos[that.mediaUtils.activeMeshName].video_stop();
        // $.map(that.videos, function(val,key){val.video_stop()});
    }
    this.video_skip = function(value) {
        that.videos[that.mediaUtils.activeMeshName].video_skip();
        // $.map(that.videos, function(val,key){val.video_skip()});
    }
    this.video_rewind = function(i,val) {
        that.videos[that.mediaUtils.activeMeshName].video_rewind();
        // $.map(that.videos, function(val,key){val.video_rewind()});
    }
    this.video_ff = function(i,val) {
        that.videos[that.mediaUtils.activeMeshName].video_ff();
        // $.map(that.videos, function(val,key){val.video_ff()});
    }
}