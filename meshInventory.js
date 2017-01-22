// keeps track of managedMeshes. they are indexed by name.
// no mesh, including the sky dome should be managed except via this class.
// This is a singleton, see below.
function meshInventory(scene) {
    var that = this;
    this.meshes = {};
    this.reimannMeshes = {};
    that.scene = scene;
    this.setTexture = function(meshName, texture, materialGeneratorFromTexture) {
            that.meshes[meshName].setTexture(texture, materialGeneratorFromTexture, meshName);
    }
    this.newMesh = function(meshName, desiredGeoName, position, scale, textureType) {
        if (that.meshes.hasOwnProperty(meshName)) 
            console.log('"' + meshName + '" mesh already exists, not recreating.')
        else {
            if (textureType == 'reimann') {
                that.meshes[meshName] = new meshManager(that.scene, position, scale, desiredGeoName);
                that.reimannMeshes[meshName] = that.meshes[meshName];
            }
            else if (textureType == 'basic') {
                that.meshes[meshName] = new basicMesh(scene, position, scale, desiredGeoName);
            }
            else if (textureType == 'anyMaterial') {
                that.meshes[meshName] = new noMaterialMesh(scene, position, scale, desiredGeoName);
            }
        }
        return that.meshes[meshName];
    }
    this.changeGeometry = function(meshName, desiredGeoName) {
        that.meshes[meshName].setGeometry(desiredGeoName);        
    }
}
function basicMesh(scene, position, scale, desiredGeoName) {
    // very basic. always a sphere, can't be moved or changed later.
    var that = this;
    this.scene = scene;
    this.position = position;
    this.scale = scale;
    var segment = 256.;
    var sphereRadius = 10;
    that.material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });            
    var geo = new THREE.SphereGeometry(sphereRadius,segment,segment);
    this.mesh = new THREE.Mesh( geo, that.material );
    that.mesh.scale.set(that.scale[0],that.scale[1], that.scale[2]);
    that.scene.add(this.mesh);
    this.mesh.position.set(that.position[0],that.position[1], that.position[2]);
    this.setTexture = function(texture, materialGeneratorFromTexture, meshName) {
        setMipMapOptions(texture);
        that.material.map = texture;
        that.material.needsUpdate = true;
    }
    return this;
}
function noMaterialMesh(scene, position, scale, desiredGeoName) {
    // You specify whichever material you want on your own. This just does the basic setup.
    var that = this;
    this.scene = scene;
    this.position = position;
    this.scale = scale;
    var segment = 256.;
    var sphereRadius = 10;
    that.material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });            
    var geo = new THREE.SphereGeometry(sphereRadius,segment,segment);
    this.mesh = new THREE.Mesh( geo, that.material );
    that.mesh.scale.set(that.scale[0],that.scale[1], that.scale[2]);
    that.scene.add(this.mesh);
    this.mesh.position.set(that.position[0],that.position[1], that.position[2]);
    this.setTexture = undefined;
    return this;
}
