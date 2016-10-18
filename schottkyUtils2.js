function cx_product(a, b) {
    return new cnum(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x);
}
function cx_conjugate(a) {
    return new cnum(a.x,-a.y);
}
function cx_divide(a, b) {
    return new cnum(
        ((a.x*b.x+a.y*b.y)/(b.x*b.x+b.y*b.y)),
        ((a.y*b.x-a.x*b.y)/(b.x*b.x+b.y*b.y))
    );
}
function cx_plus(a,b) {
    return new cnum(a.x + b.x, a.y + b.y);
}
function cx_minus(a,b) {
    return new cnum(a.x - b.x, a.y - b.y);
}
function cx_modulus(a) {
    return Math.sqrt(a.x*a.x + a.y*a.y)
}
var cnum = function(real, imaginary) {
    var self = this;
    self.x = real;
    self.y = imaginary;
    self.toVec2 = function() {
        return new THREE.Vector2(self.x,self.y);
    }
    self.multiplyScalar = function(s) {
        self.x *= s;
        self.y *= s;
        return self;
    }
}
var circle = function(center,r) {
    this.center = center;   // a cnum
    this.r = r;
}
var xform = function(a,b,c,d) {     // each one is a cnum.
    var self = this;
    self.a = a; self.b = b; self.c = c; self.d = d;
    self.applyXform = function(z) {
        var top = cx_plus(x_product(z,self.a), self.b);
        var bot = cx_plus(x_product(z,self.c), self.d);
        return cx_divide(top, bot);
    }
    self.mobiusOnCircle = function(C) {  // T is a transform, C a circle
        var T = self;
        var zdenom = cx_conjugate(cx_plus(cx_divide(T.d, T.c), C.center));
        var z = cx_minus(C.center, 
                        cx_divide(new cnum(C.radius * C.radius,0.), zdenom));
        var Dcenter = T.applyXform(z);
        var Dradius = cx_modulus(D.center - applyMobiusTransformation(C.center + C.radius, T));
        var D = new circle(Dcenter,Dradius);
        return D;
    }
    self.getAsUniform = function() {
        return [
            a.toVec2(), b.toVec2(), c.toVec2(), d.toVec2()
        ];
    }
    self.getInverse = function() {
        // inverse is (dz-b)/(-cz+a).
        return new xform(
            new cnum(self.d.x, self.d.y),
            new cnum(self.b.x, self.b.y).multiplyScalar(-1),
            new cnum(self.c.x, self.c.y).multiplyScalar(-1),
            new cnum(self.a.x, self.a.y)
        );        
    }
}
var schottkyUtils2 = function(
    xforms             // an array. 4 of these, eache one an array of 4 THREE.Vector2: a,b,c,d. corresponding to a, A, b, B
) {
    var self = this;
    var xradius = 1.0;
    var s2 = Math.sqrt(2.);
    var one = new cnum(1.0,0);
    var i = new cnum(0.0, 1.0);
    var startingCircles = [];
    startingCircles[0] = new circle(new cnum(0.0, -s2), xradius);    // a
    startingCircles[1] = new circle(new cnum(0.0, s2), xradius);    // A
    startingCircles[2] = new circle(new cnum(-s2, 0.), xradius);    // b
    startingCircles[3] = new circle(new cnum(s2, 0.), xradius);    // B
    self.xforma = new xform(
        new cnum(s2,  0.0),
        new cnum(0.0, 1.0),
        new cnum(0.0, -1.0),
        new cnum(s2, 0.0)
    );
    self.xformb = new xform(
        new cnum(s2,  0.0),
        new cnum(0.0, 1.0),
        new cnum(0.0, -1.0),
        new cnum(s2, 0.0)
    );
    self.xformA = self.xforma.getInverse();
    self.xformB = self.xformb.getInverse();
    self.addUniforms = function(uniforms) {
        uniforms.xforma = {
            type: "v2v", value: self.xforma.getAsUniform()
        },
        uniforms.xformb = {
            type: "v2v", value: self.xformb.getAsUniform()
        },
        uniforms.xformA = {
            type: "v2v", value: self.xformA.getAsUniform()
        },
        uniforms.xformB = {
            type: "v2v", value: self.xformB.getAsUniform()
        }
    }   
    self.init = function() {
        self.xForms = xforms;
        self.names = ['a', 'A', 'b', 'B'];
        self.inverses = [1,0,3,2];       // points to inverse transform.
        var result = [];
        var level = 0;
        self.terminalLevel = 4;
        for (var circle in self.startingCircles) {
            self.genChildren(circle, level)
        }
    }
    self.genChildren = function(parent, level, lastXformIndex) {
        level++;
        for (var i = 0; i < 4; i++) {
            if (i == self.inverses[lastXformIndex])
                continue;   // a should not follow A, etc.
            var xform = self.xForms[i];
            childCircle = applyXform(parent, xform);
            if (level < self.terminalLevel)
                self.genChildren(childCircle, level, i);   
        }
        level--;
    }
    self.init();
}
