SHADERCODE.schottkyUtilsCommon = function() {
    var x = `  
    struct schottkyResult {
        int iter;
        vec2 inverseZ;
        vec2 glitchZ;   // just a pretty effect i got by doing something wrong.
    };
    `;
    return x;
}
