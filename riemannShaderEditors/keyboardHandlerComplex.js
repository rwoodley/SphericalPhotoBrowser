this.keyboardHandlerComplex = function(context) {
    this.context = context;
    var that = this;
    this.lastDeltaX = 0;
    this.trackingLoxoPoints = false;
    this.e1 = [0,0];
    this.e2 = [100,100];

    that.handleSequence = function(seq, codes) {
        var opts = seq.substring(1);
        var uni = that.context.currentUniforms;
        uni.showFixedPoints.value = 0;
        switch (seq[0]) {
           case 'L':   // loxo points
                uni.mobiusEffectsOnOff.value = 1
                this.trackingLoxoPoints = !this.trackingLoxoPoints;

                break;
            case '1':
                uni.mobiusEffectsOnOff.value = 1
                that.e1 = [that.context.cameraLookAt[0], that.context.cameraLookAt[1]];
                that.setUniformsFromPoints();
                break;
            case '2':
                uni.mobiusEffectsOnOff.value = 1
                that.e2 = [that.context.cameraLookAt[0], that.context.cameraLookAt[1]];
                break;
            case 'Q':   // RESET
                this.trackingLoxoPoints = false;
                uni.mobiusEffectsOnOff.value = 0;
                that.e1 = [0,0];
                that.e2 = [100,100];
                that.setLoxoPoint(1,0);
                uni.complexEffect3OnOff.value = 0;
                uni.complexEffect4OnOff.value = 0;
                uni.complexEffect5OnOff.value = 0;
                uni.schottkyEffectOnOff.value = 0;
                break;
            case 'G':   // GIANT PLANET
                that.enableMobius();
                that.zoom(.8);
                that.context.lookAtComplex(100,100);
                break;
            case 'T':   // TINY PLANET
                that.enableMobius();
                that.zoom(1.25);
                that.context.lookAtComplex(0,0);
                break;
           case '+':
                that.enableMobius();
                uni.complexEffect1OnOff.value += 1;
                break;
           case '-':
                that.enableMobius();
                uni.complexEffect1OnOff.value -= 1;
                break;
            case '3':
                that.enableMobius();
                uni.complexEffect3OnOff.value = uni.complexEffect3OnOff.value == 0 ? 1 : 0;
                break;
            case '4':
                that.enableMobius();
                uni.complexEffect4OnOff.value = uni.complexEffect4OnOff.value == 0 ? 1 : 0;
                break;
            case '5':
                uni.mobiusEffectsOnOff.value = 1
                that.e1 = [0,1];
                that.e2 = [0,-1];
                that.setUniformsFromPoints();
                uni.complexEffect5OnOff.value = uni.complexEffect5OnOff.value == 0 ? 1 : 0;
                break;
            case '6':
                that.enableMobius();
                uni.schottkyEffectOnOff.value = uni.schottkyEffectOnOff.value == 0 ? 1 : 0;
                break;
            case '7':
                that.enableMobius();
                uni.schottkyEffectOnOff.value = uni.schottkyEffectOnOff.value == 0 ? 2 : 0;
                break;
            case '8':
                that.enableMobius();
                uni.schottkyEffectOnOff.value = uni.schottkyEffectOnOff.value == 0 ? 3 : 0;
                break;
            case '9':
                that.e1 = [-1,0];
                that.e2 = [1,0];
                uni.schottkyEffectOnOff.value = uni.schottkyEffectOnOff.value == 0 ? 1 : 0;
                uni.iRotationAmount.value = 10. * Math.PI / 2.;
                that.context.currentUniforms.mobiusEffectsOnOff.value = 1;
                that.setUniformsFromPoints();
                break;
            case ',':   // rotate left around fixed points.
                that.rotateLeft();
                break;
            case '.':   // rotate right around fixed points.
                that.rotateRight();
                break;
            case '/':   // stop rotate.
                that.rotationOff();
                break;
        }
    }
    this.enableMobius = function() {
        that.context.currentUniforms.mobiusEffectsOnOff.value = 1;
        that.e1 = [0,0];
        that.e2 = [100,100];
        that.setUniformsFromPoints();
    }
    this.rotateLeft = function() { that.rotate(-1); }
    this.rotateRight = function() { that.rotate(1); }
    this.rotationOff = function() {
		that.context.detailsObject.rotateDirection = 0;
    	that.context.currentUniforms.iRotationAmount.value = 0;
    }
    this.rotate = function(direction) {
    	if (direction == 0) {
    		that.context.detailsObject.rotateDirection = 0;
    	}
    	else {
        	that.context.detailsObject.rotateDirection += direction;
    	}
    }
    that.MouseWheelHandler = function(e) {
        if (that.context.shiftPressed && that.context.currentUniforms.mobiusEffectsOnOff.value == 1) {
            console.log(e.deltaX, e.deltaY, e.deltaZ, that.lastDeltaX);
            if (e.deltaX < that.lastDeltaX)
                that.zoom(.8);
            else
                that.zoom(1.25);
            that.lastDeltaX = e.deltaX;
            e.preventDefault();
        }
    }

    this.animate = function() {
        if (that.context.ctrlPressed && this.trackingLoxoPoints)
            that.setLoxoPoint(that.context.cameraLookAt[0],that.context.cameraLookAt[1]);
    }

    var sq = document.getElementsByTagName("BODY")[0];
	if (sq.addEventListener) {
		sq.addEventListener("mousewheel", that.MouseWheelHandler, false);
		sq.addEventListener("DOMMouseScroll", that.MouseWheelHandler, false);
	}
	else sq.attachEvent("onmousewheel", that.MouseWheelHandler);

    that.setUniformsFromPoints = function() {
        that.context.currentUniforms.e1x.value = that.e1[0];
        that.context.currentUniforms.e1y.value = that.e1[1];
        that.context.currentUniforms.e2x.value = that.e2[0];
        that.context.currentUniforms.e2y.value = that.e2[1];
    }

    this.zoomAmount = 1;
    this.zoom = function(factor) {
        console.log("Zoom factor = ", factor);
        if (that.zoomAmount * factor > 50) factor = 1;
        if (that.zoomAmount * factor < .05) factor = 1;
        that.zoomAmount *= factor;
        that.setLoxoPoint(
            that.context.currentUniforms.loxodromicX.value * factor,
            that.context.currentUniforms.loxodromicY.value * factor);
    }
    this.setLoxoPoint = function(x,y) {
        that.context.currentUniforms.loxodromicX.value = x;
        that.context.currentUniforms.loxodromicY.value = y;
        console.log("loxo point = " + that.context.currentUniforms.loxodromicX.value + "," + that.context.currentUniforms.loxodromicY.value);
    }
}
