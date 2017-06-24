SHADERCODE.polygonalGroupsCode = function () {
    var x = `  
// This has the polygonal group formulas, and a few others.
// these others are prefixed with 'adhoc;.
vec2 adhocTransform_z3(vec2 inz) {
    vec2 z = inz;
    vec2 two = vec2(2.0,0.);
    vec2 p5 = vec2(.5,0.);

    vec2 t0 = cx_pow(z,two)-vec2(.25,0.);
    vec2 t1 = z - vec2(0.,1.5);

    vec2 n = cx_product(t0,t1);
    vec2 d = vec2(1.,0.);
    vec2 f = cx_divide(n,d);
    return f;
}
vec2 adhocTransformZPlusOneOverZ(vec2 inz) {
    vec2 z = inz;

    vec2 f = z + cx_divide(one, z);

    return f;
}
vec2 adhocTransform3(vec2 z) {
    // vec2 n = cx_exp(i*z)+cx_exp(-i*z);
    // n = cx_divide(n,vec2(2.0,0.));
    return cx_exp(cx_divide(vec2(1.,0.),cx_exp(cx_pow(z,vec2(0.5,0.)))));
}
vec2 spow(vec2 z, float r) {
    return cx_pow(z,vec2(r,0.));
}
vec2 rToC(float z) { return vec2 (z,0.); }      // TODO: is this really needed.
vec2 polygonalGroup_Icosahedron(vec2 inz) {
    vec2 z;
    if (inz.x*inz.x + inz.y*inz.y > 1. )
        z = cx_divide(-one,cx_conjugate(inz));
    else
        z = inz;

    vec2 n1 = 
            cx_product(rToC(-1.),spow(z,20.)) 
            + cx_product(rToC(228.), spow(z,15.)) 
            - cx_product(rToC(494.), spow(z,10.))
            - cx_product(rToC(228.), spow(z, 5.)) 
            - one;
    vec2 n = spow(n1,3.); 
    vec2 temp = spow(z,10.) + cx_product(rToC(11.), spow(z, 5.)) - one;
    vec2 temp2 = cx_product(spow(z,5.), spow(temp, 5.));
    vec2 d = cx_product(rToC(1728.), temp2);
    vec2 f = cx_divide(n,d);
    return f;
}
vec2 polygonalGroup_Octagon(vec2 z) {
    vec2 n = spow(z,8.) + cx_product(rToC(14.), spow(z, 4.)) + one;
    n = spow(n,3.); 
    vec2 z4 = spow(z,4.);
    vec2 d = cx_product(cx_product(rToC(108.), z4), spow(z4-one, 4.));
    vec2 f = cx_divide(n,d);
    return f;
}
vec2 polygonalGroup_Tetrahedron(vec2 z) {
    vec2 midTerm = 3.464101* cx_product(i,cx_product(z,z));
    vec2 n = spow(z,4.) + midTerm + one;
    vec2 d = spow(z,4.) - midTerm + one;
    vec2 f = cx_divide(n,d);
    return spow(f,3.);
}
    `;
        return x;
    }