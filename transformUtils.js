// Functions specific to doing mobius transforms on videos or stills.
// this must be paired with the appropriate shaders of course.
// issues: zoom sometimes fires on its own for now good reason.
function getCleanSetOfUniforms() {
      var uniforms = {
	    iRotationAmount:    { type: 'f', value: 0.0 },
	    startTime:    { type: 'f', value: 0.0 },
	    iGlobalTime:    { type: 'f', value: 0.0 },
        mobiusEffectsOnOff: { type: 'i', value: 0 },
        textureScale: { type: 'f', value: 1. },
        tesselate: { type: 'f', value: 0. },
        enableTracking: { type: 'i', value: 0 },
        textureX: { type: 'f', value: 0. },
        textureY: { type: 'f', value: 0. },
        textureUAdjustment: { type: 'f', value: 0 },
        textureVAdjustment: { type: 'f', value: 0 },
        complexEffect1OnOff: { type: 'i', value: 1 },
        complexEffect3OnOff: { type: 'i', value: 0 },
        complexEffect4OnOff: { type: 'i', value: 0 },
        complexEffect5OnOff: { type: 'i', value: 0 },
        schottkyEffectOnOff: { type: 'i', value: 0 },
        fractalEffectOnOff: { type: 'i', value: 0 },
	    showFixedPoints: { type: 'i', value: 1 },
	    uBlackMask: { type: 'i', value: 0 },
	    uNadirMask: { type: 'i', value: 0 },
	    uMaskType: { type: 'i', value: 0 },
	    uTextureNumber: { type: 'i', value: 0 },
	    e1x: { type: 'f', value: 0. },
	    e1y: { type: 'f', value: 0. },
	    e2x: { type: 'f', value: 0. }, 
	    e2y: { type: 'f', value: 0. },
        loxodromicX: {type: 'f', value: 1. },
        loxodromicY: {type: 'f', value: 0. },
        drosteType: {type: 'i', value: 0 },
        drosteSpiral: {type: 'i', value: 0 },
        drosteZoom: {type: 'i', value: 0},
        iChannel0:  { type: 't', value: 0 },
        iChannelStillMask1:  { type: 't', value: 0 },
        iChannelStillMask2:  { type: 't', value: 0 },
        iChannelDelayMask:  { type: 't', value: 0 },
      };
      return uniforms;
	};
function getBigAssShaderMaterial(texture, uniforms) {
        if (texture != undefined)
            uniforms.iChannel0 =  { type: 't', value: texture }; 
        var fragmentShaderCode = 
            ""
            + SHADERCODE.uniformsAndGlobals()
            + SHADERCODE.mathUtils()
            + SHADERCODE.mobiusTransformUtils()
            + SHADERCODE.drosteUtils()
            + SHADERCODE.schottkyUtils()
            + SHADERCODE.mainShader_fs()
        ;
        var newMaterial = new THREE.ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: SHADERCODE.mainShader_vs(),
            fragmentShader: fragmentShaderCode,
            side: THREE.DoubleSide,
            transparent: true,
            // wireframe: true
        } );
        return newMaterial;                    
    }

