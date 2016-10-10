SHADERCODE.mobiusTransformUtils = function() {
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
    // a real zoomDegree is a streight zoom without twist.
    // a complex zoomDegree has a twist!
    vec2 ans = cx_product(zoomDegree,z);
        ans = cx_product(zoomDegree,ans);
    return ans;
}
vec2 anotherTransform(vec2 z) {
    vec2 n = z-i;
    vec2 d = z+i;
    vec2 f = cx_divide(n,d);
    vec2 res = 1. * cx_exp(4.*f);
    return res;
}
`;
return x;
}