
// This handles all user editing of uniforms.
// It sets up icons on construction.
// You can change the uniform being edited.
this.legacyEditor = function(
    camera, mediaUtils,
    transformControlsContainerId, complexControlsContainerId,
    transformControls2ContainerId, textureControlsContainerId,
    symmetryUtils
) {
    var that = this;
    this.camera = camera;
	this.transformControlsContainerId = transformControlsContainerId;
    this.complexControlsContainerId = complexControlsContainerId;
    this.transformControls2ContainerId = transformControls2ContainerId;
    this.textureControlsContainerId = textureControlsContainerId;
    this.mediaUtils = mediaUtils;
    this.symmetryUtils = symmetryUtils;
    this.newWord = '';

	this.initUniformsEditor = function() {
		that.setupTransformControlIcons();
        that.setupComplexControlIcons();
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
        appendSingleIcon(container, 'transformControlIcon', 'diffRedMask.svg', 'use current as still mask', that.useStillMask);
        appendSingleIcon(container, 'transformControlIcon', 'diffMask.svg', 'mask is delayed feed', that.useDelayMask);
        appendSingleIcon(container, 'transformControlIcon', 'diffGreenMask.svg', 'mask out green', that.useGreenMask);
        appendSingleIcon(container, 'transformControlIcon', 'mask.svg', 'make result black', that.blackMask);
        appendSingleIcon(container, 'transformControlIcon', 'beigeMask.svg', 'Toggle high pass/low pass filter', that.beigeMask);
        appendSingleIcon(container, 'transformControlIcon', 'nadir.png', 'mask out nadir', that.nadirMask);
        appendSingleIcon(container, 'transformControlIcon', 'nadir.png', 'tetrahedral group', that.tetrahedralGroup);

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
        appendSingleIcon(container, 'cameraControlIcon', 'crosshairs.png', 'Animation Track', that.animationTrack);
        appendSingleIcon(container, 'cameraControlIcon', 'three.png', 'Track', that.threePoint);
        appendSingleIcon(container, 'cameraControlIcon', 'alpha.png', 'Change Alpha', that.changeAlpha);
        appendSingleIcon(container, 'cameraControlIcon', 'colorWheel.png', 
            'Toggle Color/Video (only works for some math transforms)', that.toggleColorVideo);
    }
    this.setupComplexControlIcons = function() {
        var container = document.getElementById(that.complexControlsContainerId);
        appendSingleIcon(container, 'transformControlIcon', 'transform1Icon.png', 'Increase N', that.complexEffect1);                
        appendSingleIcon(container, 'transformControlIcon', 'transform2Icon.png', 'Decrease N', that.complexEffect2);                
        appendSingleIcon(container, 'transformControlIcon', 'transform3Icon.png', 'Apply transform', that.complexEffect3);                
        appendSingleIcon(container, 'transformControlIcon', 'transform4Icon.png', 'Apply transform', that.complexEffect4);
        appendSingleIcon(container, 'transformControlIcon', 'tesselate.png', 'Elliptical Tiling', that.complexEffect5);
        appendSingleIcon(container, 'transformControlIcon', 'flatGradient.png', 'Flat Shader', that.flatShader);
        appendSingleIcon(container, 'transformControlIcon', 'polygons.png', 'Polygonal Groups', that.polygonalGroups);
        appendSingleIcon(container, 'transformControlIcon', 'S1.png', 'Apply theta schottky (Equal Circles)', that.schottkyEffect1);
        appendSingleIcon(container, 'transformControlIcon', 'S2.png', 'Apply theta schottky (Uneven Circles)', that.schottkyEffect2);
        appendSingleIcon(container, 'transformControlIcon', 'A.png', 'Apollonian Gasket', that.schottkyEffect3);
        appendSingleIcon(container, 'transformControlIcon', 'F.png', 'Fractal', that.fractalEffect);
        appendSingleIcon(container, 'transformControlIcon', 'triangles.png', 'Hyperbolic Triangles', that.hyperbolicTilingEffect);
        appendSingleIcon(container, 'transformControlIcon', 'beforeOrAfter.png', 'Toggle: apply Geometry first/last', that.toggleGeometryTiming);
        appendSingleIcon(container, 'transformControlIcon', 'P.png', 'Proximities', that.proximityEffect);        
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
        that.currentUniforms.textureScaleX.value *= 1.5; 
        that.currentUniforms.textureScaleY.value *= 1.5; 
    }
    this.textureLarger = function() { 
        that.currentUniforms.textureScaleX.value /= 1.5; 
        that.currentUniforms.textureScaleY.value /= 1.5; 
    }
    this.textureTrack = function() { 
        that.currentUniforms.enableTracking.value = that.currentUniforms.enableTracking.value == 1 ? 0 : 1; 
    }
    this.animationTrack = function() { 
        that.currentUniforms.enableAnimationTracking.value = that.currentUniforms.enableAnimationTracking.value == 1 ? 0 : 1; 
    }
    this.threePoint = function() { 
        that.currentUniforms.uThreePointMappingOn.value = that.currentUniforms.uThreePointMappingOn.value == 1 ? 0 : 1; 
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
        console.log("uColorVideoMode = " + that.currentUniforms.uColorVideoMode.value);
    }
    this.tesselate = function() { that.currentUniforms.tesselate.value = that.currentUniforms.tesselate.value == 0 ? 1 : 0; }
    this.complexEffect1 = function() { 
        that.currentUniforms.complexEffect1OnOff.value += 1;
    }
    this.complexEffect2 = function() { 
        that.currentUniforms.complexEffect1OnOff.value -= 1;
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
    this.flatShader = function() {
        that.currentUniforms.flatShaderX.value = that.currentUniforms.flatShaderX.value == 0 ? window.innerWidth : 0;
        that.currentUniforms.flatShaderY.value = that.currentUniforms.flatShaderY.value == 0 ? window.innerHeight : 0;
    }
    this.polygonalGroups = function() {
        that.currentUniforms.uPolygonalGroups.value++;
        console.log(that.currentUniforms.uPolygonalGroups.value);
        that.currentUniforms.uPolygonalGroups.value = that.currentUniforms.uPolygonalGroups.value%7;
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
    this.proximityEffect = function() { 
        that.currentUniforms.proximityEffect.value++;
        that.currentUniforms.proximityEffect.value = (that.currentUniforms.proximityEffect.value)%3;
        console.log("prox effect = " + that.currentUniforms.proximityEffect.value )
    }
    this.toggleGeometryTiming = function() { 
        that.currentUniforms.geometryTiming.value = that.currentUniforms.geometryTiming.value == 0 ? 1 : 0;
        console.log("that.currentUniforms.geometryTiming.value = " + that.currentUniforms.geometryTiming.value);
    }

    this.hyperbolicTilingEffect = function() { 
        that.currentUniforms.hyperbolicTilingEffectOnOff.value++;
        that.currentUniforms.hyperbolicTilingEffectOnOff.value = 
            that.currentUniforms.hyperbolicTilingEffectOnOff.value%5;
        console.log(that.currentUniforms.hyperbolicTilingEffectOnOff.value);
     }
    this.setFixedPointsIfUndefined = function() {
    	if (!that.detailsObject.point1Defined && !that.detailsObject.point2Defined) {
    		that.setFixedPoint(1);
    	}
    }
    this.useDelayMask = function() {
        that.currentUniforms.uMaskType.value++;
        that.currentUniforms.uMaskType.value = that.currentUniforms.uMaskType.value%6;
        showToast('uMaskType = ' + that.currentUniforms.uMaskType.value, 1000);
    }
    // these can be deleted:
    this.useGreenMask = function() {
            that.currentUniforms.uMaskType.value = that.currentUniforms.uMaskType.value == 22 ? 0 : 22;
            showToast('uMaskType = ' + that.currentUniforms.uMaskType.value, 1000);
    }
    this.useStillMask = function() {
            // this is set whenever a user selects a new video.
            var pathToSubtractionTexture = that.mediaUtils.pathToCurrentSubtractionTexture  ;
            (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
                console.log("reimannShaderSupport.setDefaults(): loading texture for iChannelDelayMask");
                setMipMapOptions(texture);
                that.currentUniforms.iChannelStillMask1.value =  texture;
            });
            that.currentUniforms.uMaskType.value = that.currentUniforms.uMaskType.value == 2 ? 0 : 2;
            showToast('uMaskType = ' + that.currentUniforms.uMaskType.value, 1000);
    }
    this.blackMask = function() {
            that.currentUniforms.uBlackMask.value = that.currentUniforms.uBlackMask.value == 1 ? 0 : 1;
    }
    this.beigeMask = function() {
            that.currentUniforms.uHighPassFilter.value++;
            that.currentUniforms.uHighPassFilter.value = that.currentUniforms.uHighPassFilter.value%5;            
            showToast('uHighPassFilter = ' + that.currentUniforms.uHighPassFilter.value, 500);
        }
    this.nadirMask = function() {
            that.currentUniforms.uNadirMask.value = that.currentUniforms.uNadirMask.value == 1 ? 0 : 1;
    }
    this.tetrahedralGroup = function(mode) {
        if (mode == 1)
            that.currentUniforms.uApplyMobiusTransform.value = 1;
        var polyhedronIndex = 2;   // tetrahedron, UV
        that.symmetryUtils.updateUniformsForNextSymmetry(polyhedronIndex, that.currentUniforms, mode);
        var labels = that.symmetryUtils.getLabelsAsHTML(polyhedronIndex);
        document.getElementById('matrixText').innerHTML = labels;
    }
    this.setFixedPoint1 = function() {that.setFixedPoint(1); }
    this.setFixedPoint2 = function() {that.setFixedPoint(2); }
    this.setFixedPoint = function(pointNumber, cameraLookAtComplexX, cameraLookAtComplexY) {
    	that.currentUniforms.mobiusEffectsOnOff.value = 1;
        if (cameraLookAtComplexX == undefined)
            cameraLookAtComplexX = that.detailsObject.cameraLookAtComplexX;
        if (cameraLookAtComplexY == undefined)
            cameraLookAtComplexY = that.detailsObject.cameraLookAtComplexY;
        var x = cameraLookAtComplexX;
    	var y = cameraLookAtComplexY;
    	if (pointNumber == 1) {
        	that.currentUniforms.e1x.value = x;
        	that.currentUniforms.e1y.value = y;
        	that.detailsObject.point1Defined = true;
        	if (!that.detailsObject.point2Defined) {
            	var ant = antipode(x,y);
            	that.currentUniforms.e2x.value = ant.x;
            	that.currentUniforms.e2y.value = ant.y;	            		
        	}
        }
        else {
        	that.currentUniforms.e2x.value = x;
        	that.currentUniforms.e2y.value = y;	            	
        	that.detailsObject.point2Defined = true;
        	if (!that.detailsObject.point1Defined) {
            	var ant = antipode(x,y);
            	that.currentUniforms.e1x.value = ant.x;
            	that.currentUniforms.e1y.value = ant.y;	            		
        	}
        }
    	console.log("P1 = " + that.currentUniforms.e1x.value + "," + that.currentUniforms.e1y.value);
    	console.log("P2 = " + that.currentUniforms.e2x.value+ "," + that.currentUniforms.e2x.value);
        console.log("loxo point = " + that.currentUniforms.loxodromicX.value + "," + that.currentUniforms.loxodromicY.value);
    }
    this.setLoxoPointFromClick = function() {
        that.setLoxoPoint(that.detailsObject.cameraLookAtComplexX, that.detailsObject.cameraLookAtComplexY);
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
        // showToast("loxo point is (" +
        //         that.currentUniforms.loxodromicX.value.toFixed(2) + "," +
        //         that.currentUniforms.loxodromicY.value.toFixed(2) + "i)"
        //     , 2000);
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
    this.showHelpPage = function() {
        window.location.href = 'info.html';
    }
    this.rotatePause = function() { that.rotate(0); }
    this.rotateLeft = function() { that.rotate(-1); }
    this.rotateRight = function() { that.rotate(1); }
    this.rotate = function(direction) {
		that.setFixedPointsIfUndefined();
    	if (direction == 0) {
    		that.detailsObject.rotateDirection = 0;
    	}
    	else {
        	that.detailsObject.rotateDirection += direction;
    	}
    }
    this.rotationOff = function() {
		that.detailsObject.rotateDirection = 0;
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
            that.mediaUtils.toggleView("catenoid");
        }
    }
    this.reset = function() {
    	that.detailsObject.rotateDirection = 0;
    	that.currentUniforms.iRotationAmount.value = 0;
    	that.currentUniforms.iGlobalTime.value = 0;
    	that.detailsObject.point1Defined = false;
    	that.detailsObject.point2Defined = false;
    	that.currentUniforms.mobiusEffectsOnOff.value = 0;
        that.currentUniforms.textureScaleX.value = 1;
        that.currentUniforms.textureScaleY.value = 1;
        if (that.currentUniforms.enableTracking.value == 1) {
            that.detailsObject.trackerUtils.reset();
        }
        if (that.currentUniforms.enableAnimationTracking.value == 1) {
            console.log("noop");
            // that.detailsObject.trackerUtils.reset();
        }
        if (that.currentUniforms.uThreePointMappingOn.value == 1) {
            that.detailsObject.threePointTracker.reset();
        }
        that.currentUniforms.textureUAdjustment.value = 0; 
        that.currentUniforms.textureVAdjustment.value = 0; 
        that.currentUniforms.complexEffect1OnOff.value = 1;
        that.currentUniforms.uAnimationEffect.value = 0;
        // that.currentUniforms.complexEffect2OnOff.value = 0;
        that.currentUniforms.complexEffect3OnOff.value = 0;
        that.currentUniforms.complexEffect4OnOff.value = 0;
        that.currentUniforms.complexEffect5OnOff.value = 0;
        that.currentUniforms.flatShaderX.value = 0;
        that.currentUniforms.flatShaderY.value = 0;
        that.currentUniforms.uPolygonalGroups.value = 0;
        that.currentUniforms.schottkyEffectOnOff.value = 0;
        that.currentUniforms.fractalEffectOnOff.value = 0;
        that.currentUniforms.geometryTiming.value = 0;
        that.currentUniforms.hyperbolicTilingEffectOnOff.value = 0;
    	that.currentUniforms.e1x.value = that.currentUniforms.e1y.value = that.currentUniforms.e2x.value = that.currentUniforms.e2y.value = 0;
        that.currentUniforms.loxodromicX.value = 1;
        that.currentUniforms.loxodromicY.value = 0;
        that.currentUniforms.drosteType.value = 0;
        that.currentUniforms.tesselate.value = 0;
        that.currentUniforms.uAlpha.value = 1.0;

        // reseting this can be confusing...
        // that.currentUniforms.uColorVideoMode.value = 1.0;      // need for outer texture.
    }
    this.updateVariousNumbersForCamera = function() {
        if (that.detailsObject == undefined) return;
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
    	that.detailsObject.cameraLookAtComplexX = - x / (1.0 - negz);
    	that.detailsObject.cameraLookAtComplexY = - y / (1.0 - negz);

    	try {
            _textElement = document.getElementById('cameraText');
            _textElement.innerHTML = "<nobr>Camera in three.js coords: (" + _camera.position.x.toFixed(1) 
                + "," + _camera.position.y.toFixed(1) + ","  
                + _camera.position.z.toFixed(1) + ") len: " 
                + _camera.position.length().toFixed(1) + "</nobr>" ;

            var mess = 
            "<nobr>Camera in Cartesian Space: (" + 
            	x.toFixed(1) + "," + 
            	y.toFixed(1) + "," + 
                z.toFixed(1) + "" + 
                ") len: " 
				+ unitVector.length().toFixed(1) + "</nobr>" ;   
            // console.log(mess);
            document.getElementById('unitVectorText').innerHTML = mess;

            mess = "Looking at " + 
            	that.detailsObject.cameraLookAtComplexX.toFixed(2) + " + " + 
            	that.detailsObject.cameraLookAtComplexY.toFixed(2) + "i";
            // console.log(mess);
            document.getElementById('complexPointText').innerHTML = mess;

            document.getElementById('windowSizeText').innerHTML = "Window (wxh): " + 
            	window.innerWidth + " , " + window.innerHeight;

            document.getElementById('canvasSizeText').innerHTML = "Canvas (wxh): " + 
            	        document.getElementById('MainCanvas').style.width  +
                " , " +
            	        document.getElementById('MainCanvas').style.height;

 		}
		catch (x) {}
    }

    this.initUniformsEditor();  // set up GUI controls.
    this.setShaderDetails = function(detailsObject) { 
        that.detailsObject = detailsObject;
        that.currentUniforms = detailsObject.currentUniforms; 
        // that.detailsObject.cameraLookAtComplexX = 0;
        // that.detailsObject.cameraLookAtComplexY = 0;
        // that.detailsObject.point1Defined = false;
        // that.detailsObject.point2Defined = false;
    }
}