// TRANSFORM.reimannShaderList 
//      - holds all reimannShaderUniforms.
//      - each call to animate, loops over all uniforms invoking animate.
// The editor works on one set of uniforms at a time. Currently the 'default'.
reimannShaderListObject = function() {
    var that = this;
    this.uniformsList = {}
    this.editor = undefined;
    this.mediaUtils = undefined;
    this.createShader = function(name) {
        var uniforms = new reimannShaderUniforms(that.mediaUtils);
        this.uniformsList[name] = uniforms;

        return uniforms.currentUniforms;
    }
    this.animate = function(animationFrame, videoDisplayed, videoCurrentTime) {
        that.editor.updateVariousNumbersForCamera();
        for (var i in that.reimannShaderUniformsList) {
            var reimannShaderUniforms = that.uniformsList[i];
            reimannShaderUniforms.animate(animationFrame, videoDisplayed, videoCurrentTime);
        }
    }
    this.getShaderUniforms = function(name) {
        return this.uniformsList[name].currentUniforms;
    }
}
TRANSFORM = {}
TRANSFORM.reimannShaderList = new reimannShaderListObject();
// Functions specific to doing mobius transforms on videos or stills.
// this must be paired with the appropriate shaders of course.
reimannShaderUniforms = function(mediaUtils) {
    var that = this;
    that.mediaUtils = mediaUtils;
    that.firstTime = true;
    this.currentUniforms = {
        iRotationAmount:    { type: 'f', value: 0.0 },
        startTime:    { type: 'f', value: 0.0 },
        iGlobalTime:    { type: 'f', value: 0.0 },
        mobiusEffectsOnOff: { type: 'i', value: 0 },
        textureScale: { type: 'f', value: 1. },
        tesselate: { type: 'f', value: 0. },
        uAlpha: { type: 'f', value: 1. },
        uColorVideoMode: { type: 'f', value: 1. },  // need value = 1 for outer texture.
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
        hyperbolicTilingEffectOnOff: { type: 'i', value: 0},
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
    this.setDefaults = function(mediaUtils) {
        // Initialize the masks to something so everything comes up.
        // These will be changed later as needed.
        var pathToSubtractionTexture = 'media/placeholderStill.png';
        (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
            mediaUtils.setMipMapOptions(texture);
            that.currentUniforms.iChannelStillMask1.value =  texture; 
        });
        (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
            mediaUtils.setMipMapOptions(texture);
            that.currentUniforms.iChannelStillMask2.value =  texture; 
        });
        (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
            mediaUtils.setMipMapOptions(texture);
            that.currentUniforms.iChannelDelayMask.value =  texture;       // the delay mask needs to be initialized to a still for this to work.
        });
        
    }
    this.animate = function(animationFrame, videoDisplayed, videoCurrentTime) {
        if (firstTime) {
            setDefaults(that.mediaUtils);
        }
        that.firstTime = false;
        that.currentUniforms.iRotationAmount.value = that.currentUniforms.iRotationAmount.value  + .1*that.rotateDirection;
        that.currentUniforms.iGlobalTime.value = that.currentUniforms.iGlobalTime.value  + 1;

        var videoCurrentTime = 0;
        if (videoDisplayed) {
            if (that.currentUniforms.enableTracking.value == 1) {
                if (that.trackerUtils == undefined) 
                    that.trackerUtils = new trackerUtils(); // happens w canned mode sometimes.

                var coords = that.trackerUtils.getXY(videoCurrentTime);
                that.currentUniforms.textureUAdjustment.value = coords[0];
                that.currentUniforms.textureVAdjustment.value = 1.5-coords[1];
            }
        }
        if (animationFrame%120 == 0) {
            that.currentUniforms.iChannelDelayMask.value.image = that.currentUniforms.iChannel0.value.image;
            that.currentUniforms.iChannelDelayMask.value.needsUpdate = true;
        }
    }
};
function getReimannShaderMaterial(texture, uniforms) {
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

// This handles all user editing of uniforms. 
// It sets up icons on construction.
// You can change the uniform being edited. 
this.reimannUniformsEditor = function(
    camera,
    transformControlsContainerId, complexControlsContainerId, 
    transformControls2ContainerId, textureControlsContainerId
) {
    var that = this;
    this.camera = camera;
	this.transformControlsContainerId = transformControlsContainerId;
    this.complexControlsContainerId = complexControlsContainerId;
    this.transformControls2ContainerId = transformControls2ContainerId;
    this.textureControlsContainerId = textureControlsContainerId;
    this.rotateDirection = 0;

    this.cameraLookAtComplexX = 0;
    this.cameraLookAtComplexY = 0;
    this.point1Defined = false;
    this.point2Defined = false;

	this.initUniformsEditor = function() {
		that.setupTransformControlIcons();
        that.setupComplexControlIcons();
        //that.showToast('Hit space bar to show/hide icons.', 2000);
	}
    this.onkeydown = function(e, extraKey) {
        if (extraKey == 0 || extraKey == undefined) {
            if (e.keyCode == 39)    // right arrow
                that.currentUniforms.textureUAdjustment.value += .0025;
            if (e.keyCode == 37)    // left arrow
                that.currentUniforms.textureUAdjustment.value -= .0025;
            if (e.keyCode == 38)    // up arrow
                that.currentUniforms.textureVAdjustment.value += .0025;
            if (e.keyCode == 40)    // down arrow
                that.currentUniforms.textureVAdjustment.value -= .0025;
            if (e.keyCode == 83) {  // s - stop
                that.currentUniforms.textureVAdjustment.value = 0;
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
            that.currentUniforms.uTextureNumber.value = textureNumber;        
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
        appendSingleIcon(container, 'cameraControlIcon', 'alpha.png', 'Change Alpha', that.changeAlpha);
        appendSingleIcon(container, 'cameraControlIcon', 'alpha.png', 'Toggle Color/Video (only works for some math transforms)', that.toggleColorVideo);
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
        appendSingleIcon(container, 'transformControlIcon', 'A.png', 'Apollonian Gasket', that.schottkyEffect3);
        appendSingleIcon(container, 'transformControlIcon', 'F.png', 'Fractal', that.fractalEffect);
        appendSingleIcon(container, 'transformControlIcon', 'triangles.png', 'Hyperbolic Triangles', that.hyperbolicTilingEffect);
    }
    function appendSingleIcon(containerEl, style, png, title, callback) {
    	var el;
    	el = document.createElement('span');
    	el.innerHTML = "<img src='icons/xxx' title=\"yyy\" class='showhide zzz'></img>"
    		.replace('xxx', png).replace('yyy', title).replace('zzz', style);
    	$(el).click(callback);
    	containerEl.appendChild(el);
    }
    
    this.textureLeft = function() { that.currentUniforms.textureUAdjustment.value += .1; }
    this.textureRight = function() { that.currentUniforms.textureUAdjustment.value -= .1; }
    this.textureUp = function() { that.currentUniforms.textureVAdjustment.value += .1; }
    this.textureDown = function() { that.currentUniforms.textureVAdjustment.value -= .1; }
    this.textureStop = function() { 
        that.currentUniforms.textureUAdjustment.value = 0; 
        that.currentUniforms.textureVAdjustment.value = 0; 
    }
    this.textureSmaller = function() { 
        that.currentUniforms.textureScale.value *= 1.5; }
    this.textureLarger = function() { that.currentUniforms.textureScale.value /= 1.5; }
    this.textureTrack = function() { 
        that.currentUniforms.enableTracking.value = that.currentUniforms.enableTracking.value == 1 ? 0 : 1; 
        if (that.currentUniforms.enableTracking.value == 1)
            that.trackerUtils = new trackerUtils();
    }
    this.changeAlpha = function() { 
        that.currentUniforms.uAlpha.value += .25;
        that.currentUniforms.uAlpha.value = that.currentUniforms.uAlpha.value % 1.0;
        if (that.currentUniforms.uAlpha.value == 0.)
            that.currentUniforms.uAlpha.value = 1.0;
        console.log("alpha = "  + that.currentUniforms.uAlpha.value);
    }
    this.toggleColorVideo = function() {
        that.currentUniforms.uColorVideoMode.value++;
        that.currentUniforms.uColorVideoMode.value = that.currentUniforms.uColorVideoMode.value%7;
    }
    this.tesselate = function() { that.currentUniforms.tesselate.value = that.currentUniforms.tesselate.value == 0 ? 1 : 0; }
    this.complexEffect1 = function() { 
        that.currentUniforms.complexEffect1OnOff.value += 1;
        that.showToast("n = " + that.currentUniforms.complexEffect1OnOff.value, 1000);
    }
    this.complexEffect2 = function() { 
        that.currentUniforms.complexEffect1OnOff.value -= 1;
        that.showToast("n = " + that.currentUniforms.complexEffect1OnOff.value, 1000);
    }
    this.complexEffect3 = function() { 
        that.currentUniforms.complexEffect3OnOff.value = that.currentUniforms.complexEffect3OnOff.value == 0 ? 1 : 0;
    }
    this.complexEffect4 = function() { 
        that.currentUniforms.complexEffect4OnOff.value = that.currentUniforms.complexEffect4OnOff.value == 0 ? 1 : 0;
    }
    this.complexEffect5 = function() { 
        that.currentUniforms.complexEffect5OnOff.value = that.currentUniforms.complexEffect5OnOff.value == 0 ? 1 : 0;
    }
    this.schottkyEffect1 = function() { 
        that.currentUniforms.schottkyEffectOnOff.value = that.currentUniforms.schottkyEffectOnOff.value == 0 ? 1 : 0;
    }
    this.schottkyEffect2 = function() { 
        that.currentUniforms.schottkyEffectOnOff.value = that.currentUniforms.schottkyEffectOnOff.value == 0 ? 2 : 0;
    }
    this.schottkyEffect3 = function() { 
        that.currentUniforms.schottkyEffectOnOff.value = that.currentUniforms.schottkyEffectOnOff.value == 0 ? 3 : 0;
    }
    this.fractalEffect = function() { 
        that.currentUniforms.fractalEffectOnOff.value = that.currentUniforms.fractalEffectOnOff.value == 0 ? 1 : 0;
    }
    this.hyperbolicTilingEffect = function() { 
        that.currentUniforms.hyperbolicTilingEffectOnOff.value = that.currentUniforms.hyperbolicTilingEffectOnOff.value == 0 ? 1 : 0;
    }
    this.setFixedPointsIfUndefined = function() {
    	if (!that.point1Defined && !that.point2Defined) {
    		that.setFixedPoint(1);
    	}
    }
    this.useDelayMask = function() {
            that.currentUniforms.uMaskType.value = that.currentUniforms.uMaskType.value == 1 ? 0 : 1;
            that.showToast('uMaskType = ' + that.currentUniforms.uMaskType.value, 1000);
    }
    this.useGreenMask = function() {
            that.currentUniforms.uMaskType.value = that.currentUniforms.uMaskType.value == 2 ? 0 : 2;
            that.showToast('uMaskType = ' + that.currentUniforms.uMaskType.value, 1000);
    }
    this.useStillMask = function() {
            that.currentUniforms.uMaskType.value = that.currentUniforms.uMaskType.value == 3 ? 0 : 3;
            that.showToast('uMaskType = ' + that.currentUniforms.uMaskType.value, 1000);
    }
    this.blackMask = function() {
            that.currentUniforms.uBlackMask.value = 1;
    }
    this.beigeMask = function() {
            that.currentUniforms.uBlackMask.value = 0;
    }
    this.nadirMask = function() {
            that.currentUniforms.uNadirMask.value = that.currentUniforms.uNadirMask.value == 1 ? 0 : 1;
    }
    this.setFixedPoint1 = function() {that.setFixedPoint(1); }
    this.setFixedPoint2 = function() {that.setFixedPoint(2); }
    this.setFixedPoint = function(pointNumber, cameraLookAtComplexX, cameraLookAtComplexY) {
    	that.currentUniforms.mobiusEffectsOnOff.value = 1;
    	var x = that.cameraLookAtComplexX;
    	var y = that.cameraLookAtComplexY;
    	if (pointNumber == 1) {
        	that.currentUniforms.e1x.value = x;
        	that.currentUniforms.e1y.value = y;
        	that.point1Defined = true;
        	if (!that.point2Defined) {
            	var ant = that.antipode(x,y);
            	that.currentUniforms.e2x.value = ant.x;
            	that.currentUniforms.e2y.value = ant.y;	            		
        	}
        }
        else {
        	that.currentUniforms.e2x.value = x;
        	that.currentUniforms.e2y.value = y;	            	
        	that.point2Defined = true;
        	if (!that.point1Defined) {
            	var ant = that.antipode(x,y);
            	that.currentUniforms.e1x.value = ant.x;
            	that.currentUniforms.e1y.value = ant.y;	            		
        	}
        }
    	console.log("P1 = " + that.currentUniforms.e1x.value + "," + that.currentUniforms.e1y.value);
    	console.log("P2 = " + that.currentUniforms.e2x.value+ "," + that.currentUniforms.e2x.value);
        console.log("loxo point = " + that.currentUniforms.loxodromicX.value + "," + that.currentUniforms.loxodromicY.value);
    }
    this.setLoxoPointFromClick = function() {
        that.setLoxoPoint(that.cameraLookAtComplexX, that.cameraLookAtComplexY);
    }
    this.roundDroste = function() {
        that.setFixedPointsIfUndefined();
        that.currentUniforms.drosteType.value = that.currentUniforms.drosteType.value > 0 ? 0 : 1;
    }
    this.squareDroste = function() {
        that.setFixedPointsIfUndefined();
        that.currentUniforms.drosteType.value = that.currentUniforms.drosteType.value > 0 ? 0 : 2;
    }
    this.toggleSpiralDroste = function() {
        that.currentUniforms.startTime.value = that.currentUniforms.iGlobalTime.value;
        that.currentUniforms.drosteSpiral.value = that.currentUniforms.drosteSpiral.value == 1 ? 0 : 1;
    }
    this.toggleDrosteZoom = function() {
        that.currentUniforms.drosteZoom.value = (that.currentUniforms.drosteZoom.value + 1) % 4;
        console.log(that.currentUniforms.drosteZoom.value);
    }
    this.setLoxoPoint = function(x,y) {
        that.setFixedPointsIfUndefined();
        that.currentUniforms.loxodromicX.value = x;
        that.currentUniforms.loxodromicY.value = y;
        console.log("loxo point = " + that.currentUniforms.loxodromicX.value + "," + that.currentUniforms.loxodromicY.value);
        that.showToast("Zoom is (" +
                that.currentUniforms.loxodromicX.value.toFixed(2) + "," +
                that.currentUniforms.loxodromicY.value.toFixed(2) + "i)"
            , 2000);
    }
    this.zoomIn = function() { that.zoom(.8); }
    this.zoomOut = function() { that.zoom(1.25); }
    this.zoomCancel = function() { that.setLoxoPoint(1.,0.); }
    this.zoom = function(factor) {
		that.setFixedPointsIfUndefined();
        that.setLoxoPoint(
            that.currentUniforms.loxodromicX.value * factor,
            that.currentUniforms.loxodromicY.value * factor);
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
    this.showHelpPage = function() {
        window.location.href = 'info.html';
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
    	that.currentUniforms.iRotationAmount.value = 0;
    }
    this.toggleDebugInfo = function() {
    	that.currentUniforms.showFixedPoints.value = that.currentUniforms.showFixedPoints.value == 0 ? 1 : 0;
    	if (that.currentUniforms.showFixedPoints.value == 0) {
            $('.statusText').hide();
		}
		else {
            $('.statusText').show();
		}

    }
    this.reset = function() {
    	that.rotateDirection = 0;
    	that.currentUniforms.iRotationAmount.value = 0;
    	that.currentUniforms.iGlobalTime.value = 0;
    	that.point1Defined = false;
    	that.point2Defined = false;
    	that.currentUniforms.mobiusEffectsOnOff.value = 0;
        that.currentUniforms.textureScale.value = 1;
        // that.currentUniforms.enableTracking.value = 0;
        if (that.currentUniforms.enableTracking.value == 1) {
            that.trackerUtils.reset();
        }
        that.currentUniforms.textureUAdjustment.value = 0; 
        that.currentUniforms.textureVAdjustment.value = 0; 
        that.currentUniforms.complexEffect1OnOff.value = 1;
        // that.currentUniforms.complexEffect2OnOff.value = 0;
        that.currentUniforms.complexEffect3OnOff.value = 0;
        that.currentUniforms.complexEffect4OnOff.value = 0;
        that.currentUniforms.complexEffect5OnOff.value = 0;
        that.currentUniforms.schottkyEffectOnOff.value = 0;
        that.currentUniforms.fractalEffectOnOff.value = 0;
        that.currentUniforms.hyperbolicTilingEffectOnOff.value = 0;
    	that.currentUniforms.e1x.value = that.currentUniforms.e1y.value = that.currentUniforms.e2x.value = that.currentUniforms.e2y.value = 0;
        that.currentUniforms.loxodromicX.value = 1;
        that.currentUniforms.loxodromicY.value = 0;
        that.currentUniforms.drosteType.value = 0;
        that.currentUniforms.tesselate.value = 0;
        that.currentUniforms.uAlpha.value = 1.0;
        that.currentUniforms.uColorVideoMode.value = 1.0;      // need for outer texture.
    }
    this.updateVariousNumbersForCamera = function() {
        // Camera coordinates are in three.js space where Y is up.
        // We want to deal with traditional math coordinates where Z is up
    	var unitVector = (new THREE.Vector3()).copy(that.camera.position).normalize();
		// in three.js y is up. we want z to be up.
        // also we need to flip z and x.
		var y = unitVector.x;
		var x = unitVector.z;	// assign z to x.
		var z = unitVector.y;	// assign y to z.

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
				+ unitVector.length().toFixed(1) + "</nobr>" ;   

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

    this.initUniformsEditor();  // set up GUI controls.
    this.setUniforms = function(rawUniforms) { 
        that.currentUniforms = rawUniforms; 
    }
}