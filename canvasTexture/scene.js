scene = function(canvas) {
    this.renderer = new THREE.WebGLRenderer();
    var _renderer = this.renderer;
    // renderer.setSize(width, height);
    var div = document.getElementById('sceneDiv');
    div.appendChild(this.renderer.domElement);
    var width = div.style.width.replace('px','');
    var height = div.style.height.replace('px','');
    this.renderer.setSize( width, height );
    scene = new THREE.Scene();
  
    camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000);
    camera.position.z = 500;
    scene.add(camera);
    console.log('texture');

    texture = new THREE.Texture(canvas);
    var material = new THREE.MeshBasicMaterial({ map: texture });
    // var material = new THREE.MeshNormalMaterial();
    geometry = new THREE.SphereGeometry( 200, 64, 64 );
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    texture.needsUpdate = true;
    animate = function() {
        requestAnimationFrame(animate );
        _renderer.render( scene, camera );
        // mesh.rotateZ(.01);
        mesh.rotateY(.01);
    }
    animate();
}
