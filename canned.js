// handles canned runs.
function cannedRun() {
    var that = this;
    this.init = function() {
        var mode = getParameter('mode', window.location.href);
        if (mode == null) {
            this.createMode = true;
            this.textureName = 'uv.jpg';
            this.textureType = 'still';
            return;
        }
        if (mode == 'uv') {
            this.createMode = false;
            this.textureName = 'uv.jpg';
            this.textureType = 'still';
            this.cameraPosition = [9.4,0.4,6.];
            this.rotateYAmount = 0.0005;
            this.complexEffect3OnOff = 1;
            this.textureScale = 3.5; 
            this.schottkyEffect = 0;
        }
        if (mode == 'couple') {
            this.createMode = false;
            this.textureName = 'couple';
            this.textureType = 'video';
            this.cameraPosition = [9.4,0.4,6.];
            this.rotateYAmount = 0.0005;
            this.complexEffect3OnOff = 1;
            this.textureScale = 3.5;
            this.schottkyEffect = 0;
        }
        if (mode == 'benchmark') {
            this.createMode = false;
            this.textureName = 'couple';
            this.textureType = 'video';
            this.cameraPosition = [9.4,0.4,6.];
            this.rotateYAmount = 0.0005;
            this.complexEffect3OnOff = 1;
            this.textureScale = 3.5;
            this.schottkyEffect = 1;
        }
    }
    this.initMediaUtils = function(mediaUtils) {   // when still or video is defined in URL
        mediaUtils.camera.position.set(
            this.cameraPosition[0],
            this.cameraPosition[1],
            this.cameraPosition[2]);
        mediaUtils.rotateYAmount -= this.rotateYAmount;
    }

    this.initTransformUtils = function(uniforms) {
        uniforms.complexEffect3OnOff.value = that.complexEffect3OnOff;
        uniforms.schottkyEffectOnOff.value = that.schottkyEffect;
        uniforms.textureScale.value *= that.textureScale; 
    }    
    this.setup = function(mediaUtils, transformUtils) {
        if (!that.createMode) {
            mediaUtils.toggleControlPanel();
            this.initMediaUtils(mediaUtils);
            this.initTransformUtils(transformUtils.uniforms);
            if (this.textureType == 'still')
                mediaUtils.updateSkyDomeForFileName(this.textureName);
            else
                mediaUtils.updateVideoForFileName(this.textureName);
        }
        else
            mediaUtils.updateSkyDomeForFileName(that.textureName);   
    }
    this.init();
}