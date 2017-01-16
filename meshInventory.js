// keeps track of managedMeshes. they are indexed by name.
// no mesh, including the sky dome should be managed except via this class.
function meshInventory(scene) {
    var that = this;
    this.meshes = {};
    that.scene = scene;
    this.setTexture = function(meshName, texture, materialGeneratorFromTexture) {
        // yes, the name of the mesh is the same name we use to look up
        // uniformst.
        this.meshes[meshName]
            .setTexture(texture, materialGeneratorFromTexture, meshName);
    }
    this.newMesh = function(meshName, desiredGeoName) {
        if (!that.meshes.hasOwnProperty(meshName))
            that.meshes[meshName] = new meshManager(that.scene);
        that.meshes[meshName].newMesh(desiredGeoName);
    }
}