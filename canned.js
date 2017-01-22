// handles canned runs.
// This is sort of counter-intuitive.
// init() is called before mediaUtils or transformUtils is created. 
// Once they are created, the Utils query the cannedRun for settings in setup().
// This is done because in this order because cannedRun controls the outer sky dome too
// which must be set up before the inner sky dome is created, so that transparency works.
// So for a given mode, we setup some uniforms in init(), and store data about 'configs'.
// 
function cannedRun(scene) {
    var that = this;
    this.scene = scene;
    this.configs = {};
    this.generalSettings = function() {
        this.cameraPosition = undefined;
        this.videoReloadDelayInSeconds = undefined;
        this.rotateYAmount = undefined;
        this.initialUpDownRotation = undefined;
    };
    this.skyDomeMesh = undefined;
    function addSkyDomeToScene(scene, skyMaterial) {
        var skyGeometry = new THREE.SphereGeometry(100,32,32);
        var skyMesh = new THREE.Mesh( skyGeometry, skyMaterial );
        scene.add(skyMesh);
        that.skyDomeMesh = skyMesh;
        return skyMesh;
    }
    this.changeSkyDome = function(scene, skyMaterialName) {
        if (that.skyDomeMesh != undefined)
            scene.remove(that.skyDomeMesh);
        this.createSkyDome(scene, skyMaterialName);
    }
    this.createSkyDome = function(scene, skyMaterialName) {
        if (skyMaterialName != undefined)
            this.skyMaterialName = skyMaterialName;
        if (this.skyMaterialName == "normal") {
            addSkyDomeToScene(that.scene, new THREE.MeshNormalMaterial({ side: THREE.DoubleSide}));
            return;
        }
        if (this.skyMaterialName == "shiny") {
            addSkyDomeToScene(that.scene, new THREE.MeshPhongMaterial({ 
                side: THREE.DoubleSide,
                color: 0x255c78,
                emissive: 0x51252,
                shininess: 100,
            }));
            return;
        }
        if (this.skyMaterialName == "black") {
            addSkyDomeToScene(that.scene, new THREE.MeshBasicMaterial({ 
                side: THREE.DoubleSide,
                color: 0x000000,
            }));
            return;
        }
        if (this.skyMaterialName == "white") {
            addSkyDomeToScene(that.scene, new THREE.MeshBasicMaterial({ 
                side: THREE.DoubleSide,
                color: 0xffffff,
            }));
            return;
        }
        if (this.skyMaterialName == "fractalDome") {
            var uniforms = TRANSFORM.reimannShaderList.createShader("test");
            uniforms.fractalEffectOnOff.value = 2;
            var newMaterial = getReimannShaderMaterial(undefined, uniforms);
            var mesh = addSkyDomeToScene(that.scene, newMaterial);
            mesh.scale.set(-1,-1,1);
            return;
        }
        if (this.skyMaterialName == "triangleDome") {
            var uniforms = TRANSFORM.reimannShaderList.createShader("test");
            uniforms.hyperbolicTilingEffectOnOff.value = 2;
            var newMaterial = getReimannShaderMaterial(undefined, uniforms);
            var mesh = addSkyDomeToScene(that.scene, newMaterial);
            mesh.scale.set(-1,-1,1);
            return;
        }
        
        if (this.skyMaterialName == "hdr1") {
            (new THREE.TextureLoader()).load("media/stillMask3.png", function ( texture ) {
                var skyMaterial = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide });
                var mesh = addSkyDomeToScene(that.scene, skyMaterial);
                mesh.scale.set(-1,1,1);
            });
            return;
        }
        else {
            (new THREE.TextureLoader()).load(this.skyMaterialName, function ( texture ) {
                var skyMaterial = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide });
                var mesh = addSkyDomeToScene(that.scene, skyMaterial);
                mesh.scale.set(-1,1,1);
            });            
            return;
        }
    }
    this.init = function() {
        var mode = getParameter('mode', window.location.href);

        // overall defaults
        this.showMirrorBall = false;
        if (mode == null) {
            this.createMode = true;
            mode = 'uv';
        }
        else {
            // default for canned runs, override as needed below
            this.createMode = false;
        }
        this.generalSettings.initialUpDownRotation = 0;
        // Initial Y rotation is determined entirely by cameraPosition. 
        this.generalSettings.rotateYAmount = 0.0005;    // additional rotation on each call to animate().
        this.generalSettings.videoReloadDelayInSeconds = 30;
        this.configs = getCannedConfigs(mode, that.generalSettings)
    }
    this._initMediaUtils = function(mediaUtils) {   // when still or video is defined in URL
        mediaUtils.camera.position.set(
            this.generalSettings.cameraPosition[0],
            this.generalSettings.cameraPosition[1],
            this.generalSettings.cameraPosition[2]);
        mediaUtils.rotateYAmount -= this.generalSettings.rotateYAmount;
        rotateCameraUpDown(mediaUtils.camera, this.generalSettings.initialUpDownRotation);
    }
    this.getConfigByName = function(name) {
        return this.configs[name];
    }
    this.setup = function (mediaUtils, transformUtils) {
        mediaUtils.toggleControlPanel();
        this._initMediaUtils(mediaUtils);                   // setup camera

        for (var meshName in this.configs) {
            var meshSpecs = this.configs[meshName];
            // when mediaUtils refers to a skyDome it means the inner dome.
            // in this file skyDome means the outer dome. it uses skyMaterial.
            // the inner dome uses textureName.
            if (meshSpecs['textureType'] == 'still')
                mediaUtils.updateReimannDomeForFileName(
                    meshName,
                    meshSpecs['textureName'], 
                    meshSpecs['geometry'],
                    meshSpecs['position'],
                    meshSpecs['scale']
                    );
            else if (meshSpecs['textureType'] == 'basic') {
                var mesh = TRANSFORM.meshInventory.newMesh(
                    meshName, 
                    meshSpecs['geometry'],
                    meshSpecs['position'],
                    meshSpecs['scale'],
                    'basic');
                (new THREE.TextureLoader()).load("media/" + meshSpecs['textureName'], function ( texture ) {
                    mesh.setTexture(texture,null, null);
                });
            }
            else if (meshSpecs['textureType'] == 'outer') {
                var mesh = TRANSFORM.meshInventory.newMesh(
                    meshName, 
                    meshSpecs['geometry'],
                    meshSpecs['position'],
                    meshSpecs['scale'],
                    'outer');
                var skyMaterial = new THREE.ShaderMaterial( {
                    uniforms: meshSpecs['uniforms'],
                    vertexShader: SHADERCODE.mainShader_vs(),
                    fragmentShader: SHADERCODE.outerShader_fs(),
                    side: THREE.DoubleSide,
                    transparent: true,
                } );
                mesh.mesh.material = skyMaterial;
            }
            else if (meshSpecs['textureType'] == 'phong') {
                var mesh = TRANSFORM.meshInventory.newMesh(
                    meshName, 
                    meshSpecs['geometry'],
                    meshSpecs['position'],
                    meshSpecs['scale'],
                    'outer');
                var skyMaterial =  new THREE.MeshPhongMaterial({ 
                    side: THREE.DoubleSide,
                    color: 0x255c78,
                    emissive: 0x51252,
                    shininess: 100,
                });
                mesh.mesh.material = skyMaterial;
            }
            else {
                mediaUtils.updateReimannDomeForVideoName(
                    meshName, 
                    meshSpecs['textureName'],
                    meshSpecs['geometry'],
                    meshSpecs['position'],
                    meshSpecs['scale']                        
                    );
                if (that.generalSettings.videoReloadDelayInSeconds > -1) {
                    mediaUtils.onVideoEnded = function () {
                        console.log("here..........");
                        window.setTimeout(function () {
                            console.log("Video is done, reloading.")
                            location.reload(true);
                        },
                            that.generalSettings.videoReloadDelayInSeconds * 1000);
                    }
                }
            }
        }
        mediaUtils.doneLoadingConfig();
    }
    // ----
    this.init();
}