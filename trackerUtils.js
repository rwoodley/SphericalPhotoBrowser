function trackerUtils() {
    var that = this;
    this.coords = [];
    this.coordsIndex = 0;
    this.previousCoord = undefined;
    $.get( "tubes/woman1WhiteShirt.json", function( data ) {
        that.coords = data;
        that.previousCoord = that.coords[0];
        that.coordIndex = 0;
    });
    this.getXY = function(currentTime) {
        while ( that.coordIndex < that.coords.length-1) {
            var coord = that.coords[that.coordIndex];
            if (coord[2] > currentTime) {
                return this.lerp(that.previousCoord, coord, currentTime);
            }
            that.previousCoord = coord;
            that.coordIndex++;
        }
        return that.coords[that.coords.length-1];
    }    
    this.lerp = function(pc, c, ct) {
        var fullIntervalLength = c[2] - pc[2];
        var partialIntervalLength = ct - pc[2];
        var factor = partialIntervalLength/fullIntervalLength;
        return [
            (c[0] - pc[0])*factor + pc[0],
            (c[1] - pc[1])*factor + pc[1],
            ct
        ]
    }
}