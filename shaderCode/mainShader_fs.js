SHADERCODE.mainShader_fs = function() {
var x = `  
// ---- mainShader_fs ----

vec2 getNewUVForWrappedTexture(vec2 inUV) {
    vec2 uv = vec2( mod(inUV.x + textureUAdjustment, 1.), 
                    mod(inUV.y + textureVAdjustment, 1.));
    if (flipTexture)    // hack to flip texture upside down.
        uv = vec2(uv.x, mod(1.0 - uv.y, 1.));

    float widthx = 1./textureScaleX;
    float widthy = 1./textureScaleY;
    float minx = .5 - widthx/2.;
    float maxx = .5 + widthx/2.;
    float miny = .5 - widthy/2.;
    float maxy = .5 + widthy/2.;
    if (uv.x < minx || uv.x > maxx || uv.y < miny || uv.y > maxy)
        return vec2(-1.,-1.);
    else {
        return vec2((uv.x-minx)/widthx, (uv.y-miny)/widthy);
    } 
}
vec4 wrappedTexture2D(sampler2D texture, vec2 inUV) {
    vec2 uv = getNewUVForWrappedTexture(inUV);
    if (uv.x < 0.) 
    return 
        vec4(0.0,0.0,0.0,0.0);
    else {
        return texture2D(texture, uv);    
    }
}
bool checkMaskPointNew(vec4 t1, vec4 t2) {
    vec4 clr = abs(t1-t2);
    float threshold = .1;
    return
        (
        (clr.x < threshold) && 
        (clr.y < threshold) && 
        (clr.z < threshold)
        );
}
vec4 applyMask(vec2 uv, vec2 complexPoint) {        // subtracting t2 from t1.
    // uMaskType == 1 - delay mask, uses iChannelDelayMask1
    // uMaskType == 2 - green mask, makes green transparent.
    // uMaskType == 3 - still mask, uses iChannelStillMask1
    // uMaskType == 4 - triple delay mask, uses iChannelDelayMask1 & iChannelDelayMask2 & iChannelDelayMask3
    // uMaskType == 5 - single delay mask, uses iChannelDelayMask1. super-imposed on starting pic.
    // uBlackMask == 1 - black mask
    vec4 textureValue;
    if (uNadirMask == 1) {
        if (uv.y < .15)
            return vec4(0.,0.,0.,1.);
    }
    if (uHighPassFilter == 1) { 
        vec4 t1 = wrappedTexture2D( iChannel0,  uv);
        if (
        t1.r > uHighPassFilterThreshold.r &&
        t1.g > uHighPassFilterThreshold.g &&
        t1.b > uHighPassFilterThreshold.b
         )
            return vec4(0.,0.,0.,0.);
    }
    if (uHighPassFilter == 2) { 
        vec4 t1 = wrappedTexture2D( iChannel0,  uv);
        if (
        t1.r > uHighPassFilterThreshold2.r &&
        t1.g > uHighPassFilterThreshold2.g &&
        t1.b > uHighPassFilterThreshold2.b
         )
            return vec4(0.,0.,0.,0.);
    }
    if (uHighPassFilter == 3) { 
        vec4 t1 = wrappedTexture2D( iChannel0,  uv);
        if (
        t1.r < uLowPassFilterThreshold.r &&
        t1.g < uLowPassFilterThreshold.g &&
        t1.b < uLowPassFilterThreshold.b
         )
            return vec4(0.,0.,0.,0.);
    }
    if (uHighPassFilter == 4) { 
        vec4 t1 = wrappedTexture2D( iChannel0,  uv);
        if (
        t1.r < uLowPassFilterThreshold2.r &&
        t1.g < uLowPassFilterThreshold2.g &&
        t1.b < uLowPassFilterThreshold2.b
         )
            return vec4(0.,0.,0.,0.);
    }

    // if (uTextureNumber == 0)
        textureValue = wrappedTexture2D( iChannel0,  uv);
    // if (uTextureNumber == 1)
    //     textureValue = wrappedTexture2D( iChannelDelayMask1,  uv);
    // if (uTextureNumber == 2)
    //     textureValue = wrappedTexture2D( iChannelStillMask1,  uv);

    if (uAnimationEffect == 1) {
        // if (uAnimationEffect == 1) {
        //     vec2 rr = complexPoint;
        //     if (
        //         rr.y > 0. && rr.y < .5 && 
        //         rr.x > 0. && rr.x < .5  
        //         // abs(mod(rr.x,1.0)) < .5
        //     ) {
        //         textureValue.a = 0.;
        //     }
        // }

        vec4 temp;
        temp = drawNyanCat(uv, u3p2);
        if (temp.a > 0.0)
            textureValue = temp;
        temp = drawNyanCat(uv, u3q2);
        if (temp.a > 0.0)
            textureValue = temp;
        temp = drawNyanCat(uv, u3r2);
        if (temp.a > 0.0)
            textureValue = temp;
    }

    
    if (uMaskType == 0) {
        if (textureValue.a == 0.) {
            return textureValue;
        }
        else {
            vec4 clr;
            // return vec4(vec3(textureValue),uAlpha);
            if (uBlackMask == 1)
                clr = uColorBlack;   // vec4(0.,1.,1.,1.);
            else
                clr = vec4(vec3(textureValue),uAlpha);
            return clr;
        }
    }

    vec4 clr;
    vec4 t1 = wrappedTexture2D( iChannel0,  uv);
    vec4 t2;
    vec4 t3;
    vec4 t4;
    if (uMaskType == 1) {   // delay mask (1) 
        t2 = wrappedTexture2D( iChannelDelayMask1,  uv);
        if (
            checkMaskPointNew(t1, t2)
        )
            clr = vec4(0.,0.,0.,0.);
        else {
            if (uBlackMask == 1)
                clr = uColorBlack; // vec4(0.5,.5,1.,1.);
            else
                clr = textureValue;
        }
        return clr;

    }
    if (uMaskType == 5) {   // delay mask (5) 
        // t2 = wrappedTexture2D( iChannelDelayMask1,  uv);
        vec4 stillTexture = wrappedTexture2D( iChannelStillMask1,  uv);
        if (
            !checkMaskPointNew(stillTexture, t1)
        ) {
            clr =  uColorScale;
        }
        else {
            clr = textureValue;
        }
        return clr;

    }
    if (uMaskType == 4) {   // double delay mask (4) 
        clr = textureValue;
        t2 = wrappedTexture2D( iChannelDelayMask1,  uv);
        t3 = wrappedTexture2D( iChannelDelayMask2,  uv);
        t4 = wrappedTexture2D( iChannelDelayMask3,  uv);
        bool checkMask1 = checkMaskPointNew(t1, t2);
        bool checkMask2 = checkMaskPointNew(t2, t3);
        bool checkMask3 = checkMaskPointNew(t3, t4);
        
        // if (checkMaskS)
        //     return uColor0;
        if (checkMask1)
            return uColor1;
        if (checkMask2)
            return uColor2;
        if (checkMask3)
            return uColor4;
        return uColor3;           // cyan
    }
    if (uMaskType == 3) {   // still mask (3)
        t2 = wrappedTexture2D( iChannelStillMask1,  uv);
        if (
            checkMaskPointNew(t1, t2)
        )
            clr = vec4(0.,0.,0.,0.);
        else {
            if (uBlackMask == 1)
                clr = uColorBlack;  //vec4(0.5,.0,1.,1.);
            else
                clr = textureValue;
        }
        return clr;

    }
    if (uMaskType == 2) {       // green mask
        vec4 t1 = wrappedTexture2D( iChannel0,  uv);

        if (uBlackMask == 1)
            clr = uColorBlack;      // vec4(0.,0.,0.,1.);
        else
            clr = textureValue;

        if (t1.g > .6 && t1.b < .45 && t1.r < .45) {
                clr = vec4(0.,0.,0.,0.);
        }
        else if (t1.a > 0.1) {
                clr = vec4(vec3(t1),1.);            
        }
        return clr;

    }

}
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
vec4 getRGBAForIter(int iter, float fiter) {
    // there are 6 color modes.
    // Mode: 1 - Full specturm
    // Mode: 2 - Full spectrum, but transparent (alpha == 0) every other iter 
    // Mode: 3 - Red spectrum
    // Mode: 4 - Red spectrum, but transparent (alpha == 0) every other iter 
    // Mode: 5 - alpha gradient on blue channel.
    // Mode: 6 - alpha gradient on some other channel.
    float alpha = 1.;
    if (mod(uColorVideoMode, 2.0) == 0.) {
        if (mod(float(iter), 2.0) == 0.)
            alpha = 0.;
        else
            alpha = 1.;
    }
    if (int((uColorVideoMode+1.)/2.) == 3)
        return vec4(hsv2rgb(vec3(fiter)), alpha);
    if (int((uColorVideoMode+1.)/2.) == 2)
        return vec4(hsv2rgb(vec3(fiter, 1., 1.)), alpha);
    if (int((uColorVideoMode+1.)/2.) == 1) {
        alpha = sqrt(fiter);
        if (mod(uColorVideoMode, 2.0) == 0.) {
            float bfiter = alpha * (.75 + fiter/4.0);
            return vec4(vec3(fiter, fiter, bfiter), alpha);
        }
        else {
            return vec4(vec3(0., 0., fiter), alpha);
        }
    }
    return vec4(1.,0.,0.,1.);
}
vec2 uvToComplex(vec2 uv) {
    float theta;
    float phi;
    float x;
    float y;
    float z;
    uv.x = clamp(uv.x,0.001,.999);

    // ---------
    // convert from uv to polar coords
    vec2 tempuv = uv;
    theta = (1.0-tempuv[1]) * PI;
    phi = PI * 2.0 * tempuv[0]+PI;

    // convert polar to cartesian. Theta is polar, phi is azimuth.
    x = sin(theta)*cos(phi);
    y = sin(theta)*sin(phi);
    z = cos(theta);

    // x,y,z are on the unit sphere.
    // if we pretend that sphere is a riemann sphere, then we
    // can get the corresponding complex point, a.
    // http://math.stackexchange.com/questions/1219406/how-do-i-convert-a-complex-number-to-a-point-on-the-riemann-sphere

    // we added the PI to phi above to make the Y axis correspond with
    // the positive imaginary axis and the X axis correspond with
    //  the positive real axis. So flip y and x around in this next equation.
    vec2 a = vec2(y/(1.0-z), x/(1.0-z));
    return a;
}
vec2 trackerToComplex(vec2 pt) {
    // not sure why this correction to pt.x is needed...
    vec2 uv = getNewUVForWrappedTexture(vec2(mod(pt.x+.5,1.), pt.y));
    return uvToComplex(uv);
}
vec2 complexToUV(vec2 result) {
    // now c back to sphere.
    float theta;
    float phi;
    float x;
    float y;
    float z;
    float denom = 1.0 + result.x*result.x + result.y *result.y;
    x = 2.0 * result.x/denom;
    y = 2.0 * result.y/denom;
    z = (result.x*result.x + result.y*result.y - 1.0)/denom;

    // convert to polar
        vec2 polarCoords = cartesianToPolar(x,y,z);
        phi = polarCoords.x;
        theta = polarCoords.y;

    // now get uv in new chart.
    float newv = 1.0 - theta/PI;
    float newu = phi/(2.0 * PI);
    vec2 newuv = vec2(newu, newv);
    return newuv;
}
schottkyResult doGeometry(in vec2 a) {
    // geometries include triangleGroup, modularGroups 1 and 2, and fractal.
    // if you call this before you do the rotations/zoom etc, then the geometry stays fixed and the pictures move thru.
    // if you call this after the rotation/zoom etc then the geometry rotates, etc.
    schottkyResult tesselationResult;
    // assign defaults in case nothing is done.
    tesselationResult.iter = -1;
    tesselationResult.inverseZ = a;

    if (hyperbolicTilingEffectOnOff >= 1) {
        if (hyperbolicTilingEffectOnOff == 1)  {
            tesselationResult = applyTriangleTesselation(a);    // triangle group
        }
        if (hyperbolicTilingEffectOnOff == 2) 
            tesselationResult = applyHyperbolicTesselation(a);
        if (hyperbolicTilingEffectOnOff == 3) 
            tesselationResult = applyHyperbolicTesselation2(a);
    }
    if (fractalEffectOnOff > 0) {
        // fractal is in the bottom half plane. Rotate so it is over-head.
        vec2 b = transformForFixedPoints(a, vec2(1.,0.), vec2(-1.,0.));
        vec2 b1 = applyRotation(b, 2.718);
        a = inverseTransformForFixedPoints(b1, vec2(1.,0.), vec2(-1.,0.));
        tesselationResult = applyFractal(a);
    }
    return tesselationResult;
}
void handleSyntheticTexture(vec2 result) {
    // This is for looking up the pic of Louis from the grid.
    vec3 aa = complexToCartesian(result);
    vec4 defaultColor = vec4(aa.z,0.,0.,0.0);

    float quadrant = 0.;
    float x=0., y=0.;
    float imageRadius = .80;
    float textureW = 1818.; float textureH = 2160.;
    float tileW=606.; float tileH=1080.;
    if (aa.x > imageRadius) {       // blue axis
        quadrant = 0.;
        x = aa.y; y = aa.z;
    }
    else if (aa.y > imageRadius) {  // red axis
        quadrant = 1.;
        x = aa.x; y = aa.z;
    }
    else if (aa.z > imageRadius) {
        quadrant = 2.;
        x = aa.x; y = aa.y;
    }
    else if (aa.x < -imageRadius) {       // blue axis
        quadrant = 3.;
        x = aa.y; y = aa.z;
    }
    else if (aa.y < -imageRadius) {  // red axis
        quadrant = 4.;
        x = aa.x; y = aa.z;
    }
    else if (aa.z < -imageRadius) {
        quadrant = 5.;
        x = aa.x; y = aa.y;
    }
    else {
        gl_FragColor =  defaultColor;
        return;
    }

    if (uSyntheticTextureQuadrant > -1.0) { // over-ride.
        quadrant = uSyntheticTextureQuadrant;
    }
    float offsetX = (mod(quadrant,3.)+.5)*tileW;
    float offsetY = textureH - tileH*.5;
    if (quadrant > 2.)
        offsetY = textureH - tileH*1.5;
    // the .95 is a kludge to get rid of an artifact that crept in on the side of some videos.
    float xWithinTile = clamp(x*tileW,-.95*tileW/2.,.95*tileW/2.);
    float yWithinTile = clamp(y*tileH,-tileH/2.,tileH/2.);
    offsetX = offsetX + xWithinTile;
    offsetY = offsetY + yWithinTile;
    vec2 uv = getNewUVForWrappedTexture(vec2(offsetX/textureW, offsetY/textureH));
    gl_FragColor =  texture2D(iChannel0, uv);
    // gl_FragColor =  texture2D(iChannel0, vec2(offsetX/textureW, offsetY/textureH));
    // if (gl_FragColor.x < 0.05 && gl_FragColor.y < 0.05 && gl_FragColor.z < 0.05) {
    //     gl_FragColor.a = 0.; // = vec4(0.,0.,0.,0.);
    //     //gl_FragColor = vec4(1.,0.,1.,1.);
    // }

}
float epsilon = .1;
bool isInt2(float inx, float iny, float epsilon) {
    float x = abs(inx);
    float y = abs(iny);
    float ix = float(int(x+.5));
    float iy = float(int(y+.5));
    float dx = x - ix;
    float dy = y - iy;
    return (dx*dx+dy*dy) < epsilon;
}
void main() {

    vec2 uv = vUv;
    vec2 a = uvToComplex(uv);
    if (tesselate == 1.) {
        a.x = my_mod(a.x, 1.);
        a.y = my_mod(a.y, 1.);
    }

    if (proximityEffect == 1) { // gaussian integers
        if (isInt2(a.x, a.y, 0.03)) {
            gl_FragColor = vec4(0.,1.,1.,1.);
            return;
        }
    }
    if (proximityEffect == 2) { // eisenstein integers
        float b =2.*a.y/sqrt(3.0);
        if (isInt2(a.x+b/2., b, 0.01) || isInt2(a.x-b/2., b, 0.01)) {
                gl_FragColor = vec4(0.,1.,1.,1.);
                return;
        }
    }

    // ========================
    // Apply tesselation effects: Schottky, Apollonian, Fractal, Hyperbolic Triangles.
    // ========================
    schottkyResult tesselationResult;
    if (schottkyEffectOnOff > 0) {
        tesselationResult = applySchottkyLoop(a);

        // for math functions, either sample from texture or use a color map.
        if (uColorVideoMode > 0.) {
            int iter = tesselationResult.iter;
            float fiter = 0.1 * float(iter);
            gl_FragColor = getRGBAForIter(iter,fiter);
            return;
        }
        else
            a = tesselationResult.inverseZ;

    }

    if (geometryTiming == 0) {
        tesselationResult = doGeometry(a);
        int iter = tesselationResult.iter;
        // for geometry functions, either sample from texture or use a color map.
        if (uColorVideoMode > 0.) {
            float fiter = .1 * float(iter);
            gl_FragColor = getRGBAForIter(iter,fiter);

            if (iter == 0)
                gl_FragColor = vec4(.25,0.,.25,1.);
            if (iter > 98)
                gl_FragColor = vec4(.25,0.25,.25,1.);
            return;
        }
        if (hyperbolicTilingEffectOnOff == 1 && iter == 0) {
            gl_FragColor = vec4(.25,0.,.25,0.);
            return;
        }
        a = tesselationResult.inverseZ;
    }

    // ========================
    // Now apply Mobius Transforms and Complex transforms.
    // ========================
    vec2 result = a;
    vec2 e1 = vec2(e1x,e1y);
    vec2 e2 = vec2(e2x,e2y);
    vec3 e1InCartesian = complexToCartesian(e1);
    vec3 e2InCartesian = complexToCartesian(e2);
    vec3 aInCartesian = complexToCartesian(a);
    if (mobiusEffectsOnOff == 1) {
        vec2 lox = vec2(loxodromicX, loxodromicY);
        if (showFixedPoints) {

            if (distance(aInCartesian, e1InCartesian) < .05) {
                gl_FragColor = vec4(1.,0.,0.,1.);
                return;
            }
            if (distance(aInCartesian, e2InCartesian) < .05) {
                gl_FragColor = vec4(0.,0.,1.,1.);
                return;
            }                       
            if (distance(aInCartesian, complexToCartesian(lox)) < .05) {
                gl_FragColor = vec4(1.,1.,0.,1.);
                return;
            }                       
        }

        vec2 b = transformForFixedPoints(a, e1, e2);
        vec2 c;
        vec2 b1 = applyRotation(b,iRotationAmount/10.);
        c = zoom(b1, vec2(loxodromicX, loxodromicY));

        if (drosteType == 1)
            c = applyRoundDroste(c);
        if (drosteType == 2) {
            c = applyArbitraryDroste(c);
            //gl_FragColor = vec4(c.x/(PI/4.),0.,0.,1.);
            //return;
        }
        result = inverseTransformForFixedPoints(c, e1, e2);
    }
    vec2 realNumber = vec2(complexEffect1OnOff, 0.);
    result = cx_pow(result, realNumber);                    
    if (complexEffect3OnOff == 1) {
        result = anotherTransform(result);
    }
    if (complexEffect4OnOff == 1) {
        result = cx_exp(result);
    }
    if (uPolygonalGroups == 1) {
        result = polygonalGroup_Tetrahedron(result);
    }
    if (uPolygonalGroups == 2) {
        result = polygonalGroup_Octagon(result);
    }
    if (uPolygonalGroups == 3) {
        result = polygonalGroup_Icosahedron(result);
    } 
    if (uPolygonalGroups == 4) {
        result = adhocTransformZPlusOneOverZ(result);
    }
    if (uPolygonalGroups == 5) {
        result = adhocTransform_z3(result);
    }
    if (uPolygonalGroups == 6) {
        result = adhocTransform3(result);
    }
    if (uApplyMobiusTransform > 0) {
        result = applyInverseMobiusTransformation(result, 
            xformCtor(uXformA, uXformB, uXformC, uXformD));
        // result = applyMobiusTransformation(result, 
        //     xformCtor(vec2(-1.,0.), vec2(0.,0.), vec2(0.0,0.), vec2(1.,0.)));
    }
    if (uThreePointMappingOn) {
        vec2 inresult = result;
        result = threePointMapping(
            result,
            trackerToComplex(u3p1),
            trackerToComplex(u3q1),
            trackerToComplex(u3r1),
            trackerToComplex(u3p2),
            trackerToComplex(u3q2),
            trackerToComplex(u3r2 )
            );

        vec3 p1InCartesian = complexToCartesian(trackerToComplex(u3p1 ));
        vec3 p2InCartesian = complexToCartesian(trackerToComplex(u3p2 ));
        vec3 inresultInCartesian = complexToCartesian(inresult);
        vec3 resultInCartesian = complexToCartesian(result);
    }

    if (uSyntheticTexture) {
        handleSyntheticTexture(result);
    }
    else {
        vec2 newuv = complexToUV(result);
        // ============
        gl_FragColor = applyMask(newuv, result);
    }
    if (geometryTiming == 1) {
        tesselationResult = doGeometry(result);
        int iter = tesselationResult.iter;
        // for geometry functions, either sample from texture or use a color map.
        if (uColorVideoMode > 0.) {

            float fiter = .1 * float(iter);
            gl_FragColor = getRGBAForIter(iter,fiter);

            if (iter == 0)
                gl_FragColor = vec4(.25,0.,.25,1.);
            if (iter > 98)
                gl_FragColor = vec4(.25,0.25,.25,1.);
            return;
        }
        if (hyperbolicTilingEffectOnOff == 1 && iter == 0) {
            gl_FragColor = vec4(.25,0.,.25,0.);
        }
    }

}
`;
return x;
}