function xform(a,b,c,d) {
    var self = this;
    this.a = a; // these are THREE.Vector2
    this.b = b;
    this.c = c;
    this.d = d;

    this.getAsUniform = function() {
        return [
            a, b, c, d
        ];
    };
    this.getInverse = function() {
        // inverse is (dz-b)/(-cz+a).
        return new xform(
            new THREE.Vector2(self.d.x, self.d.y),
            new THREE.Vector2(self.b.x, self.b.y).multiplyScalar(-1),
            new THREE.Vector2(self.c.x, self.c.y).multiplyScalar(-1),
            new THREE.Vector2(self.a.x, self.a.y)
        );
    };
}
function schottkyUtils() {
    var self = this;
    this.xforma = new xform(
            new THREE.Vector2(Math.sqrt(2.0), 0.),
            new THREE.Vector2(0, 1.),
            new THREE.Vector2(0, -1.),
            new THREE.Vector2(Math.sqrt(2.0), 0.)        
    );
    this.xformb = new xform(
            new THREE.Vector2(Math.sqrt(2.0), 0.),
            new THREE.Vector2(1.0, 0.),
            new THREE.Vector2(1.0, 0.),
            new THREE.Vector2(Math.sqrt(2.0), 0.)
    );
    this.xformA = this.xforma.getInverse();
    this.xformB = this.xformb.getInverse();
    this.addUniforms = function(uniforms) {
        uniforms.xforma = {
            type: "v2v", value: this.xforma.getAsUniform()
        },
        uniforms.xformb = {
            type: "v2v", value: this.xformb.getAsUniform()
        },
        uniforms.xformA = {
            type: "v2v", value: this.xformA.getAsUniform()
        },
        uniforms.xformB = {
            type: "v2v", value: this.xformB.getAsUniform()
        }
    }   
}