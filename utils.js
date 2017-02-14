showToast = function(message, ms) {
    console.log("Showing " + message + " for " + ms) ;
    var options = {
        settings: {
            duration: ms
        }
    };        
    new iqwerty.toast.Toast(message, options);
}
function appendSingleIcon(containerEl, style, png, title, callback) {
    var el;
    el = document.createElement('span');
    el.innerHTML = "<img src='icons/xxx' title=\"yyy\" class='showhide zzz'></img>"
        .replace('xxx', png).replace('yyy', title).replace('zzz', style);
    $(el).click(callback);
    containerEl.appendChild(el);
}

function onWindowResize() {

    _camera.aspect = window.innerWidth / window.innerHeight;
    _camera.updateProjectionMatrix();

    _renderer.setSize( window.innerWidth, window.innerHeight );

}
setMipMapOptions = function(texture) {
    // since none of our textures are powers of 2, we need the
    // following settings.
    // more: https://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences#Non-Power_of_Two_Texture_Support
    texture.minFilter = THREE.LinearFilter;   // eliminates pixellation.
    texture.magFilter = THREE.LinearFilter;   // ditto
    texture.generateMipmaps = true;
}

function doFloor(scene) {
        //var floorMaterial = new THREE.MeshLambertMaterial( { color: _floorColor, side:THREE.DoubleSide } );
        var floorMaterial = new THREE.MeshPhongMaterial( { color: 0x77ff00, side:THREE.DoubleSide } );
        var floorGeometry = new THREE.PlaneGeometry(750, 750,50,50);
        var _floor = new THREE.Mesh(floorGeometry, floorMaterial);
        _floor.rotation.x = Math.PI / 2;
        _floor.position.y = -50;
        _floor.receiveShadow = true;
        scene.add(_floor);
        return _floor;
}

function rotateCameraY(camera, radians) {
    // the idea here is the camera is rotating around the origin.
    // so for this to work there has to be a camera.lookat(new THREE.Vector3(0,0,0)) call in
    // the animate loop.
    var x = camera.position.x;  var y = camera.position.y;  var z = camera.position.z;
    var signx = x > 0 ? 1 : -1;

    // get current radians from z and x coords.
    var _radians = x == 0 ? Math.PI/2 : Math.atan(z/x);
    if (signx == -1) _radians += Math.PI;

    _radians += radians;
    if (_radians > Math.PI*2) _radians = _radians%(Math.PI*2);
    while (_radians < 0) _radians += Math.PI*2;

    // console.log( _radians);

    var radius = Math.sqrt(x*x + z*z);
    camera.position.x = radius * Math.cos(_radians);
    camera.position.z = radius * Math.sin(_radians);
    //_camera.position.y = 4;
}
function rotateCameraUpDown(camera, radians) {
    // see note above for rotateCameraY. Same idea here.
    var x = camera.position.x;  var y = camera.position.z;  var z = camera.position.y;

    var radius= Math.sqrt(x*x + y*y + z*z);
    // var theta=Math.atan2(y,x);
    var theta = Math.acos(z/radius);
    // var phi=Math.atan2(Math.sqrt(x*x+y*y),z);
    var phi = Math.atan2(y,x);
    theta -= radians;
    theta = Math.max(0.01,Math.min(Math.PI-0.01, theta));

    x = radius * Math.sin(theta)*Math.cos(phi);
    y = radius * Math.sin(theta)*Math.sin(phi);
    z = radius * Math.cos(theta);

    camera.position.x = x;
    camera.position.y = z;
    camera.position.z = y;
}

function drawAxes(size,position, rotation) {
    size = size || 1;
    var vertices = new Float32Array( [
    0, 0, 0, size, 0, 0,
    0, 0, 0, 0, size, 0,
    0, 0, 0, 0, 0, size
    ] );
    var colors = new Float32Array( [
    1, 0, 0, 1, 0.6, 0,
    0, 1, 0, 0.6, 1, 0,
    0, 0, 1, 0, 0.6, 1
    ] );
    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
    var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );
    var mesh = new THREE.Line(geometry, material, THREE.LinePieces );
    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    return mesh;
}



// -------------
function doSkyDome(pathToTexture) {
    var skyGeometry = new THREE.SphereGeometry(5000,50,50);
    var texture;
    texture = THREE.ImageUtils.loadTexture("textures/" + pathToTexture + ".jpg");

    var skyMaterial = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide });
    _skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
    _skyBox.material.fog = false;
    _skyBox.position.set(0,0,0);
    _skyBox.scale.set(-1,1,1);
    //_skyBox.rotation.x = Math.PI/4;
    _scene.add( _skyBox );
}
// ----
function getParameter( name, url ) {
    if (!url) url = location.href;
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    return results == null ? null : results[1];
}
