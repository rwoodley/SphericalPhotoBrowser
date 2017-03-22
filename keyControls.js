// This is broken out so key controls can work with multiple meshes
function keyControls(inMeshNames, e1x, e1y, e2x, e2y) {
    var that = this;
    this.meshNames = inMeshNames;
    this.onKeyDown = function(e, extraKey) {
        if (extraKey == 16) {       // shift
            if (e.keyCode == 39)    // right arrow
                that.rotateLeft();
            if (e.keyCode == 37)    // left arrow
                that.rotateRight();
            if (e.keyCode == 83)  // s - stop
                that.rotationOff();
        }
    }
    this.init = function(e1x, e1y, e2x, e2y) {
        that.setFixedPoint(1, e1x, e1y);
        that.setFixedPoint(2, e2x, e2y);
    };
    this.rotatePause = function() { that.rotate(0); };
    this.rotateLeft = function() { that.rotate(-1); };
    this.rotateRight = function() { that.rotate(1); };
    this.rotate = function(direction) {
        this.incrementRotateDirection(direction);
    };
    this.iterateOverMeshes = function(argsObj, callback) {
        for (var i = 0; i < that.meshNames.length; i++) {
            var meshName = that.meshNames[i];
            var detailsObject = TRANSFORM.reimannShaderList.getShaderDetailsObject(meshName);
            var uniforms = detailsObject.currentUniforms;
            callback(argsObj, meshName, detailsObject, uniforms);
        }
    };
    this.setFixedPoint = function(pointNumber, x, y) {
        this.iterateOverMeshes(
            {},
            function(unused, meshName, detailsObject, uniforms) {

                uniforms.mobiusEffectsOnOff.value = 1;
                if (pointNumber == 1) {
                    uniforms.e1x.value = x;
                    uniforms.e1y.value = y;
                    detailsObject.point1Defined = true;
                    if (!detailsObject.point2Defined) {
                        var ant = antipode(x,y);
                        uniforms.e2x.value = ant.x;
                        uniforms.e2y.value = ant.y;	            		
                    }
                }
                else {
                    uniforms.e2x.value = x;
                    uniforms.e2y.value = y;	            	
                    detailsObject.point2Defined = true;
                    if (!detailsObject.point1Defined) {
                        var ant = antipode(x,y);
                        uniforms.e1x.value = ant.x;
                        uniforms.e1y.value = ant.y;	            		
                    }
                }
                console.log("P1 = " + uniforms.e1x.value + "," + uniforms.e1y.value);
                console.log("P2 = " + uniforms.e2x.value+ "," + uniforms.e2x.value);
                console.log("loxo point = " + uniforms.loxodromicX.value + "," + uniforms.loxodromicY.value);
            }
        );
    };
    this.rotationOff = function() {
        this.incrementRotateDirection(0);    
    };
    this.incrementRotateDirection = function(rotateDirection) {
        this.iterateOverMeshes(
            rotateDirection,
            function(rotateDirection, meshName, detailsObject, uniforms) {
                if (rotateDirection == 0) {
                    detailsObject.rotateDirection = 0;
                }
                else {
                    detailsObject.rotateDirection += rotateDirection;
                }
            }
        );
    };
    this.resetAll = function() {
            // {'rotateDirection': rotateDirection, 'amount': amount},
        this.iterateOverMeshes(
            {},
            function(unused, meshName, detailsObject, uniforms) {
                detailsObject.rotateDirection = 0;
                uniforms.iRotationAmount = amount;
            }
        );
    };
    this.init(e1x, e1y, e2x, e2y);

}