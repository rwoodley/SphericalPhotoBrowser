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
    this.skyDomeMesh = undefined;
    this.videoReloadDelayInSeconds = 1;
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
        if (this.skyMaterialName == "greyOutline") {
            var uniforms = {
                iChannelStillMask1:  { type: 't', value: 0 },
                iChannelStillMask2:  { type: 't', value: 0 },
            };
            var pathToSubtractionTexture = 'media/stillMask2.png';
            (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
                setMipMapOptions(texture);
                uniforms.iChannelStillMask1.value =  texture; 
            });
            var pathToSubtractionTexture = 'media/stillMask3.png';
            (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
                setMipMapOptions(texture);
                uniforms.iChannelStillMask2.value =  texture; 
            });
            var skyMaterial = new THREE.ShaderMaterial( {
                uniforms: uniforms,
                vertexShader: SHADERCODE.mainShader_vs(),
                fragmentShader: SHADERCODE.outerShader_fs(),
                side: THREE.DoubleSide,
                transparent: true,
                // wireframe: true
            } );            
            addSkyDomeToScene(that.scene, skyMaterial);
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
        this.initialUpDownRotation = 0;
        // Initial Y rotation is determined entirely by cameraPosition. 
        this.rotateYAmount = 0.0005;    // additional rotation on each call to animate().
        this.videoReloadDelayInSeconds = 30;

        if (mode == 'uv') {
            var uniforms = TRANSFORM.reimannShaderList.createShader('default');
            this.cameraPosition = [1.,40.,0.];
            uniforms.complexEffect3OnOff.value = 0;
//            uniforms.textureScale.value = 3.5; 
            this.configs['default'] = {
                'uniforms': uniforms,
                'textureType': 'still',
                'textureName': 'uv.jpg',
                'geometry': 'sphere',
                'position': [0,0,0],
                'scale': [1,1,-1],
            }

            var uniforms = TRANSFORM.reimannShaderList.createShader('other');
            this.configs['other'] = {
                'uniforms': uniforms,
                'textureType': 'still',
                'textureName': 'uv.jpg',
                'geometry': 'torus',
                'position': [24.0,0,0],
                'scale': [1,1,-1],
            }
            this.configs['skyDome'] = {
                'textureName': 'hdr1.jpg',
                'textureType': 'basic',
                'geometry': 'sphere',
                'material': 'texture',
                'position': [0,0,0],
                'scale': [50,50,50],
            }
        }
        if (mode == 'couple2') {
            this.cameraPosition = [-8.4,3.6,10.1];
            this.showMirrorBall = false;    // for now. TODO
            var uniforms = TRANSFORM.reimannShaderList.createShader('default');
            uniforms.complexEffect3OnOff.value = 1;
            uniforms.textureScale.value = 2.25;
            this.skyMaterialName = "greyOutline";
            this.configs['default'] = {
                'uniforms': uniforms,
                'textureType': 'video',
                'textureName': 'coupleCropped',
                'geometry': 'sphere',
                'position': [0,0,0],
                'scale': [1,1,-1],
            }
            this.configs['skyDome'] = {
                'materialName': 'greyOutline',
            }
        }
        if (mode == 'triangles') {
            this.cameraPosition = [-7.8,4.8,-2.7];
            var uniforms = TRANSFORM.reimannShaderList.createShader('default');
            uniforms.complexEffect3OnOff.value = 0;
            uniforms.hyperbolicTilingEffectOnOff.value = 1;
            uniforms.textureUAdjustment.value = 0.485;
            uniforms.uColorVideoMode.value = 0;
            this.configs['default'] = {
                'uniforms': uniforms,
                'textureType': 'video',
                'textureName': 'typewriter',
                'geometry': 'sphere',
                'position': [0,0,0],
                'scale': [1,1,-1],
            }
            this.configs['skyDome'] = {
                'materialName': 'shiny',
            }
        }
        if (mode == 'squares') {
            this.cameraPosition = [0,10.7,0];
            var uniforms = TRANSFORM.reimannShaderList.createShader('default');
            uniforms.schottkyEffectOnOff.value = 1;
            uniforms.textureUAdjustment.value = 0;
            uniforms.uColorVideoMode.value = 0;
            this.videoReloadDelayInSeconds.value = 1;
            uniforms.mobiusEffectsOnOff.value = 1
            uniforms.iRotationAmount.value = 10.*Math.PI/2.;
            uniforms.e1x.value = -1;
            uniforms.e1y.value = 0;
            uniforms.e2x.value = 1;
            uniforms.e2y.value = 0;

            this.rotateYAmount = 0.;
            this.initialUpDownRotation = -Math.PI;

            this.configs['default'] = {
                'uniforms': uniforms,
                'textureType': 'video',
                'textureName': 'typewriter',
                'geometry': 'sphere',
                'position': [0,0,0],
                'scale': [1,1,1],
            }
            this.configs['skyDome'] = {
                'materialName': 'hdr1',
            }
            
        }
    }
    this._initMediaUtils = function(mediaUtils) {   // when still or video is defined in URL
        mediaUtils.camera.position.set(
            this.cameraPosition[0],
            this.cameraPosition[1],
            this.cameraPosition[2]);
        mediaUtils.rotateYAmount -= this.rotateYAmount;
        rotateCameraUpDown(mediaUtils.camera, this.initialUpDownRotation);
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
            else {
                mediaUtils.updateReimannDomeForVideoName(
                    meshName, 
                    meshSpecs['textureName'],
                    meshSpecs['geometry'],
                    meshSpecs['position'],
                    meshSpecs['scale']                        
                    );
                if (that.videoReloadDelayInSeconds > -1) {
                    mediaUtils.onVideoEnded = function () {
                        console.log("here..........");
                        window.setTimeout(function () {
                            console.log("Video is done, reloading.")
                            location.reload(true);
                        },
                            that.videoReloadDelayInSeconds * 1000);
                    }
                }
            }
        }
        mediaUtils.doneLoadingConfig();
    }
    // ----
    this.init();
}