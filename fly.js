function flight(clock) {
    this.clock = clock; 
    var that = this;
    this.startDelta = clock.getElapsedTime();
    this.started = false;
    this.uniforms = null;
    this.start = function(uniforms) {
        that.startDelta = that.clock.getElapsedTime();
        that.started = true;
        that.uniforms = uniforms;
    }
    this.shareGlobalObjects = function(mediaUtils, transformUtils) {
        this.mediaUtils = mediaUtils;
        this.transformUtils = transformUtils;    
    }
    this.update = function() {
        if (!that.started) return;
        var delta = that.clock.getElapsedTime();
        var elapsed = delta - that.startDelta;
        that.flight1(elapsed, that.mediaUtils, that.transformUtils);
    }
    this.stop = function() {
        that.started = false;
    }
    this.toggleStartStop = function() {
        if (this.started)
            this.stop();
        else
            this.start();
    }
    this.flight1 = function(elapsed, mu, tu) {
        if (elapsed < 1.) {
            console.log("No flight defined. doing nothing");
            return;
        }
    }
    this.runCounters = {};
    this.runAt = function(elapsed, runtime, numTimes) {
        if (elapsed < runtime) return false;
        if (that.runCounters.hasOwnProperty(runtime)) {
            var obj = that.runCounters[runtime];
            if (obj.counter >= obj.numTimes)
                return false;
        }
        else {
            obj = {
                'numTimes': numTimes,
                'counter': 0
            };
            that.runCounters[runtime] = obj;                
        }
        obj.counter++;
        console.log("Running task scheduled for after " + runtime);
        return true;
    }
}