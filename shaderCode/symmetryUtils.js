function SU2Symmetries() {
    var that = this;
    that.symmetryIndex = 0;

    that.updateUniformsForNextSymmetry = function (polyhedronIndex, uniforms, mode) {
        var symmetryGroup = that.nextSymmetry(polyhedronIndex);
        if (mode == 1) {
            uniforms.uXformA.value = symmetryGroup[0];
            uniforms.uXformB.value = symmetryGroup[1];
            uniforms.uXformC.value = symmetryGroup[2];
            uniforms.uXformD.value = symmetryGroup[3];
        }
        else {
            uniforms.uSymmetryIndex.value = this.symmetryIndex;
            console.log("Symmetry index = " + uniforms.uSymmetryIndex.value);
        }
    }
    that.getLabelsAsHTML = function (polyhedronIndex) {
        if (that.labels != undefined)
            return that.labels[that.symmetryIndex];
        var symmetries = that.getSymmetriesForPolyhedron(polyhedronIndex);
        var current = symmetries[that.symmetryIndex];
        var labels = [
            that.getDisplayString(current[0]),
            that.getDisplayString(current[1]),
            that.getDisplayString(current[2]),
            that.getDisplayString(current[3])
        ];
        var template =
            "<table><tr><td>&nbsp&nbsp&nbsp;&nbsp</td><td>&nbsp&nbsp&nbsp&nbsp</td></tr></tr>" +
            "<tr><td align='right'>$1</td><td align='right'>$2</td></tr><tr><td align='right'>$3</td><td align='right'>$4</td></tr>";
        var str = template
            .replace('$1', labels[0])
            .replace('$2', labels[1])
            .replace('$3', labels[2])
            .replace('$4', labels[3]);
        return str;
    }
    that.nextSymmetry = function (polyhedronIndex) {
        var symmetries = that.getSymmetriesForPolyhedron(polyhedronIndex);
        that.symmetryIndex++;
        console.log(that.symmetryIndex);
        that.symmetryIndex = that.symmetryIndex % symmetries.length;
        var retval = symmetries[that.symmetryIndex];
        return retval;
    }
    that.getSymmetriesForPolyhedron = function (polyhedronIndex) {
        var i = new THREE.Vector2(0., 1.);
        var minusi = new THREE.Vector2(0., -1.);
        var one = new THREE.Vector2(1., 0.);
        var minusone = new THREE.Vector2(-1., 0.);
        var zero = new THREE.Vector2(0., 0.);
        var ipow = function (l) {    // returns i^l
            return l == 0 ? one : l == 1 ? i : l == 2 ? minusone : l == 3 ? minusi : one;
        }
        if (polyhedronIndex == 2) { // tetrahedron
            that.lookup = {
                "I": [new THREE.Vector2(1,0),new THREE.Vector2(0,0),new THREE.Vector2(0,0),new THREE.Vector2(1,0)],
                "U": [new THREE.Vector2(0.5,-0.5),new THREE.Vector2(0.5,-0.5),new THREE.Vector2(-0.5,-0.5),new THREE.Vector2(0.5,0.5)],
                "V": [new THREE.Vector2(0.5,-0.5),new THREE.Vector2(-0.5,-0.5),new THREE.Vector2(0.5,-0.5),new THREE.Vector2(0.5,0.5)],
                "UU": [new THREE.Vector2(-0.5,-0.5),new THREE.Vector2(0.5,-0.5),new THREE.Vector2(-0.5,-0.5),new THREE.Vector2(-0.5,0.5)],
                "UV": [new THREE.Vector2(0,-1),new THREE.Vector2(0,0),new THREE.Vector2(0,0),new THREE.Vector2(0,1)],
                "VU": [new THREE.Vector2(0,0),new THREE.Vector2(0,-1),new THREE.Vector2(0,-1),new THREE.Vector2(0,0)],
                "VV": [new THREE.Vector2(-0.5,-0.5),new THREE.Vector2(-0.5,-0.5),new THREE.Vector2(0.5,-0.5),new THREE.Vector2(-0.5,0.5)],
                "UUV": [new THREE.Vector2(-0.5,-0.5),new THREE.Vector2(0.5,0.5),new THREE.Vector2(-0.5,0.5),new THREE.Vector2(-0.5,0.5)],
                "UVV": [new THREE.Vector2(-0.5,-0.5),new THREE.Vector2(-0.5,0.5),new THREE.Vector2(0.5,0.5),new THREE.Vector2(-0.5,0.5)],
                "VUU": [new THREE.Vector2(-0.5,0.5),new THREE.Vector2(0.5,-0.5),new THREE.Vector2(-0.5,-0.5),new THREE.Vector2(-0.5,-0.5)],
                "VVU": [new THREE.Vector2(0.5,-0.5),new THREE.Vector2(0.5,-0.5),new THREE.Vector2(-0.5,-0.5),new THREE.Vector2(0.5,0.5)],
                "UVVU": [new THREE.Vector2(0,0),new THREE.Vector2(-1,0),new THREE.Vector2(1,0),new THREE.Vector2(0,0)]
            };
            var group = Object.values(that.lookup);
            that.labels = Object.keys(that.lookup)
            return group;
        }
        if (polyhedronIndex == 3) { // tetrahedron, old
            var group = [
                [one, zero, zero, one],
                [minusone, zero, zero, one],
                [zero, one, one, zero],
                [zero, minusone, one, zero],
                [i, i, one, minusone],
                [minusi, minusi, one, minusone],
                [i, minusi, one, one],
                [minusi, i, one, one],
                [one, one, one, minusone],
                [minusone, minusone, one, minusone],
                [one, minusone, one, one],
                [minusone, one, one, one]
            ];
            return group;
        }
        if (polyhedronIndex == 1) { // octagon
            var group = [];
            var g;
            for (var l = 0; l < 4; l++) {   // see page 28, "Finite Mobius Groups...", Gabor Toth
                // in numerator: where Toth has 1 we use term. where Toth has i we use termp1.
                // denominator: leave as one and i.
                var term = ipow(l);
                var termp1 = ipow(l + 1);
                // replace one by term, i by termp1. in numerator.
                group.push([term, zero, zero, one]);
                group.push([zero, term, one, zero]);
                group.push([term, term, one, minusone]);
                group.push([term, term.clone().negate(), one, one]);
                group.push([term, termp1, one, minusi]);
                group.push([term, termp1.clone().negate(), one, i]);
            }
            return group;
        }
    }
    that.getDisplayString = function (vec2) {
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


function getTetrahedralGroupDisplayString(index) {
    if (index == 0)
        return ["1", "0", "0", "1"];
    if (index == 1)
        return ["-1", "0", "0", "1"];
    if (index == 2)
        return ["0", "1", "1", "0"];
    if (index == 3)
        return ["0", "-1", "1", "0"];
    if (index == 4)
        return ["i", "i", "1", "-1"];
    if (index == 5)
        return ["-i", "-i", "1", "-1"];
    if (index == 6)
        return ["i", "-i", "1", "1"];
    if (index == 7)
        return ["-i", "i", "1", "1"];
    if (index == 8)
        return ["1", "1", "1", "-1"];
    if (index == 9)
        return ["-1", "-1", "1", "-1"];
    if (index == 10)
        return ["1", "-1", "1", "1"];
    if (index == 11)
        return ["-1", "1", "1", "1"];
}
SHADERCODE.symmetryUtils = function () {
    var x = `  
vec2 tetrahedralGroup(in vec2 z, in int index) {
    if (index == 1) {
        return applyInverseMobiusTransformation(z,xformCtor(-one,zero,zero,one));
    }
    if (index == 2) {
        return applyInverseMobiusTransformation(z,xformCtor(zero,one,one,zero));
    }
    if (index == 3) {
        return applyInverseMobiusTransformation(z,xformCtor(zero,-one,one,zero));
    }
    if (index == 4) {
        return applyInverseMobiusTransformation(z,xformCtor(i,i,one,-one));
    }
    if (index == 5) {
        return applyInverseMobiusTransformation(z,xformCtor(-i,-i,one,-one));
    }
    if (index == 6) {
        return applyInverseMobiusTransformation(z,xformCtor(i,-i,one,one));
    }
    if (index == 7) {
        return applyInverseMobiusTransformation(z,xformCtor(-i,i,one,one));
    }
    if (index == 8) {
        return applyInverseMobiusTransformation(z,xformCtor(one,one,one,-one));
    }
    if (index == 9) {
        return applyInverseMobiusTransformation(z,xformCtor(-one,-one,one,-one));
    }
    if (index == 10) {
        return applyInverseMobiusTransformation(z,xformCtor(one,-one,one,one));
    }
    if (index == 11) {
        return applyInverseMobiusTransformation(z,xformCtor(-one,one,one,one));
    }
    else 
        return applyInverseMobiusTransformation(z,xformCtor(one,zero,zero,one));
}
`;
    return x;
}
