SHADERCODE.schottkyUtils = function(numCircles) {
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
circleGroup level1[4];
circleGroup initialCircles;
float xtheta = 3.14159/4.;
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
xform getInitialCircleTransform(int i) {
    if (i == 1) return group_a;
    if (i == 0) return group_A;
    if (i == 3) return group_b;
    return group_B;
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

}
bool insideCircle(circle a, vec2 z) {
    return distance(z,a.center) < a.radius;
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
circle getChildCircle(vec3 chillun, int j) {
    circle empty;
    int target = getVec3ValForIndex(chillun, j);
    if (target < 0) return empty;
    for (int i = 0; i < $1; i++) {
        if (i == target) {
            vec4 v = uCircles[i];
            return fromVec4(v);
        }
    }
    return empty;
}
vec4 applySchottkyFromJS(in vec2 z) {
    for (int i = 0; i < $1; i++) {
        vec4 v = uCircles[i];
        if (v.a == 0.0) {
            circle c;
            c = fromVec4(v);
            if (insideCircle(c,z)) {
                    return vec4(1.,0.,0.,1.);
                //vec3 chillun = uCircleChildren[i];
                if (nearCircleRim(c,z))
                    return vec4(1.,1.,0.,1.);
                else
                    return vec4(1.,0.,0.,1.);
            }
        }
    }
    return vec4(0.,0.,0.,1.);
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
vec4 getLevel2ContainingZ(xform T, vec2 z, int inCircleIndex) {
    int xformIndex = inverseTransformIndex(inCircleIndex);
    for (int circleIndex = 0; circleIndex < 4; circleIndex++) {
        if (circleIndex != xformIndex) {
            circle c1 =  mobiusOnCircle(T, getInitialCircle(circleIndex));
            for (int i1 = 0; i1 < 4; i1++) {
                if (i1 != inverseTransformIndex(xformIndex)) {
                    xform T1 = getTransform(i1);
                    circle c2 =  mobiusOnCircle(T1, c1);
                    if (insideCircle(c2, z)) {
                    //if (c2.center.x-z.x < c2.radius) {
                        return vec4(0.,0.,1.,1.);
                    }
                }
            }
        }
    }
    return vec4(0.,0.,0.,0.);
}
vec4 getLevel1ContainingZ(circle c, vec2 z, int xformIndex) {
    for (int iii = 0; iii < 4; iii++) {
        if (iii != xformIndex) {
            xform T = getTransform(iii);
            circle c1 =  mobiusOnCircle(T, c);
            if (insideCircle(c1, z)) {
                return vec4(1.,0.,0.,1.);    
            }
        }
    }
    return vec4(0.,0.,0.,0.);
}
vec4 applySchottky(in vec2 z) {
    defineInitialCircles();
    vec4 clr;
    for (int i = 0; i < 4; i++) {
        circle c = getInitialCircle(i);     // 0 = a, 1 = A
        if (insideCircle(c, z)) {
            xform T = getTransform(inverseTransformIndex(i));
            for (int j = 0; j < 4; j++) {
                if (j == inverseTransformIndex(i)) continue;
                circle c1 = getInitialCircle(j);     // 0 = a, 1 = A
                circle c2 =  mobiusOnCircle(T, c1);
                if (insideCircle(c2, z)) {
                    xform T1 = getTransform(inverseTransformIndex(j));
                    for (int k = 0; k < 4; k++) {
                        if (k == inverseTransformIndex(j)) continue;
                        circle c3 = getInitialCircle(k);
                        circle c4 = mobiusOnCircle(T, mobiusOnCircle(T1, c3));
                        if (insideCircle(c4, z)) {
                            xform T2 = getTransform(inverseTransformIndex(k));
                            for (int l = 0; l < 4; l++) {
                                if (l == inverseTransformIndex(k)) continue;
                                circle c5 = getInitialCircle(l);
                                circle c6 = mobiusOnCircle(T,
                                            mobiusOnCircle(T1,
                                            mobiusOnCircle(T2, c5)));
                                if (insideCircle(c6, z))
                                    return vec4(1.,1.,0.,1.);    
                            }
                            return vec4(0.,0.,1.,1.);    
                        }
                    }
                    return vec4(1.,0.,0.,1.);    
                }
            }
            return vec4(0.,1.,0.,1.);
        }
    }
    return vec4(1.,1.,1.,.3);
}
vec4 applyOldSchottky(in vec2 z) {


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
return x.replace('$1', numCircles).replace('$1', numCircles);
}