// handles canned runs.
function cannedRun() {
    var that = this;
    this.init = function() {
        var mode = getParameter('mode', window.location.href);

        // overall defaults
        this.showMirrorBall = false;
        this.geometry = "sphere";

        if (mode == null) {
            this.createMode = true;
            this.textureName = 'uv.jpg';
            this.textureType = 'still';
            return;
        }
        // default for canned runs, override as needed below
        this.createMode = false;
        this.cameraPosition = [9.4,0.4,6.];     // just outside inner sphere
        this.rotateYAmount = 0.0005;
        this.textureType = 'video';
        this.complexEffect3OnOff = 0;
        this.schottkyEffect = 0;
        this.textureScale = 1.;

        // overrides:
        if (mode == 'uv') {
            this.textureName = 'uv.jpg';
            this.textureType = 'still';
            this.complexEffect3OnOff = 1;
            this.textureScale = 3.5; 
        }
        if (mode == 'couple') {
            this.textureName = 'couple';
            this.complexEffect3OnOff = 1;
            this.textureScale = 3.5;
        }
        if (mode == 'couple2') {
            this.textureName = 'coupleCropped';
            this.cameraPosition = [-8.4,3.6,10.1];
            this.complexEffect3OnOff = 1;
            this.textureScale = 2.25;
            this.showMirrorBall = true;
        }
        if (mode == 'torusDance') {
            this.textureName = 'dance200';
            this.geometry = "torus";
            this.cameraPosition = [-7.8,4.8,-2.7];
        }
        if (mode == 'benchmark') {
            this.textureName = 'couple';
            this.complexEffect3OnOff = 1;
            this.textureScale = 3.5;
            this.schottkyEffect = 1;
        }
    }
    this._initMediaUtils = function(mediaUtils) {   // when still or video is defined in URL
        mediaUtils.camera.position.set(
            this.cameraPosition[0],
            this.cameraPosition[1],
            this.cameraPosition[2]);
        mediaUtils.rotateYAmount -= this.rotateYAmount;
    }

    this._initTransformUtils = function(uniforms) {
        uniforms.complexEffect3OnOff.value = that.complexEffect3OnOff;
        uniforms.schottkyEffectOnOff.value = that.schottkyEffect;
        uniforms.textureScale.value *= that.textureScale; 
    }    
    this.setup = function(mediaUtils, transformUtils) {
        if (!that.createMode) {
            mediaUtils.toggleControlPanel();
            this._initMediaUtils(mediaUtils);
            this._initTransformUtils(transformUtils.uniforms);
            if (this.textureType == 'still')
                mediaUtils.updateSkyDomeForFileName(this.textureName);
            else
                mediaUtils.updateVideoForFileName(this.textureName);
        }
        else
            mediaUtils.updateSkyDomeForFileName(that.textureName);   
    }
    // ----
    this.init();
}