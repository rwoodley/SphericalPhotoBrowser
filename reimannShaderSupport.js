// TRANSFORM.reimannShaderList 
//      - holds all reimannShaderDetailsObject.
//      - each call to animate, loops over all uniforms invoking animate.
// The editor works on one set of uniforms at a time. Currently the 'default'.
reimannShaderListObject = function() {
    var that = this;
    this.detailsObjectList = {}
    this.editor = undefined;
    this.createShader2 = function(name) {
        var obj = new reimannShaderDetailsObject(name);
        this.detailsObjectList[name] = obj;

        return obj;
    }
    this.createShader = function(name) {
        return this.createShader2(name).currentUniforms;
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
    that.colorGen = new colorGen('FF0000', '0000FF', 1000);
    
    this.currentUniforms = {
        iRotationAmount:    { type: 'f', value: 0.0 },
        startTime:    { type: 'f', value: 0.0 },
        iGlobalTime:    { type: 'f', value: 0.0 },
        mobiusEffectsOnOff: { type: 'i', value: 0 },
        textureScaleX: { type: 'f', value: 1. },
        textureScaleY: { type: 'f', value: 1. },
        tesselate: { type: 'f', value: 0. },
        uAlpha: { type: 'f', value: 1. },
        uColorVideoMode: { type: 'f', value: 0. },  // need value = 1 for outer texture.
        enableTracking: { type: 'i', value: 0 },
        textureX: { type: 'f', value: 0. },
        textureY: { type: 'f', value: 0. },
        flipTexture: { type: 'i', value: 0 },
        textureUAdjustment: { type: 'f', value: 0 },
        textureVAdjustment: { type: 'f', value: 0 },
        uSyntheticTexture: { type: 'i', value: 0 },
        uSyntheticTextureQuadrant: { type: 'f', value: -1 },
        complexEffect1OnOff: { type: 'i', value: 1 },
        complexEffect3OnOff: { type: 'i', value: 0 },
        complexEffect4OnOff: { type: 'i', value: 0 },
        uPolygonalGroups: { type: 'i', value: 0 },
        schottkyEffectOnOff: { type: 'i', value: 0 },
        fractalEffectOnOff: { type: 'i', value: 0 },
        geometryTiming: { type: 'i', value: 0 },
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
        uSymmetryIndex: { type: 'i', value: 999 },


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
        iChannelDelayMask1:  { type: 't', value: 0 },
        iChannelDelayMask2:  { type: 't', value: 0 },
        iChannelDelayMask3:  { type: 't', value: 0 },
        u3p1: { type: "v2", value: new THREE.Vector2(0,0) },
        u3q1: { type: "v2", value: new THREE.Vector2(0,0) },
        u3r1: { type: "v2", value: new THREE.Vector2(0,0) },
        u3p2: { type: "v2", value: new THREE.Vector2(0,0) },
        u3q2: { type: "v2", value: new THREE.Vector2(0,0) },
        u3r2: { type: "v2", value: new THREE.Vector2(0,0) },
        uColor0: { type: "v4", value: new THREE.Vector4(0,0,1,1) },
        uColor1: { type: "v4", value: new THREE.Vector4(0,0,1,1) },
        uColor2: { type: "v4", value: new THREE.Vector4(0,0,1,1) },
        uColor3: { type: "v4", value: new THREE.Vector4(0,0,1,1) },
        uColor4: { type: "v4", value: new THREE.Vector4(0,0,1,1) },
        uColorScale: { type: "v4", value: new THREE.Vector4(0,0,1,1) },
        uColorBlack: { type: "v4", value: new THREE.Vector4(0,0,1,1) },
        uHighPassFilterThreshold: { type: "v3", value: new THREE.Vector3(.5,.5,.5) },
        uLowPassFilterThreshold: { type: "v3", value: new THREE.Vector3(.05,.05,.05) },
        uHighPassFilterThreshold2: { type: "v3", value: new THREE.Vector3(.3,.3,.3) },
        uLowPassFilterThreshold2: { type: "v3", value: new THREE.Vector3(.25,.25,.25) },
        uThreePointMappingOn: { type: 'i', value: 0 }
    };
    this.setDefaults = function() {
        // Initialize the masks to something so everything comes up.
        // These will be changed later as needed.
        // we have to keep loading the texture otherwise the channels all point to the same texture.
        var pathToSubtractionTexture = 'media/placeholderStill.png';
        (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
            setMipMapOptions(texture);
            that.currentUniforms.iChannelStillMask1.value =  texture; 
        });
        (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
            setMipMapOptions(texture);
            that.currentUniforms.iChannelDelayMask1.value =  texture;       // the delay mask needs to be initialized to a still for this to work.
        });
        (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
            setMipMapOptions(texture);
            that.currentUniforms.iChannelStillMask2.value =  texture; 
            that.currentUniforms.iChannelDelayMask2.value =  texture;       // the delay mask needs to be initialized to a still for this to work.
        });
        (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
            setMipMapOptions(texture);
            that.currentUniforms.iChannelDelayMask3.value =  texture;       // the delay mask needs to be initialized to a still for this to work.
        });
        
    }
    this.animate = function(animationFrame, videoDisplayed, videoCurrentTime, videoFileName) {
        if (that.firstTime) {
            that.setDefaults();
        }
        that.firstTime = false;
        that.currentUniforms.iRotationAmount.value = that.currentUniforms.iRotationAmount.value  + .05*that.rotateDirection;
        that.currentUniforms.iGlobalTime.value = that.currentUniforms.iGlobalTime.value  + 1;
        that.currentUniforms.uColor0.value = new THREE.Vector4(
            _params.color0[0]/255.,
            _params.color0[1]/255.,
            _params.color0[2]/255.,
            _params.color0[3],
        );
        that.currentUniforms.uColor1.value = new THREE.Vector4(
            _params.color1[0]/255.,
            _params.color1[1]/255.,
            _params.color1[2]/255.,
            _params.color1[3],
        );
        that.currentUniforms.uColor2.value = new THREE.Vector4(
            _params.color2[0]/255.,
            _params.color2[1]/255.,
            _params.color2[2]/255.,
            _params.color2[3],
        );
        that.currentUniforms.uColor3.value = new THREE.Vector4(
            _params.color3[0]/255.,
            _params.color3[1]/255.,
            _params.color3[2]/255.,
            _params.color3[3],
        );
        that.currentUniforms.uColor4.value = new THREE.Vector4(
            _params.color4[0]/255.,
            _params.color4[1]/255.,
            _params.color4[2]/255.,
            _params.color4[3],
        );
        that.currentUniforms.uColorBlack.value = new THREE.Vector4(
            _params.colorBlack[0]/255.,
            _params.colorBlack[1]/255.,
            _params.colorBlack[2]/255.,
            _params.colorBlack[3],
        );
        var rgb = that.colorGen.nextColor();
        that.currentUniforms.uColorScale.value = 
        new THREE.Vector4(
            rgb[0]/255.,
            rgb[1]/255.,
            rgb[2]/255.,
            1.0,
        )        
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
        if (that.currentUniforms.uMaskType.value == 1 || 
            that.currentUniforms.uMaskType.value == 4 || 
            that.currentUniforms.uMaskType.value == 5) {
            if (animationFrame%160 == 0) {
                that.currentUniforms.iChannelDelayMask1.value.image = that.currentUniforms.iChannel0.value.image;
                that.currentUniforms.iChannelDelayMask1.value.needsUpdate = true;
            }
            if (animationFrame%120 == 0) {
                that.currentUniforms.iChannelDelayMask2.value.image = that.currentUniforms.iChannel0.value.image;
                that.currentUniforms.iChannelDelayMask2.value.needsUpdate = true;
            }
            if (animationFrame%180 == 0 && that.currentUniforms.uMaskType.value == 4) {
                that.currentUniforms.iChannelDelayMask3.value.image = that.currentUniforms.iChannel0.value.image;
                that.currentUniforms.iChannelDelayMask3.value.needsUpdate = true;
            }
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
        + SHADERCODE.polygonalGroupsCode()
        + SHADERCODE.drosteUtils()
        + SHADERCODE.symmetryUtils()
        + SHADERCODE.schottkyUtils()
        + SHADERCODE.mainShader_fs()
    ;
    console.log(">>>>>>>>>>>>>>>>>>>Create shader material");
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
