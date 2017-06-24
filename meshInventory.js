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
    this.newMesh = function(meshName, desiredGeoName, position, scale, textureType, rotationAxis, rotationAngle) {
        if (that.meshes.hasOwnProperty(meshName)) 
            console.log('"' + meshName + '" mesh already exists, not recreating.')
        else {
            if (textureType == 'reimann') { 
                that.meshes[meshName] = new meshManager(that.scene, position, scale, desiredGeoName, rotationAxis, rotationAngle);
                that.reimannMeshes[meshName] = that.meshes[meshName];
            }
            else if (textureType == 'basic') {
                that.meshes[meshName] = new basicMesh(scene, position, scale, desiredGeoName, rotationAxis, rotationAngle);
            }
            else if (textureType == 'noMaterial') {
                that.meshes[meshName] = new noMaterialMesh(scene, position, scale, desiredGeoName, rotationAxis, rotationAngle);
            }
        }
        return that.meshes[meshName];
    }
    this.changeGeometry = function(meshName, desiredGeoName) {
        that.meshes[meshName].setGeometry(desiredGeoName);        
    }
    this.listOfMorphFunctions = [];
    this.morphFunction = function(animationFrame) {
        for (var i = 0; i < that.listOfMorphFunctions.length; i++)
            that.listOfMorphFunctions[i](animationFrame);
    }
}
function basicMesh(scene, position, scale, desiredGeoName, rotationAxis, rotationAngle) {
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
    if (rotationAxis != undefined) {
        var matrix = new THREE.Matrix4();
        matrix.makeRotationAxis( rotationAxis.normalize(), rotationAngle ); 
        this.mesh.rotation.setFromRotationMatrix( matrix );
    }
    this.setTexture = function(texture, materialGeneratorFromTexture, meshName) {
        setMipMapOptions(texture);
        that.material.map = texture;
        that.material.needsUpdate = true;
    }
    return this;
}
function noMaterialMesh(scene, position, scale, desiredGeoName, rotationAxis, rotationAngle) {
    // You specify whichever material you want on your own. This just does the basic setup.
    // that's the theory. As currently implemented the material is defined in line 103 of canned.js
    // where it is bound to avertexShader: SHADERCODE.mainShader_vs(), and a fragmentShader: SHADERCODE.outerShader_fs(),

    var that = this;
    this.scene = scene;
    this.position = position;
    this.scale = scale;
    var segment = 256.;
    var sphereRadius = 10;
    that.material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });            
    var geo = getGeometryForName(desiredGeoName);
    // var geo = new THREE.SphereGeometry(sphereRadius,segment,segment);
    this.mesh = new THREE.Mesh( geo, that.material );
    that.mesh.scale.set(that.scale[0],that.scale[1], that.scale[2]);
    that.scene.add(this.mesh);
    this.mesh.position.set(that.position[0],that.position[1], that.position[2]);
    if (rotationAxis != undefined) {
        var matrix = new THREE.Matrix4();
        matrix.makeRotationAxis( rotationAxis.normalize(), rotationAngle ); 
        this.mesh.rotation.setFromRotationMatrix( matrix );
    }
    this.setTexture = undefined;
    return this;
}
