complex = function(x,y) {
    var a = this;
    var that = this;
    this.x = x; this.y = y;
    this.mult = function(b) {
        var x = a.x*b.x-a.y*b.y;
        var y = a.x*b.y+a.y*b.x;
        return new complex(x,y);
    }
    this.add = function(b) {
        return new complex(a.x+b.x,a.y+b.y);
    }
    this.minus = function(b) {
        return new complex(a.x-b.x,a.y-b.y);
    }
    this.divide = function(b) {
        var x = (a.x*b.x+a.y*b.y)/(b.x*b.x+b.y*b.y);
        var y = (a.y*b.x-a.x*b.y)/(b.x*b.x+b.y*b.y);
        return new complex(x,y);
    }
    this.exp = function() {
        var x = Math.exp(a.x) * Math.cos(a.y);
        var y = Math.exp(a.x) * Math.sin(a.y);
        return new complex(x,y);
    }
    this.log = function() {
        var rpart = Math.sqrt((a.x*a.x)+(a.y*a.y));
        var ipart = Math.atan2(a.y,a.x);
        if (ipart > Math.PI) ipart=ipart-(2.0*Math.PI);
        return new complex(Math.log(rpart),ipart);
    }
    this.pow = function(power) {
        // calc a^power
        return a.log().mult(power).exp();
    }
    this.str = function() {
        return a.x + " + " + a.y + "i";
    }
    this.minus = function() { 
        return new complex(-a.x, -a.y);
    }
    this.asVec2 = function() {
        return new THREE.Vector2(a.x, a.y);
    }
    this.modulus = function() {
        return Math.sqrt(a.x*a.x + a.y*a.y);
    }
    this.displayString = function() {
        var vec2 = that;
        if (vec2.x == 0 && vec2.y == 0) return "0";
        var real = vec2.x == 0 ? "" : vec2.x + '';
        var imag = vec2.y == 0 ? "" :
            vec2.y == 1 ? 'i' :
                vec2.y == -1 ? '-i' :
                    vec2.y + 'i';
        var compoundLabel = real + " + " + imag;
        return real == "" ? imag : imag == "" ? real : compoundLabel;            
    }
}
var _four = new complex(-4,0); 
var _two = new complex(2,0); 
var _one = new complex(1,0); 
var _minusOne = new complex(-1,0); 
var _i = new complex(0,1); 
var _zero = new complex(0,0);
var _sqrtTwo = new complex(Math.sqrt(2),0);
this.xform = function(a,b,c,d) {
    var x1 = this;
    var self = this;
    this.a = a; this.b = b; this.c = c; this.d = d;
    this.doit = function(z) {               // apply transform to complex number z.
        var num = self.a.mult(z).add(self.b);
        var den = self.c.mult(z).add(self.d);
        return num.divide(den);
    }
    this.mmult = function(x2) {             // 2x2 matrix multiplication: return t
        var newone = 
        new xform(
            x1.a.mult(x2.a).add(x1.b.mult(x2.c)),  // x1.a*x2.a + x1.b*x2.c,
            x1.a.mult(x2.b).add(x1.b.mult(x2.d)),  // x1.a*x2.b + x1.b*x2.d,
            x1.c.mult(x2.a).add(x1.d.mult(x2.c)),  // x1.c*x2.a + x1.d*x2.c,
            x1.c.mult(x2.b).add(x1.d.mult(x2.d)),  // x1.c*x2.b + x1.d*x2.d

        );
        return newone;
    }
    this.magnitudeOfTransform = function(z) {
        // the magnitude at z = modulus(f'(z))
        var a = (x1.c.mult(z).add(x1.d))
        var denom = a.mult(a);
        var num = x1.a.mult(x1.d).minus(x1.b.mult(x1.c));
        var deriv = num.divide(denom);
        var modulus = deriv.modulus()
        return modulus;
    }
    this.vmult = function(cx,cy) {
        var newx = x1.a.mult(cx).add(x1.b.mult(cy));
        var newy = x1.c.mult(cx).add(x1.d.mult(cy));
        return [newx, newy];
    }
    this.zoom = function(f) {
        self.a = self.a.mult(f);
    }
    this.rotate = function(radians) {
        self.a = self.a.mult(new complex(
        Math.cos(radians),
        Math.sin(radians)
        ));
    }
    this.log = function() {
        console.log("(" + a.str() + " + " + b.str() + ")/(" +
            c.str() + " + " + d.str() + ")");
    }
    this.inverse = function() {
        return new xform(this.d, this.b.minus(), this.c.minus(), this.a);
    }
    this.asArrayOfVec2s = function() {
        return [x1.a.asVec2(), x1.b.asVec2(), x1.c.asVec2(), x1.d.asVec2()];
    }
}
var _tXform = new xform(_one,_one,_zero,_one);
// var _tXform = new xform(_one,_zero,_sqrtTwo,_one);
var _sXform = new xform(_zero, _minusOne, _one, _zero);
var _inverseTXform = _tXform.inverse();
var _inverseSXform = _sXform.inverse();
var PI = Math.PI;

function cartesianToPolar(x,y,z) {
    var theta;
    var phi;
    phi = Math.atan2(y, x);
    //phi -= (PI/2.0);    // this correction lines up the UV texture nicely.
    if (phi <= 0.0) {
        phi = phi + PI*2.0; 
    }
    if (phi >= (2.0 * PI)) {    // allow 2PI since we gen uv over [0,1]
        phi = phi - 2.0 * PI;
    }
    // phi = 2. * PI - phi;        // flip the texture around.
    theta = Math.acos(z);
    return [phi, theta];
}
function complexToUV(inx,iny) {
    // now c back to sphere.
    var theta;
    var phi;
    var x;
    var y;
    var z;
    var denom = 1.0 + inx * inx + iny * iny;
    x = 2.0 * inx/denom;
    y = 2.0 * iny/denom;
    z = (inx*inx + iny*iny - 1.0)/denom;
    // console.log(x,y,z);

    // convert to polar
    var polarCoords = cartesianToPolar(x,y,z);
    phi = polarCoords[0];
    theta = polarCoords[1];
    // console.log(phi, theta);

    // now get uv in new chart.
    var newv = 1-theta/PI;
    var newu = phi/(2.0 * PI);
    // if (newu < 0.) newu = newu + 1.0;

    // So in WebGL the UV origin is at the lower left.
    // On the canvas it is the upper left. Since we want to superimpose
    // things drawn on the canvas onto the WEBGL texture, we need to flip the V coord.
    // Also see uvToComplex in mainShader_js where a correction of PI is added to phi.
    // so that's why we add .25 below.
    var u = (newu+.25)%1.0;
    if (u < 0) u = u + 1.0;
    if (u < 0) u = u + 1.0;
    return [(1-newu+.25)%1.0, 1-newv];
    // return [(1-newu)%1.0, 1-newv];
}
function uvToCanvasCoord(uv) {
    var el = document.getElementById('canvas');

}
