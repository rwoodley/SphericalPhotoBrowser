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
        if (that.mediaUtils.videoDisplayed) {
            if (that.capturer == undefined)
                videoCurrentTime = that.mediaUtils.video.currentTime;
            else
                videoCurrentTime = that.capturer.getTiming().performancetime;
        }
        TRANSFORM.reimannShaderList.animate(
            that.mediaUtils.animationFrame,
            that.mediaUtils.videoDisplayed,
            videoCurrentTime,
            that.mediaUtils.videoFileName);

        that.mediaUtils.animate(that.cameraVectorLength, videoCurrentTime);
    }

    detailsObject = TRANSFORM.reimannShaderList.getShaderDetailsObject('default');

    this.reimannShaderEditor = new reimannUniformsEditor(
        this.camera, this.mediaUtils,
        transformControlsContainerId, complexControlsContainerId, 
        transformControls2ContainerId, textureControlsContainerId
    );
    if (detailsObject != undefined)
        this.reimannShaderEditor.setShaderDetails(detailsObject);
    TRANSFORM.reimannShaderList.editor = this.reimannShaderEditor;
    //TRANSFORM.reimannShaderList.mediaUtils = this.mediaUtils;


}