SHADERCODE = {
    drosteUtils: "",
    mathUtils: "",
    schottkyUtils: "",
    mobiusTransformUtils: ""
};
SHADERCODE.uniformsAndGlobals = function() {
var x = `  

    // ===== shader control variables
    uniform sampler2D iChannel0;
    uniform sampler2D iChannelDelayMask;
    uniform sampler2D iChannelStillMask1;
    uniform sampler2D iChannelStillMask2;
    varying vec2 vUv;  
    uniform float iRotationAmount;
    uniform float iGlobalTime;
    uniform float startTime;
    uniform float loxodromicX;
    uniform float loxodromicY;
    uniform float e1x;
    uniform float e1y;
    uniform float e2x;
    uniform float e2y;
    uniform int mobiusEffectsOnOff; 
    uniform float textureScale;
    uniform float tesselate;
    uniform int enableTracking;
    uniform float trackingX;
    uniform float trackingY;
    uniform float textureUAdjustment;
    uniform float textureVAdjustment;
    uniform int complexEffect1OnOff;
    uniform int complexEffect2OnOff;
    uniform int complexEffect3OnOff;
    uniform int complexEffect4OnOff;
    uniform int complexEffect5OnOff;
    uniform int schottkyEffectOnOff;
    uniform int fractalEffectOnOff;
    uniform int drosteType;
    uniform int drosteSpiral;
    uniform int drosteZoom;
    uniform int uNumCircles;

    uniform int  uBlackMask;
    uniform int  uNadirMask;
    uniform int  uMaskType;
    uniform int  uTextureNumber;

    uniform bool showFixedPoints;
    vec2 one = vec2(1.0, 0.0);
    vec2 zero = vec2(0.0, 0.0);
    vec2 i = vec2(0., 1.);
`;
return x;
}
