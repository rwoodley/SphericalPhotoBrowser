initCanvasTextureStuff = function() {
    var self = this;
    this.go = function(onReadyCB) {
        // this kicks everything off.
        var that = this;
        _canvasWidth = canvas.width;
        _canvasHeight = canvas.height;
        self.generator = new generator(onReadyCB);
    };
    this.getCanvas = function() {
        return self.generator.canvas;
    }
};
generator = function(onReadyCB) {
    var PI = Math.PI;
    var self = this;
    this.onReadyCB = onReadyCB;
    this.canvas = document.getElementById('canvas');
    this.ctx = canvas.getContext('2d');
    this.cartesianToPolar = function(x,y,z) {
        var theta;
        var phi;
        phi = Math.atan2(y, x);
        //phi -= (PI/2.0);    // this correction lines up the UV texture nicely.
        if (phi <= 0.0) {
            phi = phi + PI*2.0; 
        }
        if (phi >= (2.0 * PI)) {    // allow 2PI since we gen uv over [0,1]
            phi = phi - 2.0 * PI;
        }
        // phi = 2. * PI - phi;        // flip the texture around.
        theta = Math.acos(z);
        return [phi, theta];
    }
    this.uvToComplex = function(u,v) {
        var theta;
        var phi;
        var x;
        var y;
        var z;
        // uv.x = clamp(uv.x,0.001,.999);
    
        // convert from uv to polar coords
        theta = (1.0-v) * PI;
        phi = PI * 2.0 * u+PI;
    
        // convert polar to cartesian. Theta is polar, phi is azimuth.
        x = Math.sin(theta)*Math.cos(phi);
        y = Math.sin(theta)*Math.sin(phi);
        z = Math.cos(theta);
    
        // x,y,z are on the unit sphere.
        // if we pretend that sphere is a riemann sphere, then we
        // can get the corresponding complex point, a.
        // http://math.stackexchange.com/questions/1219406/how-do-i-convert-a-complex-number-to-a-point-on-the-riemann-sphere
    
        // we added the PI to phi above to make the Y axis correspond with
        // the positive imaginary axis and the X axis correspond with
        //  the positive real axis. So flip y and x around in this next equation.
        return new complex(x/(1.0-z), y/(1.0-z));
    }
    this.complexToUV = function(inx,iny) {
        // now c back to sphere.
        var theta;
        var phi;
        var x;
        var y;
        var z;
        var denom = 1.0 + inx * inx + iny * iny;
        x = 2.0 * inx/denom;
        y = 2.0 * iny/denom;
        z = (inx*inx + iny*iny - 1.0)/denom;
        // console.log(x,y,z);

        // convert to polar
        var polarCoords = self.cartesianToPolar(x,y,z);
        phi = polarCoords[0];
        theta = polarCoords[1];
        // console.log(phi, theta);

        // now get uv in new chart.
        var newv = 1-theta/PI;
        var newu = (phi-PI)/(2.0 * PI);
        if (newu < 0.) newu = newu + 1.0;
        return [newu, newv];
    }
    this.drawGrid = function() {
        for (i = 0; i < self.canvasHeight; i+=10) {
        self.ctx.beginPath();
        self.ctx.moveTo(0, i);
        self.ctx.lineTo(_canvasWidth,i);
        self.ctx.stroke();
        // console.log(i);
        }
    }
    this.drawCPoint = function(x,y) {
        var xpt = this.xform(new complex(x,y));
        var pt = self.complexToUV(xpt.x,xpt.y);
        self.ctx.beginPath();
        // console.log(pt[0],pt[1]);
        self.ctx.arc(
        pt[0]*_canvasWidth, 
        pt[1]*_canvasHeight,
        10,2*Math.PI, false);
        self.ctx.fill();
    }
    this.uvToCanvas = function(pt) {
        return [pt[0]*_canvasWidth, pt[1]*_canvasHeight];
    }
    this.drawCline = function(x1,y1,x2,y2) {
        self.ctx.fillStyle = 'Green';
        var m = (y2-y1)/(x2-x1);
        var iter=200
        self.ctx.strokeStyle = 'Red';
        self.ctx.beginPath();
        var incr = (x2-x1)/iter;
        var nx = x1;
        for (var i = 0; i <= iter; i++) {
        nx = nx + incr;
        // var nx = nx + Math.max(0.01,Math.abs(nx)*incr/5);
        if (nx > x2) break;
        var ny = m*nx+y1;
        // nx = Math.log(Math.abs(nx))*Math.sign(nx);
        // ny = Math.log(Math.abs(ny))*Math.sign(ny);
        var xpt = this.xform.doit(new complex(nx,ny));
        var pt = self.uvToCanvas( self.complexToUV(xpt.x,xpt.y));
        if (i == 0)
            self.ctx.moveTo(pt[0], pt[1]);
        else
            self.ctx.lineTo(pt[0], pt[1]);
        // this.drawCPoint(nx, ny);
        // console.log('--->',nx,ny);
        }
        self.ctx.stroke();
        self.ctx.strokeStyle = 'Black';
    }
    this.drawCLines = function() {
        self.xform = new xform(_one,_zero,_zero,_one);
        for (i = 0; i < 10; i++) {
        self.drawCline(-100,0.,100.,0.00);
        self.xform = new xform(
            self.xform.a.mult(_two),
            self.xform.b,
            // self.xform.b.add(_one),
            // self.xform.c.pow(_two),
            self.xform.c,
            self.xform.d
        );
        console.log(self.xform.a.x, self.xform.a.y);
        }
    }
    var img = new Image;
    img.onload = function() {
        var tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = self.canvas.width;
        tmpCanvas.height = self.canvas.height;
        var tmpCtx = tmpCanvas.getContext('2d');

        tmpCtx.drawImage(img, 0, 0, img.width,    img.height,
            0, 0, self.canvas.width, self.canvas.height);

        var imgData = tmpCtx.getImageData(0,0,canvas.width,canvas.height);
        var data = imgData.data;
        
        var oimgData = self.ctx.createImageData(imgData);
        var odata = oimgData.data;
        self.xform = new xform(_i,_zero,_i,_one);
        for(var i=0; i<data.length; i+=4) {
            var red = data[i];
            var green = data[i+1];
            var blue = data[i+2];
            var alpha = data[i+3];
            var pixel = i/4;
            var row = Math.floor(pixel/canvas.width);
            var col = pixel%canvas.width;
            var u = (1.0-row/canvas.height);
            var v = col/canvas.width;
            var complexNumber = self.uvToComplex(u, v);
            var newNumber = self.xform.doit(complexNumber);
            var uv = self.complexToUV(newNumber.x, newNumber.y);
            var uvPixels = [
                Math.round((1-uv[0])*canvas.height),
                Math.round(uv[1]*canvas.width) ];
            var index = 4*(uvPixels[0]*canvas.width + uvPixels[1]);
            if (row%100 == 0 && col == 100)
                console.log(i, index, row,col, uvPixels[0], uvPixels[1]);
            odata[index] = red;
            odata[index+1] = green;
            odata[index+2] = blue;
            odata[index+3] = alpha;
        }
        self.ctx.putImageData(oimgData, 0, 0);

        // self.drawGrid();
        //self.drawCLines();
        console.log("done drawing");
        self.onReadyCB();
    }
    img.src = '../media/C.png';
    // self.ctx.fillRect(25, 25, 100, 100);
}

