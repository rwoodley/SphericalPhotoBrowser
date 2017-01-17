function transformUtils(camera, 
    transformControlsContainerId, complexControlsContainerId, 
    transformControls2ContainerId, textureControlsContainerId,
    mediaUtils) {
    this.canvas = document.querySelector('canvas');
	this.camera = camera;
	var that = this;
    this.mediaUtils = mediaUtils;
    that.recording = false;
    this.mediaUtils.onkeydown = function(e, extraKey){
        if(e.keyCode == 32) {
            //that.currentUniforms.showFixedPoints.value = 0;
            $('.statusText').hide();
        }
        if (e.keyCode == 77) {  // 'm'
            that.useGreenMask();
        }

        if (e.keyCode == 81 && extraKey == 16) {  // shift-Q - start/stop recording
            if (!that.recording) {
                //that.mediaUtils.video_restart();
                console.log("Start recording");
                that.recording = true;
                that.capturer = new CCapture({
                    // framerate: 20,
                    // verbose: true,
                    format: 'webm'
                });
                // that.capturer = new CCapture( { format: 'webm' } );
                //            that.capturer = new CCapture( { format: 'gif', workersPath: 'lib/' } );
                that.capturer.start();
                that.lasttiming = that.capturer.getTiming();
                // that.mediaUtils.video.play();
                document.getElementById('video').playbackRate = 60 / 25
            }
            else {
                console.log("Stop recording");
                that.recording = false;
                that.capturer.stop();
                that.capturer.save();
                that.capturer = undefined;
            }
        }
        that.reimannShaderEditor.onkeydown(e, extraKey);
        e.preventDefault();
    }

    this.cameraVectorLength = 1;    // by default, unit vector.

    // this is where we over-ride the default in mediaUtils.
    // this is where we hook in all of our transformation code that is in the shaders.
    mediaUtils.buildMaterialForTexture = function(texture, configName) {
        var newMaterial = getReimannShaderMaterial(texture, 
        TRANSFORM.reimannShaderList.getShaderUniforms(configName));
        mediaUtils.setMipMapOptions(texture);
        return newMaterial; 
    }
    mediaUtils.changeMeshBeingEditedOverridable = function(meshName) {
        rawUniforms = TRANSFORM.reimannShaderList.getShaderUniforms(meshName);
        that.reimannShaderEditor.setUniforms(rawUniforms);
    }
    this.viewState = 0;
    this.toggleView = function() {
        that.viewState++;
        that.viewState = that.viewState % 4;
        if (that.viewState == 0) {
            that.cameraVectorLength = 1;
            that.mediaUtils.toggleView("sphere");
        }
        if (that.viewState == 1) {
            that.cameraVectorLength = 1;
            that.mediaUtils.toggleView("torus");
        }
        if (that.viewState == 2) {
            that.cameraVectorLength = -1;
            that.mediaUtils.toggleView("plane");
        }
        // if (that.viewState == 3) {
        //     that.cameraVectorLength = 15;
        //     that.mediaUtils.toggleView("sphere");
        // }
        if (that.viewState == 3) {
            that.cameraVectorLength = 15;
            that.mediaUtils.toggleView("steiner");
        }
    }
    this.animate = function() {

        if (that.mediaUtils.videoDisplayed) {
            if (that.capturer == undefined)
                videoCurrentTime = that.mediaUtils.video.currentTime;
            else
                videoCurrentTime = that.capturer.getTiming().performancetime;
        }
        TRANSFORM.reimannShaderList.animate(
            that.mediaUtils.animationFrame,
            that.mediaUtils.videoDisplayed,
            videoCurrentTime);

        var videoCurrentTime = 0;

        that.mediaUtils.animate(that.cameraVectorLength, videoCurrentTime);
    }

    rawUniforms = TRANSFORM.reimannShaderList.getShaderUniforms('default');

    this.reimannShaderEditor = new reimannUniformsEditor(
        this.camera,
        transformControlsContainerId, complexControlsContainerId, 
        transformControls2ContainerId, textureControlsContainerId
    );
    this.reimannShaderEditor.setUniforms(rawUniforms);
    TRANSFORM.reimannShaderList.editor = this.reimannShaderEditor;
    TRANSFORM.reimannShaderList.mediaUtils = this.mediaUtils;


}