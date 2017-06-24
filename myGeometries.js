
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
        return new THREE.Vector3(x*10, y*10, z*10);
}
var catenoidFunc = function(u,v) {
    u=u*(2*Math.PI)-Math.PI;
    v=v*10-5;
    rr=10;
    x=rr*Math.cosh(v/rr)*Math.cos(u);
    y=rr*Math.cosh(v/rr)*Math.sin(u);
    z=v;
    return new THREE.Vector3(x*10, y*10, z*10);    
}
var steinerFunc = function(u,v) {
    // see http://xahlee.info/surface/steiner/steiner.html
    u *= Math.PI;
    v *= 2 * Math.PI;
    var x,y,z;
    x = Math.cos(u) * Math.cos(v) * Math.sin(v);
    y = Math.sin(u) * Math.cos(v) * Math.sin(v);
    z = Math.cos(u) * Math.sin(u) * Math.cos(v) * Math.cos(v);
    return new THREE.Vector3(x,y,z);
}
var dumpling = function(u,v, openOrClose, overallHeight, petalPeak, petalTrough, nPetals, scale) {
    // openOrClose: 0 to 1: 0 = flat, 1 = folded up.

    var theta = u * 2 * Math.PI;
    var radius = v * 2; // see note below on why we have x2 here.
    var zdelta = 0;
    // this bit of code folds the object back on itself and makes it a solid instead of a plane, so both sides cast a shadow.
    // see http://stackoverflow.com/questions/20463247/three-js-doublesided-material-doesnt-cast-shadow-on-both-sides-of-planar-parame
    if (radius > 1) {
      radius = 2 - radius;
      zdelta = 0.01;
    }
    
    var x = radius*Math.cos(theta*nPetals/2);
    var y = radius*Math.sin(theta*nPetals/2);
    var z = zdelta +  overallHeight * (petalPeak*x*x + petalTrough*y*y)/1.5;
    var temprad = radius;
    if (openOrClose >= 0) {
        var temprad = Math.sin(Math.PI *openOrClose * radius);     // dumpling effect
        //var temprad = Math.sin(Math.PI *openOrClose * radius);   // no dumpling effect
    }
    x = temprad*Math.cos(theta);
    y = temprad*Math.sin(theta);

    return new THREE.Vector3(x*scale, z*scale, y*scale);
};
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
