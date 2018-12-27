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
        var obj = this.createShader2(name);
        obj.loadDefaultTextures();
        return obj.currentUniforms;
    }
    this.createShaderFewerTextures = function(name) {   // maybe this is faster.
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
// this must be paired with the appropriate shaders of course, 
// which happens in getReimannShaderMaterial <- called eventually by updateReimannDomeForVideoName() or
// called in updateReimannDomeForFileName().
reimannShaderDetailsObject = function(name) {
    var that = this;
    that.firstTime = true;
    that.name = name;
    this.rotateDirection = 0;
    that.cameraLookAtComplexX = 0;
    that.cameraLookAtComplexY = 0;
    that.point1Defined = false;
    that.point2Defined = false;
    that.savedFrame = undefined;
    that.colorGen = new colorGen('FF0000', '0000FF', 1000);
    this.aMobiusTransform = new xform(_one, _zero, _zero, _one);
    // this.aMobiusTransform = new xform(_one, _four, _zero, _one);

    this.currentUniforms = {
        iRotationAmount:    { type: 'f', value: 0.0 },
        startTime:    { type: 'f', value: 0.0 },
        iGlobalTime:    { type: 'f', value: 0.0 },
        mobiusEffectsOnOff: { type: 'i', value: 0 },
        textureScaleX: { type: 'f', value: 1. },
        textureScaleY: { type: 'f', value: 1. },
        tesselate: { type: 'f', value: 0. },
        uAlpha: { type: 'f', value: 1. },
        uColorVideoMode: { type: 'i', value: 0. },  // need value = 1 for outer texture.
        enableTracking: { type: 'i', value: 0 },
        enableAnimationTracking: { type: 'i', value: 0},
        textureX: { type: 'f', value: 0. },
        textureY: { type: 'f', value: 0. },
        flipTexture: { type: 'i', value: 0 },
        textureUAdjustment: { type: 'f', value: 0 },
        textureVAdjustment: { type: 'f', value: 0 },
        uSyntheticTexture: { type: 'i', value: 0 },
        uSyntheticTextureQuadrant: { type: 'f', value: -1 },
        uAnimationEffect: { type: 'i', value: 0},
        complexEffect1OnOff: { type: 'i', value: 1 },
        complexEffect3OnOff: { type: 'i', value: 0 },
        complexEffect4OnOff: { type: 'i', value: 0 },
        uPolygonalGroups: { type: 'i', value: 0 },
        schottkyEffectOnOff: { type: 'i', value: 0 },
        fractalEffectOnOff: { type: 'i', value: 0 },
        proximityEffect:  { type: 'i', value: 0 },
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
        uXform2A: { type: "v2", value: new THREE.Vector2(0,0) },
        uXform2B: { type: "v2", value: new THREE.Vector2(0,0) },
        uXform2C: { type: "v2", value: new THREE.Vector2(0,0) },
        uXform2D: { type: "v2", value: new THREE.Vector2(0,0) },
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
        iChannelAnimation: { type: 't', value: 0 },
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
    // aMobiusTransform is just any ole xform you wish to use in a shader but calc in js.
    this.updateUniformsForMobiusTransform = function() {
        that.currentUniforms.uXform2A.value = that.aMobiusTransform.a;
        that.currentUniforms.uXform2B.value = that.aMobiusTransform.b;
        that.currentUniforms.uXform2C.value = that.aMobiusTransform.c;
        that.currentUniforms.uXform2D.value = that.aMobiusTransform.d;
        that.aMobiusTransform.log();
        that.currentUniforms.uXform2A.needsUpdate = true;
        that.currentUniforms.uXform2B.needsUpdate = true;
        that.currentUniforms.uXform2C.needsUpdate = true;
        that.currentUniforms.uXform2D.needsUpdate = true;
    }
    this.updateUniformsForMobiusTransform();
    this.drawLabelOnCanvas = function(rn, rd,i) {
        // draws a fraction, if real (i == 0)
        // There is only one canvas element for now,
        // so if you have multiple meshes, this won't work.
        var el = document.getElementById('canvas');
        var ctx = el.getContext("2d");
        var z = new complex(rn/rd, i);

        // so the labels have been placed assuming no mobius transform.
        // if a transform has been applied that will morph the labels.
        // values near the origin will balloon, those near infinity will shrink.
        // so the labels need to be divided by |z b4|/|z after|
        var xform = that.aMobiusTransform;
        var z_after = xform.doit(z);
        var mod_b4 = z.modulus();
        var mod_after = z_after.modulus();
        var font_size = (100 * mod_after/mod_b4).toFixed(0);
        ctx.font = font_size + "px Arial";

        ctx.fillStyle = 'red';
        var uv = complexToUV(z.x, z.y);
        var txt; 
        if (i == 0) {
            txt = rn + "/" + rd;
            ctx.fillText(txt,uv[0]*el.width,uv[1]*el.height);
        }
        else {
            txt = z.displayString();
            ctx.fillText(txt,uv[0]*el.width,uv[1]*el.height);
        }
        console.log(txt, mod_b4, mod_after, mod_b4/mod_after, ctx.font);

        ctx.stroke();
    }
    
    this.updateFareyLabelsForMobiusTransform = function() {
        var el = document.getElementById('canvas');
        var ctx = el.getContext("2d");
        ctx.clearRect(0, 0, el.width, el.height);        

        that.drawLabelOnCanvas(1.0,2,0.0);
        that.drawLabelOnCanvas(1.0,3,0.0);
        that.drawLabelOnCanvas(1.0,4,0.0);
        that.drawLabelOnCanvas(1.0,5,0.0);
        
        that.drawLabelOnCanvas(-1.0,2,0.0);
        that.drawLabelOnCanvas(-1.0,3,0.0);
        that.drawLabelOnCanvas(-1.0,4,0.0);
        that.drawLabelOnCanvas(-1.0,5,0.0);
        
        that.drawLabelOnCanvas(1.0,1,0.0);
        that.drawLabelOnCanvas(2.0,1,0.0);
        that.drawLabelOnCanvas(3.0,1,0.0);
        that.drawLabelOnCanvas(4.0,1,0.0);
        that.drawLabelOnCanvas(5.0,1,0.0);
        that.drawLabelOnCanvas(-1.0,1,0.0);
        that.drawLabelOnCanvas(-2.0,1,0.0);
        that.drawLabelOnCanvas(-3.0,1,0.0);
        that.drawLabelOnCanvas(-4.0,1,0.0);
        that.drawLabelOnCanvas(-5.0,1,0.0);
        that.drawLabelOnCanvas(0.0,1, 1.0);
        that.drawLabelOnCanvas(0.0,1, 2.0);
        that.drawLabelOnCanvas(0.0,1, 3.0);
        that.drawLabelOnCanvas(0.0,1, 4.0);
        that.drawLabelOnCanvas(0.0,1, 5.0);
        // that.currentUniforms.iChannelAnimation.needsUpdate = true;
        texture = new THREE.Texture(el);
        that.currentUniforms.iChannelAnimation.value = texture;
        texture.needsUpdate = true;

        // var z = new complex(1.0,0.0);
        // var uv = complexToUV(z.x, z.y);
        // ctx.fillText(z.displayString(),uv[0]*el.width,uv[1]*el.height);
        // var z = new complex(2.0,0.0);
        // var uv = complexToUV(z.x, z.y);
        // ctx.fillText(z.displayString(),uv[0]*el.width,uv[1]*el.height);
        // var z = new complex(3.0,0.0);
        // var uv = complexToUV(z.x, z.y);
        // ctx.fillText(z.displayString(),uv[0]*el.width,uv[1]*el.height);
        // var z = new complex(0.5,0.0);
        // var uv = complexToUV(z.x, z.y);
        // ctx.fillText(z.displayString(),uv[0]*el.width,uv[1]*el.height);


        // var xf = new xform(_one, _zero, _zero, _one);
        // var z = new complex(1.0,0.0);
        // for (i = 0; i < 10; i++) {
        //     var z = xf.doit(z);
        //     xf =xf.mmult(_tXform);
        //     var uv = complexToUV(z.x, z.y);
        //     console.log(">>>>>>>>>> " + z.x + "," + z.y + "[" + uv[0] + "," + uv[1] + "]");
        //     ctx.fillText(z.displayString(),uv[0]*el.width,uv[1]*el.height);
        //     ctx.beginPath();
        //     ctx.arc(uv[0]*el.width,uv[1]*el.height,10,0,2*Math.PI);
        //     ctx.stroke();
        // }
    }

    this.loadDefaultTextures = function() {
        // Initialize the masks to something so everything comes up.
        // These will be changed later as needed.
        // we have to keep loading the texture otherwise the channels all point to the same texture.
        var pathToSubtractionTexture = 'media/placeholderStill.png';
        (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
            console.log("reimannShaderSupport.setDefaults(): loading texture for iChannelDelayMask");
            setMipMapOptions(texture);
            that.currentUniforms.iChannelStillMask1.value =  texture; 
        });
        (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
            console.log("reimannShaderSupport.setDefaults(): loading texture for iChannelDelayMask1");
            setMipMapOptions(texture);
            that.currentUniforms.iChannelDelayMask1.value =  texture;       // the delay mask needs to be initialized to a still for this to work.
        });
        (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
            console.log("reimannShaderSupport.setDefaults(): loading texture for iChannelDelayMask2");
            setMipMapOptions(texture);
            that.currentUniforms.iChannelStillMask2.value =  texture; 
            that.currentUniforms.iChannelDelayMask2.value =  texture;       // the delay mask needs to be initialized to a still for this to work.
        });
        (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
            console.log("reimannShaderSupport.setDefaults(): loading texture for iChannelDelayMask3");
            setMipMapOptions(texture);
            that.currentUniforms.iChannelDelayMask3.value =  texture;       // the delay mask needs to be initialized to a still for this to work.
        });
        
    }    
    this.animate = function(animationFrame, videoDisplayed, videoCurrentTime, videoFileName) {
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
            if (that.currentUniforms.enableAnimationTracking.value == 1) {
                console.log("noop")
            }
            if (that.currentUniforms.enableTracking.value == 1) {
                if (that.trackerUtils == undefined) 
                    that.trackerUtils = new trackerUtils(_trackerUtilsFileName); // happens w canned mode sometimes.

                var coords = that.trackerUtils.getXY(videoCurrentTime);
                that.currentUniforms.textureUAdjustment.value = coords[0];
                that.currentUniforms.textureVAdjustment.value = 1.5-coords[1];
            }
            if (that.currentUniforms.uThreePointMappingOn.value == 1) {
                if (that.threePointTracker == undefined)
                    that.threePointTracker = new threePointTrackerFromFiles(videoFileName);
                that.threePointTracker.getXY(videoCurrentTime, that.currentUniforms);
            }
        }

        if (that.currentUniforms.uAnimationEffect.value == 1) {
                if (that.threePointTracker == undefined)
                    that.threePointTracker = new threePointTrackerRandomWalk(videoFileName);
                that.threePointTracker.getXY(videoCurrentTime, that.currentUniforms);
        }

        if (that.currentUniforms.uMaskType.value == 1 || 
            that.currentUniforms.uMaskType.value == 2 ||
            that.currentUniforms.uMaskType.value == 4 ||
            that.currentUniforms.uMaskType.value == 5) {

            if (that.savedFrame != undefined) {
                that.currentUniforms.iChannelDelayMask1.value.image = that.savedFrame;
                that.currentUniforms.iChannelDelayMask1.value.needsUpdate = true;
            }
            else {
                console.log("undefined")
            }
            that.savedFrame = that.currentUniforms.iChannel0.value.image;
//            if (animationFrame%1 == 0) {
//                console.log("Updating.");
//                that.currentUniforms.iChannelDelayMask1.value.image = that.currentUniforms.iChannel0.value.image;
//                that.currentUniforms.iChannelDelayMask1.value.needsUpdate = true;
//            }
            if (animationFrame%120 == 0) {
                that.currentUniforms.iChannelDelayMask2.value.image = that.currentUniforms.iChannel0.value.image;
                that.currentUniforms.iChannelDelayMask2.value.needsUpdate = true;
            }
            if (animationFrame%180 == 0) {
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
        + SHADERCODE.animationUtils()
        + SHADERCODE.symmetryUtils()
        + SHADERCODE.schottkyUtilsCommon()
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
