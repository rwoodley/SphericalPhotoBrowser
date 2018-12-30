this.cameraContext = function(camera) {
    var that = this;
    TRANSFORM.camera = this;
    that.camera = camera;
    this.rotateZAmount = 0;
    this.rotateYAmount = 0;
    this.rotateXAmount = 0;
    this.cameraZoomAmount = 1;
    this.FOV = 90;

    this.cameraLeft = function() {
        that.rotateYAmount -= 0.0005;
    }
    this.cameraRight = function() {
        that.rotateYAmount += 0.0005;
    }
    this.cameraUp = function() {
        that.rotateXAmount -= 0.002;
    }
    this.cameraDown = function() {
        that.rotateXAmount += 0.002;
    }
    this.cameraStop = function() {
        that.rotateZAmount = 0.0;
        that.rotateYAmount = 0.;
        that.rotateXAmount = 0.;
    }
    this.cameraRotateLeft = function() {
        that.rotateZAmount -= 0.002;
    }
    this.cameraRotateRight = function() {
        that.rotateZAmount += 0.002;
    }
    this.cameraZoom = function(scale) {
        that.cameraZoomAmount = scale;
    }
    this.flipCamera = function() {
    	that.camera.position.x = - that.camera.position.x;
    	that.camera.position.y = - that.camera.position.y;
    	that.camera.position.z = - that.camera.position.z;
    }
    this.narrowFOV = function() {
        that.FOV += 15;
        that.camera.fov = that.FOV;
        that.camera.updateProjectionMatrix();
    }
    this.widerFOV = function() {
        that.FOV -= 15;
        that.camera.fov = that.FOV;
        that.camera.updateProjectionMatrix();
    }
    this.onkeydown = function(e, extraKey) {

        if (extraKey == 17) {       // ctrl
            if (e.keyCode == 39) {   // right arrow
                that.cameraRight();
                console.log("move camera");
            }
            if (e.keyCode == 37) {   // left arrow
                that.cameraLeft();
                console.log("move camera");
            }
            if (e.keyCode == 38) {   // up arrow
                that.cameraUp();
                console.log("move camera");
            }
            if (e.keyCode == 40) {   // down arrow
                that.cameraDown();
                console.log("move camera");
            }
            if (e.keyCode == 83) { // s - stop
                that.cameraStop();
                console.log("move camera");
            }
            if (e.keyCode == 90) { // z - zoom
                that.narrowFOV();
                console.log("zoom - narrow FOV");
            }
            if (e.keyCode == 80) { // p - pan
                that.widerFOV();
                console.log("pan - wide FOV");
            }
            if (e.keyCode == 70) { // p - pan
                that.flipCamera();
                console.log("flip camera");
            }
        }
    }
    this.animate = function() {
        that.camera.lookAt(new THREE.Vector3(0,0,0));
        rotateCameraY(that.camera, that.rotateYAmount);
        rotateCameraUpDown(that.camera, that.rotateXAmount);
        rotateCameraZ(that.camera, that.rotateZAmount);
        // if (that.rotateZAmount > 0) {
        //     console.log("Changing Camera up!");
        //     that.camera.up.set(0,1,1);
        // }
        // that.camera.rotateZ(that.rotateZAmount+that.camera.rotation.z);

        // console.log(that.camera.rotation.z, that.rotateZAmount);
        // that.camera.rotateY(that.rotateZAmount);
        // that.camera.rotateX(that.rotateZAmount);
        that.camera.position.x = that.cameraZoomAmount*that.camera.position.x;
        that.camera.position.y = that.cameraZoomAmount*that.camera.position.y;
        that.camera.position.z = that.cameraZoomAmount*that.camera.position.z;
    }
}
