
this.keyboardContext = function (camera, mediaUtils) {
    var that = this;
    this.camera = camera;
    this.mediaUtils = mediaUtils;
    this.shiftPressed = undefined;
    this.ctrlPressed = undefined;
    this.detailsObject = undefined;
    this.currentUniforms = undefined;
    this.mediaUtils.extraKeyListener = function(extraKey) {
        that.shiftPressed = extraKey == 16;
        that.ctrlPressed = extraKey == 17;
        if (that.shiftPressed)
            console.log("Shift Pressed");
        else if (that.ctrlPressed)
            console.log("Ctrl Pressed");
        else
            console.log("Nothing pressed.")
    }
    this.cameraLookAt = [1,0];

    this.setShaderDetails = function(detailsObject) {
        that.detailsObject = detailsObject;
        that.currentUniforms = detailsObject.currentUniforms;
    }
    this.setCameraLookAtComplex = function(x, y) {
        // this saves the current position in complex space that the camera is looking at.
        that.cameraLookAt = [x,y];
    }
    this.lookAtComplex = function(x,y) {
        // this moves the camera to look at a point in complex space.
        var p = complexToCartesian(x, y);

        // all the signs are flipped because the camera is not sitting at the origin.
        // it is sitting 1 unit away from the origin, looking thru the origin at the
        // opposite side of the sphere.
        // also the y axis is up.

        that.camera.position.set(-p[0], -p[2], -p[1]);
    }

    this.fullReset = function() {
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
        // that.currentUniforms.complexEffect2OnOff.value = 0;
        that.currentUniforms.complexEffect3OnOff.value = 0;
        that.currentUniforms.complexEffect4OnOff.value = 0;
        that.currentUniforms.complexEffect5OnOff.value = 0;
        that.currentUniforms.schottkyEffectOnOff.value = 0;
        that.currentUniforms.fractalEffectOnOff.value = 0;
        that.currentUniforms.geometryTiming.value = 0;
        that.currentUniforms.hyperbolicTilingEffectOnOff.value = 0;
    	that.currentUniforms.e1x.value = that.currentUniforms.e1y.value = that.currentUniforms.e2x.value = that.currentUniforms.e2y.value = 0;
        that.currentUniforms.loxodromicX.value = 1;
        that.currentUniforms.loxodromicY.value = 0;
        that.currentUniforms.tesselate.value = 0;
        that.currentUniforms.uAlpha.value = 1.0;

        // reseting this can be confusing...
        // that.currentUniforms.uColorVideoMode.value = 1.0;      // need for outer texture.
    }

}

// This handles all user editing of uniforms.
// It sets up icons on construction.
// You can change the uniform being edited.
// API: Constructor, onkeydown, setShaderDetails
this.keyboardEditor = function(
    cameraContext, mediaUtils
) {
    var that = this;
    this.cameraContext = cameraContext;
    this.context = new keyboardContext(cameraContext.camera, mediaUtils);
    this.keyboardHandlers = new keyboardHandlers(this.context);

    this.setShaderDetails = function(detailsObject) {
        that.context.setShaderDetails(detailsObject);
    }

	this.initUniformsEditor = function() {
        //showToast('Hit space bar to show/hide icons.', 2000);
	}
	this.cs = "";   // command sequence
	this.codes = [];
	this.extendedSequence = false;
    this.onkeydown = function(e, extraKey) {

        that.cameraContext.onkeydown(e, extraKey);

        // normally a 2 letter code unless starts with Z. Then collects until next Z. R resets always.
        var x = e.charCode || e.keyCode;  // Get the Unicode value
        var letter = String.fromCharCode(x);  // Convert the value into a character
        console.log("letter is " + letter);
        if (e.keyCode == 187) letter = '+';
        if (e.keyCode == 189) letter = '-';
        if (e.keyCode == 188) letter = ',';
        if (e.keyCode == 190) letter = '.';
        if (e.keyCode == 191) letter = '/';

        if (letter == 'R') {
            that.extendedSequence = false;
            that.cs = '';
            that.codes =[];
            document.getElementById('wordText').innerHTML = '';
            return;
        }
        if (letter == 'W') {
            that.context.fullReset();
            that.cs = '';
            that.codes =[];
            document.getElementById('wordText').innerHTML = '';
            return;
        }
        if (letter == 'Z') {
            if (that.extendedSequence) {
                document.getElementById('wordText').innerHTML = '';
                that.keyboardHandlers.handleSequence(that.cs, that.codes, extraKey);
                that.extendedSequence = false;
            }
            else {
                that.extendedSequence = true;
            }
            that.cs = '';
            that.codes =[];
            return;
        }
        that.cs += letter;
        that.codes.push(e.keyCode);
        if (that.cs.length == 2 && !that.extendedSequence) {
            document.getElementById('wordText').innerHTML = '';
            that.keyboardHandlers.handleSequence(that.cs, that.codes, extraKey);
            that.cs = '';
            that.codes =[];
            return;
        }
        document.getElementById('wordText').innerHTML = that.cs;
    }
    this.updateVariousNumbersForCamera = function() {   // this is called on each frame, so like animate().
        if (that.context.detailsObject == undefined) return;
        // Camera coordinates are in three.js space where Y is up.
        // We want to deal with traditional math coordinates where Z is up
    	var unitVector = (new THREE.Vector3()).copy(that.context.camera.position).normalize();
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
    	var cameraLookAtComplexX = - x / (1.0 - negz);
    	var cameraLookAtComplexY = - y / (1.0 - negz);
    	this.context.setCameraLookAtComplex(cameraLookAtComplexX, cameraLookAtComplexY);
    	this.keyboardHandlers.animate();

    	try {
            var textElement = document.getElementById('cameraText');
            textElement.innerHTML = "<nobr>Camera in three.js coords: (" + that.context.camera.position.x.toFixed(1)
                + "," + that.context.camera.position.y.toFixed(1) + ","
                + that.context.camera.position.z.toFixed(1) + ") len: "
                + that.context.camera.position.length().toFixed(1) + "</nobr>" ;

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
            	cameraLookAtComplexX.toFixed(2) + " + " +
            	cameraLookAtComplexY.toFixed(2) + "i";
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

}