function simpleSkyDome(fileContainingStill) {
    return {
            'textureName': fileContainingStill,
            'textureType': 'basic',
            'geometry': 'sphere',
            'material': 'texture',
            'position': [0,0,0],
            'scale': [50,50,50],
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
function normalSkyDome() {
       return {
            'textureType': 'normal',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [50,50,50],
        };    
}
function getCannedConfigs(mode, generalSettings) {
    configs = {};
    if (mode == 'uv') {     // this is what you get by default if no mode specifed.
        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        generalSettings.cameraPosition = [-1,0,0.];
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

        // var uniforms = TRANSFORM.reimannShaderList.createShader('other');
        // configs['other'] = {
        //     'uniforms': uniforms,
        //     'textureType': 'still',
        //     'textureName': 'uv.jpg',
        //     'geometry': 'torus',
        //     'position': [24.0,0,0],
        //     'scale': [1,1,-1],
        // }
        configs['skyDome'] = simpleSkyDome('hdr1.jpg');
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
            'textureType': 'anyMaterial',
            'geometry': 'sphere',
            'position': [0,0,0],
            'scale': [50,50,50],
        }
        // this must go after sky dome so transparency works.
        var uniforms2 = TRANSFORM.reimannShaderList.createShader('default');
        uniforms2.complexEffect3OnOff.value = 1;
        uniforms2.textureScale.value = 2.25;
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
        uniforms.mobiusEffectsOnOff.value = 1
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
    if (mode == 'portrait') {
        generalSettings.cameraPosition = [6.6,2.4,0];
        generalSettings.videoReloadDelayInSeconds = 1;
        generalSettings.rotateYAmount = 0.;

        var uniforms = TRANSFORM.reimannShaderList.createShader('default');
        uniforms.complexEffect3OnOff.value = 1;
        uniforms.textureScale.value = 1.5;
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
    return configs;    
    
}