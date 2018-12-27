function getMaterialForName(name) {
    if (name == 'greyOutline') {
        var uniforms = {
            iChannelStillMask1:  { type: 't', value: 0 },
            iChannelStillMask2:  { type: 't', value: 0 },
        };
        var pathToSubtractionTexture = 'media/stillMask2.png';
        (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
            console.log("getMaterialForName(): loading texture into iChannelStillMask1");
            setMipMapOptions(texture);
            uniforms.iChannelStillMask1.value =  texture; 
        });
        var pathToSubtractionTexture = 'media/stillMask3.png';
        (new THREE.TextureLoader()).load(pathToSubtractionTexture, function ( texture ) {
            console.log("getMaterialForName(): loading texture into iChannelStillMask2");
            setMipMapOptions(texture);
            uniforms.iChannelStillMask2.value =  texture; 
        });
        return new THREE.ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: SHADERCODE.mainShader_vs(),
            fragmentShader: SHADERCODE.outerShader_fs(),
            side: THREE.DoubleSide,
            transparent: true,
        } );
    }
    if (name == 'phong') {
        return new THREE.MeshPhongMaterial({ 
            side: THREE.DoubleSide,
            color: 0x255c78,
            emissive: 0x51252,
            shininess: 100,
        });        
    }
    if (name == 'normal') {
        return new THREE.MeshNormalMaterial({side: THREE.DoubleSide, shading: THREE.FlatShading});
    }
    if (name == 'transparent') {
        return  new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            color: 0xffffff
        });
    }
}