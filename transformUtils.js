function transformUtils(cameraContext,
    transformControlsContainerId, complexControlsContainerId, 
    transformControls2ContainerId, textureControlsContainerId,
    mediaUtils) {
    this.canvas = document.querySelector('canvas');
	this.cameraContext = cameraContext;
	var that = this;
    this.mediaUtils = mediaUtils;
    that.recording = false;
    
    this.mediaUtils.onkeydown = function(e, extraKey){
        if(e.keyCode == 32) {
            //that.currentUniforms.showFixedPoints.value = 0;
            $('.statusText').hide();
        }
//        if (e.keyCode == 88 && extraKey == 16) {  // shift-X - start/stop recording
//            if (!that.recording) {
//                that.startRecording();
//            }
//            else {
//                that.stopRecording();
//            }
//        }
        that.keyboardEditor.onkeydown(e, extraKey);
        e.preventDefault();
    }
    this.startRecording = function() {
        console.log("Start recording");
        that.recording = true;
        that.capturer = new CCapture({
            framerate: 30,
            verbose: true,
            format: 'webm'
        });
        that.mediaUtils.videoManager.video_play_all_for_recording();
        that.capturer.start();
    }
    this.stopRecording = function() {
        console.log("Stop recording");
        that.recording = false;
        that.capturer.stop();
        that.capturer.save();
        that.capturer = undefined;
        that.mediaUtils.videoManager.video_stop();
    }

    this.cameraVectorLength = 1;    // by default, unit vector.

    // this is where we over-ride the default in mediaUtils.
    // this is where we hook in all of our transformation code that is in the shaders.
    mediaUtils.buildMaterialForTexture = function(texture, meshName) {
        // yes, the name of the mesh is the same name we use to look up uniforms.
        var newMaterial = getReimannShaderMaterial(
            texture,
            TRANSFORM.reimannShaderList.getShaderDetailsObject(meshName).currentUniforms
            );
        setMipMapOptions(texture);
        return newMaterial;
    }
    mediaUtils.changeMeshBeingEditedOverridable = function(meshName) {
        details = TRANSFORM.reimannShaderList.getShaderDetailsObject(meshName);
        that.legacyEditor.setShaderDetails(details);
        that.keyboardEditor.setShaderDetails(details);
    }
    this.animate = function() {
        var videoCurrentTime = 0;
        if (that.mediaUtils.videoManager.videoDisplayed) {
            if (that.capturer == undefined) {
                videoCurrentTime = that.mediaUtils.videoManager.getCurrentTime(that.mediaUtils.activeMeshName);
            }
        }
        if (that.capturer != undefined) {
            that.capturer.capture( that.canvas );
        }
        // Update uniforms. Snatch animationFrame for delay mask if needed.
        TRANSFORM.reimannShaderList.animate(
            that.mediaUtils.animationFrame,
            that.mediaUtils.videoManager.videoDisplayed,
            videoCurrentTime,
            that.mediaUtils.videoManager.videoFileName);

        that.mediaUtils.animate(that.cameraVectorLength, videoCurrentTime);
    }

    detailsObject = TRANSFORM.reimannShaderList.getShaderDetailsObject('default');

    this.legacyEditor = new legacyEditor(
        this.cameraContext.camera, this.mediaUtils,
        transformControlsContainerId, complexControlsContainerId,
        transformControls2ContainerId, textureControlsContainerId,
        new SU2Symmetries()
    );
    this.keyboardEditor = new keyboardEditor(
        this.cameraContext, this.mediaUtils
    );
    if (detailsObject != undefined) {
        this.legacyEditor.setShaderDetails(detailsObject);
        this.keyboardEditor.setShaderDetails(detailsObject);
    }
    TRANSFORM.reimannShaderList.editor = this.keyboardEditor;
    //TRANSFORM.reimannShaderList.mediaUtils = this.mediaUtils;


}