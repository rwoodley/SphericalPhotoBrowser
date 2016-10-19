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
var Circle = function(center,r) {
    this.center = center;   // a cnum
    this.radius = r;
}
var xform = function(a,b,c,d) {     // each one is a cnum.
    var self = this;
    self.a = a; self.b = b; self.c = c; self.d = d;
    self.applyXform = function(z) {
        var top = cx_plus(cx_product(z,self.a), self.b);
        var bot = cx_plus(cx_product(z,self.c), self.d);
        return cx_divide(top, bot);
    }
    self.mobiusOnCircle = function(C) {  // T is a transform, C a Circle
        var T = self;
        var zdenom = cx_conjugate(cx_plus(cx_divide(T.d, T.c), C.center));
        var Dcenter;
        if (zdenom.x == 0 && zdenom.y == 0) {
            Dcenter = cx_divide(a,c);
        }
        else {
            var z = cx_minus(C.center, 
                            cx_divide(new cnum(C.radius * C.radius,0.), zdenom));
            Dcenter = T.applyXform(z);
        }
        var Dradius = 
        cx_modulus(
            cx_minus(Dcenter, T.applyXform(
                cx_plus(C.center, new cnum(C.radius, C.radius)))));
        var D = new Circle(Dcenter,Dradius);
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
    self.circles = [];
    self.maxSlot = 0;
    self.numFilledSlots = 0;
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
        uniforms.uCircles = {
            type: "v4v", value: self.genCircleUniform()
        }
        uniforms.uNumCircles = {
            type: "int", value: self.maxSlot
        }
    }
    self.init = function() {
        var xradius = 1.0;
        var s2 = Math.sqrt(2.00);
        var one = new cnum(1.0,0);
        var i = new cnum(0.0, 1.0);
        self.startingCircles = [];
        self.startingCircles[0] = new Circle(new cnum(0.0, -s2), xradius);    // a
        self.startingCircles[1] = new Circle(new  cnum(0.0, s2), xradius);    // A
        self.startingCircles[2] = new Circle(new cnum(-s2, 0.), xradius);    // b
        self.startingCircles[3] = new Circle(new cnum(s2, 0.), xradius);    // B
        self.xforma = new xform(
            new cnum(s2,  0.0),
            new cnum(0.0, 1.0),
            new cnum(0.0, -1.0),
            new cnum(s2, 0.0)
        );
        self.xformb = new xform(
            new cnum(s2,  0.0),
            new cnum(1.0, 0.0),
            new cnum(1.0, 0.0),
            new cnum(s2, 0.0)
        );
        self.xformA = self.xforma.getInverse();
        self.xformB = self.xformb.getInverse();
        self.xforms = [self.xforma, self.xformA, self.xformb, self.xformB];
        self.names = ['a', 'A', 'b', 'B'];
        self.inverses = [1,0,3,2];       // points to inverse transform.
        var result = [];
        var level = 0;
        self.terminalLevel = 3;
        for (var sindex in self.startingCircles) {
            var slot = parseInt(sindex)+1;
            var aslot = slot.toString();
            self.genChildren(self.startingCircles[sindex], level, -1, slot, aslot);
        }
        console.table(self.circles);
    }
    self.genChildren = function(parent, level, lastXformIndex, slot, aslot) {
        level++;
        for (var i = 0; i < 4; i++) {
            if (i == self.inverses[lastXformIndex] && lastXformIndex > -1)
                continue;   // a should not follow A, etc.
            var xform = self.xforms[i];
            // childCircle = applyXform(parent, xform);
            childCircle = xform.mobiusOnCircle(parent);
            var newslot = slot*5 + i + 1;
            var newaslot = aslot + (i+1).toString();
            var wrapper = {
                'circle': childCircle,
                'level': level,
                'parent': parent,
                'xform': i,
                'parentXform': lastXformIndex,
                'index': self.circles.length,
                'cx': childCircle.center.x,
                'cy': childCircle.center.y,
                'r': childCircle.radius,
                'slot': newslot,
                'aslot': newaslot
            };
            if (newslot > self.maxSlot) self.maxSlot = newslot;
            if (newslot in self.circles)
                console.log("DUP! at " + newslot + "," + newaslot + ","
                + self.circles[newslot].aslot);
            self.circles[newslot] = wrapper
            if (level < self.terminalLevel)
                self.genChildren(childCircle, level, i, newslot,newaslot);   
        }
        level--;
    }
    self.genCircleUniform = function() {
        var res = [];
        for (var i = 0; i < self.maxSlot; i++) {
            var v4;
            if (i in self.circles) {
                var circ = self.circles[i].circle;
                v4 = new THREE.Vector4(circ.center.x, circ.center.y, circ.radius,
                            self.circles[i].level);
                res.push(v4);
            }
            else {
                v4 = new THREE.Vector4(0,0,0,999);
            }
            // res.push(v4);
        }
        self.numFilledSlots = res.length;
        return res;
    }
    self.init();
}
