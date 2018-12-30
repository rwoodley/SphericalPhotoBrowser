this.keyboardHandlerCamera = function(context) {
    this.context = context;

    that.handleSequence = function(seq, codes) {
        var opts = seq.substring(1);
        that.context.currentUniforms.showFixedPoints.value = 0;
        switch (seq[0]) {
            case 'L':
                that.cameraRotateLeft();
                break;
            case 'R':
                that.cameraRotateRight();
                break;
        }
    }


}
