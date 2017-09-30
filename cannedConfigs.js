function simpleSkyDome(fileContainingStill) {
    return {
            'textureName': fileContainingStill,
            'textureType': 'basic',
            'geometry': 'sphere',
            'material': 'texture',
            'position': [0,0,0],
            'scale': [51,51,51],
        };
}
function phongSkyDome() {
       return {
            'textureType': 'phong',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [50,50,50],
        };    
}
function transparentSkyDome() {
       return {
            'textureType': 'transparent',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [50,50,50],
        };    
}
function normalSkyDome() {
       return {
            'textureType': 'normal',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [50,50,50],
        };    
}
function getCannedConfigs(mode, generalSettings, flightControl) {
    configs = {};
    keycontrols = undefined;
    if (mode == 'uv') {     // this is what you get by default if no mode specifed.
        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        generalSettings.cameraPosition = [-1,0,0.];     // expected by trackerUtils.
        uniforms.complexEffect3OnOff.value = 0;
        generalSettings.rotateYAmount = 0.;
         configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'still',
            'textureName': 'uv.jpg',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [1,1,-1],
        }
        // configs['skyDome'] = simpleSkyDome('eso_dark.jpg');
        configs['skyDome'] = transparentSkyDome();
        // configs['skyDome'] = simpleSkyDome('hdr1.jpg');
    }
    if (mode == 'tothTetrahedron') {
        // aligned as per Toth, page 27.

        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        var xx = -3./Math.sqrt(3.0);    // alignment specified in Toth.
        generalSettings.cameraPosition = [xx,xx,xx];
        uniforms.complexEffect3OnOff.value = 0;
        generalSettings.rotateYAmount = 0.;
         configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'tetraNormal',
            'geometry': 'tetrahedron',
            'position': [0,0,0],
            'scale': [1,1,-1],
            'rotationAxis': new THREE.Vector3( 0, 1, 0 ),
            'rotationAngle': Math.PI/2.
        }
        configs['skyDome'] = phongSkyDome();
    }
    if (mode == 'complex') {     // this is what you get by default if no mode specifed.
        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        generalSettings.cameraPosition = [-20,-10,0.];     // expected by trackerUtils.
        uniforms.uPolygonalGroups.value = 1;
        generalSettings.rotateYAmount = 0.;
         configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'still',
            'textureName': 'C.png',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [4,4,-4],
        }
        var uniforms = TRANSFORM.reimannShaderList.createShader('inner');
         configs['inner'] = {
            'uniforms': uniforms,
            'textureType': 'still',
            'textureName': 'C.png',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [1,1,-1],
        }
         // configs['skyDome'] = simpleSkyDome('hdr1.jpg');
    }
    if (mode == 'simple') {     // no riemann surface. fast startup.
        generalSettings.cameraPosition = [-20,-10,0.];     // expected by trackerUtils.
        generalSettings.rotateYAmount = 0.;
         configs['skyDome'] = simpleSkyDome('hdr1.jpg');
    }
    if (mode == 'rootFindingBot') {
        generalSettings.videoReloadDelayInSeconds = -1;
        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        generalSettings.cameraPosition = [0,39,0.];     // expected by trackerUtils.
        uniforms.complexEffect3OnOff.value = 0;
        uniforms.uNadirMask.value = 1;
        generalSettings.rotateYAmount = 0.;
         configs['default'] = {
            'uniforms': uniforms,
            // 'textureType': 'still',
            // 'textureName': 'C.png',
            'textureType': 'video',
            'textureName': 'octagon',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [4,4,-4],
        }
        configs['mirrorBall'] =
        {
            'textureType': 'mirror',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [.7,.7,.7],
        };
        configs['skyDome'] = phongSkyDome();
        flightControl.flight1 = function(elapsed, mu, tu, shouldWeRecord) {
            if (flightControl.runAt(elapsed, 0.25,1)) {
                uniforms.uPolygonalGroups.value = 0;
                generalSettings.cameraPosition = [0,39,0.];     // expected by trackerUtils.
                console.log("I'm alive.");
                document.getElementsByTagName( 'canvas' )[0].style.width = "1920px";
                document.getElementsByTagName( 'canvas' )[0].style.height = "1080px";
                mu.videoManager.video_restart();
                if (shouldWeRecord)
                    mu.videoManager.video.playbackRate = .125;     // this has to be found by trial and error. :(
                return;
            };
            if (flightControl.runAt(elapsed, 1.0,1)) {
                // the vide_restart above has a timeout, so we need to delay before starting recording.
                if (shouldWeRecord)
                    tu.startRecording();
            }
            if (flightControl.runAt(elapsed, 5.0,1)) {
                uniforms.uPolygonalGroups.value = 5;
                return;
            }
            if (flightControl.runAt(elapsed, 10.,1)) {
                uniforms.showFixedPoints.value = 0;
                tu.reimannShaderEditor.setFixedPoint(1,1,-1);
                tu.reimannShaderEditor.rotateLeft();
                tu.reimannShaderEditor.rotateLeft();
                tu.reimannShaderEditor.rotateLeft();
                return;
            }
            if (flightControl.runAt(elapsed, 30.,5)) {
                mu.cameraZoom(1.01);
                return;
            }
            if (flightControl.runAt(elapsed, 32.,1)) {
                mu.cameraZoom(1.0);
                return;
            }
            if (flightControl.runAt(elapsed, 54.,1)) {
                if (shouldWeRecord)
                    tu.stopRecording();
                flightControl.stop();
                return;
            }
        }
    }
    if (mode == 'trianglesWithSomeReflectionPlanes') {
        generalSettings.rotateYAmount = 0.;

        var uniforms = TRANSFORM.reimannShaderList.createShader('default');

        generalSettings.cameraPosition = [-20,0,0.];
        uniforms.hyperbolicTilingEffectOnOff.value = 1;
        uniforms.complexEffect3OnOff.value = 0;
        uniforms.uColorVideoMode.value = 3; // mode == 'hyperbolicTessellation' ?  2 : 3;

        configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'still',
            'textureName': 'uv.jpg',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [-1,1,1],
        };

        var uniforms = TRANSFORM.reimannShaderList.createShader('plane1a');
         configs['plane1a'] = {
            'uniforms': uniforms, 
            'textureType': 'still',
            'textureName': 'coolGradient.jpg',
            'geometry': 'plane', 
            'scale': [11,11,11],
            'position': [0,0,0],
            'rotationAxis': new THREE.Vector3( 0, 1, 0 ),
            'rotationAngle': Math.PI/4.
        }
        var uniforms = TRANSFORM.reimannShaderList.createShader('plane2a');
         configs['plane2a'] = {
            'uniforms': uniforms, 
            'textureType': 'still',
            'textureName': 'coolGradient.jpg',
            'geometry': 'plane', 
            'scale': [11,11,11],
            'position': [0,0,0],
            'rotationAxis': new THREE.Vector3( 1, 1, 0 ),
            'rotationAngle': Math.PI/4 + Math.PI/4.
        }
        var uniforms = TRANSFORM.reimannShaderList.createShader('plane3a');
         configs['plane3a'] = {
            'uniforms': uniforms, 
            'textureType': 'still',
            'textureName': 'coolGradient.jpg',
            'geometry': 'plane', 
            'scale': [11,11,11],
            'position': [0,0,0],
            'rotationAxis': new THREE.Vector3( 1, 0, 0 ),
            'rotationAngle': Math.PI/4 + Math.PI/4 + Math.PI/4
        }
    }
    if (mode == 'apollonian' ) {
        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        generalSettings.cameraPosition = [-10.8,0,0.];     // expected by trackerUtils.
        uniforms.schottkyEffectOnOff.value = 3;
        uniforms.uColorVideoMode.value = mode == 'hyperbolicTessellation' ?  2 : 3;
        generalSettings.rotateYAmount = 0.;
         configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'still',
            'textureName': 'uv.jpg',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [1,1,-1],
        }
        configs['skyDome'] = phongSkyDome();
         // configs['skyDome'] = simpleSkyDome('hdr1.jpg');
    }
    if (mode == 'drosophila') {     // this is what you get by default if no mode specifed.
        generalSettings.cameraPosition = [8.,2,0];     // expected by trackerUtils.
        generalSettings.rotateYAmount = .004;
        generalSettings.fog = true;

        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        uniforms.textureUAdjustment.value = 0.485;
        configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'still',
            'textureName': 'altesMuster.png',
            'geometry': 'floor',
            'position': [0.0,-2.5,0],
            'scale': [50,50,1],
        }
        var uniforms = TRANSFORM.reimannShaderList.createShader('plane1');
         configs['plane1'] = {
            'uniforms': uniforms, 
            'textureType': 'mirror2', 
            'geometry': 'plane', 
            'scale': [2,2,2],
            'position': [2.5,0,0],
            'rotationAxis': new THREE.Vector3( 0, 1, 0 ),
            'rotationAngle': Math.PI/2
        }

        var uniforms = TRANSFORM.reimannShaderList.createShader('plane2');
         configs['plane2'] = {
            'uniforms': uniforms, 'textureType': 'mirror2', 'geometry': 'plane', 
            'scale': [2,2,2],
            'position': [0,0,-2.5],
            'rotationAxis': new THREE.Vector3( 0, 1, 0 ),
            'rotationAngle': Math.PI
        }

        var uniforms = TRANSFORM.reimannShaderList.createShader('plane3');
         configs['plane3'] = {
            'uniforms': uniforms, 'textureType': 'mirror2', 'geometry': 'plane', 
            'scale': [2,2,2],
            'position': [0,0,2.5],
            'rotationAxis': new THREE.Vector3( 0, 1, 0 ),
            'rotationAngle': 0
        }

        var uniforms = TRANSFORM.reimannShaderList.createShader('plane4');
         configs['plane4'] = {
            'uniforms': uniforms, 'textureType': 'mirror2', 'geometry': 'plane', 
            'scale': [2,2,2],
            'position': [-2.5,0,0],
            'rotationAxis': new THREE.Vector3( 0, 1, 0 ),
            'rotationAngle': -Math.PI/2
        }

        configs['skyDome'] = phongSkyDome() ;
    }
    if (mode == 'couple2') {
      generalSettings.cameraPosition = [-8.4,3.6,10.1];
        //generalSettings.videoReloadDelayInSeconds = -1;
        var uniforms = {
            iChannelStillMask1:  { type: 't', value: 0 },
            iChannelStillMask2:  { type: 't', value: 0 },
        };
        var pathToSubtractionTexture = 'media/stillMask2.png';
        (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
            setMipMapOptions(texture);
            uniforms.iChannelStillMask1.value =  texture; 
        });
        var pathToSubtractionTexture = 'media/stillMask3.png';
        (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
            setMipMapOptions(texture);
            uniforms.iChannelStillMask2.value =  texture; 
        });
        configs['greyOutline'] = {
            'uniforms': uniforms,
            'textureType': 'outerShaderMaterial',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [50,50,50],
        }
        // this must go after sky dome so transparency works.
        var uniforms2 = TRANSFORM.reimannShaderList.createShader('default');
        uniforms2.complexEffect3OnOff.value = 1;
        uniforms2.textureScaleX.value = 2.25;
        uniforms2.textureScaleY.value = 2.25;
        configs['default'] = {
            'uniforms': uniforms2,
            'textureType': 'video',
            'textureName': 'coupleCropped',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [1,1,-1],
        }

        configs['mirrorBall'] =
        {
            'textureType': 'mirror',
            'geometry': 'sphere',
            'position': [0,-8.,0],
            'scale': [.7,.7,.7],
        };
    }
    if (mode == 'hyperbolicTessellation' || mode == 'hyperbolicTessellation2' ) {
       var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        generalSettings.cameraPosition = [-10.8,0,0.];
        uniforms.hyperbolicTilingEffectOnOff.value = mode == 'hyperbolicTessellation' ? 2 : 3;
        uniforms.complexEffect3OnOff.value = 0;
        uniforms.uColorVideoMode.value = 3; // mode == 'hyperbolicTessellation' ?  2 : 3;
        generalSettings.rotateYAmount = 0.;
         configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'still',
            'textureName': 'uv.jpg',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [1,1,-1],
        }
        configs['skyDome'] = phongSkyDome();
         // configs['skyDome'] = simpleSkyDome('hdr1.jpg');
    }
    if (mode == 'triangles') {
        generalSettings.cameraPosition = [-7.8,4.8,-2.7];
        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        uniforms.complexEffect3OnOff.value = 0;
        uniforms.hyperbolicTilingEffectOnOff.value = 1;
        uniforms.textureUAdjustment.value = 0.485;
        uniforms.uColorVideoMode.value = 0;
        configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'video',
            'textureName': 'typewriter',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [1,1,-1],
        }
        configs['skyDome'] = simpleSkyDome('hdr1.jpg');
    }
    if (mode == 'squares') {
        generalSettings.cameraPosition = [0,10.7,0];
        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        uniforms.schottkyEffectOnOff.value = 1;
        uniforms.textureUAdjustment.value = 0;
        uniforms.uColorVideoMode.value = 0;
        generalSettings.videoReloadDelayInSeconds = 1;
        uniforms.mobiusEffectsOnOff.value = 1;
        uniforms.iRotationAmount.value = 10.*Math.PI/2.;
        uniforms.e1x.value = -1;
        uniforms.e1y.value = 0;
        uniforms.e2x.value = 1;
        uniforms.e2y.value = 0;

        generalSettings.rotateYAmount = 0.;
        generalSettings.initialUpDownRotation = -Math.PI;

        configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'video',
            'textureName': 'typewriter',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [1,1,1],
        };
        configs['skyDome'] = simpleSkyDome('hdr1.jpg');
    }
    if (mode == 'manyDancersLoop') {
        generalSettings.cameraPosition = [3.8, 0.1, -1.4];
        generalSettings.videoReloadDelayInSeconds = 1;

        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        uniforms.complexEffect1OnOff.value = 4;

        configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'video',
            'textureName': 'loop',
            'geometry': 'torus',
            'position': [0,0,0],
            'scale': [1,1,1],
        };

        configs['skyDome'] = phongSkyDome();
    }
    if (mode == 'torusDance') {
        generalSettings.cameraPosition = [-7.8,4.8,-2.7];
        generalSettings.videoReloadDelayInSeconds = 1;

        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'video',
            'textureName': 'dance200',
            'geometry': 'torus',
            'position': [0,0,0],
            'scale': [1,1,1],
        };
        configs['skyDome'] = simpleSkyDome('hdr1.jpg');
    }
    if (mode == 'torusTracker') {
        generalSettings.cameraPosition = [-13.2,-0.3,2.0];
        generalSettings.videoReloadDelayInSeconds = 1;
        generalSettings.rotateYAmount = 0.;

        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'video',
            'textureName': 'tubes',
            'geometry': 'torus',
            'position': [0,0,0],
            'scale': [1,1,1],
        };
        // configs['skyDome'] = simpleSkyDome('hdr1.jpg');
        uniforms.enableTracking.value = 1; 
        this.rotateYAmount = 0.;
    }
    if (mode == 'portrait') {
        generalSettings.cameraPosition = [6.6,2.4,0];
        generalSettings.videoReloadDelayInSeconds = 1;
        generalSettings.rotateYAmount = 0.;

        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        uniforms.complexEffect3OnOff.value = 1;
        uniforms.textureScaleX.value = 1.5;
        uniforms.textureScaleY.value = 1.5;
        uniforms.textureUAdjustment.value = 0.27;
        configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'still',
            'textureName': 'hung.jpg',
            'geometry': 'torus',
            'position': [0,0,0],
            'scale': [1,1,1],
        };
        configs['skyDome'] = phongSkyDome();
    }

    if (mode == 'flower') {
        generalSettings.videoReloadDelayInSeconds = -1;
        generalSettings.cameraPosition = [10.6,5.4,0];
        generalSettings.rotateYAmount = 0.;

        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        // uniforms.textureUAdjustment.value = 0.5;
        uniforms.geometryTiming.value = 0;         // apply geometry before or after mobius xforms.
        uniforms.uSyntheticTexture.value = 1;
        uniforms.uSyntheticTextureQuadrant.value = 0.;
        uniforms.flipTexture.value = 1;
        configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'video',
            'textureName': '2g.webm',
            'geometry': 'morphinFlower',
            'position': [0,0,0],
            'scale': [1,1,1],
        };
        configs['skyDome'] = phongSkyDome();
    }


    if (mode == 'dollyZoom') {
        generalSettings.cameraPosition = [1,0,0];
        generalSettings.videoReloadDelayInSeconds = 1;
        generalSettings.rotateYAmount = 0.;

        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        uniforms.uThreePointMappingOn.value = 1;
        configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'video',
            'textureName': 'drwSchool',
            'geometry': 'plane',
            'position': [0,0,0],
            'scale': [1,1,1],
        };
        configs['skyDome'] = phongSkyDome();
    }
    if (mode == 'flocking') {
        generalSettings.cameraPosition = [0,-15 ,0];
        generalSettings.videoReloadDelayInSeconds = 1;
        generalSettings.rotateYAmount = 0.;

        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        uniforms.textureScaleY.value = .7 ;
        configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'video',
            'textureName': 'flockingCropped',
            'geometry': 'tsphere',
            'position': [0,0,0],
            'scale': [1,1,1],
        };
        uniforms.flipTexture.value = 1;
        configs['skyDome'] = phongSkyDome();
    }
    if (mode == 'domes') {
        generalSettings.cameraPosition = [0,-25 ,50];
        generalSettings.videoReloadDelayInSeconds = 1;
        generalSettings.rotateYAmount = 0.;

        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        uniforms.textureScaleY.value = .6;
        uniforms.flipTexture.value = 1;
        configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'video',
            'textureName': 'flockingCropped',
            'geometry': 'tsphere',
            'position': [-15,0,0],
            'scale': [1,1,1],
        };

        var uniforms = TRANSFORM.reimannShaderList.createShader('default2');
        uniforms.textureScaleY.value = .6;
        uniforms.flipTexture.value = 1;
        configs['default2'] = {
            'uniforms': uniforms,
            'textureType': 'video',
            'textureName': 'rosie',
            'geometry': 'tsphere',
            'position': [15,0,0],
            'scale': [1,1,1],
        };
        configs['skyDome'] = phongSkyDome();
    }
    if (mode == 'louisTriangles') {
        generalSettings.cameraPosition = [0,00,40];
        generalSettings.videoReloadDelayInSeconds = -1;

        // configs['skyDome'] = phongSkyDome();
        configs['skyDome'] = simpleSkyDome('Rookery.jpg');

        var obj = TRANSFORM.reimannShaderList.createShader2('default');
        obj.rotateDirection = 10;

        var uniforms2 = obj.currentUniforms;
        uniforms2.geometryTiming.value = 0;         // apply geometry before or after mobius xforms.
        uniforms2.uSyntheticTexture.value = 1;
        generalSettings.rotateYAmount = 0.0;
        configs['default'] = {
            'uniforms': uniforms2,
            'textureType': 'video',
            'textureName': '2g.webm',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [1,1,-1],
        }
    }
    if (mode == 'taosTriangles') {
        generalSettings.cameraPosition = [20,10,0];

        configs['skyDome'] = simpleSkyDome('eso_dark.jpg');
        // configs['skyDome']['scale'] = [-50,50,50];
        // generalSettings.fog = true;

        var obj = TRANSFORM.reimannShaderList.createShader2('default');
        obj.rotateDirection = 10;
        var uniforms2 = obj.currentUniforms;
        uniforms2.hyperbolicTilingEffectOnOff.value = 1;
        uniforms2.geometryTiming.value = 1;
        uniforms2.uColorVideoMode.value = 0; // mode == 'hyperbolicTessellation' ?  2 : 3;

        uniforms2.mobiusEffectsOnOff.value = 1
        // uniforms2.iRotationAmount.value = 10.*Math.PI/2.;
        uniforms2.e1x.value = -1;
        uniforms2.e1y.value = 0.5;
        uniforms2.e2x.value = 1;
        uniforms2.e2y.value = -0.5;
        uniforms2.showFixedPoints.value = 0;

        generalSettings.rotateYAmount = 0.0;
        configs['default'] = {
            'uniforms': uniforms2,
            'textureType': 'still',
            'textureName': 'BlueMetal.jpg',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [1,1,-1],
        }
        var sFactor = 15;
        var scale = 4*sFactor/2.5;
        var uniforms = TRANSFORM.reimannShaderList.createShader('plane1');
         configs['plane1'] = {
            'uniforms': uniforms, 
            'textureType': 'mirror2', 
            'geometry': 'plane', 
            'scale': [scale,scale,scale],
            'position': [0,-12,0],
            'rotationAxis': new THREE.Vector3( 1, 0, 0 ),
            'rotationAngle': -Math.PI/2
        }
    }
    if (mode == 'trianglesTwoViews') {
        generalSettings.cameraPosition = [20,0 ,0];
        generalSettings.videoReloadDelayInSeconds = -1;
        generalSettings.rotateYAmount = 0.;
        configs['skyDome'] = simpleSkyDome('eso_dark.jpg');

        // this must go after sky dome so transparency works.

        var uniforms2 = TRANSFORM.reimannShaderList.createShader('default');
        uniforms2.hyperbolicTilingEffectOnOff.value = 1;
        uniforms2.uColorVideoMode.value = 0; // mode == 'hyperbolicTessellation' ?  2 : 3;
        generalSettings.rotateYAmount = 0.;
        configs['default'] = {
            'uniforms': uniforms2,
            'textureType': 'still',
            'textureName': 'BlueMetal.jpg',
            'geometry': 'sphere',
            'position': [0,0,-12],
            'scale': [1,1,-1],
        }

        var uniforms2 = TRANSFORM.reimannShaderList.createShader('default2');
        uniforms2.hyperbolicTilingEffectOnOff.value = 1;
        uniforms2.uColorVideoMode.value = 0; // mode == 'hyperbolicTessellation' ?  2 : 3;
        generalSettings.rotateYAmount = 0.;
        configs['default2'] = {
            'uniforms': uniforms2,
            'textureType': 'still',
            'textureName': 'BlueMetal.jpg',
            'geometry': 'plane',
            'position': [0,0,12],
            'scale': [9,-9,9],
        }

        keycontrols = new keyControls(['default', 'default2'], 1,0,-1,0);
    }
    if (mode == 'text') {
        generalSettings.cameraPosition = [20,0 ,0];
        generalSettings.videoReloadDelayInSeconds = -1;
        generalSettings.rotateYAmount = 0.002;
        configs['skyDome'] = phongSkyDome();
        document.getElementById('simpleText').style.display= 'block';
        
    }
    if (mode == 'text2') {
        generalSettings.cameraPosition = [20,0 ,0];
        generalSettings.videoReloadDelayInSeconds = -1;
        generalSettings.rotateYAmount = 0.002;
        configs['skyDome'] = phongSkyDome();
        document.getElementById('simpleText2').style.display= 'block';
    }
    if (mode == 'equiAndSphere') {
        generalSettings.cameraPosition = [20,0 ,0];
        generalSettings.videoReloadDelayInSeconds = -1;
        generalSettings.rotateYAmount = 0.;

        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        uniforms.textureScaleY.value = .6;
        uniforms.flipTexture.value = 1;
        // var axes = drawAxes(14,new THREE.Vector3( 0, 0, -15 ));
        // _scene.add(axes); 
        configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'still',
            'textureName': 'uv.jpg',
            'geometry': 'sphere',
            'position': [0,0,-15],
            'scale': [1,-1,1],
        };

        var uniforms = TRANSFORM.reimannShaderList.createShader('plane');
        uniforms.textureScaleY.value = .6;
        uniforms.flipTexture.value = 1;
        configs['plane'] = {
            'uniforms': uniforms,
            'textureType': 'still',
            'textureName': 'uv.jpg',
            'geometry': 'plane',
            'position': [0,0,15],
            'scale': [9,-9,9],
        };
        configs['skyDome'] = phongSkyDome();
        keycontrols = new keyControls(['default', 'plane'], 1,0,-1,0);
    }
    if (mode == 'flockingMirrors') {
        generalSettings.cameraPosition = [1.7,-.7,-1.4];     // expected by trackerUtils.
        generalSettings.rotateYAmount = 0.;
        // generalSettings.cameraPosition = [8.,2,0];     // expected by trackerUtils.
        // generalSettings.rotateYAmount = .004;
        generalSettings.fog = true;


        //configs['skyDome'] = simpleSkyDome('eso_dark.jpg');

        // var uniforms = TRANSFORM.reimannShaderList.createShader('default2');
        //  uniforms.fractalEffectOnOff.value = 2;
        // configs['default2'] = {
        //     'uniforms': uniforms,
        //     'textureType': 'still',
        //     'textureName': 'placeholderStill.png',
        //     'geometry': 'sphere',
        //     'position': [0,0,0],
        //     'scale': [2,2,2],
        //     'rotationAxis': new THREE.Vector3( 1, 1, 0 ),
        //     'rotationAngle': Math.PI
        // };

        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        // uniforms.uHighPassFilterThreshold.value = new THREE.Vector3(.5, .5, .5  );
        // uniforms.uHighPassFilter.value = 1;
        // uniforms.complexEffect3OnOff.value = 0;
        uniforms.textureScaleY.value = .7 ;
        uniforms.uHighPassFilter.value = 1;
        uniforms.uMaskType.value = 2; // green mask just to hide the green screen a bit.
         configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'video',
            'textureName': 'flockingCropped',
            'geometry': 'tsphere',
            'position': [0,0,0],
            'scale': [1,1,1],
        }
        uniforms.flipTexture.value = 1;
        var sFactor = 15;
        var scale = 2*sFactor/2.5;
        var uniforms = TRANSFORM.reimannShaderList.createShader('plane1');
         configs['plane1'] = {
            'uniforms': uniforms, 
            'textureType': 'mirror2', 
            'geometry': 'plane', 
            'scale': [scale,scale,scale],
            'position': [sFactor,0,0],
            'rotationAxis': new THREE.Vector3( 0, 1, 0 ),
            'rotationAngle': -Math.PI/2
        }

        var uniforms = TRANSFORM.reimannShaderList.createShader('plane2');
         configs['plane2'] = {
            'uniforms': uniforms, 'textureType': 'mirror2', 'geometry': 'plane', 
            'scale': [scale,scale,scale],
            'position': [0,0,-sFactor],
            'rotationAxis': new THREE.Vector3( 0, 1, 0 ),
            'rotationAngle': 0
        }

        var uniforms = TRANSFORM.reimannShaderList.createShader('plane3');
         configs['plane3'] = {
            'uniforms': uniforms, 'textureType': 'mirror2', 'geometry': 'plane', 
            'scale': [scale,scale,scale],
            'position': [0,0,sFactor],
            'rotationAxis': new THREE.Vector3( 0, 1, 0 ),
            'rotationAngle': Math.PI
        }

        var uniforms = TRANSFORM.reimannShaderList.createShader('plane4');
         configs['plane4'] = {
            'uniforms': uniforms, 'textureType': 'mirror2', 'geometry': 'plane', 
            'scale': [scale,scale,scale],
            'position': [-sFactor,0,0],
            'rotationAxis': new THREE.Vector3( 0, 1, 0 ),
            'rotationAngle': Math.PI/2
        }

    }
    if (mode == 'fractal') {
        generalSettings.cameraPosition = [23.8, 0.1, -1.4];
        generalSettings.videoReloadDelayInSeconds = 1;

        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        uniforms.fractalEffectOnOff.value = 2;

        configs['default'] = {
            'uniforms': uniforms,
            'textureType': 'still',
            'textureName': 'placeholderStill.png',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [1,1,1],
        };

        var uniforms = TRANSFORM.reimannShaderList.createShader('default2');
        uniforms.fractalEffectOnOff.value = 2;
        configs['default2'] = {
            'uniforms': uniforms,
            'textureType': 'still',
            'textureName': 'placeholderStill.png',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [2,2,2],
        };
        configs['skyDome'] = normalSkyDome();
    }
    return {
        'configs': configs,
        'keyControls': keycontrols
    };    
    
}