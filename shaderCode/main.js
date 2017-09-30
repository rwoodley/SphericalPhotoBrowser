SHADERCODE = {
    drosteUtils: "",
    mathUtils: "",
    schottkyUtils: "",
    mobiusTransformUtils: "",
    polygonalGroupsCode: ""
};
SHADERCODE.uniformsAndGlobals = function() {
var x = `  

    // ===== shader control variables
    uniform sampler2D iChannel0;
    uniform sampler2D iChannelDelayMask1;
    uniform sampler2D iChannelDelayMask2;
    uniform sampler2D iChannelDelayMask3;
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
    uniform float textureScaleX;
    uniform float textureScaleY;
    uniform float tesselate;
    uniform float uAlpha;
    uniform float uColorVideoMode;
    uniform int enableTracking;
    uniform float trackingX;
    uniform float trackingY;
    uniform bool flipTexture;
    uniform float textureUAdjustment;
    uniform float textureVAdjustment;
    uniform bool uSyntheticTexture;
    uniform float uSyntheticTextureQuadrant;
    uniform int complexEffect1OnOff;
    uniform int complexEffect2OnOff;
    uniform int complexEffect3OnOff;
    uniform int complexEffect4OnOff;
    uniform int uPolygonalGroups;
    uniform int schottkyEffectOnOff;
    uniform int fractalEffectOnOff;
    uniform int geometryTiming;
    uniform int hyperbolicTilingEffectOnOff;
    uniform int drosteType;
    uniform int drosteSpiral;
    uniform int drosteZoom;
    uniform int uNumCircles;

    uniform int  uBlackMask;
    uniform int uHighPassFilter;
    uniform vec3 uHighPassFilterThreshold;
    uniform vec3 uLowPassFilterThreshold;
    uniform vec3 uHighPassFilterThreshold2;
    uniform vec3 uLowPassFilterThreshold2;
    uniform int  uNadirMask;
    uniform int uApplyMobiusTransform;
    uniform vec2 uXformA;
    uniform vec2 uXformB;
    uniform vec2 uXformC;
    uniform vec2 uXformD;
    uniform int uSymmetryIndex;
    uniform int  uMaskType;
    uniform int  uTextureNumber;

    // === for 3 point mapping..
    uniform bool uThreePointMappingOn;
    uniform vec2 u3p1;
    uniform vec2 u3q1;
    uniform vec2 u3r1;
    uniform vec2 u3p2;
    uniform vec2 u3q2;
    uniform vec2 u3r2;

    uniform bool showFixedPoints;
    vec2 one = vec2(1.0, 0.0);
    vec2 zero = vec2(0.0, 0.0);
    vec2 i = vec2(0., 1.);
    uniform vec4 uColor0;
    uniform vec4 uColor1;
    uniform vec4 uColor2;
    uniform vec4 uColor3;
    uniform vec4 uColor4;
    `;
return x;
}
