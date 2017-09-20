function videoManager() {
    var that = this;
    this.textureConsumers = [];
    that.video  = document.getElementById('video');
    that.videoSource = document.createElement('source');
    that.video.appendChild(that.videoSource);
    that.video.addEventListener('ended', function() { that.onVideoEnded() } );
    this.videoDisplayed = false;

    this.newVideo = function(pid) {
        // if (that.videoDisplayed && that.videoFileName == pid)
        //     return;
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
        that.video.pause();     
        that.video.play();
        that.videoDisplayed = true;

        that.videoTexture = new THREE.Texture(that.video);
        for (var index in that.textureConsumers) {
            that.textureConsumers[index](that.videoTexture);
        }
    };
    this.animate = function() {
        // this is just to update the timer on the screen. maybe move some into videoManager?
		if (that.videoDisplayed &&  that.video.readyState === that.video.HAVE_ENOUGH_DATA ) {
            if (that.videoTexture) that.videoTexture.needsUpdate = true; 
            var timeRemaining = (that.video.duration - that.video.currentTime).toFixed(0);
            var statusString = that.video.currentTime.toFixed(0) + '<br/>' + timeRemaining;
            return statusString;
		}
        return undefined;
    }
    this.onVideoEnded = function() {
        console.log("The video ended. I have nothing to do so I'm doing nothing. Over-ride this to do something.")
    }
    this.unloadVideo = function() {
        that.video.pause();
        that.videoDisplayed = false;
    }
    this.registerTextureConsumer = function(name, aFunction) {
        that.textureConsumers[name] = aFunction;
    };
    this.video_play = function() {
        // all this messing around to avoid a chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=593273
        console.log("1 Is video paused? " + that.video.paused);
        that.video.pause();             
        setTimeout(function () {      
            that.video.pause();             
            console.log("2 Is video paused? " + that.video.paused);
    		that.video.play();
            console.log("3 Is video paused? " + that.video.paused);
        }, 150);        
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
}