/**
puts a set of flat divs over your page for managing media.
and sets up the globe.

User might want to:
- draw on different/multiple scenes
- pre-process, post-process textures on each frame
- add their own icons

**/ 
function mediaUtils(scene, camera, stills, videos, 
	   mediaListContainerId, cameraControlsContainerId, videoControlsContainerId,
       onSpaceBarClick) {
	var that = this;
	this.stills = stills;
	this.videos = videos;
	this.mediaListContainerId = mediaListContainerId;
	this.cameraControlsContainerId = cameraControlsContainerId;
	this.videoControlsContainerId = videoControlsContainerId;

	this.camera = camera;
	this.scene = scene;

	this.video = document.getElementById("video");
	this.videoTexture = undefined; 
	this.videoSource = "";
    this.videoDisplayed = false;
    this.rotateYAmount = 0;
    this.rotateXAmount = 0;
    this.FOV = 90;
    this.onSpaceBarClick = onSpaceBarClick;

    this.controlPanelVisible = true;
	document.body.onkeyup = function(e){
        if(e.keyCode == 32) {
            that.toggleControlPanel();
            if (that.onSpaceBarClick != undefined) that.onSpaceBarClick();
        }
    }
;
    this.showToast = function(message, ms) {
        var options = {
            settings: {
                duration: ms
            }
        };        
        this.toast = new iqwerty.toast.Toast(message, options);
    }

    this.initMediaUtils = function() {
	    that.initSkyBox();
	    that.initVideo();
	    that.toggleControlPanel();
	    that.setupMediaIcons();
	    that.setupCameraControlIcons();
	    that.setupVideoControlIcons();
        that.toggleVideoControls();
        that.updateSkyDomeForFileName(myTextures[0]);
        //that.updateVideoForFileName(myVideos[0]);
        that.setInitialCameraPosition();
	}
    this.setInitialCameraPosition = function() {
        that.camera.position.x = -1; that.camera.position.y = 0.0; that.camera.position.z = 0;   
    }
    this.setupMediaIcons = function() {
        var textureListHTML = document.getElementById(that.mediaListContainerId).innerHTML;
        for (var i = 0; i < myTextures.length; i++)
            textureListHTML += "<span id='textureSelector_xxx' class='showhide tselector'>xxx</span>".replace(/xxx/g, myTextures[i]);

        for (var i = 0; i < myVideos.length; i++)
            textureListHTML += "<span id='textureSelector_xxx' class='showhide vselector'>xxx</span>".replace(/xxx/g, myVideos[i]);
        
        document.getElementById(that.mediaListContainerId).innerHTML = textureListHTML;

        $('.tselector').click(that.updateSkyDome);
        $('.vselector').click(that.updateVideo);
    }
    this.setupVideoControlIcons = function() {
    	var container = document.getElementById(that.videoControlsContainerId);
    	appendSingleIcon(container, 'videoControlIcon', 'rewind', 'Video Back', that.video_rewind);
    	appendSingleIcon(container, 'videoControlIcon', 'play', 'Video Play', that.video_play);
    	appendSingleIcon(container, 'videoControlIcon', 'stop', 'Video Stop', that.video_stop);
    	appendSingleIcon(container, 'videoControlIcon', 'ff', 'Video Forward', that.video_ff);
    	appendSingleIcon(container, 'videoControlIcon', 'replay', 'Video Restart', that.video_restart);
    }
    this.setupCameraControlIcons = function() {
    	var container = document.getElementById(that.cameraControlsContainerId);
    	appendSingleIcon(container, 'cameraControlIcon', 'left', 'Camera Left', that.cameraLeft);
    	appendSingleIcon(container, 'cameraControlIcon', 'up', 'Camera Up', that.cameraUp);
    	appendSingleIcon(container, 'cameraControlIcon', 'down', 'Camera Down', that.cameraDown);
    	appendSingleIcon(container, 'cameraControlIcon', 'right', 'Camera Right', that.cameraRight);
    	appendSingleIcon(container, 'cameraControlIcon', 'stop', 'Camera Stop', that.cameraStop);
        appendSingleIcon(container, 'cameraControlIcon', 'flipCamera', 'Flip Camera', that.flipCamera);
        appendSingleIcon(container, 'cameraControlIcon', 'fovNarrow', 'Smaller Viewport', that.narrowFOV);
        appendSingleIcon(container, 'cameraControlIcon', 'fovWide', 'Wider Viewport', that.widerFOV);
    }
    function appendSingleIcon(containerEl, style, png, title, callback) {
    	var el;
    	el = document.createElement('span');
    	el.innerHTML = "<img src='icons/xxx.png' title=\"yyy\" class='showhide zzz'></img>"
    		.replace('xxx', png).replace('yyy', title).replace('zzz', style);
    	$(el).click(callback);
    	containerEl.appendChild(el);
    }
	this.toggleControlPanel = function() {
    	that.controlPanelVisible = !that.controlPanelVisible;
    	if (that.controlPanelVisible) {
            $('.showhide').hide();
            // $('#' + that.mediaListContainerId).hide();
			// $('#' + that.videoControlsContainerId).hide();
   //          $('#' + that.cameraControlsContainerId).hide();
		}
		else {
            $('.showhide').show();
			// $('#' + that.mediaListContainerId).show();
			// $('#' + that.videoControlsContainerId).show();
			// $('#' + that.cameraControlsContainerId).show();
		}
	}
	this.toggleVideoControls = function() {
		if (that.videoDisplayed)
			$('#' + that.videoControlsContainerId).show();
		else {
			$('#' + that.videoControlsContainerId).hide();
			that.video_stop();
		}
	}
	this.animate = function(cameraVectorLength) {
        if (that.plane.visible) {
            that.setInitialCameraPosition();
            that.camera.position.x *=-1;
        }
        else {
    		var unitVector = (new THREE.Vector3())
                .copy(that.camera.position)
                .normalize()
                .multiplyScalar(cameraVectorLength);
            that.camera.position.set(unitVector.x, unitVector.y, unitVector.z);
            that.camera.lookAt(new THREE.Vector3(0,0,0));
            rotateCameraY(that.camera, that.rotateYAmount);
            rotateCameraUpDown(that.camera, that.rotateXAmount);
        }

		if (that.videoDisplayed &&  that.video.readyState === that.video.HAVE_ENOUGH_DATA ) {
		  if (that.videoTexture) that.videoTexture.needsUpdate = true;
		}		
	}
    this.updateSkyDome = function(event) {
        var pid = event.target.id.replace('textureSelector_','');
        that.updateSkyDomeForFileName(pid);
    }
    this.updateSkyDomeForFileName = function(fileName) {
        document.title = fileName;
        that.videoDisplayed = false;
        that.toggleVideoControls();
        that.video.pause();
        that.showToast("Loading '" + fileName + "'.", 2000);
        var pathToTexture = 'media/' + fileName + '.jpg';
        (new THREE.TextureLoader()).load(pathToTexture, function ( texture ) {
            var mat = that.setMaterialForTexture(texture);
            that.skyBox.material = mat;
            that.plane.material = mat;
        });
    }
    this.toggleView = function(planeVisible) {
        if (planeVisible) {
            planeOnlyView();
        }
        else {
            sphereOnlyView();
        }
    }
    function sphereOnlyView() {
        that.skyBox.visible = true;
        // that.skyBox.geometry.radius = 10;
        // that.skyBox.position.set(0,0,0);
        that.plane.visible = false;
        // that.plane.scale.set(10,10,10);
        // that.skyBox.scale.set(10,10,10);
    }
    function planeOnlyView() {
        that.skyBox.visible = false;
        // that.plane.position.set(0,0,0);
        that.plane.visible = true;
        // that.plane.scale.set(1,1,1);
    }
    // over-ride this to provide your own material,e.g. shader material:
    this.setMaterialForTexture = function(texture) {
            return new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide });            
    }
    this.initSkyBox = function() {
        var segment = 256.;
        var sphereRadius = 10;
        var skyGeometry = new THREE.SphereGeometry(sphereRadius,segment,segment);
		var newMaterial = new THREE.MeshNormalMaterial();
        that.skyBox = new THREE.Mesh( skyGeometry, newMaterial);
        that.scene.add( that.skyBox );
        that.skyBox.position.set(0,0,0);
        that.skyBox.scale.set(1,1,-1);

        // the plane is used for debuggin Mobius transforms and is hidden most of the time.
        var planeGeometry = new THREE.PlaneBufferGeometry( sphereRadius/8, sphereRadius/8, segment, segment );
        that.plane = new THREE.Mesh( planeGeometry, newMaterial );
        that.plane.rotateY(Math.PI/2);
        that.plane.visible = false;
        that.scene.add( that.plane );

    }
    this.initVideo = function() {
        that.video  = document.getElementById('video');
        that.videoSource = document.createElement('source');
        that.video.appendChild(that.videoSource);
    }
	this.updateVideo = function(event) {
    	var pid = event.target.id.replace('textureSelector_','');
        that.updateVideoForFileName(pid);
    }
    this.updateVideoForFileName = function(pid) {
        that.videoFileName = pid;
        console.log('in video: ' + pid);
        document.title = pid;
        var pathToTexture = 'media/' + pid + '.mp4';

        that.videoSource.setAttribute('src', pathToTexture);
        that.video.load();

        that.videoTexture = new THREE.Texture(that.video);
        that.videoTexture.minFilter = THREE.LinearFilter;
        that.videoTexture.magFilter = THREE.LinearFilter;
        that.videoTexture.generateMipmaps = false;
        that.video.pause();     
        that.video.play();

        that.videoTexture.minFilter = THREE.LinearFilter;   // eliminates aliasing when tiling textures.
        var videoMaterial = that.setMaterialForTexture(that.videoTexture);
        that.skyBox.material = videoMaterial;
        that.plane.material = videoMaterial;
        that.videoDisplayed = true;
        that.toggleVideoControls();
	}
    this.video_play = function() {
        // all this messing around to avoid a chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=593273
        console.log("1 Is video paused? " + that.video.paused);
        that.video.pause();             
        setTimeout(function () {      
            that.video.pause();             
            console.log("2 Is video paused? " + that.video.paused);
		that.video.play();
            console.log("3 Is video paused? " + that.video.paused);
        }, 150);
    }
    this.video_stop = function() {
		that.video.pause();    	
    }
    this.video_restart = function() {
        that.video.pause();
        that.video.currentTime = 0;
        // that.updateVideoForFileName(that.videoFileName);
		that.video_play();
    }
    this.video_skip = function(value) {
        that.video.currentTime += value;
    }
    this.video_rewind = function() {
    	that.video_skip(-10);
    }
    this.video_ff = function() {
    	that.video_skip(10);
    }
    this.cameraLeft = function() {
        that.rotateYAmount -= 0.002;
    }  
    this.cameraRight = function() {
        that.rotateYAmount += 0.002;
    }  
    this.cameraUp = function() {
        that.rotateXAmount -= 0.002;
    }  
    this.cameraDown = function() {
        that.rotateXAmount += 0.002;
    }  
    this.cameraStop = function() {
        that.rotateYAmount = 0.;
        that.rotateXAmount = 0.;
    }  
    this.flipCamera = function() {
    	that.camera.position.x = - that.camera.position.x;
    	that.camera.position.y = - that.camera.position.y;
    	that.camera.position.z = - that.camera.position.z;
    }
    this.narrowFOV = function() {
        that.FOV += 15;
        that.camera.fov = that.FOV;
        that.camera.updateProjectionMatrix();
    }
    this.widerFOV = function() {
        that.FOV -= 15;
        that.camera.fov = that.FOV;
        that.camera.updateProjectionMatrix();
    }
    this.initMediaUtils();
}