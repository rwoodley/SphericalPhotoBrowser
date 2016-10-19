SHADERCODE.schottkyUtils = function(numCircles) {
var x = `  

struct circle {
    vec2 center;
    float radius;
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
circleGroup level1[4];
circleGroup initialCircles;
float xtheta = 3.14159/4.;
xform group_a;
xform group_b;
xform group_A;
xform group_B;
xform xFormForIndex[4];  // group_a, A, b, B
circle mobiusOnCircle(xform T, circle C) { // indra's pearls, page 91
    circle D;
    vec2 z;
    vec2 zdenom = cx_conjugate(vec2(cx_divide(T.d, T.c) + C.center));
    z = C.center - cx_divide(vec2(C.radius * C.radius,0.), zdenom);
    D.center = applyMobiusTransformation(z, T);
    D.radius = cx_modulus(D.center - applyMobiusTransformation(C.center + C.radius, T));
    return D;
}

void defineInitialCircles() {
    float xradius = 1.;
    float xctr = 1./cos(xtheta);
    float s2 = sqrt(2.0);

    initialCircles.a.center = -i*s2;
    initialCircles.a.radius = xradius;
    initialCircles.A.center = i*s2;
    initialCircles.A.radius = xradius;

    initialCircles.b.center = vec2(-s2,0.);
    initialCircles.b.radius = xradius;
    initialCircles.B.center = vec2(s2,0.);
    initialCircles.B.radius = xradius;

    float cnst = 1./sin(xtheta);
    cnst = 1.;

    group_a = xformCtor(xforma[0], xforma[1], xforma[2], xforma[3]);
    group_b = xformCtor(xformb[0], xformb[1], xformb[2], xformb[3]);
    group_A = xformCtor(xformA[0], xformA[1], xformA[2], xformA[3]);
    group_B = xformCtor(xformB[0], xformB[1], xformB[2], xformB[3]);
    xFormForIndex[0] = group_b;
    xFormForIndex[1] = group_A;
    xFormForIndex[2] = group_b;
    xFormForIndex[3] = group_B;

}
bool insideCircle(circle a, vec2 z) {
    return distance(z,a.center) < a.radius;
}
bool nearCircleRim(circle a, vec2 z) {
    return distance(z,a.center) > .95 *  a.radius;
}
vec2 schottkyGroup(in vec2 z, in vec2 s, in vec2 t, int index) {
    if (index > 0)
        z = applyMobiusTransformation(z, group_a);
   if (index < 0)
        z = applyInverseMobiusTransformation(z, group_a);
    return z;
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
circle fromVec3(vec3 x) {
    circle c;
    c.center[0] = x[0];
    c.center[1] = x[1];
    c.radius = x[2];
    return c;
}
vec4 applySchottky(in vec2 z) {

    for (int i = 0; i < $1; i++) {
        vec4 v = uCircles[i];
        if(v.a > 900.00) continue;
        circle c;
        c = fromVec3(vec3(v.x,v.y,v.z));
        if (insideCircle(c, z) && v.a > 2.) {
            if (nearCircleRim(c,z))
                return vec4(1.,0.,0.,1.);
        }
        else if (insideCircle(c, z) && v.a > 1.) {
            if (nearCircleRim(c,z))
                return vec4(0.,1.,0.,1.);
        }
        else if (insideCircle(c, z)) {
            if (nearCircleRim(c,z))
                return vec4(0.,0.,1.,1.);
        }
    }
    return vec4(0.,0.,0.,1.);
    defineInitialCircles();

  //  vec4 clr = highlightInnerCircle(z);

  // group_a takes A to a, normally. a1
  // we're starting with z on C, and want to get the right color, by unwinding xforms.
  // if inside circle, apply reverse xform(s) to get to color.

        if (insideCircle(initialCircles.a, z) == true)     // in a1, apply 2: group_a takes a1 to a2. should be: group_A takes a to A.
    z = applyInverseSchottkyTransformForCircle(z, 2);          
    else if (insideCircle(initialCircles.b, z) == true)
    z = applyInverseSchottkyTransformForCircle(z, 3);
    else if (insideCircle(initialCircles.A, z) == true)
    z = applyInverseSchottkyTransformForCircle(z, 0);
    else if (insideCircle(initialCircles.B, z) == true)
    z = applyInverseSchottkyTransformForCircle(z, 1);
    else {
        return vec4(1.,1.,1.,1.);
    }
    vec4 clr = getTextureColor(z);
    return clr;
}
`;
return x.replace('$1', numCircles);
}