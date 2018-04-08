SHADERCODE.mobiusTransformUtils = function () {
    var x = `  

// ====== Transformation Code
// xform is a mobius transform.
struct xform { vec2 a; vec2 b; vec2 c; vec2 d; };

xform xformCtor(in vec2 a, in vec2 b, in vec2 c, in vec2 d) {
    xform x;
    x.a = a; x.b = b; x.c = c; x.d = d;
    return x;
}
xform inverseXformCtor(xform x) {
    return xformCtor(x.d,-x.b,-x.c,x.a);
}
vec2 applyMobiusTransformation(in vec2 z, in xform t) {
    vec2 top = cx_product(z,t.a)+t.b;
    vec2 bottom = cx_product(z,t.c)+t.d;
    return cx_divide(top,bottom);
}
vec2 applyInverseMobiusTransformation(in vec2 z, xform x) {
    // inverse is (dz-b)/(-cz+a).
    return applyMobiusTransformation(z,xformCtor(x.d,-x.b,-x.c,x.a));
}
vec2 transformForFixedPoints(in vec2 z, in vec2 e1, in vec2 e2) {
    return applyMobiusTransformation(z,xformCtor(one,-e1,one,-e2));
}
vec2 inverseTransformForFixedPoints(in vec2 z, in vec2 e1, in vec2 e2) {
    // inverse is (dz-b)/(-cz+a). a and c are 1.
    return applyInverseMobiusTransformation(z,xformCtor(one,-e1,one,-e2));
}
vec2 applyRotation(in vec2 z, in float radians) {
    // vec2 exp = cx_exp(vec2(0.,radians));
    vec2 exp = vec2(cos(radians), sin(radians));
    vec2 ans = cx_product(z, exp);
    return ans;
}
vec2 zoom(in vec2 z, in vec2 zoomDegree) {
    // a real zoomDegree is a straight zoom without twist.
    // a complex zoomDegree has a twist!
    vec2 ans = cx_product(zoomDegree,z);
    return ans;
}
vec2 anotherTransform(vec2 z) {
    vec2 n = z-i;
    vec2 d = z+i;
    vec2 res = cx_divide(n,d);
    res = 1. * cx_exp(4.*res);
    return res;
}
vec2 threePointMapping(vec2 z, vec2 q1, vec2 r1, vec2 s1, vec2 q2, vec2 r2, vec2 s2) {
    // xform xformCtor(in vec2 a, in vec2 b, in vec2 c, in vec2 d) {
    // convert Z cross ratio to mobius transform
    xform zXForm = xformCtor(
        r1 - s1,
        cx_product(q1, vec2(s1-r1)),
        r1 - q1,
        cx_product(s1, vec2(q1-r1))
    );
    // // convert W cross ratio to mobius transform
    xform wXForm = xformCtor(
        r2 - s2,
        cx_product(q2, vec2(s2-r2)),
        r2 - q2,
        cx_product(s2, vec2(q2-r2))
    );
    // q1, r1, s1 are the initial locations.
    // so first we send thos to 0,1, infinity.
    vec2 temp = applyMobiusTransformation(z, zXForm);

    // q2, r2, s2 are the new locations.
    // so now we send 0,1,infinity to the new locations.
    vec2 w = applyInverseMobiusTransformation(temp, wXForm);

    // basically this seems completely backwards. You'd think we want to send
    // q2,r2,s2 to 0,1,inf. and then from there to q1,r1, and s1.
    // But we're dealing with shader so everything is backwards. We have a point
    // that we need to color. So this point should be colored as if we had
    // applied W then Z^-1. So by doing it backwards we get the point that would
    // have been mapped to this point.

    return w;
} 

    `;
        return x;
    }