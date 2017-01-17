// keeps track of managedMeshes. they are indexed by name.
// no mesh, including the sky dome should be managed except via this class.
function meshInventory(scene) {
    var that = this;
    this.meshes = {};
    that.scene = scene;
    this.setTexture = function(meshName, texture, materialGeneratorFromTexture) {
        // yes, the name of the mesh is the same name we use to look up
        // uniformst.
        that.meshes[meshName]
        .setTexture(texture, materialGeneratorFromTexture, meshName);
    }
    this.newMesh = function(meshName, desiredGeoName, position, scale) {
        if (that.meshes.hasOwnProperty(meshName)) 
            console.log('"' + meshName + '" mesh already exists, not recreating.')
        else
            that.meshes[meshName] = new meshManager(that.scene, position, scale, desiredGeoName);
    }
    this.changeGeometry = function(meshName, desiredGeoName) {
        that.meshes[meshName].setGeometry(desiredGeoName);        
    }
}