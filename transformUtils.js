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
        if (e.keyCode == 70) {    // f=flight. shift-f = record flight. 
            _flightControl.toggleStartStop(extraKey == 16);
        }
        if (e.keyCode == 88 && extraKey == 16) {  // shift-X - start/stop recording
            if (!that.recording) {
                that.startRecording();
            }
            else {
                that.stopRecording();
            }
        }
        that.reimannShaderEditor.onkeydown(e, extraKey);
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
        that.mediaUtils.videoManager.video_play(function() {
        });
        that.capturer.start();
    }
    this.stopRecording = function() {
        console.log("Stop recording");
        that.recording = false;
        that.capturer.stop();
        that.capturer.save();
        that.capturer = undefined;
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
        that.reimannShaderEditor.setShaderDetails(details);
    }
    this.animate = function() {

        var videoCurrentTime = 0;
        if (that.mediaUtils.videoManager.videoDisplayed) {
            if (that.capturer == undefined)
                videoCurrentTime = that.mediaUtils.videoManager.video.currentTime;
            else {
                
                that.capturer.capture( that.canvas );
            }
        }
        TRANSFORM.reimannShaderList.animate(
            that.mediaUtils.animationFrame,
            that.mediaUtils.videoManager.videoDisplayed,
            videoCurrentTime,
            that.mediaUtils.videoManager.videoFileName);

        that.mediaUtils.animate(that.cameraVectorLength, videoCurrentTime);
    }

    detailsObject = TRANSFORM.reimannShaderList.getShaderDetailsObject('default');

    this.reimannShaderEditor = new reimannUniformsEditor(
        this.camera, this.mediaUtils,
        transformControlsContainerId, complexControlsContainerId, 
        transformControls2ContainerId, textureControlsContainerId,
        new SU2Symmetries()
    );
    if (detailsObject != undefined)
        this.reimannShaderEditor.setShaderDetails(detailsObject);
    TRANSFORM.reimannShaderList.editor = this.reimannShaderEditor;
    //TRANSFORM.reimannShaderList.mediaUtils = this.mediaUtils;


}