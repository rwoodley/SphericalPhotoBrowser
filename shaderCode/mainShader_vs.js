SHADERCODE.mainShader_vs = function() {
var x = `  
// ---- mainShader_vs ----
varying vec2 vUv; 
uniform float morphTargetInfluences[ 4 ];
void main()
{
#ifdef USE_MORPHTARGETS
    vec3 morphed = vec3( 0.0 , 0.0 , 0.0 );
    morphed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];
    morphed += position;
    vec3 newPosition = morphed;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
#else
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
#endif
    vUv = uv;
}

`;
return x;
}