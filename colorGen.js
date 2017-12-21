function colorGen(start, stop, nStep) {
    var that = this;
    that.start = start;
    that.stop = stop;
    that.nStep = nStep;
    that.currentStep = 0;
    // that.scale = chroma.scale([start, stop]);
    that.scale = chroma.scale('RdYlBu');
    that.nextColor = function() {
        that.currentStep++;
        that.currentStep = that.currentStep%that.nStep;
        return that.scale(that.currentStep/that.nStep).rgb();
    }
}