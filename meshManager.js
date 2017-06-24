// This class exists to handle some gnarly problems.
// I want a self-transparent sphere. This is very tricky. You need 2 spheres,
// one with side = BackSide, and one with side = FrontSide.
// So we 2 meshes where previously we only had 1. So to update a material/texture
// we need to set it on each mesh. But you can't use the same material for both textures
// because one has BackSide and one has FrontSide set. So you need 2 separate materials.
// You can't simply clone the material (not sure why, maybe because they are shader
// material?), so you need to generate it as needed, hence the use of lambdas for materials.
// each instance of meshManager handles only one managedMesh which may in fact be 2
// instances of a three.js mesh.
function managedMesh(mesh, updateMaterialCallback) {
    var that = this;
    this.mesh = mesh;
    this.updateMaterialCallback = updateMaterialCallback;
}
function getGeometryForName(geoName) {
    var sphereRadius = 10;
    var segment = 256.;
    if (geoName == "sphere") {
        var geo = new THREE.SphereGeometry(sphereRadius,segment,segment);
    }
    if (geoName == "box") {
        var geo = new THREE.BoxGeometry(sphereRadius,sphereRadius,sphereRadius);
    }
    if (geoName == "tsphere") {
        var thetaStart = 4.8;
        var geo = new THREE.SphereGeometry(sphereRadius,segment,segment, 0., 2.*Math.PI, 
                        thetaStart, 2*Math.PI-thetaStart);
    }
    if (geoName == "cylinder") {
        var geo = new THREE.CylinderGeometry(
            sphereRadius,       // radius top
            sphereRadius,       // radius bottom
            sphereRadius*2,     // height
            segment,            // radial segments
            10,                 // height segments 
            true);              // open-ended
    }
    if (geoName == "plane") {
        var geo = new THREE.PlaneBufferGeometry( sphereRadius/4, sphereRadius/4, segment, segment );
    }
    if (geoName == "floor") {
        var geo = new THREE.PlaneBufferGeometry( sphereRadius/4, sphereRadius/4, segment, segment );
    }
    if (geoName == "torus") {
        var geo = new THREE.TorusGeometry( sphereRadius, sphereRadius/2, segment, segment );
    }
    if (geoName == "rotatedFatTorus") {
        var geo = new THREE.TorusGeometry( sphereRadius, sphereRadius/1.5, segment, segment );
    }
    if (geoName == "psphere") {
        var geo = 
        new THREE.ParametricGeometry( 
            psphere, 
            40, 40 );
    }
    if (geoName == "steiner") {
        var geo = 
        new THREE.ParametricGeometry( 
            steinerFunc, 
            40, 40 );
    }
    if (geoName == "catenoid") {
        var geo = 
        new THREE.ParametricGeometry( 
            catenoidFunc, 
            100, 100 );
    }
    if (geoName == "klein") {
        var geo = 
        new THREE.ParametricGeometry( 
            klein, 
            40, 40 );
    }
    if (geoName == "morphinFlower") {
        var kgeo = new THREE.ParametricGeometry( klein, 90, 90 );
        var flatDumpling = function(u,v) { return dumpling(u, v, -1, 0, 0, 0, 8, 8); }
        var funcCup = function(u,v) { return      dumpling(u, v, 1, 1, 3, 1.7, 8, 4); }
        var funcLeaves = function(u,v) { return   dumpling(u, v, -1, .5, .5, .2, 16, 7); }
        var func1Geo = new THREE.ParametricGeometry(funcLeaves, 90, 90, false);
        var func2Geo = new THREE.ParametricGeometry(funcCup, 90, 90, false);
        func1Geo.morphTargets.push( { name: "target1", vertices: func2Geo.vertices } );
        func1Geo.computeMorphNormals();
        geo = func1Geo;
    }
    return geo;
}
function meshManager(scene, position, scale, desiredGeoName, rotationAxis,
    rotationAngle) {
    // TODO: rename to multiMesh or multiGeoMesh
    // ALWAYS ALLOW FOR MULTIPLE MESHES!
    var that = this;
    this.scene = scene;
    this.position = position;
    this.scale = scale;
    that.materialGenerator = function () {
        return new THREE.MeshNormalMaterial();
    }
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
        mesh.position.set(that.position[0],that.position[1], that.position[2]);
        mesh.scale.set(that.scale[0],that.scale[1], that.scale[2]);
        newMaterialCallback(mesh, mesh.material);
        return mmesh;
    }
    this.setTexture = function(texture, materialGeneratorFromTexture, meshName) {
        that.setMaterial(function() {
            return materialGeneratorFromTexture(texture, meshName);
        });
    }
    this.setMaterial = function(materialGenerator) {
        for (var i = 0; i < that.managedMeshes.length; i++) {
            that.managedMeshes[i].updateMaterialCallback(
                that.managedMeshes[i].mesh, 
                materialGenerator());   // always a new material since updateMaterialCallback() will modify it.
        }
        that.materialGenerator = materialGenerator;    // and one to keep around...
    }
    this.setGeometry = function(desiredGeoName) {
        that.geoName = desiredGeoName;
        that.removeManagedMeshes();
        var geo = getGeometryForName(that.geoName);
        var mesh;
        if (that.geoName == "sphere" ) {
            // see https://github.com/mrdoob/three.js/issues/2476
            // order is important, see esp: https://github.com/mrdoob/three.js/issues/2476#issuecomment-9078548
            mesh = new THREE.Mesh( geo, that.materialGenerator() );
            that._addMesh(mesh, function(msh, mat) {
                mat.side = THREE.FrontSide;
                msh.material = mat;
            });
            var mesh2 = new THREE.Mesh( geo, that.materialGenerator() );
            that._addMesh(mesh2, function(msh, mat) {
                mat.side = THREE.BackSide;
                msh.material = mat;
            });
        }
        if (that.geoName == "tsphere") {
            mesh = new THREE.Mesh( geo, that.materialGenerator() );
            // mesh.rotateX(Math.PI/2. );
            that._addMesh( mesh, function(msh, newMaterial) {
                newMaterial.side = THREE.DoubleSide;
                msh.material = newMaterial;
            });
        }
        if (that.geoName == "box") {
            mesh = new THREE.Mesh( geo, that.materialGenerator() );
            // mesh.rotateX(Math.PI/2. );
            that._addMesh( mesh, function(msh, newMaterial) {
                newMaterial.side = THREE.DoubleSide;
                msh.material = newMaterial;
            });
        }
        if (that.geoName == "plane") {
            mesh = new THREE.Mesh( geo, that.materialGenerator() );
            mesh.rotateY(Math.PI/2);
            that._addMesh( mesh, function(msh, newMaterial) {
                newMaterial.side = THREE.DoubleSide;
                msh.material = newMaterial;
            });
        }
        if (that.geoName == "floor") {
            mesh = new THREE.Mesh( geo, that.materialGenerator() );
            mesh.rotateX(Math.PI/2);
            that._addMesh( mesh, function(msh, newMaterial) {
                newMaterial.side = THREE.DoubleSide;
                msh.material = newMaterial;
            });
        }
        if (that.geoName == "torus") {
            mesh = new THREE.Mesh( geo, that.materialGenerator() );
            mesh.rotateX(Math.PI/2);
            that._addMesh( mesh, function(msh, newMaterial) {
                newMaterial.side = THREE.DoubleSide;
                msh.material = newMaterial;
            });
        }
        if (that.geoName == "cylinder") {
            mesh = new THREE.Mesh( geo, that.materialGenerator() );
            // mesh.rotateX(Math.PI/2);
            that._addMesh( mesh, function(msh, newMaterial) {
                newMaterial.side = THREE.DoubleSide;
                msh.material = newMaterial;
            });
        }
        if (that.geoName == "rotatedFatTorus") {
            mesh = new THREE.Mesh( geo, that.materialGenerator() );
//            mesh.rotateX(Math.PI/2);
            that._addMesh( mesh, function(msh, newMaterial) {
                newMaterial.side = THREE.DoubleSide;
                msh.material = newMaterial;
            });
        }
        if (that.geoName == "psphere") {
            mesh = new THREE.Mesh( geo, that.materialGenerator() );
            mesh.rotateX(Math.PI/2);
            that._addMesh( mesh, function(msh, newMaterial) {
                newMaterial.side = THREE.DoubleSide;
                msh.material = newMaterial;
            });
        }
        if (that.geoName == "steiner") {
            mesh = new THREE.Mesh( geo, that.materialGenerator() );
            mesh.rotateX(Math.PI/2);
            that._addMesh( mesh, function(msh, newMaterial) {
                newMaterial.side = THREE.DoubleSide;
                msh.material = newMaterial;
            });
        }
        if (that.geoName == "catenoid") {
            mesh = new THREE.Mesh( geo, that.materialGenerator() );
            mesh.rotateX(Math.PI/2);
            that._addMesh( mesh, function(msh, newMaterial) {
                newMaterial.side = THREE.DoubleSide;
                msh.material = newMaterial;
            });
        }
        if (that.geoName == "klein") {
            mesh = new THREE.Mesh( geo, that.materialGenerator() );
            mesh.rotateX(-Math.PI/2);
            that._addMesh( mesh, function(msh, newMaterial) {
                newMaterial.side = THREE.DoubleSide;
                msh.material = newMaterial;
            });
        }
        if (that.geoName == "morphinFlower") {
            mesh = new THREE.Mesh( geo, that.materialGenerator() );
            mesh.rotateY(-Math.PI/2);
            that._addMesh( mesh, function(msh, newMaterial) {
                newMaterial.side = THREE.DoubleSide;
                msh.material = newMaterial;
                if (newMaterial.type != 'MeshNormalMaterial') {
                    newMaterial.morphTargets = true;
                    var myMorphFunction = function(animationFrame) {
                        msh.morphTargetInfluences[0] = (animationFrame%2000.0)/2000.0;
                        // console.log(msh.morphTargetInfluences[0]*10.);
                    }
                    TRANSFORM.meshInventory.listOfMorphFunctions.push(myMorphFunction);

                }
            });
        }
        if (rotationAxis != undefined) {
            var matrix = new THREE.Matrix4();
            matrix.makeRotationAxis( rotationAxis.normalize(), rotationAngle ); 
            mesh.rotation.setFromRotationMatrix( matrix );
        }
        console.log("geoName = " + that.geoName);
    }
    this.setGeometry(desiredGeoName);
}
