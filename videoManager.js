var _videoUUID = 0;
function VideoSource(meshName, pid, textureConsumers, pidType, streams) {
    var that = this;
    that.recordingUnderway = false;
    this.init = function(meshName, pid, textureConsumers, pidType, streams) {
        // this.textureConsumers = [];
        _videoUUID++;
        that.streams = streams;
        that.video  = document.createElement('video');
        // that.video  = document.getElementById('video'+_videoUUID);
        that.video.id = 'video_____' + meshName
        that.videoSource = document.createElement('source');
        that.video.appendChild(that.videoSource);
        that.video.addEventListener('ended', function() { that.onVideoEnded() } );
        that.textureConsumers = textureConsumers;
        this.setVideoSourceFromPid(pid, pidType);

        that.videoTexture = new THREE.Texture(that.video);
        for (var index in textureConsumers) {
            textureConsumers[index](that.videoTexture);
        }
    }
    this.setVideoSourceFromPid = function(pid, pidType) {
        if (pidType === 'stream') {
//            that.video.pause();     // this line is necessary if you're switch from video to stream, it seems.
            that.video.srcObject = that.streams[pid];
            that.video.play();
        }
        else {
            that.video.srcObject = null;
//            that.streams[pid].stop();
            var pathToTexture = 'media/' + pid;
            if (pid.indexOf('.') == -1)
                pathToTexture = 'media/' + pid + '.mp4';
            console.log('loading: ' + pathToTexture);
            that.videoFileName = pid;
            that.videoSource.setAttribute('src', pathToTexture);
            that.video.load();
            // don't want to play video here because chrome throws an error if you try to
            // play a video without user input, and this is called on init as well as on new video.
        }
    }
    this.onVideoEnded = function() {
        console.log("The video ended. I have nothing to do so I'm doing nothing. Over-ride this to do something.")
    }
    this.loadNewVideo = function(pid, pidType) {
        that.video.pause();
        for (var index in that.textureConsumers) {
            that.textureConsumers[index](that.videoTexture);
        }
        this.setVideoSourceFromPid(pid, pidType);
        // ok to play video at this point.
        that.video.play();
    }
    this.unloadVideo = function() {
        that.video.pause();
    }
    this.video_play = function() {
        that.video.mute = false;
        that.video.play();
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
    this.start_recording = function() {
        that.video.play();
        that.video.playbackRate = .125/2.;     // this has to be found by trial and error. :(
        that.recordingUnderway = true;
    }
    this.stop_recording = function() {
        that.recordingUnderway = false;
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
            if (that.videoTexture)
                that.videoTexture.needsUpdate = true;
            if (that.recordingUnderway)
                return 'recording';
            var timeRemaining = (that.video.duration - that.video.currentTime).toFixed(0);
            var statusString = that.video.currentTime.toFixed(0) + '<br/>' + timeRemaining;
            // console.log(statusString);
            return statusString;
		}
    }
    this.init(meshName, pid, textureConsumers, pidType, streams);
}
function videoManager(mu) { // handles streams too.
    var that = this;
    this.mediaUtils = mu;

    this.videos = {};
    this.streams = {};
    this.makeStream = function(meshName, pid, textureConsumers) {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            // find the theta uvc blender device
            let theta = devices.find(device => device.label === pid);
            // let theta = devices.find(device => device.label.match(/THETA UVC Blender/));
            return theta ? { optional: [{ sourceId: theta.deviceId }] } : true
          }).then((video) => {
            // get the camera
            return navigator.mediaDevices.getUserMedia({ video })
          }).then((stream) => {
                that.streams[pid] = stream;
                that.addVideo(meshName, pid, textureConsumers, "stream" );
        });

    }
    this.addVideo = function(meshName, pid, textureConsumers, pidType) {
        if (meshName in this.videos) {
            this.videos[meshName].loadNewVideo(pid, pidType);
        }
        else {
            this.videos[meshName] = new VideoSource(meshName, pid, textureConsumers, pidType, that.streams);
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
    this.video_play_all_for_recording = function() {
        $.map(that.videos, function(val,key){
            val.start_recording();
        });
    }
    this.video_play_all = function() {
        $.map(that.videos, function(val,key){
            val.video_play();
        });
    }
    this.stop_recording = function() {
        $.map(that.videos, function(val,key){
            val.stop_recording();
        });        
    }
    this.video_restart = function(i,val) {
        that.videos[that.mediaUtils.activeMeshName].video_restart();
        // $.map(that.videos, function(val,key){val.video_restart()});
    }
    this.video_stop = function(i,val) {
        if(Object.keys(that.videos).length > 0) {
            that.videos[that.mediaUtils.activeMeshName].video_stop();
        }
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