SHADERCODE.mathUtils = function() {
var x = `  
    
        // ====== Math Utils =======

    #define PI 3.1415926535897932384626433832795
    #define cx_product(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)
    #define cx_conjugate(a) vec2(a.x,-a.y)
    #define cx_divide(a, b) vec2(((a.x*b.x+a.y*b.y)/(b.x*b.x+b.y*b.y)),((a.y*b.x-a.x*b.y)/(b.x*b.x+b.y*b.y)))
    // emulate OpenGL 4.5's mix(,,bool)
    float mix(float x, float y, bool a) {
        return a ? y : x;
    }
    //#define cx_abs(a) sqrt(a.x*a.x + a.y*a.y)
    #define cx_modulus(a) length(a)
    #define cx_conj(a) vec2(a.x,-a.y)
    #define cx_arg(a) atan2(a.y,a.x)

    float atan2(in float y, in float x) {
        // http://stackoverflow.com/questions/26070410/robust-atany-x-on-glsl-for-converting-xy-coordinate-to-angle
        bool s = (abs(x) >= abs(y));
        float res = mix(PI/2.0 - atan(x,y), atan(y,x), s);
        return res;
    }
    // https://github.com/julesb/glsl-util/blob/master/complexvisual.glsl
    vec2 cx_sqrt(vec2 a) {
        float r = sqrt(a.x*a.x+a.y*a.y);
        float rpart = sqrt(0.5*(r+a.x));
        float ipart = sqrt(0.5*(r-a.x));
        if (a.y < 0.0) ipart = -ipart;
        return vec2(rpart,ipart);
    }
    vec2 cx_log(vec2 a) {
        float rpart = sqrt((a.x*a.x)+(a.y*a.y));
        float ipart = atan2(a.y,a.x);
        if (ipart > PI) ipart=ipart-(2.0*PI);
        return vec2(log(rpart),ipart);
    }
    vec2 cx_exp(vec2 z) {
        return vec2(exp(z.x) * cos(z.y), exp(z.x) * sin(z.y));
    }
    vec2 cx_pow(vec2 z, vec2 y) {
        return  cx_exp(cx_product(y, cx_log(z)));

    }
    vec3 complexToCartesian(vec2 c) {
        float denom = 1.0 + c.x*c.x + c.y*c.y;
        float x = 2.*c.x/denom;
        float y = 2.*c.y/denom;
        float z = (c.x*c.x + c.y*c.y - 1.0)/denom;
        return vec3(x,y,z);
    }
`;
return x;
}