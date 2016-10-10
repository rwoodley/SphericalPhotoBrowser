SHADERCODE.drosteUtils = function() {
var x = `  
     vec2 applyRoundDroste(in vec2 z) {
        float r1 = 0.3;     // how big the annulus appears on the screen
        float r2 = 0.9;     // how wide (relative to r1 each annulus is.

        float zoomFactor = 1.0;
        if (drosteZoom > 0) {
            float zoom=float(iGlobalTime - startTime) * float(drosteZoom);
            zoomFactor = exp(1.+zoom/500.);
        }
        z = cx_log(z/zoomFactor); 

        float scale = r2/r1;
        if (drosteSpiral == 1) {
            float twist = atan(log(scale)/(2.0*PI));
            vec2 temp = cx_exp(vec2(0.,twist))*cos(twist);
            z = cx_divide(z, temp);
        }

        z.x = mod(z.x+scale*.6, log(scale));
        z = cx_exp(z)*r1;
        return z;
    }
    float squareDroste_f(float x){
        return exp2(-floor(log2(x))-2.);
    }
    vec2 applySquareDroste(in vec2 z, float zoom) {
        // see http://roy.red/infinite-regression-.html#infinite-regression
        // see http://www.josleys.com/article_show.php?id=82

        float zoomFactor = exp(zoom*500.);
        z = z/zoomFactor; // Play with this to zoom
        vec2 a_z = abs(z);
        float scale = squareDroste_f(max(a_z.x,a_z.y));
        return z*scale;

    }
    vec2 applyArbitraryDroste(in vec2 z) {
        float r1 = 0.2;     // how big the annulus appears on the screen
        float r2 = 0.7;     // how wide (relative to r1 each annulus is.

        float r = length(z);
        float theta = cx_arg(z);

        float zoomFactor = 1.0;
        if (drosteZoom > 0) {
            float zoom=float(iGlobalTime-startTime) * float(drosteZoom);
            zoomFactor = exp(1.+zoom/500.);
        }
        z = cx_log(z/zoomFactor); 

        // make octagon
        float ndiv = 8.;
        float angle = PI/ndiv;
        //float shortestR = cos(angle);
        angle = angle - mod(theta, 2.*PI/ndiv);
        float b = cos(angle);
        float scale = b*r2/r1;

        if (drosteSpiral == 1) {
            float twist = atan(log(scale)/(2.0*PI));
            vec2 temp = cx_exp(vec2(0.,twist))*cos(twist);
            z = cx_divide(z, temp);
        }

        z.x = mod(z.x , log(scale));
        z = cx_exp(z);
        return z;

    }
`;
return x;
}