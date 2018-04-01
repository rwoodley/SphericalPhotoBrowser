// ========
// Track 3 points simulataneously. For use with Segerman's dolly zoom effect.
// ========
function threePointTrackerFromFiles(fileWithCoordinates) {
    var that = this;
    this.tracker = [];
    this.tracker[0] = new trackerUtils("trackerData/" + fileWithCoordinates + "/1.json");
    this.tracker[1] = new trackerUtils("trackerData/" + fileWithCoordinates + "/2.json");
    this.tracker[2] = new trackerUtils("trackerData/" + fileWithCoordinates + "/3.json");
    this.startPoint = [];
    this.startPoint[0] = this.tracker[0].getXYAsVector2(0);
    this.startPoint[1] = this.tracker[1].getXYAsVector2(0);
    this.startPoint[2] = this.tracker[2].getXYAsVector2(0);
    this.getXY = function(currentTime, uniforms) {
        uniforms.u3p1.value = that.startPoint[0];
        uniforms.u3q1.value = that.startPoint[1];
        uniforms.u3r1.value = that.startPoint[2];
        uniforms.u3p2.value = 
            that.tracker[0].getXYAsVector2(currentTime);
        uniforms.u3q2.value = 
            that.tracker[1].getXYAsVector2(currentTime);
        uniforms.u3r2.value = 
            that.tracker[2].getXYAsVector2(currentTime);
    }
    this.reset = function() {
        this.tracker[0].reset();        
        this.tracker[1].reset();        
        this.tracker[2].reset();        
    }
}
// from https://stackoverflow.com/a/36481059
var _randn_bm_count = 0;
function randn_bm() {
    _randn_bm_count++;
    if (_randn_bm_count%50 != 0) return 0;
    var u = Math.random();
    var v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}
function threePointTrackerRandomWalk(fileWithCoordinates) {
    var that = this;
    this.startPoint = [];
    this.startPoint[0] = new THREE.Vector2(0., 0.5);
    this.startPoint[1] = new THREE.Vector2(0.33, 0.5);
    this.startPoint[2] = new THREE.Vector2(0.66, 0.5);
    this.firstTime = true;
    this.getXY = function(currentTime, uniforms) {
        uniforms.u3p1.value = that.startPoint[0];
        uniforms.u3q1.value = that.startPoint[1];
        uniforms.u3r1.value = that.startPoint[2];
        if (that.firstTime) {
            that.firstTime = false;
            uniforms.u3p2.value = that.startPoint[0];
            uniforms.u3q2.value = that.startPoint[1];
            uniforms.u3r2.value = that.startPoint[2];        
        }
        else {
            uniforms.u3p2.value = new THREE.Vector2(
                (uniforms.u3p2.value.x + (Math.random()-.25)/200.0)%1.0,
                (uniforms.u3p2.value.y + randn_bm()/200.0)%1.0
            );
            uniforms.u3q2.value = new THREE.Vector2(
                (uniforms.u3q2.value.x - (Math.random()-.25)/200.0)%1.0,
                (uniforms.u3q2.value.y + randn_bm()/200.0)%1.0
            );
            uniforms.u3r2.value = new THREE.Vector2(
                (uniforms.u3r2.value.x + 3*(Math.random()-.25)/200.0)%1.0,
                (uniforms.u3r2.value.y + randn_bm()/200.0)%1.0
            );
        }
    }
    this.reset = function() {
    }
}
// ========
// For tracking a single person
// ========
var _trackerUtilsFileName = "tubes/woman1WhiteShirt.json";
function trackerUtils(filename) {
    var that = this;
    this.previousCoord = undefined;
    var data = $.ajax({
        type: "GET",
        url: filename,
        async: false
    }).responseText;
    this.getCoords = function(index) {
        // this should be the only place the coords structure is accessed.
        var scale = 2.0;
        return [
            that._coords[index][0]/scale,
            that._coords[index][1]/scale,
            that._coords[index][2],
        ];
    }
    that._coords = JSON.parse(data);
    that.previousCoord = that.getCoords(0);
    that.coordIndex = 0;
    this.reset = function() {
        that.previousCoord = that.getCoords(0);
        that.coordIndex = 0;
    }
    this.getXYAsVector2 = function(currentTime) {
        var coords = this.getXY(currentTime);
        return new THREE.Vector2(coords[0], coords[1]);
    }
    this.getXY = function(currentTime) {
        while ( that.coordIndex < that._coords.length-1) {
            var coord = that.getCoords(that.coordIndex);
            if (coord[2] > currentTime) {
                if (that.previousCoord[2] == coord[2])
                    return coord;
                return this.lerp(that.previousCoord, coord, currentTime);
            }
            that.previousCoord = coord;
            that.coordIndex++;
        }
        return that.getCoords(that._coords.length-1);
    }    
    this.lerp = function(pc, c, ct) {
        var fullIntervalLength = c[2] - pc[2];
        var partialIntervalLength = ct - pc[2];
        var factor = partialIntervalLength/fullIntervalLength;

        // remember this is 360. take the shortest route between the 2 points which may 
        // mean going off the edge of the texture and back on the other side.
        if (Math.abs(c[0] - pc[0]) > .5) {
            var sign = -Math.sign(c[0] - pc[0]);
            newx = (sign + c[0] - pc[0])*factor + pc[0] + 1;    // that last 1 is not always needed, but mod takes care of it.
            newx = newx%1;
        }
        else
            newx = (c[0] - pc[0])*factor + pc[0];

        if (Math.abs(c[1] - pc[1]) > .5) {
            var sign = -Math.sign(c[1] - pc[1]);
            newy = (sign + c[1] - pc[1])*factor + pc[1] + 1;    // that last 1 is not always needed, but mod takes care of it.
            newy = newy%1;
        }
        else
            newy = (c[1] - pc[1])*factor + pc[1];


        return [newx, newy, ct];
    }
}