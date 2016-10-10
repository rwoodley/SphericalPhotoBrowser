
var klein = function (u, v) {
    u *= Math.PI;
    v *= 2 * Math.PI;

    u = u * 2;
    var x, y, z;
    if (u < Math.PI) {
        x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(u) * Math.cos(v);
        z = -8 * Math.sin(u) - 2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);
    } else {
        x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(v + Math.PI);
        z = -8 * Math.sin(u);
    }

    y = -2 * (1 - Math.cos(u) / 2) * Math.sin(v);

    return new THREE.Vector3(x*2, y*2, z*2);
};
var psphere = function (u, v) {
    u = u * 10 - 5;
    v *= 2 * Math.PI;
    var x,y,z;
    x = (1./Math.cosh(u))*Math.cos(v);
    y = (1./Math.cosh(u))*Math.sin(v);
    z = u - Math.tanh(u);
        return new THREE.Vector3(x*2, y*2, z*2);
}
var helix = new THREE.Curve();
helix.getPoint = function(t) {
   var s = (t - 0.5) * 12*Math.PI;
         // As t ranges from 0 to 1, s ranges from -6*PI to 6*PI
   return new THREE.Vector3(
        5*Math.cos(s),
        s,
        5*Math.sin(s)
   );
}
