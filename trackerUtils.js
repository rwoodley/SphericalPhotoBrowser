function trackerUtils() {
    var that = this;
    this.coords = [];
    this.coordsIndex = 0;
    $.get( "tubes/woman1WhiteShirt.json", function( data ) {
        that.coords = data;
        that.coordIndex = 0;
    });
    this.getXY = function(currentTime) {
        if (that.coordIndex >= that.coords.length)
            return that.coords[that.coords.length-1];
        var coord = that.coords[that.coordIndex];
        while (coord[2] < currentTime && that.coordIndex < that.coords.length) {
            that.coordIndex++;
            coord = that.coords[that.coordIndex];
        }
        return that.coords[that.coordIndex];
    }    
}