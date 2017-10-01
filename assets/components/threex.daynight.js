import ExpoTHREE from 'expo-three';

THREEx.DayNight = {};

THREEx.DayNight.currentPhase = function (sunAngle) {
    if (Math.sin(sunAngle) > Math.sin(0)) {
        return 'day';
    } else if (Math.sin(sunAngle) > Math.sin(-Math.PI / 6)) {
        return 'twilight';
    } else {
        return 'night';
    }
};


class StarField {
    object3d;
    constructor(scene) {
        this._setup(scene);
    }
    _setup = async (scene) => {
        // create the mesh
        let texture = await ExpoTHREE.createTextureAsync({
            asset: Expo.Asset.fromModule(require('../daynight/galaxy_starfield.png')),
        });
        this.material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            color: 0x808080,
        });
        let geometry = new THREE.SphereGeometry(100, 32, 32);
        this.object3d = new THREE.Mesh(geometry, this.material);
        scene.add(this.object3d);

    }

    update = (sunAngle) => {
        if (!this.object3d) {
            return;
        }
        let phase = THREEx.DayNight.currentPhase(sunAngle);
        if (phase === 'day') {
            this.object3d.visible = false;
        } else if (phase === 'twilight') {
            this.object3d.visible = false;
        } else {
            this.object3d.visible = true;
            this.object3d.rotation.y = sunAngle / 5;
            let intensity = Math.abs(Math.sin(sunAngle));
            this.material.color.setRGB(intensity, intensity, intensity);
        }
    };

}
THREEx.DayNight.StarField = StarField;
// ////////////////////////////////////////////////////////////////////////////////
//		SunLight							//
// ////////////////////////////////////////////////////////////////////////////////

THREEx.DayNight.SunLight = function () {
    let light = new THREE.DirectionalLight(0xffffff, 1);
    this.object3d = light;

    this.update = function (sunAngle) {
        light.position.x = 0;
        light.position.y = Math.sin(sunAngle) * 90000;
        light.position.z = Math.cos(sunAngle) * 90000;
        // console.log('Phase ', THREEx.DayNight.currentPhase(sunAngle))

        let phase = THREEx.DayNight.currentPhase(sunAngle);
        if (phase === 'day') {
            light.color.set('rgb(255,' + (Math.floor(Math.sin(sunAngle) * 200) + 55) + ',' + (Math.floor(Math.sin(sunAngle) * 200)) + ')');
        } else if (phase === 'twilight') {
            light.intensity = 1;
            light.color.set('rgb(' + (255 - Math.floor(Math.sin(sunAngle) * 510 * -1)) + ',' + (55 - Math.floor(Math.sin(sunAngle) * 110 * -1)) + ',0)');
        } else {
            light.intensity = 0;
        }
    };
};

// ////////////////////////////////////////////////////////////////////////////////
//		SunSphere							//
// ////////////////////////////////////////////////////////////////////////////////

THREEx.DayNight.SunSphere = function () {
    let geometry = new THREE.SphereGeometry(20, 30, 30);
    let material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
    });
    let mesh = new THREE.Mesh(geometry, material);
    this.object3d = mesh;

    this.update = function (sunAngle) {
        mesh.position.x = 0;
        mesh.position.y = Math.sin(sunAngle) * 400;
        mesh.position.z = Math.cos(sunAngle) * 400;

        let phase = THREEx.DayNight.currentPhase(sunAngle);
        if (phase === 'day') {
            mesh.material.color.set('rgb(255,' + (Math.floor(Math.sin(sunAngle) * 200) + 55) + ',' + (Math.floor(Math.sin(sunAngle) * 200) + 5) + ')');
        } else if (phase === 'twilight') {
            mesh.material.color.set('rgb(255,55,5)');
        } else {
        }
    };
};


// ////////////////////////////////////////////////////////////////////////////////
//		Skydom								//
// ////////////////////////////////////////////////////////////////////////////////

THREEx.DayNight.Skydom = function () {
    let geometry = new THREE.SphereGeometry(700, 32, 15);
    let shader = THREEx.DayNight.Skydom.Shader;
    let uniforms = THREE.UniformsUtils.clone(shader.uniforms);
    let material = new THREE.ShaderMaterial({
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        uniforms: uniforms,
        side: THREE.BackSide,
    });

    let mesh = new THREE.Mesh(geometry, material);
    this.object3d = mesh;

    this.update = function (sunAngle) {
        let phase = THREEx.DayNight.currentPhase(sunAngle);
        if (phase === 'day') {
            uniforms.topColor.value.set('rgb(0,120,255)');
            uniforms.bottomColor.value.set('rgb(255,' + (Math.floor(Math.sin(sunAngle) * 200) + 55) + ',' + (Math.floor(Math.sin(sunAngle) * 200)) + ')');
        } else if (phase === 'twilight') {
            uniforms.topColor.value.set('rgb(0,' + (120 - Math.floor(Math.sin(sunAngle) * 240 * -1)) + ',' + (255 - Math.floor(Math.sin(sunAngle) * 510 * -1)) + ')');
            uniforms.bottomColor.value.set('rgb(' + (255 - Math.floor(Math.sin(sunAngle) * 510 * -1)) + ',' + (55 - Math.floor(Math.sin(sunAngle) * 110 * -1)) + ',0)');
        } else {
            uniforms.topColor.value.set('black');
            uniforms.bottomColor.value.set('black');
        }
    };
};

THREEx.DayNight.Skydom.Shader = {
    uniforms: {
        topColor: { type: 'c', value: new THREE.Color().setHSL(0.6, 1, 0.75) },
        bottomColor: { type: 'c', value: new THREE.Color(0xffffff) },
        offset: { type: 'f', value: 400 },
        exponent: { type: 'f', value: 0.6 },
    },
    vertexShader: [
        'varying vec3 vWorldPosition;',
        'void main() {',
        '	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
        '	vWorldPosition = worldPosition.xyz;',
        '	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        '}',
    ].join('\n'),
    fragmentShader: [
        'uniform vec3 topColor;',
        'uniform vec3 bottomColor;',
        'uniform float offset;',
        'uniform float exponent;',

        'varying vec3 vWorldPosition;',

        'void main() {',
        '	float h = normalize( vWorldPosition + offset ).y;',
        '	gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( h, exponent ), 0.0 ) ), 1.0 );',
        '}',
    ].join('\n'),
};
