// This project should have a set of textureProduces and textureConsumers.
// This produces a texture backed by a video stream.
// The python server produces an MJPEG stream. This has to be consumed in a different way from normal video
// streams. Hence this class. It uses a context and an IMG tag.
var _streamSourceObject;
function streamSource() {
    var that = this;
    that.canvas2d = document.getElementById('2d')
    that.ctx = that.canvas2d.getContext("2d")
    that.texture = new THREE.Texture(that.canvas2d)
//    const material = new THREE.MeshBasicMaterial({ map: that.texture })
    that.img = document.createElement('img');
    that.streaming = false;
    that.setStreamSourceFromPid = function(pid, textureConsumers) {
        that.img.src = pid;             // "/video_feed";
        for (var index in textureConsumers) {
            textureConsumers[index](that.texture);
        }
        that.streaming = true;
    }
    that.animate = function() {
        if (that.streaming) {
            that.ctx.drawImage(that.img, 0, 0);
            that.texture.needsUpdate = true;
        }
    }
    that.stopStreaming = function() {
        console.log("=====STOPPING STREAM=========");
        if (that.streaming)
            that.img.src = null;     // not sure if this is the 'official' way to stop a stream but it works.
        that.streaming = false;
    }
}
//function startStreamSource(pid, pidType, textureConsumers) {
//    if (_streamSourceObject == null) {
//        _streamSourceObject = new streamSource(textureConsumers);
//    }
//    _streamSourceObject.setStreamSourceFromPid(pid, pidType);
//}
//function stopStreaming() {
//    _streamSourceObject.stopStreaming();
//}