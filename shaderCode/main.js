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
    uniform int complexEffect1OnOff;
    uniform int complexEffect2OnOff;
    uniform int complexEffect3OnOff;
    uniform int complexEffect4OnOff;
    uniform int complexEffect5OnOff;
    uniform int drosteType;
    uniform int drosteSpiral;
    uniform int drosteZoom;
    uniform int uNumCircles;

    uniform bool showFixedPoints;
    vec2 one = vec2(1.0, 0.0);
    vec2 zero = vec2(0.0, 0.0);
    vec2 i = vec2(0., 1.);
`;
return x;
}
