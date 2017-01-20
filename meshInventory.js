// keeps track of managedMeshes. they are indexed by name.
// no mesh, including the sky dome should be managed except via this class.
function meshInventory(scene) {
    var that = this;
    this.meshes = {};
    that.scene = scene;
    this.setTexture = function(meshName, texture, materialGeneratorFromTexture) {
        that.meshes[meshName].setTexture(texture, materialGeneratorFromTexture, meshName);
    }
    this.newMesh = function(meshName, desiredGeoName, position, scale, textureType) {
        if (that.meshes.hasOwnProperty(meshName)) 
            console.log('"' + meshName + '" mesh already exists, not recreating.')
        else {
            if (textureType == 'reimann')
                that.meshes[meshName] = new meshManager(that.scene, position, scale, desiredGeoName);
            else if (textureType == 'basic') {
                that.meshes[meshName] = new basicMesh(scene, position, scale, desiredGeoName);
            }
        }
    }
    this.changeGeometry = function(meshName, desiredGeoName) {
        that.meshes[meshName].setGeometry(desiredGeoName);        
    }
}
function basicMesh(scene, position, scale, desiredGeoName) {
    // very basic. always a texture, always a sphere, can't be moved or changed later.
    var that = this;
    this.scene = scene;
    this.position = position;
    this.scale = scale;
    var segment = 256.;
    var sphereRadius = 10;
    setMipMapOptions(texture);
    var mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });            
    var geo = new THREE.SphereGeometry(sphereRadius,segment,segment);
    this.mesh = new THREE.Mesh( geo, mat );
    that.scene.add(mesh);
    mesh.position.set(that.position[0],that.position[1], that.position[2]);
    mesh.scale.set(that.scale[0],that.scale[1], that.scale[2]);
    this.setTexture = function(texture, materialGeneratorFromTexture, meshName) {
        mat.map = texture;
    }    
}