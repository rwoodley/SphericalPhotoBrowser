// handles canned runs.
function cannedRun() {
    var that = this;
    this.transformUtils = undefined;    // will be setup in setup().
    function addSkyDomeToScene(scene, skyMaterial) {
        var skyGeometry = new THREE.SphereGeometry(100,32,32);
        var skyMesh = new THREE.Mesh( skyGeometry, skyMaterial );
        scene.add(skyMesh);
        return skyMesh;
    }
    this.createSkyDome = function(scene) {
        var skyMaterial;
        if (this.skyMaterial == "normal") {
            skyMaterial = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide});    
            addSkyDomeToScene(_scene, skyMaterial);
        }
        if (this.skyMaterial == "greyOutline") {
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
            skyMaterial = new THREE.ShaderMaterial( {
                uniforms: uniforms,
                vertexShader: SHADERCODE.mainShader_vs(),
                fragmentShader: SHADERCODE.outerShader_fs(),
                side: THREE.DoubleSide,
                transparent: true,
                // wireframe: true
            } );            
            addSkyDomeToScene(_scene, skyMaterial);
        }
        if (this.skyMaterial == "fractalDome") {
            var uniforms = getCleanSetOfUniforms();
            uniforms.fractalEffectOnOff.value = 2;
            var newMaterial = getBigAssShaderMaterial(undefined, uniforms);
            var mesh = addSkyDomeToScene(_scene, newMaterial);
            mesh.scale.set(-1,-1,1);
        }


        if (this.skyMaterial == "hdr1") {
            (new THREE.TextureLoader()).load("media/stillMask3.png", function ( texture ) {
                skyMaterial = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide });
                var mesh = addSkyDomeToScene(_scene, skyMaterial);
                mesh.scale.set(-1,1,1);
            });
        }
        else {
            (new THREE.TextureLoader()).load(this.skyMaterial, function ( texture ) {
                skyMaterial = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide });
                var mesh = addSkyDomeToScene(_scene, skyMaterial);
                mesh.scale.set(-1,1,1);
            });            
        }
    }
    this.init = function() {
        var mode = getParameter('mode', window.location.href);

        // overall defaults
        this.showMirrorBall = false;
        this.geometry = "sphere";
        // this.skyMaterial = "fractalDome";
        //this.skyMaterial = "greyOutline";
        this.skyMaterial = "media/eso_dark.jpg";
        this.textureUAdjustment = 0;
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
        this.rotateYAmount = 0.0005;
        this.textureType = 'video';
        this.complexEffect3OnOff = 0;
        this.fractalEffectOnOff = 0;
        this.schottkyEffect = 0;
        this.textureScale = 1.;

        // overrides:
        if (mode == 'uv') {
            this.textureName = 'uv.jpg';
            this.textureType = 'still';
            this.complexEffect3OnOff = 1;
            this.textureScale = 3.5; 
        }
        if (mode == 'couple') {
            this.textureName = 'couple';
            this.complexEffect3OnOff = 1;
            this.textureScale = 3.5;
            this.skyMaterial = "greyOutline";
        }
        if (mode == 'couple2') {
            this.textureName = 'coupleCropped';
            this.cameraPosition = [-8.4,3.6,10.1];
            this.complexEffect3OnOff = 1;
            this.textureScale = 2.25;
            this.showMirrorBall = true;
            this.skyMaterial = "greyOutline";
        }
        if (mode == 'torusDance') {
            this.textureName = 'dance200';
            this.geometry = "torus";
            this.cameraPosition = [-7.8,4.8,-2.7];
            this.skyMaterial = "hdr1";
            this.textureUAdjustment = 0.44;
        }
        if (mode == 'benchmark') {
            this.textureName = 'couple';
            this.complexEffect3OnOff = 1;
            this.textureScale = 3.5;
            this.schottkyEffect = 1;
            this.skyMaterial = "greyOutline";
        }
        if (mode == 'doubleFractal') {
            this.textureName = 'uv';
            this.cameraPosition = [-8.4,3.6,10.1];
            this.fractalEffectOnOff = 1;
            this.showMirrorBall = true;
            this.skyMaterial = "fractalDome";
        }
    }
    this._initMediaUtils = function(mediaUtils) {   // when still or video is defined in URL
        mediaUtils.camera.position.set(
            this.cameraPosition[0],
            this.cameraPosition[1],
            this.cameraPosition[2]);
        mediaUtils.rotateYAmount -= this.rotateYAmount;
    }

    this._initTransformUtils = function(uniforms) {
        uniforms.complexEffect3OnOff.value = that.complexEffect3OnOff;
        uniforms.schottkyEffectOnOff.value = that.schottkyEffect;
        uniforms.fractalEffectOnOff.value = that.fractalEffectOnOff;
        uniforms.textureScale.value *= that.textureScale; 
        uniforms.textureUAdjustment.value = this.textureUAdjustment;
    }    
    this.setup = function(mediaUtils, transformUtils) {
        if (!that.createMode) {
            mediaUtils.toggleControlPanel();
            this._initMediaUtils(mediaUtils);
            this._initTransformUtils(transformUtils.uniforms);
            if (this.textureType == 'still')
                mediaUtils.updateSkyDomeForFileName(this.textureName);
            else
                mediaUtils.updateVideoForFileName(this.textureName);
        }
        else
            mediaUtils.updateSkyDomeForFileName(that.textureName);   
    }
    // ----
    this.init();
}