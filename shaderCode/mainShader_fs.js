SHADERCODE.mainShader_fs = function() {
var x = `  
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
        else
            return texture2D(texture, uv);    
}
bool checkMaskPoint(vec2 uv) {
    vec4 t1 = wrappedTexture2D( iChannel0,  uv);
    vec4 t2;
    vec4 t3;
    if (uMaskType == 1) {
        t2 = wrappedTexture2D( iChannelDelayMask,  uv);
        t3 = t2;
    }
    else {
        t2 = wrappedTexture2D( iChannelStillMask1,  uv);
        t3 = wrappedTexture2D( iChannelStillMask2,  uv);        
    }
    vec4 clr = abs(t1-t2);
    vec4 clr2 = abs(t1-t3);
    float threshold = .1;
    return
        (
        (clr.x < threshold || clr2.x < threshold) && 
        (clr.y < threshold || clr2.y < threshold) && 
        (clr.z < threshold || clr2.z < threshold)
        );
}
vec4 applyMask(vec2 uv) {        // subtracting t2 from t1.
    // uMaskType == 1 - delay mask, uses iChannelDelayMask
    // uMaskType == 2 - green mask, makes green transparent.
    // uMaskType == 3 - still mask, uses iChannelStillMask1
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

    if (uTextureNumber == 0)
        textureValue = wrappedTexture2D( iChannel0,  uv);
    if (uTextureNumber == 1)
        textureValue = wrappedTexture2D( iChannelDelayMask,  uv);
    if (uTextureNumber == 2)
        textureValue = wrappedTexture2D( iChannelStillMask1,  uv);
    
    if (uMaskType == 0) {
        if (textureValue.a == 0.)
            return textureValue;
        else
            return vec4(vec3(textureValue),uAlpha);
    }

    vec4 clr;
    if (uMaskType == 1 || uMaskType == 3) {   // delay mask (1) or still mask (3)
        float d = .0001;
        float dp = 1. + d;
        float dm = 1. - d;
        if (
            checkMaskPoint(vec2(uv.x, uv.y))
    //        && checkMaskPoint(vec2(uv.x*dp, uv.y*dp))
    //        && checkMaskPoint(vec2(uv.x*dp, uv.y*dm))
    //        && checkMaskPoint(vec2(uv.x*dm, uv.y*dp))
    //        && checkMaskPoint(vec2(uv.x*dm, uv.y*dm)) 
        )
            clr = vec4(0.,0.,0.,0.);
        else {
            if (uBlackMask == 1)
                clr = vec4(0.,0.,0.,1.);
            else
                clr = textureValue;
        }
        return clr;

    }
    if (uMaskType == 2) {       // green mask
        vec4 t1 = wrappedTexture2D( iChannel0,  uv);

        if (uBlackMask == 1)
            clr = vec4(0.,0.,0.,1.);
        else
            clr = textureValue;

        // faint greens should not be cut out or will have gaps. but we don't
        // want a green tinge ringing everything, so just average.
        // different set of constants depending on brightness, as follows:
        // in bright areas
        float avg = (t1.g + t1.r + t1.b)/3.0;
        if (t1.g > t1.r && t1.g > t1.b) {
            if (t1.g > .7 && t1.r > .9 * t1.g && t1.b > .9 * t1.g) {
                clr = vec4(avg, avg, avg ,1.);
            }
            // in dark areas 
            else if (t1.g < .4 && t1.r > .6 * t1.g && t1.b > .6 * t1.g) {
                clr = vec4(avg, avg, avg ,1.);
            }
            // in in-between areas
            else if (t1.g > .4 && t1.g < .7 && t1.r > .85 * t1.g && t1.b > .85 * t1.g) {
                clr = vec4(avg, avg, avg ,1.);
            }

            // now for really green areas, we cut out enitrely. once again, different constants
            // for different brightness.
            else if (t1.g > .40 && t1.g > .6*(t1.r + t1.b))
                clr = vec4(0.,0.,0.,0.);
            else if (t1.g > .5 && 
                ((t1.g*.85 > t1.r && t1.g > t1.b) ||
                (t1.g*.85 > t1.b && t1.g > t1.r) )
            )
                {
                clr = vec4(0.,0.,0.,0.);
            }
            else if (t1.g > .6 && 
                ((t1.g*.9 > t1.r && t1.g > t1.b) ||
                (t1.g*.9 > t1.b && t1.g > t1.r)) 
            )
                {
                clr = vec4(0.,0.,0.,0.);
            }
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
vec2 getNewTrackerUVForWrappedTexture(vec2 inUV) {
    // this is almost an identical copy of getNewUVForWrappedTexture except for signs in next line:
    vec2 uv = vec2( mod(inUV.x - textureUAdjustment, 1.), 
                    mod(inUV.y - textureVAdjustment, 1.));
    if (flipTexture)    // hack to flip texture upside down.
        uv = vec2(uv.x, mod(1.0 - uv.y, 1.));

    float widthx = 1.;
    float minx = .5 - widthx/2.;
    float maxx = .5 + widthx/2.;
    if (uv.x < minx || uv.x > maxx || uv.y < minx || uv.y > maxx)
        return vec2(0.,0.);
    else {
        return vec2((uv.x-minx)/widthx, (uv.y-minx)/widthx);
    } 
}
vec2 trackerToComplex(vec2 pt) {
    // not sure why these corrections are needed, maybe because of scale()
    vec2 uv = getNewTrackerUVForWrappedTexture(vec2(mod(pt.x+.5,1.), 1.-pt.y));
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
void main() {

    vec2 uv = vUv;
    vec2 a = uvToComplex(uv);
    if (tesselate == 1.) {
        a.x = my_mod(a.x, 1.);
        a.y = my_mod(a.y, 1.);
    }

    // ========================
    // Apply tesselation effects: Schottky, Apollonian, Fractal, Hyperbolic Triangles.
    // ========================

    if (schottkyEffectOnOff > 0) {
        schottkyResult tesselationResult = applySchottkyLoop(a);

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
    if (hyperbolicTilingEffectOnOff > 0) {
        // fractal is in the bottom half plane. Rotate so it is over-head.
        // vec2 b = transformForFixedPoints(a, vec2(1.,0.), vec2(-1.,0.));
        // vec2 b1 = applyRotation(b, 0.5*3.1415926);
        // a = inverseTransformForFixedPoints(b1, vec2(1.,0.), vec2(-1.,0.));
        
        schottkyResult tesselationResult;
        if (hyperbolicTilingEffectOnOff == 1)  {
            tesselationResult = applyTriangleTesselation(a);
            // tesselationResult = colorTest(a);
            // gl_FragColor = vec4(mod(tesselationResult.inverseZ.x,1.),
            // mod(tesselationResult.inverseZ.y,1.), 0., 1.);
            // return;
        }
        else if (hyperbolicTilingEffectOnOff == 2) 
            tesselationResult = applyHyperbolicTesselation(a);
        else
            tesselationResult = applyHyperbolicTesselation2(a);

        // for math functions, either sample from texture or use a color map.
        if (uColorVideoMode > 0.) {
            int iter = tesselationResult.iter;
            float fiter = .1 * float(iter);
            gl_FragColor = getRGBAForIter(iter,fiter);
            if (tesselationResult.flag == 1)
                gl_FragColor.a = .1;
            if (iter == 0)
                gl_FragColor = vec4(.25,0.,.25,1.);
            if (iter > 98)
                gl_FragColor = vec4(.25,0.25,.25,1.);
            return;
        }
        else
            a = vec2(tesselationResult.inverseZ);
    }
    if (fractalEffectOnOff > 0) {
        // fractal is in the bottom half plane. Rotate so it is over-head.
        vec2 b = transformForFixedPoints(a, vec2(1.,0.), vec2(-1.,0.));
        vec2 b1 = applyRotation(b, 2.718);
        a = inverseTransformForFixedPoints(b1, vec2(1.,0.), vec2(-1.,0.));

        schottkyResult tesselationResult = applyFractal(a);
        // for math functions, either sample from texture or use a color map.
        if (uColorVideoMode > 0.) {
            float fiter = 0.01 * float(tesselationResult.iter);
            gl_FragColor = getRGBAForIter(tesselationResult.iter,fiter);
            return;
        }
        else
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
    if (complexEffect5OnOff == 1) {
        result = cx_log(result);
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

    vec2 newuv = complexToUV(result);
    gl_FragColor = applyMask(newuv);
}
`;
return x;
}