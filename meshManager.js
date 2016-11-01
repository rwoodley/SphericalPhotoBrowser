// This class exists to handle some gnarly problems.
// I want a self-transparent sphere. This is very tricky. You need 2 spheres,
// one with side = BackSide, and one with side = FrontSide.
// So we 2 meshes where previously we only had 1. So to update a material/texture
// we need to set it on each mesh. But you can't use the same material for both textures
// because one has BackSide and one has FrontSide set. So you need 2 separate materials.
// You can't simply clone the material (not sure why, maybe because they are shader
// material?), so you need to generate it as needed, hence the use of lambdas for materials.
function managedMesh(mesh, updateMaterialCallback) {
    var that = this;
    this.mesh = mesh;
    this.updateMaterialCallback = updateMaterialCallback;
}
function meshManager(scene) {
    // ALWAYS ALLOW FOR MULTIPLE MESHES!
    var that = this;
    this.scene = scene;
    this.material = new THREE.MeshNormalMaterial();
    this.managedMeshes = [];
    this.removeManagedMeshes = function() {
        for (var i = 0; i < that.managedMeshes.length; i++) {
            that.scene.remove(that.managedMeshes[i].mesh);
        }
        that.managedMeshes = [];
    }
    this._addMesh = function(mesh, newMaterialCallback) {
        var mmesh = new managedMesh(mesh, newMaterialCallback);
        that.managedMeshes.push(mmesh);
        that.scene.add(mesh);
        //mesh.position.set(0,0,0);
        return mmesh;
    }
    this.setTexture = function(texture, materialGeneratorFromTexture) {
        that.setMaterial(function() {
            return materialGeneratorFromTexture(texture);
        });
    }
    this.setMaterial = function(materialGenerator) {
        for (var i = 0; i < that.managedMeshes.length; i++) {
            that.managedMeshes[i].updateMaterialCallback(
                that.managedMeshes[i].mesh, 
                materialGenerator());   // always a new mesh.
        }
        that.material = newMaterial;
    }
    this.newMesh = function(desiredGeoIndex) {
        that.geoIndex = desiredGeoIndex;
        var segment = 256.;
        var sphereRadius = 10;
        that.removeManagedMeshes();
        if (that.geoIndex == 0) {
            // see https://github.com/mrdoob/three.js/issues/2476
            // order is important, see esp: https://github.com/mrdoob/three.js/issues/2476#issuecomment-9078548
            var geo = new THREE.SphereGeometry(sphereRadius,segment,segment);
            var mesh = new THREE.Mesh( geo, new THREE.MeshNormalMaterial() );
            mesh.scale.set(1,1,-1);
            that._addMesh(mesh, function(msh, mat) {
                mat.side = THREE.FrontSide;
                msh.material = mat;
            });
            var mesh2 = new THREE.Mesh( geo, new THREE.MeshNormalMaterial() );
            mesh2.scale.set(1,1,-1);
            that._addMesh(mesh2, function(msh, mat) {
                mat.side = THREE.BackSide;
                msh.material = mat;
            });
            mesh.position.set(0,0,0);
            mesh2.position.set(0,0,0);
        }
        if (that.geoIndex == 1) {
            var geo = new THREE.PlaneBufferGeometry( sphereRadius/8, sphereRadius/8, segment, segment );
            var mesh = new THREE.Mesh( geo, that.material );
            mesh.rotateY(Math.PI/2);
            that._addMesh( mesh, function(msh, newMaterial) {
                msh.material = newMaterial;
            });
        }
        if (that.geoIndex == 2) {
            var geo = new THREE.TorusGeometry( sphereRadius, sphereRadius/2, segment, segment );
            var mesh = new THREE.Mesh( geo, that.material );
            mesh.rotateX(Math.PI/2);
            that._addMesh( mesh, function(msh, newMaterial) {
                msh.material = newMaterial;
            });
        }
        if (that.geoIndex == 3) {
            var geo = 
            new THREE.ParametricGeometry( 
                psphere, 
                40, 40 );
            var mesh = new THREE.Mesh( geo, that.material );
            mesh.rotateX(Math.PI/2);
            that._addMesh( mesh, function(msh, newMaterial) {
                msh.material = newMaterial;
            });
        }
        if (that.geoIndex == 4) {
            var geo = 
            new THREE.ParametricGeometry( 
                klein, 
                40, 40 );

            var mesh = new THREE.Mesh( geo, that.material );
            mesh.rotateX(-Math.PI/2);
            that._addMesh( mesh, function(msh, newMaterial) {
                msh.material = newMaterial;
            });
        }
        console.log("geoIndex = " + that.geoIndex);

    }
}