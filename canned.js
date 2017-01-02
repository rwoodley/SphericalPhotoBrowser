// handles canned runs.
function cannedRun() {
    var that = this;
    this.skyDomeMesh = undefined;
    this.transformUtils = undefined;    // will be setup in setup().
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
            addSkyDomeToScene(_scene, new THREE.MeshNormalMaterial({ side: THREE.DoubleSide}));
            return;
        }
        if (this.skyMaterialName == "shiny") {
            addSkyDomeToScene(_scene, new THREE.MeshPhongMaterial({ 
                side: THREE.DoubleSide,
                color: 0x255c78,
                emissive: 0x51252,
                shininess: 100,
            }));
            return;
        }
        if (this.skyMaterialName == "black") {
            addSkyDomeToScene(_scene, new THREE.MeshBasicMaterial({ 
                side: THREE.DoubleSide,
                color: 0x000000,
            }));
            return;
        }
        if (this.skyMaterialName == "white") {
            addSkyDomeToScene(_scene, new THREE.MeshBasicMaterial({ 
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
                _mediaUtils.setMipMapOptions(texture);
                uniforms.iChannelStillMask1.value =  texture; 
            });
            var pathToSubtractionTexture = 'media/stillMask3.png';
            (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
                _mediaUtils.setMipMapOptions(texture);
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
            addSkyDomeToScene(_scene, skyMaterial);
            return;
        }
        if (this.skyMaterialName == "studioOutline") {
            var uniforms = {
                iChannelStillMask1:  { type: 't', value: 0 },
                iChannelStillMask2:  { type: 't', value: 0 },
            };
            var pathToSubtractionTexture = 'media/studioImage1.jpg';
            (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
                _mediaUtils.setMipMapOptions(texture);
                uniforms.iChannelStillMask1.value =  texture; 
            });
            var pathToSubtractionTexture = 'media/studioImage2.jpg';
            (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
                _mediaUtils.setMipMapOptions(texture);
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
            addSkyDomeToScene(_scene, skyMaterial);
            return;
        }
        if (this.skyMaterialName == "fractalDome") {
            var uniforms = getCleanSetOfUniforms();
            uniforms.fractalEffectOnOff.value = 2;
            var newMaterial = getBigAssShaderMaterial(undefined, uniforms);
            var mesh = addSkyDomeToScene(_scene, newMaterial);
            mesh.scale.set(-1,-1,1);
            return;
        }
        if (this.skyMaterialName == "triangleDome") {
            var uniforms = getCleanSetOfUniforms();
            uniforms.hyperbolicTilingEffectOnOff.value = 2;
            var newMaterial = getBigAssShaderMaterial(undefined, uniforms);
            var mesh = addSkyDomeToScene(_scene, newMaterial);
            mesh.scale.set(-1,-1,1);
            return;
        }
        
        if (this.skyMaterialName == "hdr1") {
            (new THREE.TextureLoader()).load("media/stillMask3.png", function ( texture ) {
                var skyMaterial = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide });
                var mesh = addSkyDomeToScene(_scene, skyMaterial);
                mesh.scale.set(-1,1,1);
            });
            return;
        }
        else {
            (new THREE.TextureLoader()).load(this.skyMaterialName, function ( texture ) {
                var skyMaterial = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide });
                var mesh = addSkyDomeToScene(_scene, skyMaterial);
                mesh.scale.set(-1,1,1);
            });            
            return;
        }
    }
    this.init = function() {
        var mode = getParameter('mode', window.location.href);

        // overall defaults
        this.showMirrorBall = false;
        this.geometry = "sphere";
        this.skyMaterialName = "shiny";
        //this.skyMaterialName = "greyOutline";
        //this.skyMaterialName = "media/eso_dark.jpg";
        this.textureUAdjustment = 0;
        this.iRotationAmount = 0;
        this.showMirrorBall = false;
        if (mode == null) {
            this.createMode = true;
            this.textureName = 'uv.jpg';
            this.textureType = 'still';
            return;
        }
        // default for canned runs, override as needed below
        this.createMode = false;

        this.cameraPosition = [9.4,0.4,6.];     // just outside inner sphere
        this.initialUpDownRotation = 0;
        // Initial Y rotation is determined entirely by cameraPosition. 
        this.rotateYAmount = 0.0005;    // additional rotation on each call to animate().
        this.textureType = 'video';

        this.uniforms = getCleanSetOfUniforms();

        this.uniforms.complexEffect3OnOff.value = 0;
        this.uniforms.fractalEffectOnOff.value = 0;
        this.uniforms.uColorVideoMode.value = 0;
        this.uniforms.hyperbolicTilingEffectOnOff.value = 0;
        this.uniforms.schottkyEffectOnOff.value = 0;
        this.uniforms.textureScale.value = 1.;

        // overrides:
        if (mode == 'uv') {
            this.textureName = 'uv.jpg';
            this.textureType = 'still';
            this.uniforms.complexEffect3OnOff.value = 1;
            this.uniforms.textureScale.value = 3.5; 
        }
        if (mode == 'couple2') {
            this.textureName = 'coupleCropped';
            this.cameraPosition = [-8.4,3.6,10.1];
            this.uniforms.complexEffect3OnOff.value = 1;
            this.uniforms.textureScale.value = 2.25;
            this.showMirrorBall = true;
            this.skyMaterialName = "greyOutline";
            this.videoReloadDelayInSeconds = 30;
        }
        if (mode == 'torusDance') {
            this.textureName = 'dance200';
            this.geometry = "torus";
            this.cameraPosition = [-7.8,4.8,-2.7];
            this.skyMaterialName = "hdr1";
            this.uniforms.textureUAdjustment.value = 0.44;
            this.videoReloadDelayInSeconds = 1;
        }
        if (mode == 'doubleFractal') {
            this.textureName = 'uv';
            this.cameraPosition = [-8.4,3.6,10.1];
            this.uniforms.fractalEffectOnOff.value = 1;
            this.uniforms.uColorVideoMode.value = 2;
            this.showMirrorBall = true;
            this.skyMaterialName = "fractalDome";
        }
        if (mode == 'triangles') {
            this.textureName = 'typewriter';
            this.geometry = "sphere";
            this.cameraPosition = [-7.8,4.8,-2.7];
            this.skyMaterialName = "hdr1";
            this.uniforms.hyperbolicTilingEffectOnOff.value = 1;
            this.uniforms.textureUAdjustment.value = 0.485;
            this.videoReloadDelayInSeconds = 1;
        }
        if (mode == 'squares') {
            this.textureName = 'typewriter';
            this.geometry = "sphere";
            this.cameraPosition = [0,-10.7,0];
            this.skyMaterialName = "hdr1";
            this.uniforms.schottkyEffectOnOff.value = 1;
            this.uniforms.textureUAdjustment.value = 0;

            this.videoReloadDelayInSeconds.value = 1;

            this.uniforms.mobiusEffectsOnOff.value = 1
            this.uniforms.iRotationAmount.value = 10.*Math.PI/2.;
            this.uniforms.e1x.value = -1;
            this.uniforms.e1y.value = 0;
            this.uniforms.e2x.value = 1;
            this.uniforms.e2y.value = 0;

            this.rotateYAmount = 0.;
            this.initialUpDownRotation = - Math.PI;
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

    this._initTransformUtils = function(uniforms) {
        uniforms.complexEffect3OnOff.value = that.uniforms.complexEffect3OnOff.value;
        uniforms.schottkyEffectOnOff.value = that.uniforms.schottkyEffectOnOff.value;
        uniforms.fractalEffectOnOff.value = that.uniforms.fractalEffectOnOff.value;
        uniforms.uColorVideoMode.value = that.uniforms.uColorVideoMode.value;
        uniforms.hyperbolicTilingEffectOnOff.value = that.uniforms.hyperbolicTilingEffectOnOff.value;
        uniforms.textureScale.value *= that.uniforms.textureScale.value; 
        uniforms.textureUAdjustment.value = that.uniforms.textureUAdjustment.value;
        uniforms.mobiusEffectsOnOff.value = that.uniforms.mobiusEffectsOnOff.value;
        uniforms.iRotationAmount.value = that.uniforms.iRotationAmount.value;
        uniforms.e1x.value = that.uniforms.e1x.value;
        uniforms.e1y.value = that.uniforms.e1y.value;
        uniforms.e2x.value = that.uniforms.e2x.value;
        uniforms.e2y.value = that.uniforms.e2y.value;
    }    
    this.setup = function(mediaUtils, transformUtils) {
        if (!that.uniforms.createMode) {     // canned mode
            mediaUtils.toggleControlPanel();
            this._initMediaUtils(mediaUtils);
            this._initTransformUtils(transformUtils.uniforms);
            // when mediaUtils refers to a skyDome it means the inner dome.
            // in this file skyDome means the outer dome. it uses skyMaterial.
            // the inner dome uses textureName.
            if (this.textureType == 'still')
                mediaUtils.updateSkyDomeForFileName(this.textureName);
            else {
                mediaUtils.updateVideoForFileName(this.textureName);
                mediaUtils.onVideoEnded = function() {
                    console.log("here..........");
                    window.setTimeout(function() {
                        console.log("Video is done, reloading.")
                        location.reload(true);
                    }, 
                    that.videoReloadDelayInSeconds*1000);
                }
            }
        }
        else {
            mediaUtils.updateSkyDomeForFileName(that.textureName);   
        }
    }
    // ----
    this.init();
}