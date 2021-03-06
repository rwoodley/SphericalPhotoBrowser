// handles canned runs.
// This is sort of counter-intuitive.
// init() is called before mediaUtils or transformUtils is created. 
// Once they are created, the Utils query the cannedRun for settings in setup().
// This is done because in this order because cannedRun controls the outer sky dome too
// which must be set up before the inner sky dome is created, so that transparency works.
// So for a given mode, we setup some uniforms in init(), and store data about 'configs'.

var _verticalMirror = {};        // hack! for now

function getNoMaterialMesh(meshName, meshSpecs) {
    var mesh = TRANSFORM.meshInventory.newMesh(
        meshName, 
        meshSpecs['geometry'],
        meshSpecs['position'],
        meshSpecs['scale'],
        'noMaterial',
        meshSpecs['rotationAxis'],
        meshSpecs['rotationAngle']
        );
    return mesh;
}
function cannedRun(scene, flightControl) {
    var that = this;
    this.scene = scene;
    this.flightControl = flightControl;
    this.configs = {};
    this.generalSettings = function() {
        this.cameraPosition = undefined;
        this.videoReloadDelayInSeconds = undefined;
        this.rotateYAmount = undefined;
        this.initialUpDownRotation = undefined;
        this.fog = false;
    };
    this.init = function() {
        var mode = getParameter('mode', window.location.href);

        // overall defaults
        this.showMirrorBall = false;
        that.hideAllControls = mode != null;
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
        var retdic = getCannedConfigs(mode, that.generalSettings, that.flightControl);
        that.configs = retdic['configs'];
        that.keyControls = retdic['keyControls'];
    }
    this._initMediaUtils = function(mediaUtils) {   // when still or video is defined in URL
        TRANSFORM.camera.camera.position.set(
            this.generalSettings.cameraPosition[0],
            this.generalSettings.cameraPosition[1],
            this.generalSettings.cameraPosition[2]);
        mediaUtils.rotateYAmount -= this.generalSettings.rotateYAmount;
        rotateCameraUpDown(TRANSFORM.camera.camera, this.generalSettings.initialUpDownRotation);
        if (this.generalSettings.fog) {
            that.scene.fog = new THREE.Fog( 0xaaaaaa, 1, 1000);
        }
    }
    this.setup = function (mediaUtils, transformUtils, renderer) {
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
                    meshSpecs['rotationAngle'],
                    );
            else if (meshSpecs['textureType'] == 'basic') {
                var basicmesh = TRANSFORM.meshInventory.newMesh(
                    meshName, 
                    meshSpecs['geometry'],
                    meshSpecs['position'],
                    meshSpecs['scale'],
                    'basic',
                    meshSpecs['rotationAxis'],
                    meshSpecs['rotationAngle']
                    );
                (new THREE.TextureLoader()).load("media/" + meshSpecs['textureName'], function ( texture ) {
                    console.log("setup(): loading texture");
                    basicmesh.setTexture(texture,null, null);
                });
            }
            else if (meshSpecs['textureType'] == 'outerShaderMaterial') {
                var mesh = getNoMaterialMesh(meshName, meshSpecs);
                console.log(">>>>>>>>>>>>>>>>>>>Create shader material");
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
                var mesh = getNoMaterialMesh(meshName, meshSpecs);
                var skyMaterial =  new THREE.MeshPhongMaterial({ 
                    side: THREE.DoubleSide,
                    color: 0x255c78,
                    emissive: 0x51252,
                    shininess: 100,
                });
                mesh.mesh.material = skyMaterial;
            }
            else if (meshSpecs['textureType'] == 'transparent') {
                var mesh = getNoMaterialMesh(meshName, meshSpecs);
                var skyMaterial =  new THREE.MeshLambertMaterial({ 
                    side: THREE.DoubleSide,
                    color: 0x00000000,
                });
                mesh.mesh.material = skyMaterial;
            }
            else if (meshSpecs['textureType'] == 'normal') {
                var mesh = getNoMaterialMesh(meshName, meshSpecs);
                mesh.mesh.material = new THREE.MeshNormalMaterial({side: THREE.DoubleSide, shading: THREE.FlatShading});
            }
            else if (meshSpecs['textureType'] == 'tetraNormal') {
                var mesh = getNoMaterialMesh(meshName, meshSpecs);
                // see: https://stackoverflow.com/questions/45156446/color-a-tetrahedron-in-three-js/45156649#45156649
                var skyMaterial = new THREE.MeshBasicMaterial({
                    side: THREE.DoubleSide,
                    shading: THREE.FlatShading,
                    vertexColors: THREE.VertexColors
                })
                mesh.mesh.material = skyMaterial;
            }
            else if (meshSpecs['textureType'] == 'mirror') {
                var mesh = getNoMaterialMesh(meshName, meshSpecs);

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
                // mirror2 is used for planes. Uses THREE.Mirror instead of a CubeCamera. 
                // Simpler if you want a bunch of mirrors.
                var mesh = getNoMaterialMesh(meshName, meshSpecs);
                var WIDTH = window.innerWidth;
                var HEIGHT = window.innerHeight;
                var verticalMirror = new THREE.Mirror( renderer, TRANSFORM.camera.camera, {
                    clipBias: 0.003,
                    textureWidth: WIDTH, 
                    textureHeight: HEIGHT, 
                    color:0x00aaaa } );
                mesh.mesh.material =  verticalMirror.material;
				mesh.mesh.add( verticalMirror );
                _verticalMirror[meshName] = verticalMirror;
            }
            else if (meshSpecs['textureType'] == 'stream') {
                mediaUtils.initializeReimannDomeForVideoName(
                    meshName,
                    meshSpecs['textureName'],
                    meshSpecs['geometry'],
                    meshSpecs['position'],
                    meshSpecs['scale'],
                    meshSpecs['rotationAxis'],
                    meshSpecs['rotationAngle'],
                    'stream'
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
            else {
                // Video
                mediaUtils.initializeReimannDomeForVideoName(
                    meshName, 
                    meshSpecs['textureName'],
                    meshSpecs['geometry'],
                    meshSpecs['position'],
                    meshSpecs['scale'],
                    meshSpecs['rotationAxis'],
                    meshSpecs['rotationAngle'],
                    'video'
                    );
                document.getElementById("startVideoText").onclick = function() {
                    console.log("user clicked, play video");
                    mediaUtils.videoManager.video_play_all();
                    document.getElementById("startVideoText").style.display = "None"
                };
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