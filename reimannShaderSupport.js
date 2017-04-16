// TRANSFORM.reimannShaderList 
//      - holds all reimannShaderDetailsObject.
//      - each call to animate, loops over all uniforms invoking animate.
// The editor works on one set of uniforms at a time. Currently the 'default'.
reimannShaderListObject = function() {
    var that = this;
    this.detailsObjectList = {}
    this.editor = undefined;
    this.createShader = function(name) {
        var uniforms = new reimannShaderDetailsObject(name);
        this.detailsObjectList[name] = uniforms;

        return uniforms.currentUniforms;
    }
    this.animate = function(animationFrame, videoDisplayed, videoCurrentTime, videoFileName) {
        that.editor.updateVariousNumbersForCamera();
        for (var i in that.detailsObjectList) {
            var reimannShaderDetailsObject = that.detailsObjectList[i];
            reimannShaderDetailsObject.animate(animationFrame, videoDisplayed, videoCurrentTime, videoFileName);
        }
    }
    this.getShaderDetailsObject = function(name) {
        return this.detailsObjectList[name];
    }
}

// Functions specific to doing mobius transforms on videos or stills.
// this must be paired with the appropriate shaders of course.
reimannShaderDetailsObject = function(name) {
    var that = this;
    that.firstTime = true;
    that.name = name;
    this.rotateDirection = 0;
    that.cameraLookAtComplexX = 0;
    that.cameraLookAtComplexY = 0;
    that.point1Defined = false;
    that.point2Defined = false;

    this.currentUniforms = {
        iRotationAmount:    { type: 'f', value: 0.0 },
        startTime:    { type: 'f', value: 0.0 },
        iGlobalTime:    { type: 'f', value: 0.0 },
        mobiusEffectsOnOff: { type: 'i', value: 0 },
        textureScaleX: { type: 'f', value: 1. },
        textureScaleY: { type: 'f', value: 1. },
        tesselate: { type: 'f', value: 0. },
        uAlpha: { type: 'f', value: 1. },
        uColorVideoMode: { type: 'f', value: 1. },  // need value = 1 for outer texture.
        enableTracking: { type: 'i', value: 0 },
        textureX: { type: 'f', value: 0. },
        textureY: { type: 'f', value: 0. },
        flipTexture: { type: 'i', value: 0 },
        textureUAdjustment: { type: 'f', value: 0 },
        textureVAdjustment: { type: 'f', value: 0 },
        complexEffect1OnOff: { type: 'i', value: 1 },
        complexEffect3OnOff: { type: 'i', value: 0 },
        complexEffect4OnOff: { type: 'i', value: 0 },
        complexEffect5OnOff: { type: 'i', value: 0 },
        schottkyEffectOnOff: { type: 'i', value: 0 },
        fractalEffectOnOff: { type: 'i', value: 0 },
        hyperbolicTilingEffectOnOff: { type: 'i', value: 0},
        showFixedPoints: { type: 'i', value: 1 },
        uBlackMask: { type: 'i', value: 0 },
        uHighPassFilter : { type: 'i', value: 0 },
        uNadirMask: { type: 'i', value: 0 },
        uApplyMobiusTransform: { type: 'i', value:-1},

        uXformA: { type: "v2", value: new THREE.Vector2(0,0) },
        uXformB: { type: "v2", value: new THREE.Vector2(0,0) },
        uXformC: { type: "v2", value: new THREE.Vector2(0,0) },
        uXformD: { type: "v2", value: new THREE.Vector2(0,0) },


        uMaskType: { type: 'i', value: 0 },
        uTextureNumber: { type: 'i', value: 0 },
        e1x: { type: 'f', value: 0. },
        e1y: { type: 'f', value: 0. },
        e2x: { type: 'f', value: 0. }, 
        e2y: { type: 'f', value: 0. },
        loxodromicX: {type: 'f', value: 1. },
        loxodromicY: {type: 'f', value: 0. },
        drosteType: {type: 'i', value: 0 },
        drosteSpiral: {type: 'i', value: 0 },
        drosteZoom: {type: 'i', value: 0},
        iChannel0:  { type: 't', value: 0 },
        iChannelStillMask1:  { type: 't', value: 0 },
        iChannelStillMask2:  { type: 't', value: 0 },
        iChannelDelayMask:  { type: 't', value: 0 },
        u3p1: { type: "v2", value: new THREE.Vector2(0,0) },
        u3q1: { type: "v2", value: new THREE.Vector2(0,0) },
        u3r1: { type: "v2", value: new THREE.Vector2(0,0) },
        u3p2: { type: "v2", value: new THREE.Vector2(0,0) },
        u3q2: { type: "v2", value: new THREE.Vector2(0,0) },
        u3r2: { type: "v2", value: new THREE.Vector2(0,0) },
        uHighPassFilterThreshold: { type: "v3", value: new THREE.Vector3(.5,.5,.5) },
        uThreePointMappingOn: { type: 'i', value: 0 }
    };
    this.setDefaults = function() {
        // Initialize the masks to something so everything comes up.
        // These will be changed later as needed.
        var pathToSubtractionTexture = 'media/placeholderStill.png';
        (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
            setMipMapOptions(texture);
            that.currentUniforms.iChannelStillMask1.value =  texture; 
        });
        (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
            setMipMapOptions(texture);
            that.currentUniforms.iChannelStillMask2.value =  texture; 
            that.currentUniforms.iChannelDelayMask.value =  texture;       // the delay mask needs to be initialized to a still for this to work.
        });
        
    }
    this.animate = function(animationFrame, videoDisplayed, videoCurrentTime, videoFileName) {
        if (that.firstTime) {
            that.setDefaults();
        }
        that.firstTime = false;
        that.currentUniforms.iRotationAmount.value = that.currentUniforms.iRotationAmount.value  + .05*that.rotateDirection;
        that.currentUniforms.iGlobalTime.value = that.currentUniforms.iGlobalTime.value  + 1;

        if (videoDisplayed) {
            if (that.currentUniforms.enableTracking.value == 1) {
                if (that.trackerUtils == undefined) 
                    that.trackerUtils = new trackerUtils(_trackerUtilsFileName); // happens w canned mode sometimes.

                var coords = that.trackerUtils.getXY(videoCurrentTime);
                that.currentUniforms.textureUAdjustment.value = coords[0];
                that.currentUniforms.textureVAdjustment.value = 1.5-coords[1];
            }
            if (that.currentUniforms.uThreePointMappingOn.value == 1) {
                if (that.threePointTracker == undefined)
                    that.threePointTracker = new threePointTracker(videoFileName);
                that.threePointTracker.getXY(videoCurrentTime, that.currentUniforms);
            }
        }
        if (animationFrame%120 == 0) {
            that.currentUniforms.iChannelDelayMask.value.image = that.currentUniforms.iChannel0.value.image;
            that.currentUniforms.iChannelDelayMask.value.needsUpdate = true;
        }
    }
};
function getReimannShaderMaterial(texture, uniforms) {
    if (texture != undefined)
        uniforms.iChannel0 =  { type: 't', value: texture }; 
    var fragmentShaderCode = 
        ""
        + SHADERCODE.uniformsAndGlobals()
        + SHADERCODE.mathUtils()
        + SHADERCODE.mobiusTransformUtils()
        + SHADERCODE.drosteUtils()
        + SHADERCODE.schottkyUtils()
        + SHADERCODE.mainShader_fs()
    ;
    var newMaterial = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: SHADERCODE.mainShader_vs(),
        fragmentShader: fragmentShaderCode,
        side: THREE.DoubleSide,
        transparent: true,
        // wireframe: true
    } );
    return newMaterial;                    
}
