SHADERCODE.outerShader_fs = function() {
var x = `  
uniform sampler2D iChannelStillMask1;
uniform sampler2D iChannelStillMask2;
varying vec2 vUv;  
vec4 wrappedTexture2D(sampler2D texture, vec2 inUV, float textureScale, float textureUAdjustment, float textureVAdjustment) {
    vec2 uv = vec2(mod(inUV.x + textureUAdjustment, 1.), mod(inUV.y + textureVAdjustment, 1.));
    float scaleFactor = textureScale;
    float widthx = 1./scaleFactor;
    float minx = .5 - widthx/2.;
    float maxx = .5 + widthx/2.;
    if (uv.x < minx || uv.x > maxx || uv.y < minx || uv.y > maxx)
        return vec4(0.0,0.0,0.0,0.0);
    else {
        uv = vec2((uv.x-minx)/widthx, (uv.y-minx)/widthx);
        return texture2D(texture, uv);    
    }
    
}
void main() {
    vec2 uv = vUv;
    vec4 t1 = texture2D( iChannelStillMask1,  uv);
    //vec4 t2 = wrappedTexture2D( iChannelStillMask1,  uv, 1.0, .1, 0.);        
    vec4 t2 = wrappedTexture2D( iChannelStillMask1,  uv, 1.0, 0.2, 0.);        
    vec4 clr = abs(t1-t2);
    float threshold = .05;
    if
        (
        (clr.x < threshold ) && 
        (clr.y < threshold ) && 
        (clr.z < threshold )
        )
        gl_FragColor = vec4(0.5,0.5,.5,1.);
    else
        gl_FragColor = vec4(1.,1.,1.,1.);
}
`;
return x;
}