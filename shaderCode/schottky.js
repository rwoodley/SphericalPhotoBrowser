SHADERCODE.schottkyUtils = function() {
var x = `  

struct circle {
    vec2 center;
    float radius;
    float radiusSquared;
};
struct childCircle {
    circle c;
    xform x;
};
childCircle children[100];
int nChildren;
struct circleGroup {
    circle a;   // 0
    circle A;   // 1
    circle b;
    circle B;
};
circleGroup initialCircles;
xform group_a;
xform group_b;
xform group_A;
xform group_B;

circle mobiusOnCircle(xform T, circle C) { // indra's pearls, page 91
    circle D;
    vec2 z;
    vec2 zdenom = cx_conjugate(vec2(cx_divide(T.d, T.c) + C.center));
    z = C.center - cx_divide(vec2(C.radius * C.radius,0.), zdenom);
    D.center = applyMobiusTransformation(z, T);
    D.radius = cx_modulus(D.center - 
        applyMobiusTransformation(C.center + vec2(C.radius,0.), T));
    return D;
}
circle getInitialCircle(int i) {
    if (i == 0) return initialCircles.a;
    if (i == 1) return initialCircles.A;
    if (i == 2) return initialCircles.b;
    return initialCircles.B;
}
xform getTransform(int i) {
    if (i == 0) return group_a;
    if (i == 1) return group_A;
    if (i == 2) return group_b;
    return group_B;
}
void defineInitialCircles1() {   // indra's necklace page 170
    // kissing theta circles
    float xradius = 1.;
    float s2 = sqrt(2.0);

    initialCircles.A.center = -i*s2;
    initialCircles.A.radius = xradius;
    initialCircles.a.center = i*s2;
    initialCircles.a.radius = xradius;

    initialCircles.B.center = vec2(-s2,0.);
    initialCircles.B.radius = xradius;
    initialCircles.b.center = vec2(s2,0.);
    initialCircles.b.radius = xradius;

    vec2 s2c = vec2(sqrt(2.0),0.);
    vec2 zero = vec2(0.,0.);
    vec2 one = vec2(1.,0.);
    group_a = xformCtor(s2c,i,-i,s2c);
    group_b = xformCtor(s2c,one,one,s2c);
    group_A = inverseXformCtor(group_a);
    group_B = inverseXformCtor(group_b);
}
void defineInitialCircles2() {   // indra's necklace page 118
    // non-kissing circles
    float xtheta = 3.14159/5.;
    float s2 = sqrt(2.0);

    float xctr = 1./cos(xtheta);
    float xradius = tan(xtheta);
    vec2 zero = vec2(0.,0.);
    vec2 one = vec2(1.,0.);

    initialCircles.a.center = i*xctr;
    initialCircles.a.radius = xradius;
    initialCircles.A.center = -i*xctr;
    initialCircles.A.radius = xradius;

    initialCircles.b.center = one*xctr;
    initialCircles.b.radius = xradius;
    initialCircles.B.center = -one*xctr;
    initialCircles.B.radius = xradius;

//    float cnst = 1./sin(xtheta);
    float cnst = 1.;

    group_a = xformCtor(one*cnst,i*cos(xtheta)*cnst,-i*cos(xtheta)*cnst,one*cnst);
    //group_b = xformCtor(one*cnst,vec2(cos(xtheta),0.)*cnst,vec2(cos(xtheta),0)*cnst,one*cnst);
    group_b = xformCtor(vec2(1.5,1.), vec2(s2,1.0606602), vec2(s2,-1.0606602), vec2(1.5,-1.));
    group_A = inverseXformCtor(group_a);
    group_B = inverseXformCtor(group_b);
}
void defineInitialCircles3() {   // indra's necklace page 165, 170
    // kissing, different size circles. limit set = unit circle
    float y = 1.684;
    float x = sqrt(1. + y*y);

    float u = 1.143;
    float v = sqrt(u*u - 1.);
    float k = 1.;

    group_b = xformCtor(vec2(x,0.), vec2(y,0.), vec2(y,0.), vec2(x,0.));
    group_a = xformCtor(vec2(u,0.), vec2(0.,k*v), vec2(0.,-k*v), vec2(u,0.));
    group_A = inverseXformCtor(group_a);
    group_B = inverseXformCtor(group_b);

    initialCircles.a.center = vec2(0.,k*u/v);
    initialCircles.a.radius = k/v;
    initialCircles.A.center = vec2(0.,-k*u/v);
    initialCircles.A.radius = k/v;

    initialCircles.b.center = vec2(x/y,0.);
    initialCircles.b.radius = 1./y;
    initialCircles.B.center = vec2(-x/y,0.);
    initialCircles.B.radius = 1./y;
}
void defineInitialCircles4() {   // indra's necklace page 201

    group_a = xformCtor(vec2(1.,0.), vec2(0.,0.), vec2(0.,-2.), vec2(1.,0.));
    group_b = xformCtor(vec2(1.,-1.), vec2(1.,0.), vec2(1.,0.), vec2(1.,1.));
    group_A = inverseXformCtor(group_a);
    group_B = inverseXformCtor(group_b);

    initialCircles.a.center = vec2(0., 5000.);
    initialCircles.a.radius = 5000.;
    initialCircles.A.center = vec2(0.,-0.25);
    initialCircles.A.radius = 0.25;

    initialCircles.b.center = vec2(1.,-1.);
    initialCircles.b.radius = 1.;
    initialCircles.B.center = vec2(-1.,-1.);
    initialCircles.B.radius = 1.;
}
void defineInitialCircles() {
    if (schottkyEffectOnOff == 1)
        defineInitialCircles1();
    if (schottkyEffectOnOff == 2)
        defineInitialCircles3();
    if (schottkyEffectOnOff == 3)
        defineInitialCircles4();
}
bool insideCircleOld(circle a, vec2 z) {
    return distance(z,a.center) < a.radius;
}
bool insideCircle(circle a, vec2 z) {
    float dx = z.x - a.center.x;
    float dy = z.y - a.center.y;
    float dsquared = dx*dx + dy*dy; 
    return dsquared < a.radius*a.radius;
}
bool nearCircleRim(circle a, vec2 z) {
    float d = distance(z,a.center);
    return d > .95 *  a.radius && d <= a.radius;
}
vec2 schottkyGroup(in vec2 z, in vec2 s, in vec2 t, int index) {
    if (index > 0)
        z = applyMobiusTransformation(z, group_a);
   if (index < 0)
        z = applyInverseMobiusTransformation(z, group_a);
    return z;
}
vec2 applyInverseSchottkyTransformForCircle(vec2 z, int i) {
    if (i == 0)
        z = applyInverseMobiusTransformation(z, group_a);
    if (i == 1)
        z = applyInverseMobiusTransformation(z, group_b);
    if (i == 2)
        z = applyInverseMobiusTransformation(z, group_A);
    if (i == 3)
        z = applyInverseMobiusTransformation(z, group_B);
    return z;
}
vec4 getTextureColor(vec2 z) {
    if (insideCircle(initialCircles.a, z)) {
        return vec4(1.,1.,0.,1.);
    }
    if (insideCircle(initialCircles.A, z)) {
        return vec4(0.,1.,0.,1.);
    }
    if (insideCircle(initialCircles.b, z)) {
        return vec4(0.,1.,1.,1.);
    }
    if (insideCircle(initialCircles.B, z)) {
        return vec4(0.,0.,1.,1.);
    }
    return vec4(0.,0.,0.,1.);
}
circle fromVec3(vec3 v) {
    circle c;
    c.center[0] = v.x;
    c.center[1] = v.y;
    c.radius = v.z;
    return c;
}
circle fromVec4(vec4 v) {
    return fromVec3(vec3(v.x,v.y,v.z));
}
int getVec3ValForIndex(vec3 v, int i) {
    if (i == 0) return int(v.x);
    if (i == 1) return int(v.y);
    return int(v.z);
}
vec4 highlightInnerCircle(vec2 z) {
    circle c = initialCircles.A;
    circle c1 = mobiusOnCircle(group_a, c);

    if (insideCircle(c1, z)) {
        return vec4(0,.0,1.,1.);
    }
    if (insideCircle(c, z)) {
        return vec4(1.,.0,0.,1.);
    }
    return vec4(0.,1.,0.,1.);
}
int inverseTransformIndex(int i) {
    if (i == 0) return 1;
    if (i == 1) return 0;
    if (i == 2) return 3;
    if (i == 3) return 2;
}
xform xformForIndex(xform[6] xforms, int i) {
    // i hate opengl.
    if (i == 0) return xforms[0];
    if (i == 1) return xforms[1];
    if (i == 2) return xforms[2];
    if (i == 3) return xforms[3];
    if (i == 4) return xforms[4];
    return xforms[5];
}
struct schottkyResult {
    int level;
    float distance;
    float radius;
    xform inverseXform;
    vec2 inverseZ;
    vec2 glitchZ;   // just a pretty effect i got by doing something wrong.
};
schottkyResult getSchottkyResult(int n, xform[6] xforms, vec2 z, circle c) {
    schottkyResult res;
    res.level = n;
    vec2 invZ = z;
    vec2 glitchZ = z;
    for (int i = 0; i < 6; i++) {
        if (i <= n) {
            xform T = xformForIndex(xforms, i);
            glitchZ = applyMobiusTransformation(invZ, T);
            invZ = applyInverseMobiusTransformation(invZ, T);
        }
    }
    res.inverseZ = invZ;
    res.glitchZ = glitchZ;
    return res;
}
circle applyTransformsToCircle(circle c, xform[6] xforms, int n) {
    circle res = c;
    for (int i = 6; i >= 0; i--) {
        if (i <= n) 
            res = mobiusOnCircle(xformForIndex(xforms, i), res);
    }
    return res;
}
schottkyResult applySchottkyLoopOld(in vec2 z) {
    defineInitialCircles();
    vec4 clr;
    xform xforms[6];
    int level = -1;
    for (int i = 0; i < 4; i++) {
        circle c = getInitialCircle(i);     // 0 = a, 1 = A, 2 = b, 3 = B
        if (insideCircle(c, z)) {
            xform T = getTransform(i);   // which xform got us inside this circle?
            level++;
            xforms[0] = T;
            int inverseTransformIndex_i = inverseTransformIndex(i);
            for (int j = 0; j < 4; j++) {
                if (j == inverseTransformIndex_i) continue;
                circle c2 = applyTransformsToCircle(getInitialCircle(j), xforms, level);
                if (insideCircle(c2, z)) {
                    xform T1 = getTransform(j);
                    level++;
                    xforms[1] = T1;
                    int inverseTransformIndex_j = inverseTransformIndex(j);
                    for (int k = 0; k < 4; k++) {
                        if (k == inverseTransformIndex_j) continue;
                        circle c4 = applyTransformsToCircle(getInitialCircle(k), xforms, level);
                        if (insideCircle(c4, z)) {
                            xform T2 = getTransform(k);
                            level++;
                            xforms[2] = T2;
                            int inverseTransformIndex_k = inverseTransformIndex(k);
                            for (int l = 0; l < 4; l++) {
                                if (l == inverseTransformIndex_k) continue;
                                circle c6 = applyTransformsToCircle(getInitialCircle(l), xforms, level);
                                if (insideCircle(c6, z)) {


                                    xform T3 = getTransform(l);
                                    level++;
                                    xforms[3] = T3;
                                    int inverseTransformIndex_l = inverseTransformIndex(l);
                                    for (int m = 0; m < 4; m++) {
                                        if (m == inverseTransformIndex_l) continue;
                                        circle c8 = applyTransformsToCircle(getInitialCircle(m), xforms, level);
                                        if (insideCircle(c8, z)) {
                                            return getSchottkyResult(3, xforms, z, c8);
                                        }
                                    }


                                    return getSchottkyResult(2, xforms, z, c6);
                                }
                            }
                            return getSchottkyResult(2, xforms, z, c4);
                        }
                    }
                    return getSchottkyResult(1, xforms, z, c2);
                }
            }
            return getSchottkyResult(0, xforms, z, c);
        }
    }
    // if we get here Z is in the fundamental domain.
    schottkyResult rrr;
    rrr.level = -1;  // -1
    rrr.inverseZ = z;
    return rrr;
}
schottkyResult applySchottkyLoop(in vec2 z) {
    defineInitialCircles();
    vec2 y = z;
    for (int iter = 0; iter < 100; iter++) {
        bool cont = false;
        for (int i = 0; i < 4; i++) {
            circle c = getInitialCircle(i);     // 0 = a, 1 = A, 2 = b, 3 = B
            if (insideCircle(c, z)) {
                xform T = getTransform(i);
                z = applyInverseMobiusTransformation(z, T);
                y = applyMobiusTransformation(y, T);
                cont = true;
                break;
            }
        }
        if (!cont) {
            schottkyResult res;
            res.level = iter;
            res.inverseZ = z;
            res.glitchZ = y;
            return res;
        }
    }
    // if we get here Z is in the fundamental domain.
    schottkyResult rrr;
    rrr.level = -1;  // -1
    rrr.inverseZ = z;
    return rrr;
}
int applyFractal(in vec2 z0) {
    vec2 z = z0;
    vec3 z0InCartesian = complexToCartesian(z0);
    // see https://en.wikipedia.org/wiki/Julia_set for other C values
    vec2 c = vec2(-.7269,.1889);
    for (int iter = 0; iter < 100; iter++) {
        z = cx_product(z,z) + c;
        vec3 zInCartesian = complexToCartesian(z);
        if (length(cx_divide(z, z0)) > 3000.)
            return iter;
    }
    return -1;
}
`;
return x;
}
