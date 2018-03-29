SHADERCODE.polygonalGroupsCode = function () {
    var x = `  
// This has the polygonal group formulas, and a few others.
// these others are prefixed with 'adhoc;.
vec2 adhocTransform_z3(vec2 inz) {
    return vec2(0,0);
}
vec2 adhocTransformZPlusOneOverZ(vec2 inz) {
    return vec2(0,0);
}
vec2 adhocTransform3(vec2 z) {
    return vec2(0,0);
}
vec2 spow(vec2 z, float r) {
    return vec2(0,0);
}
vec2 polygonalGroup_Icosahedron(vec2 inz) {
    return vec2(0,0);
}
vec2 polygonalGroup_Octagon(vec2 z) {
    return vec2(0,0);
}
vec2 polygonalGroup_Tetrahedron(vec2 z) {
    return vec2(0,0);
}
    `;
        return x;
    }