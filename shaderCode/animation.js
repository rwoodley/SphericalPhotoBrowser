SHADERCODE.animationUtils = function() {
    var x = `  
vec4 drawNyanCat(in vec2 uv, in vec2 pos) {
    vec2 q;
    float sideLength = 0.4;
    // for debugging...
    if (
        min(mod(uv.x - pos.x,1.0), mod(pos.x -  uv.x,1.0)) < 0.01 &&
        min(mod(uv.y - pos.y,1.0), mod(pos.y -  uv.y,1.0)) < 0.01
    ) {
        return vec4(1.,0.,0.,1.);
    }
    // determined this offsetpos by trial and error. want the red dot in the middle of the cat
    // because the mobius transform is going to work on the red dot.
    vec2 offsetpos = vec2(pos.x-.13,pos.y-.28);
    float offsetX = mod(uv.x - offsetpos.x, 1.0);
    float offsetY = mod(uv.y - offsetpos.y, 1.0);
    if (
        offsetX < sideLength && offsetX > 0.0 &&
        offsetY < sideLength && offsetY > 0.0
    ) {
        q.x = (offsetX)/sideLength;
        q.y = 1. - (offsetY)/sideLength;
        // return texture2D(iChannelAnimation, q);
        // return vec4(1.,0.,0.,1.);
        // https://www.shadertoy.com/view/ltsGWn
        vec2 uvNyan = (q  - vec2(0.25, 0.15)) / (vec2(0.7,0.5) - vec2(0.5, 0.15));
        uvNyan = clamp(uvNyan, 0.0, 1.0);
        float ofx = floor( mod( floor(iGlobalTime/10.0), 6.0 ) );
        float ww = 40.0/256.0;
        uvNyan = vec2(clamp( uvNyan.x*ww + ofx*ww, 0.0, 1.0 ), 1.0-uvNyan.y);
        return texture2D( iChannelAnimation, uvNyan );
    }
    else {
        return vec4(0.,0.,0.,0.);
    }
}
`;
return x;
}
