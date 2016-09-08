// Functions specific to doing mobius transforms on videos or stills.
// this must be paired with the appropriate shaders of course.
// issues: zoom sometimes fires on its own for now good reason.
function transformUtils(camera, transformControlsContainerId, complexControlsContainerId, mediaUtils) {
	this.camera = camera;
	var that = this;
	this.transformControlsContainerId = transformControlsContainerId;
    this.complexControlsContainerId = complexControlsContainerId;
    this.unitVector = (new THREE.Vector3()).copy(this.camera.position).normalize();;
    this.point1Defined = false;
    this.point2Defined = false;
    this.rotateDirection = 0;
    this.cameraLookAtComplexX = 0;
    this.cameraLookAtComplexY = 0;
    this.currentZoom = 1;
    that.mediaUtils = mediaUtils;
    this.uniforms = {
	    iGlobalTime:    { type: 'f', value: 0.0 },
        mobiusEffectsOnOff: { type: 'i', value: 0 },
        complexEffect1OnOff: { type: 'i', value: 0 },
        complexEffect2OnOff: { type: 'i', value: 0 },
        complexEffect3OnOff: { type: 'i', value: 0 },
        complexEffect4OnOff: { type: 'i', value: 0 },
	    showFixedPoints: { type: 'i', value: 1 },
	    zoomFactor: { type: 'f', value: 1.0 },
	    e1x: { type: 'f', value: 0. },
	    e1y: { type: 'f', value: 0. },
	    e2x: { type: 'f', value: 0. },
	    e2y: { type: 'f', value: 0. },
	};
    mediaUtils.setMaterialForTexture = function(texture) {
        that.uniforms.iChannel0 =  { type: 't', value: texture }; 
        texture.minFilter = THREE.LinearFilter; // eliminates aliasing when tiling textures.
        newMaterial = new THREE.ShaderMaterial( {
            uniforms: that.uniforms,
            vertexShader: document.getElementById( 'vs' ).textContent,
            fragmentShader: document.getElementById( 'fs' ).textContent,
            side: THREE.DoubleSide,
            // wireframe: true
        } );
        return newMaterial;                    
    }
	this.initTransformUtils = function() {
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
    	appendSingleIcon(container, 'transformControlIcon', 'cancel.png', 'Cancel Zoom', that.cancel);
    	appendSingleIcon(container, 'transformControlIcon', 'Epsilon1.svg', 'Set Fixed Point 1', that.setFixedPoint1);
    	appendSingleIcon(container, 'transformControlIcon', 'Epsilon2.svg', 'Set Fixed Point 2', that.setFixedPoint2);
    	appendSingleIcon(container, 'transformControlIcon', 'reset.png', 'Reset', that.reset);
        appendSingleIcon(container, 'transformControlIcon', 'debug.png', 'Show/Hide Debug Info', that.toggleDebugInfo);
        appendSingleIcon(container, 'transformControlIcon', 'toggle.png', 'ToggleView', that.mediaUtils.toggleView);
    }
    this.setupComplexControlIcons = function() {
        var container = document.getElementById(that.complexControlsContainerId);
        appendSingleIcon(container, 'transformControlIcon', 'debug.png', 'Show/Hide Debug Info', that.complexEffect1);                
        appendSingleIcon(container, 'transformControlIcon', 'debug.png', 'Show/Hide Debug Info', that.complexEffect2);                
        appendSingleIcon(container, 'transformControlIcon', 'debug.png', 'Show/Hide Debug Info', that.complexEffect3);                
        appendSingleIcon(container, 'transformControlIcon', 'debug.png', 'Show/Hide Debug Info', that.complexEffect4);                
    }
    function appendSingleIcon(containerEl, style, png, title, callback) {
    	var el;
    	el = document.createElement('span');
    	el.innerHTML = "<img src='icons/xxx' title=\"yyy\" class='showhide zzz'></img>"
    		.replace('xxx', png).replace('yyy', title).replace('zzz', style);
    	$(el).click(callback);
    	containerEl.appendChild(el);
    }
    this.complexEffect1 = function() { 
        that.uniforms.complexEffect1OnOff.value = that.uniforms.complexEffect1OnOff.value == 0 ? 1 : 0;
    }
    this.complexEffect2 = function() { 
        that.uniforms.complexEffect2OnOff.value = that.uniforms.complexEffect2OnOff.value == 0 ? 1 : 0;
    }
    this.complexEffect3 = function() { 
        that.uniforms.complexEffect3OnOff.value = that.uniforms.complexEffect3OnOff.value == 0 ? 1 : 0;
    }
    this.complexEffect4 = function() { 
        that.uniforms.complexEffect4OnOff.value = that.uniforms.complexEffect4OnOff.value == 0 ? 1 : 0;
    }
    this.setFixedPointsIfUndefined = function() {
    	if (!that.point1Defined && !that.point2Defined) {
    		that.setFixedPoint(1);
    	}
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
    	that.uniforms.iGlobalTime.value = 0;
    }
    this.zoomIn = function() { that.zoom(.5); }
    this.zoomOut = function() { that.zoom(2.); }
    this.zoomCancel = function() { that.zoom(1/that.currentZoom); }
    this.zoom = function(factor) {
		that.setFixedPointsIfUndefined();
    	that.currentZoom *= factor;
    	that.uniforms.zoomFactor.value = that.currentZoom;
    	console.log(that.currentZoom);
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
        that.uniforms.iGlobalTime.value = that.uniforms.iGlobalTime.value  + .1*that.rotateDirection;
    	that.updateVariousNumbersForCamera();
    }
    this.reset = function() {
    	that.currentZoom = 1.0;
    	that.uniforms.zoomFactor.value = that.currentZoom;
    	that.rotateDirection = 0;
    	that.uniforms.iGlobalTime.value = 0;
    	that.point1Defined = false;
    	that.point2Defined = false;
    	that.uniforms.mobiusEffectsOnOff.value = 0;
        that.uniforms.complexEffect1OnOff.value = 0;
        that.uniforms.complexEffect2OnOff.value = 0;
        that.uniforms.complexEffect3OnOff.value = 0;
        that.uniforms.complexEffect4OnOff.value = 0;
    	that.uniforms.e1x.value = that.uniforms.e1y.value = that.uniforms.e2x.value = that.uniforms.e2y.value = 0;
    }
    this.updateVariousNumbersForCamera = function() {
    	that.unitVector = (new THREE.Vector3()).copy(that.camera.position).normalize();
		// in three.js y is up. we want z to be up.
		// flip the signs on x and z because we're inside the sphere. i think?
		var x = -that.unitVector.x;
		var y = -that.unitVector.z;	// assign z to y.
		var z = -that.unitVector.y;	// assign y to z.

    	// convert to point on complex plane
    	that.cameraLookAtComplexX = - x / (1.0 - z);
    	that.cameraLookAtComplexY = - y / (1.0 - z);

    	try {
            document.getElementById('unitVectorText').innerHTML = 
            "<nobr>Unit Vec: (" + 
            	that.unitVector.x.toFixed(1) + "," + 
            	that.unitVector.z.toFixed(1) + "," + 
            	that.unitVector.y.toFixed(1) + ") len: " 
				+ that.unitVector.length().toFixed(1) + "</nobr>" ;   

            document.getElementById('complexPointText').innerHTML = "Looking at " + 
            	that.cameraLookAtComplexX.toFixed(2) + " + " + 
            	that.cameraLookAtComplexY.toFixed(2) + "i";

            that.textElement = document.getElementById('cameraText');
            that.textElement.innerHTML = "<nobr>Camera: (" + that.camera.position.x.toFixed(1) 
            	+ "," + that.camera.position.y.toFixed(1) + ","  
            	+ that.camera.position.z.toFixed(1) + ") len: " 
				+ that.camera.position.length().toFixed(1) + "</nobr>" ;
		}
		catch (x) {}
    }
    this.initTransformUtils();
}