function transformUtils(camera, 
    transformControlsContainerId, complexControlsContainerId, 
    transformControls2ContainerId, textureControlsContainerId,
    mediaUtils) {
    this.canvas = document.querySelector('canvas');
	this.camera = camera;
	var that = this;
	this.transformControlsContainerId = transformControlsContainerId;
    this.complexControlsContainerId = complexControlsContainerId;
    this.transformControls2ContainerId = transformControls2ContainerId;
    this.textureControlsContainerId = textureControlsContainerId;
    this.unitVector = (new THREE.Vector3()).copy(this.camera.position).normalize();;
    this.point1Defined = false;
    this.point2Defined = false;
    this.rotateDirection = 0;
    this.cameraLookAtComplexX = 0;
    this.cameraLookAtComplexY = 0;
    this.mediaUtils = mediaUtils;
    that.recording = false;
    this.mediaUtils.postProcessingAfterVideoRestart = function() {
        that.trackerUtils.reset();        
    }
    this.mediaUtils.postProcessingAfterVideoLoad = function(pid) {
        // Load stills for this video if they exist.
        var pathToSubtractionTexture = 'media/' + pid + 'Still1.png';
        (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
            mediaUtils.setMipMapOptions(texture);
            that.uniforms.iChannelStillMask1.value =  texture; 
        });
        var pathToSubtractionTexture = 'media/' + pid + 'Still2.png';
        (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
            mediaUtils.setMipMapOptions(texture);
            that.uniforms.iChannelStillMask2.value =  texture; 
        });        
    }
    this.mediaUtils.onkeydown = function(e, extraKey){
        if(e.keyCode == 32) {
            that.uniforms.showFixedPoints.value = 0;
            $('.statusText').hide();
        }
        if (e.keyCode == 77) {  // 'm'
            that.useGreenMask();
            // that.uniforms.uBlackMask.value = that.uniforms.uBlackMask.value == 1 ? 0 : 1;
        }
        // TODO: This screen capture should probably go in mediaUtils at some point.
        if (e.keyCode == 82) {  // r - start/stop recording
            if (!that.recording) {
                that.mediaUtils.video_restart();
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
        if (extraKey == 0) {
            if (e.keyCode == 39)    // right arrow
                that.uniforms.textureUAdjustment.value += .0025;
            if (e.keyCode == 37)    // left arrow
                that.uniforms.textureUAdjustment.value -= .0025;
            if (e.keyCode == 38)    // up arrow
                that.uniforms.textureVAdjustment.value += .0025;
            if (e.keyCode == 40)    // down arrow
                that.uniforms.textureVAdjustment.value -= .0025;
            if (e.keyCode == 83) {  // s - stop
                that.uniforms.textureVAdjustment.value = 0;
            }
        }
        if (extraKey == 16) {       // shift
            if (e.keyCode == 39)    // right arrow
                that.rotateLeft();
            if (e.keyCode == 37)    // left arrow
                that.rotateRight();
            if (e.keyCode == 83)  // s - stop
                that.rotationOff();
        }
        if (extraKey == 17) {       // ctrl
            if (e.keyCode == 39)    // right arrow
                that.mediaUtils.cameraRight();
            if (e.keyCode == 37)    // left arrow
                that.mediaUtils.cameraLeft();
            if (e.keyCode == 38)    // up arrow
                that.mediaUtils.cameraUp();
            if (e.keyCode == 40)    // down arrow
                that.mediaUtils.cameraDown();
            if (e.keyCode == 83)  // s - stop
                that.mediaUtils.cameraStop();
        }
        var textureNumber = e.keyCode - 48;
        if (textureNumber < 10 && textureNumber >= 0)
            that.uniforms.uTextureNumber.value = textureNumber;
        e.preventDefault();
    }

    this.cameraVectorLength = 1;    // by default, unit vector.
    this.uniforms = getCleanSetOfUniforms();

    // Initialize the masks to something so everything comes up.
    // These will be changed later as needed.
    var pathToSubtractionTexture = 'media/placeholderStill.png';
    (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
        mediaUtils.setMipMapOptions(texture);
        that.uniforms.iChannelStillMask1.value =  texture; 
    });
    (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
        mediaUtils.setMipMapOptions(texture);
        that.uniforms.iChannelStillMask2.value =  texture; 
    });
    (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
        mediaUtils.setMipMapOptions(texture);
        that.uniforms.iChannelDelayMask.value =  texture;       // the delay mask needs to be initialized to a still for this to work.
    });

    // this is where we over-ride the default in mediaUtils.
    // this is where we hook in all of our transformation code that is in the shaders.
    mediaUtils.setMaterialForTexture = function(texture) {
        var newMaterial = getBigAssShaderMaterial(texture, that.uniforms);
        mediaUtils.setMipMapOptions(texture);
        return newMaterial; 
    }
    this.showToast = function(message, ms) {
        console.log("Showing " + message + " for " + ms) ;
        var options = {
            settings: {
                duration: ms
            }
        };        
        new iqwerty.toast.Toast(message, options);
    }
	this.initTransformUtils = function() {
		that.setupTransformControlIcons();
        that.setupComplexControlIcons();
        //that.showToast('Hit space bar to show/hide icons.', 2000);
	}
    this.setupTransformControlIcons = function() {
    	var container = document.getElementById(that.transformControlsContainerId);
    	appendSingleIcon(container, 'transformControlIcon', 'rotateLeft.png', 'Rotate Left', that.rotateLeft);
    	appendSingleIcon(container, 'transformControlIcon', 'rotateRight.png', 'Rotate Right', that.rotateRight);
    	appendSingleIcon(container, 'transformControlIcon', 'pause.png', 'Rotate Pause', that.rotatePause);
    	appendSingleIcon(container, 'transformControlIcon', 'stop.png', 'No Rotation', that.rotationOff);

    	appendSingleIcon(container, 'transformControlIcon', 'zoomIn.png', 'Zoom In', that.zoomIn);
    	appendSingleIcon(container, 'transformControlIcon', 'zoomOut.png', 'Zoom Out', that.zoomOut);
    	appendSingleIcon(container, 'transformControlIcon', 'cancel.png', 'Cancel Zoom', that.zoomCancel);
    	appendSingleIcon(container, 'transformControlIcon', 'Epsilon1.svg', 'Set Fixed Point 1', that.setFixedPoint1);
        appendSingleIcon(container, 'transformControlIcon', 'Epsilon2.svg', 'Set Fixed Point 2', that.setFixedPoint2);
        appendSingleIcon(container, 'transformControlIcon', 'Epsilon3.svg', 'Set Loxodromic constant', that.setLoxoPointFromClick);
        appendSingleIcon(container, 'transformControlIcon', 'roundDroste.png', 'Round Droste', that.roundDroste);
        appendSingleIcon(container, 'transformControlIcon', 'squareDroste.jpg', 'Square Droste', that.squareDroste);
        appendSingleIcon(container, 'transformControlIcon', 'spiral.png', 'Toggle Spiral Droste Effect', that.toggleSpiralDroste);
        appendSingleIcon(container, 'transformControlIcon', 'zoomIn.png', 'Toggle Droste Zoom Effect', that.toggleDrosteZoom);

    	var container = document.getElementById(that.transformControls2ContainerId);
        appendSingleIcon(container, 'transformControlIcon', 'reset.png', 'Reset', that.reset);
        appendSingleIcon(container, 'transformControlIcon', 'debug.png', 'Show/Hide Debug Info', that.toggleDebugInfo);
        appendSingleIcon(container, 'transformControlIcon', 'toggle.png', 'Toggle View', that.toggleView);
        appendSingleIcon(container, 'transformControlIcon', 'help.png', 'Help/Info', that.showHelpPage);
        appendSingleIcon(container, 'transformControlIcon', 'diffRedMask.svg', 'mask is still', that.useStillMask);
        appendSingleIcon(container, 'transformControlIcon', 'diffMask.svg', 'mask is delayed feed', that.useDelayMask);
        appendSingleIcon(container, 'transformControlIcon', 'diffGreenMask.svg', 'mask out green', that.useGreenMask);
        appendSingleIcon(container, 'transformControlIcon', 'mask.svg', 'make result black', that.blackMask);
        appendSingleIcon(container, 'transformControlIcon', 'beigeMask.svg', 'use original color', that.beigeMask);
        appendSingleIcon(container, 'transformControlIcon', 'nadir.png', 'mask out nadir', that.nadirMask);

    	var container = document.getElementById(that.textureControlsContainerId);
    	appendSingleIcon(container, 'cameraControlIcon', 'left.png', 'texture Left', that.textureLeft);
    	appendSingleIcon(container, 'cameraControlIcon', 'up.png', 'texture Up', that.textureUp);
    	appendSingleIcon(container, 'cameraControlIcon', 'down.png', 'texture Down', that.textureDown);
    	appendSingleIcon(container, 'cameraControlIcon', 'right.png', 'texture Right', that.textureRight);
    	appendSingleIcon(container, 'cameraControlIcon', 'stop.png', 'texture Stop', that.textureStop);
        appendSingleIcon(container, 'cameraControlIcon', 'fovNarrow.png', 'Scale Factor', that.textureSmaller);
        appendSingleIcon(container, 'cameraControlIcon', 'fovWide.png', 'Scale Factor', that.textureLarger);
        appendSingleIcon(container, 'cameraControlIcon', 'tesselate.png', 'Tesselate', that.tesselate);
        appendSingleIcon(container, 'cameraControlIcon', 'crosshairs.png', 'Track', that.textureTrack);
    }
    this.setupComplexControlIcons = function() {
        var container = document.getElementById(that.complexControlsContainerId);
        appendSingleIcon(container, 'transformControlIcon', 'transform1Icon.png', 'Increase N', that.complexEffect1);                
        appendSingleIcon(container, 'transformControlIcon', 'transform2Icon.png', 'Decrease N', that.complexEffect2);                
        appendSingleIcon(container, 'transformControlIcon', 'transform3Icon.png', 'Apply transform', that.complexEffect3);                
        appendSingleIcon(container, 'transformControlIcon', 'transform4Icon.png', 'Apply transform', that.complexEffect4);
        appendSingleIcon(container, 'transformControlIcon', 'surprise.png', 'Debugging transform', that.complexEffect5);                
        appendSingleIcon(container, 'transformControlIcon', 'S1.png', 'Apply theta schottky (Equal Circles)', that.schottkyEffect1);
        appendSingleIcon(container, 'transformControlIcon', 'S2.png', 'Apply theta schottky (Uneven Circles)', that.schottkyEffect2);
        appendSingleIcon(container, 'transformControlIcon', 'S2.png', 'Apollonian Gasket', that.schottkyEffect3);
        appendSingleIcon(container, 'transformControlIcon', 'S2.png', 'Fractal', that.fractalEffect);
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
            that.mediaUtils.toggleView("psphere");
        }
    }
    function appendSingleIcon(containerEl, style, png, title, callback) {
    	var el;
    	el = document.createElement('span');
    	el.innerHTML = "<img src='icons/xxx' title=\"yyy\" class='showhide zzz'></img>"
    		.replace('xxx', png).replace('yyy', title).replace('zzz', style);
    	$(el).click(callback);
    	containerEl.appendChild(el);
    }
    this.showHelpPage = function() {
        window.location.href = 'info.html';
    }
    this.textureLeft = function() { that.uniforms.textureUAdjustment.value += .1; }
    this.textureRight = function() { that.uniforms.textureUAdjustment.value -= .1; }
    this.textureUp = function() { that.uniforms.textureVAdjustment.value += .1; }
    this.textureDown = function() { that.uniforms.textureVAdjustment.value -= .1; }
    this.textureStop = function() { 
        that.uniforms.textureUAdjustment.value = 0; 
        that.uniforms.textureVAdjustment.value = 0; 
    }
    this.textureSmaller = function() { 
        that.uniforms.textureScale.value *= 1.5; }
    this.textureLarger = function() { that.uniforms.textureScale.value /= 1.5; }
    this.textureTrack = function() { 
        that.uniforms.enableTracking.value = that.uniforms.enableTracking.value == 1 ? 0 : 1; 
        if (that.uniforms.enableTracking.value == 1)
            that.trackerUtils = new trackerUtils();
    }
    this.tesselate = function() { that.uniforms.tesselate.value = that.uniforms.tesselate.value == 0 ? 1 : 0; }
    this.complexEffect1 = function() { 
        that.uniforms.complexEffect1OnOff.value += 1;
        that.showToast("n = " + that.uniforms.complexEffect1OnOff.value, 1000);
    }
    this.complexEffect2 = function() { 
        that.uniforms.complexEffect1OnOff.value -= 1;
        that.showToast("n = " + that.uniforms.complexEffect1OnOff.value, 1000);
    }
    this.complexEffect3 = function() { 
        that.uniforms.complexEffect3OnOff.value = that.uniforms.complexEffect3OnOff.value == 0 ? 1 : 0;
    }
    this.complexEffect4 = function() { 
        that.uniforms.complexEffect4OnOff.value = that.uniforms.complexEffect4OnOff.value == 0 ? 1 : 0;
    }
    this.complexEffect5 = function() { 
        that.uniforms.complexEffect5OnOff.value = that.uniforms.complexEffect5OnOff.value == 0 ? 1 : 0;
    }
    this.schottkyEffect1 = function() { 
        that.uniforms.schottkyEffectOnOff.value = that.uniforms.schottkyEffectOnOff.value == 0 ? 1 : 0;
    }
    this.schottkyEffect2 = function() { 
        that.uniforms.schottkyEffectOnOff.value = that.uniforms.schottkyEffectOnOff.value == 0 ? 2 : 0;
    }
    this.schottkyEffect3 = function() { 
        that.uniforms.schottkyEffectOnOff.value = that.uniforms.schottkyEffectOnOff.value == 0 ? 3 : 0;
    }
    this.fractalEffect = function() { 
        that.uniforms.fractalEffectOnOff.value = that.uniforms.fractalEffectOnOff.value == 0 ? 1 : 0;
    }
    this.setFixedPointsIfUndefined = function() {
    	if (!that.point1Defined && !that.point2Defined) {
    		that.setFixedPoint(1);
    	}
    }
    this.useDelayMask = function() {
            that.uniforms.uMaskType.value = that.uniforms.uMaskType.value == 1 ? 0 : 1;
            that.showToast('uMaskType = ' + that.uniforms.uMaskType.value, 1000);
    }
    this.useGreenMask = function() {
            that.uniforms.uMaskType.value = that.uniforms.uMaskType.value == 2 ? 0 : 2;
            that.showToast('uMaskType = ' + that.uniforms.uMaskType.value, 1000);
    }
    this.useStillMask = function() {
            that.uniforms.uMaskType.value = that.uniforms.uMaskType.value == 3 ? 0 : 3;
            that.showToast('uMaskType = ' + that.uniforms.uMaskType.value, 1000);
    }
    this.blackMask = function() {
            that.uniforms.uBlackMask.value = 1;
    }
    this.beigeMask = function() {
            that.uniforms.uBlackMask.value = 0;
    }
    this.nadirMask = function() {
            that.uniforms.uNadirMask.value = that.uniforms.uNadirMask.value == 1 ? 0 : 1;
    }
    this.setFixedPoint1 = function() {that.setFixedPoint(1); }
    this.setFixedPoint2 = function() {that.setFixedPoint(2); }
    this.setFixedPoint = function(pointNumber) {
    	that.uniforms.mobiusEffectsOnOff.value = 1;
    	var x = that.cameraLookAtComplexX;
    	var y = that.cameraLookAtComplexY;
    	if (pointNumber == 1) {
        	that.uniforms.e1x.value = x;
        	that.uniforms.e1y.value = y;
        	that.point1Defined = true;
        	if (!that.point2Defined) {
            	var ant = that.antipode(x,y);
            	that.uniforms.e2x.value = ant.x;
            	that.uniforms.e2y.value = ant.y;	            		
        	}
        }
        else {
        	that.uniforms.e2x.value = x;
        	that.uniforms.e2y.value = y;	            	
        	that.point2Defined = true;
        	if (!that.point1Defined) {
            	var ant = that.antipode(x,y);
            	that.uniforms.e1x.value = ant.x;
            	that.uniforms.e1y.value = ant.y;	            		
        	}
        }
    	console.log("P1 = " + that.uniforms.e1x.value + "," + that.uniforms.e1y.value);
    	console.log("P2 = " + that.uniforms.e2x.value+ "," + that.uniforms.e2x.value);
        console.log("loxo point = " + that.uniforms.loxodromicX.value + "," + that.uniforms.loxodromicY.value);
    }
    this.rotatePause = function() { that.rotate(0); }
    this.rotateLeft = function() { that.rotate(-1); }
    this.rotateRight = function() { that.rotate(1); }
    this.rotate = function(direction) {
		that.setFixedPointsIfUndefined();
    	if (direction == 0) {
    		that.rotateDirection = 0;
    	}
    	else {
        	that.rotateDirection += direction;
    	}
    }
    this.rotationOff = function() {
		that.rotateDirection = 0;
    	that.uniforms.iRotationAmount.value = 0;
    }
    this.setLoxoPointFromClick = function() {
        that.setLoxoPoint(that.cameraLookAtComplexX, that.cameraLookAtComplexY);
    }
    this.roundDroste = function() {
        that.setFixedPointsIfUndefined();
        that.uniforms.drosteType.value = that.uniforms.drosteType.value > 0 ? 0 : 1;
    }
    this.squareDroste = function() {
        that.setFixedPointsIfUndefined();
        that.uniforms.drosteType.value = that.uniforms.drosteType.value > 0 ? 0 : 2;
    }
    this.toggleSpiralDroste = function() {
        that.uniforms.startTime.value = that.uniforms.iGlobalTime.value;
        that.uniforms.drosteSpiral.value = that.uniforms.drosteSpiral.value == 1 ? 0 : 1;
    }
    this.toggleDrosteZoom = function() {
        that.uniforms.drosteZoom.value = (that.uniforms.drosteZoom.value + 1) % 4;
        console.log(that.uniforms.drosteZoom.value);
    }
    this.setLoxoPoint = function(x,y) {
        that.setFixedPointsIfUndefined();
        that.uniforms.loxodromicX.value = x;
        that.uniforms.loxodromicY.value = y;
        console.log("loxo point = " + that.uniforms.loxodromicX.value + "," + that.uniforms.loxodromicY.value);
        that.showToast("Zoom is (" +
                that.uniforms.loxodromicX.value.toFixed(2) + "," +
                that.uniforms.loxodromicY.value.toFixed(2) + "i)"
            , 2000);
    }
    this.zoomIn = function() { that.zoom(.8); }
    this.zoomOut = function() { that.zoom(1.25); }
    this.zoomCancel = function() { that.setLoxoPoint(1.,0.); }
    this.zoom = function(factor) {
		that.setFixedPointsIfUndefined();
        that.setLoxoPoint(
            that.uniforms.loxodromicX.value * factor,
            that.uniforms.loxodromicY.value * factor);
    }
    this.antipode = function(inx,iny) {
    	// -(1/conj(x,y))
    	var x = inx;
    	var y = -iny; // conjugate
    	var denom = x*x + y*y;
    	return {
    		x: -x/denom,
    		y: y/denom
    	}
    }
    this.toggleDebugInfo = function() {
    	that.uniforms.showFixedPoints.value = that.uniforms.showFixedPoints.value == 0 ? 1 : 0;
    	if (that.uniforms.showFixedPoints.value == 0) {
            $('.statusText').hide();
		}
		else {
            $('.statusText').show();
		}

    }
    this.animate = function() {
        that.uniforms.iRotationAmount.value = that.uniforms.iRotationAmount.value  + .1*that.rotateDirection;
        that.uniforms.iGlobalTime.value = that.uniforms.iGlobalTime.value  + 1;
    	that.updateVariousNumbersForCamera();
        var videoCurrentTime = 0;
        if (that.mediaUtils.videoDisplayed) {
            if (that.capturer == undefined)
                videoCurrentTime = that.mediaUtils.video.currentTime;
            else
                videoCurrentTime = that.capturer.getTiming().performancetime;
            if (that.uniforms.enableTracking.value == 1) {
                var coords = that.trackerUtils.getXY(videoCurrentTime);
                that.uniforms.textureUAdjustment.value = coords[0];
                that.uniforms.textureVAdjustment.value = 1.5-coords[1];
            }
        }
        that.mediaUtils.animate(that.cameraVectorLength, videoCurrentTime);
        if (that.mediaUtils.animationFrame%120 == 0) {
            that.uniforms.iChannelDelayMask.value.image = that.uniforms.iChannel0.value.image;
            that.uniforms.iChannelDelayMask.value.needsUpdate = true;
        }
        // if (that.capturer != undefined && that.mediaUtils.animationFrame%120 == 0)
        if (that.capturer != undefined){
            var recording_fps = 60;
            timing = that.capturer.getTiming();
            actual_fps = timing.performancetime - that.lasttiming.performancetime;
            ratio = actual_fps / recording_fps;
            // playbackRate is normalised
            that.mediaUtils.video.playbackRate = ratio;
            that.lasttiming = timing;

            that.capturer.capture( that.canvas );
        }
    }
    this.reset = function() {
    	that.rotateDirection = 0;
    	that.uniforms.iRotationAmount.value = 0;
    	that.uniforms.iGlobalTime.value = 0;
    	that.point1Defined = false;
    	that.point2Defined = false;
    	that.uniforms.mobiusEffectsOnOff.value = 0;
        that.uniforms.textureScale.value = 1;
        // that.uniforms.enableTracking.value = 0;
        that.trackerUtils.reset();
        that.uniforms.textureUAdjustment.value = 0; 
        that.uniforms.textureVAdjustment.value = 0; 
        that.uniforms.complexEffect1OnOff.value = 1;
        // that.uniforms.complexEffect2OnOff.value = 0;
        that.uniforms.complexEffect3OnOff.value = 0;
        that.uniforms.complexEffect4OnOff.value = 0;
        that.uniforms.complexEffect5OnOff.value = 0;
        that.uniforms.schottkyEffectOnOff.value = 0;
        that.uniforms.fractalEffectOnOff.value = 0;
    	that.uniforms.e1x.value = that.uniforms.e1y.value = that.uniforms.e2x.value = that.uniforms.e2y.value = 0;
        that.uniforms.loxodromicX.value = 1;
        that.uniforms.loxodromicY.value = 0;
        that.uniforms.drosteType.value = 0;
    }
    this.updateVariousNumbersForCamera = function() {
        // Camera coordinates are in three.js space where Y is up.
        // We want to deal with traditional math coordinates where Z is up
    	that.unitVector = (new THREE.Vector3()).copy(that.camera.position).normalize();
		// in three.js y is up. we want z to be up.
        // also we need to flip z and x.
		var y = that.unitVector.x;
		var x = that.unitVector.z;	// assign z to x.
		var z = that.unitVector.y;	// assign y to z.

    	// convert to point on complex plane
        // all the signs are flipped because the camera is not sitting at the origin.
        // it is sitting 1 unit away from the origin, looking thru the origin at the
        // opposite side of the sphere.
        var negz = -z;
    	that.cameraLookAtComplexX = - x / (1.0 - negz);
    	that.cameraLookAtComplexY = - y / (1.0 - negz);

    	try {
            _textElement = document.getElementById('cameraText');
            _textElement.innerHTML = "<nobr>Camera in three.js coords: (" + _camera.position.x.toFixed(1) 
                + "," + _camera.position.y.toFixed(1) + ","  
                + _camera.position.z.toFixed(1) + ") len: " 
                + _camera.position.length().toFixed(1) + "</nobr>" ;

            document.getElementById('unitVectorText').innerHTML = 
            "<nobr>Camera in Cartesian Space: (" + 
            	x.toFixed(1) + "," + 
            	y.toFixed(1) + "," + 
                z.toFixed(1) + "" + 
                ") len: " 
				+ that.unitVector.length().toFixed(1) + "</nobr>" ;   

            document.getElementById('complexPointText').innerHTML = "Looking at " + 
            	that.cameraLookAtComplexX.toFixed(2) + " + " + 
            	that.cameraLookAtComplexY.toFixed(2) + "i";

            document.getElementById('windowSizeText').innerHTML = "Window (wxh): " + 
            	window.innerWidth + " , " + window.innerHeight;

            document.getElementById('canvasSizeText').innerHTML = "Canvas (wxh): " + 
            	        document.getElementsByTagName( 'canvas' )[0].style.width  + 
                " , " +
            	        document.getElementsByTagName( 'canvas' )[0].style.height; 

 		}
		catch (x) {}
    }
    this.initTransformUtils();
}