/**
puts a set of flat divs over your page for managing media.
and sets up the globe.

User might want to:
- draw on different/multiple scenes
- pre-process, post-process textures on each frame
- add their own icons

**/ 
function mediaUtils(canned, scene,
	   mediaListContainerId, cameraControlsContainerId, videoControlsContainerId,
       rightClickHandler, addEffects) {
	var that = this;
	this.currentPathToSkyDomeTexture = 'placeHolderStill.png';
    this.canned = canned;
    this.addEffects = addEffects;
	this.mediaListContainerId = mediaListContainerId;
	this.cameraControlsContainerId = cameraControlsContainerId;
	this.videoControlsContainerId = videoControlsContainerId;
    this.rightClickHandler = rightClickHandler;
    this.deviceList = {};
	this.scene = scene;

    this.onkeydown = undefined;     // this gets defined by transformUtils...
    this.material = new THREE.MeshNormalMaterial();
    this.geoIndex = 0;

    this.controlPanelVisible = true;
    this.extraKey = 0;
	document.body.onkeyup = function(e){
        if (e.keyCode == 16 || e.keyCode == 17  || e.keyCode == 18) {
            that.extraKey = 0;
        }
    }
	document.body.onkeydown = function(e){
        //if (!that.canned.createMode) return;
        console.log(e.keyCode);
        if (e.keyCode == 16 || e.keyCode == 17 || e.keyCode == 18) { // shift & ctrl & alt, respectively...
            that.extraKey = e.keyCode;
        }
        else {
            if(e.keyCode == 32) {
                that.toggleControlPanel();
            }
            if (that.extraKey == 16) {  // shift key
                if (e.keyCode == 49)     // '1'
                    that.toggleShowPanel('.tselector');
                if (e.keyCode == 50)     // '2'
                    that.toggleShowPanel('.vselector');
                if (e.keyCode == 51)     // '3'
                    that.toggleShowPanel('.eselector');
            }
            if (that.onkeydown != undefined) that.onkeydown(e, that.extraKey);
        }
    };

    this.initMediaUtils = function() {
	    that.videoManager = new videoManager(that);
	    that.setupMediaIcons();
	    that.setupCameraControlIcons();
	    that.setupVideoControlIcons();
        that.toggleVideoControls();
	};
    this.doneLoadingConfig = function() {
        var meshListHTML = document.getElementById('meshContainerId').innerHTML;
        for (var meshName in TRANSFORM.meshInventory.reimannMeshes) {
            meshListHTML += "<span id='meshSelector_xxx' class='showhide mselector'>xxx</span>".replace(/xxx/g, meshName);
        }
        document.getElementById('meshContainerId').innerHTML = meshListHTML;
        $('.mselector').click(that.changeMeshBeingEdited);
        if (that.canned.hideAllControls) {
            that.toggleControlPanel();
            that.hideAllControls();
        }
    }
    this.setupMediaIcons = function() {
        var textureListHTML = document.getElementById(that.mediaListContainerId).innerHTML;
        for (var i = 0; i < myTextures.length; i++)
            textureListHTML += "<span id='textureSelector_xxx' class='showhide tselector'>xxx</span>".replace(/xxx/g, myTextures[i]);

        for (var i = 0; i < myVideos.length; i++)
            textureListHTML += "<span id='textureSelector_xxx' class='showhide vselector'>xxx</span>".replace(/xxx/g, myVideos[i]);

        if (that.addEffects) {
            var myEffects = ['greyOutline', 'normal','transparent','phong'];
            for (var i = 0; i < myEffects.length; i++)
                textureListHTML += "<span id='effectSelector_xxx' class='showhide eselector'>xxx</span>".replace(/xxx/g, myEffects[i]);
        }

        // add streams.
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            // find the theta uvc blender device
            for (var i in devices) {
                // console.log(devices[i]);
                var device = devices[i];
                if (device.kind === "videoinput") {
                    that.deviceList[i] = device;
                    textureListHTML += "<span id='streamSelector_$1' class='showhide sselector'>xxx</span>"
                    .replace('$1', i)
                    .replace(/xxx/, device.label);
                    console.log(device.label);
                }
            }

            // and... finish setup.
            document.getElementById(that.mediaListContainerId).innerHTML = textureListHTML;
            
            $('.tselector').click(that.updateSkyDome);
            $('.eselector').click(that.updateSkyDome);
            $('.tselector').contextmenu(that.rightClickHandler);
            $('.eselector').contextmenu(that.rightClickHandler);
            $('.sselector').click(that.updateVideo);
            $('.vselector').click(that.updateVideo);
        });

    };
    this.setupVideoControlIcons = function() {
    	var container = document.getElementById(that.videoControlsContainerId);
    	el = document.createElement('span');
        el.id = 'videoMeshName';
        el.style='width: 130px; height: 30px;';
        el.className='showhide videoControlIcon';
        container.appendChild(el);

    	appendSingleIcon(container, 'videoControlIcon', 'rewind', 'Video Back', that.videoManager.video_rewind);
    	appendSingleIcon(container, 'videoControlIcon', 'play', 'Video Play', that.videoManager.video_play);
    	appendSingleIcon(container, 'videoControlIcon', 'stop', 'Video Stop', that.videoManager.video_stop);
    	appendSingleIcon(container, 'videoControlIcon', 'ff', 'Video Forward', that.videoManager.video_ff);
    	appendSingleIcon(container, 'videoControlIcon', 'replay', 'Video Restart', that.videoManager.video_restart);

        el = document.createElement('span');
        el.id = 'videoClock';
        el.style='width: 30px; height: 30px;';
        el.className='showhide videoControlIcon';
        container.appendChild(el);
    }
    this.setupCameraControlIcons = function() {
    	var container = document.getElementById(that.cameraControlsContainerId);
    	appendSingleIcon(container, 'cameraControlIcon', 'left', 'Camera Left', TRANSFORM.camera.cameraLeft);
    	appendSingleIcon(container, 'cameraControlIcon', 'up', 'Camera Up', TRANSFORM.camera.cameraUp);
    	appendSingleIcon(container, 'cameraControlIcon', 'down', 'Camera Down', TRANSFORM.camera.cameraDown);
    	appendSingleIcon(container, 'cameraControlIcon', 'right', 'Camera Right', TRANSFORM.camera.cameraRight);
    	appendSingleIcon(container, 'cameraControlIcon', 'rotateLeft', 'Rotate Left', TRANSFORM.camera.cameraRotateLeft);
    	appendSingleIcon(container, 'cameraControlIcon', 'rotateRight', 'Rotate Right', TRANSFORM.camera.cameraRotateRight);
    	appendSingleIcon(container, 'cameraControlIcon', 'stop', 'Camera Stop', TRANSFORM.camera.cameraStop);
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
    this.hideAllControls = function() {
        $('.showhide').hide();
        $('.tselector').hide();
        $('.vselector').hide();
        $('.eselector').hide();
        $('#mediaListContainer').hide();    // only way I could hide icons on start,
        $('.dg.ac').hide();
        that.toggleMap['.tselector'] = false;
        that.toggleMap['.vselector'] = false;
        that.toggleMap['.sselector'] = false;
    }
	this.toggleControlPanel = function() {
    	that.controlPanelVisible = !that.controlPanelVisible;
        if (that.controlPanelVisible) {
            $('.showhide').hide();
            $('.dg.ac').hide();
		}
		else {
            $('.showhide').show();
            $('.tselector').hide();
            $('#mediaListContainer').show();    // needed to hide all on start.
            $('.dg.ac').show();
        }
        TRANSFORM.loadDatGuiStuff();          
    }
    this.toggleMap = {};
    this.toggleShowPanel = function(panelName) {
        var isVisible;
        if (!that.toggleMap.hasOwnProperty(panelName)) {
            isVisible = that.toggleMap[panelName] = true;
        }
        else {
            isVisible = that.toggleMap[panelName];
            that.toggleMap[panelName] = !isVisible;
            isVisible = that.toggleMap[panelName];
        }
        if (isVisible) {
            $(panelName).hide();
        }
        else {
            $(panelName).show();
            $('#mediaListContainer').show();    // needed to hide all on start.
        }
    
    }
	this.toggleVideoControls = function() {
			$('#' + that.videoControlsContainerId).show();
	}
    this.animationFrame = 0;
	this.animate = function(cameraVectorLength, videoCurrentTime) {
        this.animationFrame++;
        if (that.geoIndex == 1) {       //plane
            TRANSFORM.camera.camera.position.x *=-1;
        }
        else {
            TRANSFORM.meshInventory.morphFunction(this.animationFrame);
            for (var verticalMirrorName in _verticalMirror)
                _verticalMirror[verticalMirrorName].render();

            TRANSFORM.camera.animate();
        }
        var obj = that.videoManager.animate(that.activeMeshName);
        if (obj.str != undefined)
            document.getElementById('videoClock').innerHTML = obj.str;
        if (obj.meshName != undefined)
            document.getElementById('videoMeshName').innerHTML = obj.meshName;
    }
    this.updateSkyDome = function(event) {  // this should be called updateTextureForActiveMesh
        var pid;
        if (event.target.id.indexOf('textureSelector_') > -1) {
            var pid = event.target.id.replace('textureSelector_','');
            that.updateReimannDomeForFileName(that.activeMeshName, pid, undefined);
        }
        else {
            pid = event.target.id.replace('effectSelector_','');
            var mesh = TRANSFORM.meshInventory.meshes[that.activeMeshName];
            // #TODO: more effects. 
            mesh.setMaterial(function(texture, meshName) { 
                return getMaterialForName(pid);
            });
        
        }
    }
    this.initializeReimannDomeForFileName = function(meshName, filename, desiredGeoName, position, scale, rotationAxis, rotationAngle) {
        if (this.activeMeshName == undefined)
            this.activeMeshName = meshName;
        TRANSFORM.meshInventory.newMesh(meshName, desiredGeoName, position, scale, 'reimann', rotationAxis, rotationAngle);
        this.updateReimannDomeForFileName(meshName, filename);
    }
    this.updateReimannDomeForFileName = function(meshName, filename) {
        that.videoManager.unloadVideos();
        that.toggleVideoControls();
        showToast("Loading '" + filename + "'.", 2000);
        var pathToTexture = 'media/' + filename;
        that.currentPathToSkyDomeTexture = pathToTexture;
        (new THREE.TextureLoader()).load(pathToTexture, function ( texture ) {
            console.log("updateReimannDomeForFileName: loading texture");
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
	this.updateVideo = function(event) {
        if (event.target.id.indexOf('textureSelector_') > -1) {
            var pid = event.target.id.replace('textureSelector_','');
            showToast("Loading Video '" + pid + "'.", 2000);
            that.updateReimannDomeForVideoName(that.activeMeshName, pid, "video");
        }
        else if (event.target.id.indexOf('streamSelector_') > -1) {
            var id = event.target.id.replace('streamSelector_','');
            var pid = that.deviceList[id].label;
            showToast("Loading Stream '" + pid + "'.", 2000);
            that.updateReimannDomeForVideoName(that.activeMeshName, pid, "stream");
        }
    }
    this.changeMeshBeingEditedOverridable = function(meshName) {    }    
    this.changeMeshBeingEdited = function(event) {
    	var meshName = event.target.id.replace('meshSelector_','');
        that.activeMeshName = meshName;
        that.changeMeshBeingEditedOverridable(meshName);
    }
    this.initializeReimannDomeForVideoName = function(
            meshName,
            pid,
            desiredGeoName,
            position,
            scale,
            rotationAxis,
            rotationAngle, pidType)
    {
        if (this.activeMeshName == undefined)
            this.activeMeshName = meshName;
        TRANSFORM.meshInventory.newMesh(meshName, desiredGeoName, position, scale, 'reimann', rotationAxis, rotationAngle);
        this.updateReimannDomeForVideoName(meshName, pid, pidType);
    }
    this.updateReimannDomeForVideoName = function(meshName, pid, pidType) {
        var textureConsumers = [function(videoTexture) {
            TRANSFORM.meshInventory.setTexture(meshName, videoTexture, 
                that.buildMaterialForTexture);
        }];
        if (pidType == 'stream') {
            that.videoManager.makeStream(meshName, pid, textureConsumers, "stream");
        }
        else {
            that.videoManager.addVideo(meshName, pid, textureConsumers, "video");
            that.toggleVideoControls();            
        }
	}
    this.initMediaUtils();
}