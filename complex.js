complex = function(x,y) {
    var a = this;
    this.x = x; this.y = y;
    this.mult = function(b) {
        var x = a.x*b.x-a.y*b.y;
        var y = a.x*b.y+a.y*b.x;
        return new complex(x,y);
    }
    this.add = function(b) {
        return new complex(a.x+b.x,a.y+b.y);
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
}
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
            // x1.a.mult(x2.a).add(x1.b.mult(x2.c)),  // x1.a*x2.a + x1.b*x2.c,
            // x1.a.mult(x2.b).add(x1.b.mult(x2.d)),  // x1.a*x2.b + x1.b*x2.d,
            // x1.c.mult(x2.a).add(x1.d.mult(x2.c)),  // x1.c*x2.a + x1.d*x2.c,
            // x1.c.mult(x2.b).add(x1.d.mult(x2.d)),  // x1.c*x2.b + x1.d*x2.d

            x1.a.mult(x2.a).add(x1.b.mult(x2.c)),  // x1.a*x2.a + x1.b*x2.c,
            x1.a.mult(x2.b).add(x1.b.mult(x2.d)),  // x1.a*x2.b + x1.b*x2.d,
            x1.c.mult(x2.a).add(x1.d.mult(x2.c)),  // x1.c*x2.a + x1.d*x2.c,
            x1.c.mult(x2.b).add(x1.d.mult(x2.d)),  // x1.c*x2.b + x1.d*x2.d

        );
        return newone;
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
}
var _one = new complex(1,0); 
var _minusOne = new complex(-1,0); 
var _i = new complex(0,1); 
var _zero = new complex(0,0);
var _two = new complex(2,0);
var _tXform = new xform(_one,_one,_zero,_one);
var _sXform = new xform(_zero, _minusOne, _one, _zero);
var _inverseTXform = _tXform.inverse();
var _inverseSXform = _sXform.inverse();