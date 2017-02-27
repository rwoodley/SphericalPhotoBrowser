// handles canned runs.
// This is sort of counter-intuitive.
// init() is called before mediaUtils or transformUtils is created. 
// Once they are created, the Utils query the cannedRun for settings in setup().
// This is done because in this order because cannedRun controls the outer sky dome too
// which must be set up before the inner sky dome is created, so that transparency works.
// So for a given mode, we setup some uniforms in init(), and store data about 'configs'.

var _verticalMirror = {};        // hack! for now

function getAnyMaterialMesh(meshName, meshSpecs) {
    var mesh = TRANSFORM.meshInventory.newMesh(
        meshName, 
        meshSpecs['geometry'],
        meshSpecs['position'],
        meshSpecs['scale'],
        'anyMaterial',
        meshSpecs['rotationAxis'],
        meshSpecs['rotationAngle']
        );
    return mesh;
}
function cannedRun(scene) {
    var that = this;
    this.scene = scene;
    this.configs = {};
    this.generalSettings = function() {
        this.cameraPosition = undefined;
        this.videoReloadDelayInSeconds = undefined;
        this.rotateYAmount = undefined;
        this.initialUpDownRotation = undefined;
        this.fog = false;
    };
    this.skyDomeMesh = undefined;
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
        var retdic = getCannedConfigs(mode, that.generalSettings);
        that.configs = retdic['configs'];
        that.keyControls = retdic['keyControls'];
    }
    this._initMediaUtils = function(mediaUtils) {   // when still or video is defined in URL
        mediaUtils.camera.position.set(
            this.generalSettings.cameraPosition[0],
            this.generalSettings.cameraPosition[1],
            this.generalSettings.cameraPosition[2]);
        mediaUtils.rotateYAmount -= this.generalSettings.rotateYAmount;
        rotateCameraUpDown(mediaUtils.camera, this.generalSettings.initialUpDownRotation);
        if (this.generalSettings.fog) {
            that.scene.fog = new THREE.Fog( 0xaaaaaa, 1, 1000);
        }
    }
    this.setup = function (mediaUtils, transformUtils, renderer) {
        mediaUtils.toggleControlPanel();
        this._initMediaUtils(mediaUtils);                   // setup camera

        for (var meshName in this.configs) {
            var meshSpecs = this.configs[meshName];
            // when mediaUtils refers to a skyDome it means the inner dome.
            // in this file skyDome means the outer dome. it uses skyMaterial.
            // the inner dome uses textureName.
            if (meshSpecs['textureType'] == 'still')
                mediaUtils.initializeReimannDomeForFileName(
                    meshName,
                    meshSpecs['textureName'], 
                    meshSpecs['geometry'],
                    meshSpecs['position'],
                    meshSpecs['scale'],
                    meshSpecs['rotationAxis'],
                    meshSpecs['rotationAngle']
                    );
            else if (meshSpecs['textureType'] == 'basic') {
                var mesh = TRANSFORM.meshInventory.newMesh(
                    meshName, 
                    meshSpecs['geometry'],
                    meshSpecs['position'],
                    meshSpecs['scale'],
                    'basic',
                    meshSpecs['rotationAxis'],
                    meshSpecs['rotationAngle']
                    );
                (new THREE.TextureLoader()).load("media/" + meshSpecs['textureName'], function ( texture ) {
                    mesh.setTexture(texture,null, null);
                });
            }
            else if (meshSpecs['textureType'] == 'anyMaterial') {
                mesh = getAnyMaterialMesh(meshName, meshSpecs);
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
                mesh = getAnyMaterialMesh(meshName, meshSpecs);
                var skyMaterial =  new THREE.MeshPhongMaterial({ 
                    side: THREE.DoubleSide,
                    color: 0x255c78,
                    emissive: 0x51252,
                    shininess: 100,
                });
                mesh.mesh.material = skyMaterial;
            }
            else if (meshSpecs['textureType'] == 'normal') {
                mesh = getAnyMaterialMesh(meshName, meshSpecs);
                mesh.mesh.material = new THREE.MeshNormalMaterial({side: THREE.DoubleSide});
            }
            else if (meshSpecs['textureType'] == 'mirror') {
                mesh = getAnyMaterialMesh(meshName, meshSpecs);

                // mirror ball is handled with these 2 global variables. later, if we want more than one,
                // i suppose we'll need to have a mirrorBallManager or something.
                _mirrorSphere = mesh.mesh;
                mirrorCameraNearClippingDistance = 'mirrorCameraNearClippingDistance' in meshSpecs ?
                    meshSpecs['mirrorCameraNearClippingDistance'] : .1;
                _mirrorSphereCamera = new THREE.CubeCamera(mirrorCameraNearClippingDistance, 5000, 512 );

                that.scene.add( _mirrorSphereCamera );
                var mirrorSphereMaterial = new THREE.MeshBasicMaterial( 
                    { color: 0xccccff, envMap: _mirrorSphereCamera.renderTarget, side: THREE.DoubleSide, reflectivity: 0.6 } );

                mesh.mesh.material = mirrorSphereMaterial;
                if ('mirrorCameraPosition' in meshSpecs)
                    _mirrorSphereCamera.position.copy(meshSpecs['mirrorCameraPosition']);
                else
                    _mirrorSphereCamera.position.copy(mesh.mesh.position);
            }
            else if (meshSpecs['textureType'] == 'mirror2') {
                mesh = getAnyMaterialMesh(meshName, meshSpecs);
                var WIDTH = window.innerWidth;
                var HEIGHT = window.innerHeight;
                var verticalMirror = new THREE.Mirror( renderer, mediaUtils.camera, { 
                    clipBias: 0.003, 
                    textureWidth: WIDTH, 
                    textureHeight: HEIGHT, 
                    color:0x00aaaa } );
                mesh.mesh.material =  verticalMirror.material;
				mesh.mesh.add( verticalMirror );
                _verticalMirror[meshName] = verticalMirror;
            }
            else {
                mediaUtils.initializeReimannDomeForVideoName(
                    meshName, 
                    meshSpecs['textureName'],
                    meshSpecs['geometry'],
                    meshSpecs['position'],
                    meshSpecs['scale'],
                    meshSpecs['rotationAxis'],
                    meshSpecs['rotationAngle']
                    );
                if (that.generalSettings.videoReloadDelayInSeconds > -1) {
                    mediaUtils.videoManager.onVideoEnded = function () {
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
        if (this.keyControls != undefined)
            mediaUtils.onkeydown = this.keyControls.onKeyDown;
    }
    // ----
    this.init();
}