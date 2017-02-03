/**
puts a set of flat divs over your page for managing media.
and sets up the globe.

User might want to:
- draw on different/multiple scenes
- pre-process, post-process textures on each frame
- add their own icons

**/ 
function mediaUtils(canned, scene, camera, stills, videos, 
	   mediaListContainerId, cameraControlsContainerId, videoControlsContainerId,
       rightClickHandler, addEffects) {
	var that = this;
    this.canned = canned;
	this.stills = stills;
	this.videos = videos;
    this.addEffects = addEffects;
	this.mediaListContainerId = mediaListContainerId;
	this.cameraControlsContainerId = cameraControlsContainerId;
	this.videoControlsContainerId = videoControlsContainerId;
    this.rightClickHandler = rightClickHandler;

	this.camera = camera;
	this.scene = scene;

	this.video = document.getElementById("video");
	this.videoTexture = undefined; 
	this.videoSource = "";
    this.videoDisplayed = false;
    this.rotateZAmount = 0;
    this.rotateYAmount = 0;
    this.rotateXAmount = 0;
    this.FOV = 90;
    this.onkeydown = undefined;     // this gets defined by transformUtils... 
    this.material = new THREE.MeshNormalMaterial();
    this.geoIndex = 0;

    this.controlPanelVisible = true;
    this.extraKey = 0;
	document.body.onkeyup = function(e){
        if (e.keyCode == 16 || e.keyCode == 17)
            this.extraKey = 0;
    }
	document.body.onkeydown = function(e){
        //if (!that.canned.createMode) return;
        console.log(e.keyCode);
        if (e.keyCode == 16 || e.keyCode == 17) // shift & ctrl, respectively...
            this.extraKey = e.keyCode;
        else {
            if(e.keyCode == 32) {
                that.toggleControlPanel();
            }
            if (that.onkeydown != undefined) that.onkeydown(e, this.extraKey);
        }
    };

    this.initMediaUtils = function() {
	    that.initVideo();
	    that.setupMediaIcons();
	    that.setupCameraControlIcons();
	    that.setupVideoControlIcons();
        that.toggleVideoControls();
        that.setInitialCameraPosition();
	};
    this.doneLoadingConfig = function() {
        var meshListHTML = document.getElementById('meshContainerId').innerHTML;
        for (var meshName in TRANSFORM.meshInventory.reimannMeshes) {
            meshListHTML += "<span id='meshSelector_xxx' class='showhide mselector'>xxx</span>".replace(/xxx/g, meshName);
        }
        document.getElementById('meshContainerId').innerHTML = meshListHTML;
        $('.mselector').click(that.changeMeshBeingEdited);
	    that.toggleControlPanel();
    }
    this.setInitialCameraPosition = function() {
        that.camera.position.x = -1; that.camera.position.y = 0.0; that.camera.position.z = 0;   
    };
    this.setupMediaIcons = function() {
        var textureListHTML = document.getElementById(that.mediaListContainerId).innerHTML;
        for (var i = 0; i < myTextures.length; i++)
            textureListHTML += "<span id='textureSelector_xxx' class='showhide tselector'>xxx</span>".replace(/xxx/g, myTextures[i]);

        for (var i = 0; i < myVideos.length; i++)
            textureListHTML += "<span id='textureSelector_xxx' class='showhide vselector'>xxx</span>".replace(/xxx/g, myVideos[i]);

        if (that.addEffects) {
            var myEffects = ['fractalDome', 'greyOutline', 'studioOutline', 'normal','shiny','black','white'];
            for (var i = 0; i < myEffects.length; i++)
                textureListHTML += "<span id='effectSelector_xxx' class='showhide tselector'>xxx</span>".replace(/xxx/g, myEffects[i]);
        }
        document.getElementById(that.mediaListContainerId).innerHTML = textureListHTML;

        $('.tselector').click(that.updateSkyDome);
        $('.tselector').contextmenu(that.rightClickHandler);
        $('.vselector').click(that.updateVideo);
    };
    this.setupVideoControlIcons = function() {
    	var container = document.getElementById(that.videoControlsContainerId);
    	appendSingleIcon(container, 'videoControlIcon', 'rewind', 'Video Back', that.video_rewind);
    	appendSingleIcon(container, 'videoControlIcon', 'play', 'Video Play', that.video_play);
    	appendSingleIcon(container, 'videoControlIcon', 'stop', 'Video Stop', that.video_stop);
    	appendSingleIcon(container, 'videoControlIcon', 'ff', 'Video Forward', that.video_ff);
    	appendSingleIcon(container, 'videoControlIcon', 'replay', 'Video Restart', that.video_restart);

    	el = document.createElement('span');
        el.id = 'videoClock';
        el.style='width: 30px; height: 30px;';
        el.className='showhide videoControlIcon';
        container.appendChild(el);
    }
    this.setupCameraControlIcons = function() {
    	var container = document.getElementById(that.cameraControlsContainerId);
    	appendSingleIcon(container, 'cameraControlIcon', 'left', 'Camera Left', that.cameraLeft);
    	appendSingleIcon(container, 'cameraControlIcon', 'up', 'Camera Up', that.cameraUp);
    	appendSingleIcon(container, 'cameraControlIcon', 'down', 'Camera Down', that.cameraDown);
    	appendSingleIcon(container, 'cameraControlIcon', 'right', 'Camera Right', that.cameraRight);
    	appendSingleIcon(container, 'cameraControlIcon', 'rotateLeft', 'Rotate Left', that.cameraRotateLeft);
    	appendSingleIcon(container, 'cameraControlIcon', 'rotateRight', 'Rotate Right', that.cameraRotateRight);
    	appendSingleIcon(container, 'cameraControlIcon', 'stop', 'Camera Stop', that.cameraStop);
        appendSingleIcon(container, 'cameraControlIcon', 'flipCamera', 'Flip Camera', that.flipCamera);
        appendSingleIcon(container, 'cameraControlIcon', 'fovNarrow', 'Smaller Viewport', that.narrowFOV);
        appendSingleIcon(container, 'cameraControlIcon', 'fovWide', 'Wider Viewport', that.widerFOV);

    	el = document.createElement('span');
        el.style='width: 30px; height: 30px;';
        el.className='showhide cameraControlIcon';
        el.innerHTML="1920<br/>1080"
        container.appendChild(el);
    	$(el).click(screenSizeLarge);

    	el = document.createElement('span');
        el.style='width: 30px; height: 30px;';
        el.className='showhide cameraControlIcon';
        el.innerHTML="1280<br/>720"
        container.appendChild(el);
    	$(el).click(screenSizeMedium);

    	el = document.createElement('span');
        el.style='width: 30px; height: 30px;';
        el.className='showhide cameraControlIcon';
        el.innerHTML="720<br/>480"
        container.appendChild(el);
    	$(el).click(screenSizeSmall);
    }
    function screenSizeLarge() {
        document.getElementsByTagName( 'canvas' )[0].style.width = "1920px";
        document.getElementsByTagName( 'canvas' )[0].style.height = "1080px";
    }
    function screenSizeMedium() {
        document.getElementsByTagName( 'canvas' )[0].style.width = "1280px";
        document.getElementsByTagName( 'canvas' )[0].style.height = "720px";
        window.resizeTo(1280, 720)
    }
    function screenSizeSmall() {
        document.getElementsByTagName( 'canvas' )[0].style.width = "720px";
        document.getElementsByTagName( 'canvas' )[0].style.height = "480px";
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
		}
		else {
            $('.showhide').show();
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
    this.animationFrame = 0;
	this.animate = function(cameraVectorLength, videoCurrentTime) {
        this.animationFrame++;
        if (that.geoIndex == 1) {       //plane
            that.setInitialCameraPosition();
            that.camera.position.x *=-1;
        }
        else {
            if (1 ==2 && cameraVectorLength > 0 && that.geoIndex == 0) { // sphere
        		var unitVector = (new THREE.Vector3())
                    .copy(that.camera.position)
                    .normalize()
                    .multiplyScalar(cameraVectorLength);
                that.camera.position.set(unitVector.x, unitVector.y, unitVector.z);
            }
            that.camera.lookAt(new THREE.Vector3(0,0,0));
            rotateCameraY(that.camera, that.rotateYAmount);
            rotateCameraUpDown(that.camera, that.rotateXAmount);
            if (that.rotateZAmount > 0) {
                console.log("Changing Camera up!");
                that.camera.up.set(0,1,1);
            }
            that.camera.rotateZ(that.rotateZAmount+that.camera.rotation.z);
            // that.camera.rotateY(that.rotateZAmount);
            // that.camera.rotateX(that.rotateZAmount);
        }

		if (that.videoDisplayed &&  that.video.readyState === that.video.HAVE_ENOUGH_DATA ) {
          if (videoCurrentTime == undefined) videoCurrentTime = that.video.currentTime;
		  if (that.videoTexture) that.videoTexture.needsUpdate = true; 
          var timeRemaining = (that.video.duration - videoCurrentTime).toFixed(0);
          document.getElementById('videoClock').innerHTML = videoCurrentTime.toFixed(0) + '<br/>' + timeRemaining;
		}
	}
    this.updateSkyDome = function(event) {
        var pid = event.target.id.replace('textureSelector_','');
        that.updateReimannDomeForFileName(that.activeMeshName, pid, undefined);
    }
    this.initializeReimannDomeForFileName = function(meshName, filename, desiredGeoName, position, scale, rotationAxis, rotationAngle) {
        if (this.activeMeshName == undefined)
            this.activeMeshName = meshName;
        document.title = filename;
        TRANSFORM.meshInventory.newMesh(meshName, desiredGeoName, position, scale, 'reimann', rotationAxis, rotationAngle);
        this.updateReimannDomeForFileName(meshName, filename);
    }
    this.updateReimannDomeForFileName = function(meshName, filename) {
        that.videoDisplayed = false;
        that.toggleVideoControls();
        that.video.pause();
        showToast("Loading '" + filename + "'.", 2000);
        var pathToTexture = 'media/' + filename;
        (new THREE.TextureLoader()).load(pathToTexture, function ( texture ) {
            TRANSFORM.meshInventory.setTexture(meshName, texture, that.buildMaterialForTexture);
        });
    }
    this.toggleView = function(desiredGeoName) {
        TRANSFORM.meshInventory.changeGeometry(that.activeMeshName, desiredGeoName);
    }
    // over-ride this to provide your own material,e.g. shader material:
    this.buildMaterialForTexture = function(texture, meshName) {
        setMipMapOptions(texture);
        return new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide });            
    }
    this.onVideoEnded = function() {
        console.log("The video ended. I have nothing to do so I'm doing nothing. Over-ride this to do something.")
    }
    this.initVideo = function() {
        that.video  = document.getElementById('video');
        that.videoSource = document.createElement('source');
        that.video.appendChild(that.videoSource);
        that.video.addEventListener('ended', function() { that.onVideoEnded() } );
    }
	this.updateVideo = function(event) {
    	var pid = event.target.id.replace('textureSelector_','');
        that.updateReimannDomeForVideoName(that.activeMeshName, pid);
    }
    this.changeMeshBeingEditedOverridable = function(meshName) {    }    
    this.changeMeshBeingEdited = function(event) {
    	var meshName = event.target.id.replace('meshSelector_','');
        that.activeMeshName = meshName;
        that.changeMeshBeingEditedOverridable(meshName);
    }
    this.postProcessingAfterVideoLoad = function(pid) {
    }
    this.initializeReimannDomeForVideoName = function(meshName, pid, desiredGeoName, position, scale, rotationAxis, rotationAngle) {
        if (this.activeMeshName == undefined)
            this.activeMeshName = meshName;
        that.videoFileName = pid;
        document.title = pid;
        TRANSFORM.meshInventory.newMesh(meshName, desiredGeoName, position, scale, 'reimann', rotationAxis, rotationAngle);
        this.updateReimannDomeForVideoName(meshName, pid);
    }
    this.updateReimannDomeForVideoName = function(meshName, pid) {
        var pathToTexture = 'media/' + pid + '.mp4';
        console.log('loading: ' + pathToTexture);
        that.videoSource.setAttribute('src', pathToTexture);
        that.video.load();

        that.videoTexture = new THREE.Texture(that.video);
        that.video.pause();     
        that.video.play();

        TRANSFORM.meshInventory.setTexture(meshName, that.videoTexture, that.buildMaterialForTexture);
        that.videoDisplayed = true;
        that.toggleVideoControls();        
        that.postProcessingAfterVideoLoad(pid);
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
    this.postProcessingAfterVideoRestart = function() {}
    this.video_restart = function() {
        that.video.pause();
        that.video.currentTime = 0;
        // that.updateVideoForFileName(that.videoFileName);
		that.video_play();
        that.postProcessingAfterVideoRestart();
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
        that.rotateYAmount -= 0.0005;
    }  
    this.cameraRight = function() {
        that.rotateYAmount += 0.0005;
    }  
    this.cameraUp = function() {
        that.rotateXAmount -= 0.002;
    }  
    this.cameraDown = function() {
        that.rotateXAmount += 0.002;
    }  
    this.cameraStop = function() {
        that.rotateZAmount = 0.0;
        that.rotateYAmount = 0.;
        that.rotateXAmount = 0.;
    }  
    this.cameraRotateLeft = function() {
        that.rotateZAmount -= 0.2;
    }  
    this.cameraRotateRight = function() {
        that.rotateZAmount += 0.2;
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