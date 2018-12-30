this.keyboardHandlers = function(context) {
    this.context = context;
    var that = this;
    this.keyboardHandlerComplex = new keyboardHandlerComplex(context);

    this.handleSequence = function(seq, codes, extraKey) {
        console.log("SEQUENCE: " + seq);
        var opts = seq.substring(1);
        switch(seq[0]) {
            case 'D':
                that.toggleDebugInfo();
                break;
            case 'G':
                that.handleGeo(opts, codes);
                break;
            case 'M':
                that.handleMask(opts, codes);
                break;
//            case 'C':
//                that.keyboardHandlerCamera.handleSequence(opts, codes);
//                break;
            case 'E':
                that.handleEffects(opts, codes);
                break;
            case 'X':
                that.keyboardHandlerComplex.handleSequence(opts, codes);
                break;
            case 'T':
                that.handleTexture(opts, codes);
                break;
        }
    }
    that.handleCamera = function(seq, codes) {
    }
    that.handleEffects = function(seq, codes) {
    }
    that.handleTexture = function(seq, codes) {
    }

    that.handleMask = function(seq, codes) {
        var opts = seq.substring(1);
        switch (seq[0]) {
            case 'Q':   // reset
                that.context.currentUniforms.uBlackMask.value = 0;
                that.context.currentUniforms.uMaskType.value = 0;
                break;
            case 'B':
                 that.context.currentUniforms.uBlackMask.value++;
                 that.context.currentUniforms.uBlackMask.value = that.context.currentUniforms.uBlackMask.value%5 ;
               break;
            default:    // numbers work here, 1->5.
                that.context.currentUniforms.uMaskType.value = parseInt(seq[0]);
                break;
        }
    }
    that.handleGeo = function(seq, codes) {
        switch (seq[0]) {
            case 'S':
                that.context.mediaUtils.toggleView("sphere");
                break;
            case 'T':
                that.context.camera.position.set(-15.0, 1.0, 0.0);
                that.context.mediaUtils.toggleView("torus");
                break;
            case 'P':
                that.context.mediaUtils.toggleView("plane");
                break;
        }

    }
    this.toggleDebugInfo = function() {
    	that.context.currentUniforms.showFixedPoints.value = that.context.currentUniforms.showFixedPoints.value == 0 ? 1 : 0;
    	if (that.context.currentUniforms.showFixedPoints.value == 0) {
            $('.statusText').hide();
		}
		else {
            $('.statusText').show();
		}

    }
    this.animate = function() {
        that.keyboardHandlerComplex.animate();
    }

}