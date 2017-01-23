function trackerUtils() {
    var that = this;
    this.coords = [];
    this.coordsIndex = 0;
    this.previousCoord = undefined;
    // $.get( "tubes/woman1WhiteShirt.json", function( data ) {
    //     that.coords = data;
    //     that.previousCoord = that.coords[0];
    //     that.coordIndex = 0;
    // });
    var data = $.ajax({
        type: "GET",
        url: "tubes/woman1WhiteShirt.json",
        async: false
    }).responseText;
    that.coords = JSON.parse(data);
    that.previousCoord = that.coords[0];
    that.coordIndex = 0;

    this.reset = function() {
        that.previousCoord = that.coords[0];
        that.coordIndex = 0;
    }
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