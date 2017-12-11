//https://codepen.io/EvanBacon/pen/xgEBPX?editors=0010
import Expo from 'expo';
import React from 'react';
import { View, Text } from 'react-native';
import ExpoTHREE from 'expo-three';
import ThreeView from '../ThreeView';

import Touches from '../window/Touches';

class App extends React.Component {
   
    render = () => (
        <ThreeView
            style={{ flex: 1, backgroundColor: 'black' }}
            onContextCreate={this._onContextCreate}
            onRender={this._animate}
        />
    );

    _onContextCreate = async (gl) => {

        const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

        // renderer

        this.renderer = ExpoTHREE.createRenderer({ gl });
        this.renderer.setPixelRatio(scale);
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x000000);
        this.renderer.autoClear = false;

        this._setupScene();

        // resize listener

        window.addEventListener('resize', this._onWindowResize, false);
        this._onWindowResize();

    }

    _setupScene = () => {
        const { innerWidth: width, innerHeight: height } = window;
        // Initialize Three.JS


        const createMesh = (geometry, scene) => {
            var material = new THREE.MeshNormalMaterial();

            this.mesh1 = new THREE.Mesh(geometry, this.material1);
            this.mesh1.position.x = -300;
            this.mesh1.position.z = -1000;
            scene.add(this.mesh1);

            this.mesh2 = new THREE.Mesh(geometry, this.material2);
            this.mesh2.position.x = 300;
            this.mesh2.position.z = -1000;
            scene.add(this.mesh2);
        }


        this.cameraOrtho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.cameraPerspective = new THREE.PerspectiveCamera(50, width / height, 1, 10000);

        this.sceneRTT = new THREE.Scene();
        this.sceneScreen = new THREE.Scene();

        this.directionalLight = new THREE.DirectionalLight(0xffffff);
        this.directionalLight.position.set(0, 0, 1);
        this.sceneRTT.add(this.directionalLight);

        this.rtTexture = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
            stencilBuffer: false
        });

        this.rtTextureX = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
            stencilBuffer: false
        });

        this.rtTextureY = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
            stencilBuffer: false
        });

        this.materialScreen = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: {
                    type: 't',
                    value: this.rtTexture
                },
                opacity: {
                    type: 'f',
                    value: 1.5
                }
            },
            vertexShader: shaders.vertex,
            fragmentShader: shaders.fragment,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        this.blurX = new THREE.Vector2(1 / 512, 0.0);
        this.blurY = new THREE.Vector2(0.0, 1 / 512);

        var sigma = 4.0,
            kernelSize = 25;
        var convolutionShader = THREE.ConvolutionShader;
        var convolutionUniforms = THREE.UniformsUtils.clone(convolutionShader.uniforms);
        convolutionUniforms['uImageIncrement'].value = this.blurX;
        convolutionUniforms['cKernel'].value = THREE.ConvolutionShader.buildKernel(sigma);

        this.materialConvolution = new THREE.ShaderMaterial({
            uniforms: convolutionUniforms,
            vertexShader: convolutionShader.vertexShader,
            fragmentShader: convolutionShader.fragmentShader,
            defines: {
                'KERNEL_SIZE_FLOAT': kernelSize.toFixed(1),
                'KERNEL_SIZE_INT': kernelSize.toFixed(0)
            }
        });

        this.shader = ShaderTest['hatching'];

        var lineColor1 = 0xff0000,
            lineColor2 = 0x0000ff;

        this.material1 = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(this.shader.uniforms),
            vertexShader: this.shader.vertexShader,
            fragmentShader: this.shader.fragmentShader
        });

        this.material1.uniforms.uDirLightColor.value = this.directionalLight.color;
        this.material1.uniforms.uDirLightPos.value = this.directionalLight.position;
        this.material1.uniforms.uBaseColor.value.setHex(0x000000);
        this.material1.uniforms.uLineColor0.value.setHex(lineColor1);
        this.material1.uniforms.uLineColor1.value.setHex(lineColor1);
        this.material1.uniforms.uLineColor2.value.setHex(lineColor1);
        this.material1.uniforms.uLineColor3.value.setHex(lineColor1);
        this.material1.uniforms.uLineColor4.value.setHex(0xffff00);

        this.material2 = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(this.shader.uniforms),
            vertexShader: this.shader.vertexShader,
            fragmentShader: this.shader.fragmentShader
        });

        this.material2.uniforms.uDirLightColor.value = this.directionalLight.color;
        this.material2.uniforms.uDirLightPos.value = this.directionalLight.position;
        this.material2.uniforms.uBaseColor.value.setHex(0x000000);
        this.material2.uniforms.uLineColor0.value.setHex(lineColor2);
        this.material2.uniforms.uLineColor1.value.setHex(lineColor2);
        this.material2.uniforms.uLineColor2.value.setHex(lineColor2);
        this.material2.uniforms.uLineColor3.value.setHex(lineColor2);
        this.material2.uniforms.uLineColor4.value.setHex(0x00ffff);

        var geometry = new THREE.TorusGeometry(250, 100, 32, 64);
        createMesh(geometry, this.sceneRTT);

        this.quadScreen = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
        this.sceneScreen.add(this.quadScreen);

    }

    _onWindowResize = () => {
        const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

        // Update Renderer
        this.renderer.setPixelRatio(scale);
        this.renderer.setSize(width, height);

        this.cameraPerspective.aspect = width / height;
        this.cameraPerspective.updateProjectionMatrix();

        this.renderer.setSize(width, height);

        this.rtTexture = this.rtTexture.clone();

        this.rtTextureX = this.rtTexture.clone();
        this.rtTextureY = this.rtTexture.clone();

    }

    _animate = (delta) => {
        this._render();
    }

    _render = () => {
        const { renderer, sceneScreen, materialScreen, materialConvolution, blurY, blurX, scene, sceneRTT, quadScreen, rtTextureX, rtTexture, rtTextureY, cameraOrtho, cameraPerspective, mesh1, mesh2 } = this;
        renderer.clear();

        mesh1.rotation.y += Math.PI / 8 * .025;
        mesh2.rotation.y -= Math.PI / 8 * .025;

        renderer.context.enable(renderer.context.DEPTH_TEST);
        renderer.render(sceneRTT, cameraPerspective, rtTexture, true);

        quadScreen.material = materialConvolution;

        materialConvolution.uniforms.tDiffuse.value = rtTexture;
        materialConvolution.uniforms.uImageIncrement.value = blurX;
        renderer.render(sceneScreen, cameraOrtho, rtTextureX, true);

        materialConvolution.uniforms.tDiffuse.value = rtTextureX;
        materialConvolution.uniforms.uImageIncrement.value = blurY;
        renderer.render(sceneScreen, cameraOrtho, rtTextureY, true);

        quadScreen.material = materialScreen;

        materialScreen.uniforms.tDiffuse.value = rtTextureY;
        renderer.render(sceneScreen, cameraOrtho, rtTexture, false);

        materialScreen.uniforms.tDiffuse.value = rtTexture;
        renderer.render(sceneScreen, cameraOrtho);


    }
}

// Wrap Touches Event Listener
export default Touches(App);


// Define Shaders
const shaders = {
    vertex: `
    varying vec2 vUv;
    
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    `,
    fragment: `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform float opacity;
    
    void main() {
        vec4 texel = texture2D( tDiffuse, vUv );
        gl_FragColor = opacity * texel;
    }
    `
};



THREE.ConvolutionShader = {

    defines: {

        "KERNEL_SIZE_FLOAT": "25.0",
        "KERNEL_SIZE_INT": "25",

    },

    uniforms: {

        "tDiffuse": {
            type: "t",
            value: null
        },
        "uImageIncrement": {
            type: "v2",
            value: new THREE.Vector2(0.001953125, 0.0)
        },
        "cKernel": {
            type: "fv1",
            value: []
        }

    },

    vertexShader: [

        "uniform vec2 uImageIncrement;",

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform float cKernel[ KERNEL_SIZE_INT ];",

        "uniform sampler2D tDiffuse;",
        "uniform vec2 uImageIncrement;",

        "varying vec2 vUv;",

        "void main() {",

        "vec2 imageCoord = vUv;",
        "vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );",

        "for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {",

        "sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];",
        "imageCoord += uImageIncrement;",

        "}",

        "gl_FragColor = sum;",

        "}"

    ].join("\n"),

    buildKernel: function (sigma) {

        // We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

        function gauss(x, sigma) {

            return Math.exp(-(x * x) / (2.0 * sigma * sigma));

        }

        var i, values, sum, halfWidth, kMaxKernelSize = 25,
            kernelSize = 2 * Math.ceil(sigma * 3.0) + 1;

        if (kernelSize > kMaxKernelSize) kernelSize = kMaxKernelSize;
        halfWidth = (kernelSize - 1) * 0.5;

        values = new Array(kernelSize);
        sum = 0.0;
        for (i = 0; i < kernelSize; ++i) {

            values[i] = gauss(i - halfWidth, sigma);
            sum += values[i];

        }

        // normalize the kernel

        for (i = 0; i < kernelSize; ++i) values[i] /= sum;

        return values;

    }
};

const ShaderTest = {
    hatching: {
        uniforms: {
            uDirLightPos: {
                type: 'v3',
                value: new THREE.Vector3()
            },
            uDirLightColor: {
                type: 'c',
                value: new THREE.Color(0xeeeeee)
            },
            uAmbientLightColor: {
                type: 'c',
                value: new THREE.Color(0x050505)
            },
            uBaseColor: {
                type: 'c',
                value: new THREE.Color(0xffffff)
            },
            uLineColor0: {
                type: 'c',
                value: new THREE.Color(0x000000)
            },
            uLineColor1: {
                type: 'c',
                value: new THREE.Color(0x000000)
            },
            uLineColor2: {
                type: 'c',
                value: new THREE.Color(0x000000)
            },
            uLineColor3: {
                type: 'c',
                value: new THREE.Color(0x000000)
            },
            uLineColor4: {
                type: 'c',
                value: new THREE.Color(0x000000)
            }
        },

        vertexShader: [
            'varying vec3 vNormal;',
            'void main() {',
            'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            'vNormal = normalize( normalMatrix * normal );',
            '}'
        ].join('\n'),

        fragmentShader: [
            'uniform vec3 uBaseColor;',
            'uniform vec3 uLineColor0;',
            'uniform vec3 uLineColor1;',
            'uniform vec3 uLineColor2;',
            'uniform vec3 uLineColor3;',
            'uniform vec3 uLineColor4;',
            'uniform vec3 uDirLightPos;',
            'uniform vec3 uDirLightColor;',
            'uniform vec3 uAmbientLightColor;',
            'varying vec3 vNormal;',
            '',
            'void main() {',
            'float directionalLightWeighting = max( dot( vNormal, uDirLightPos ), 0.0);',
            'vec3 lightWeighting = uAmbientLightColor + uDirLightColor * directionalLightWeighting;',

            'gl_FragColor = vec4( uBaseColor, 1.0 );',

            'if ( length(lightWeighting) < 1.00 ) {',
            'if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0) {',
            'gl_FragColor = vec4( uLineColor1, 1.0 );',
            '}',
            '}',
            'if ( length(lightWeighting) < 0.75 ) {',
            'if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0) {',
            'gl_FragColor = vec4( uLineColor2, 1.0 );',
            '}',
            '}',
            'if ( length(lightWeighting) < 0.50 ) {',
            'if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0) {',
            'gl_FragColor = vec4( uLineColor3, 1.0 );',
            '}',
            '}',
            'if ( length(lightWeighting) < 0.3465 ) {',
            'if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0) {',
            'gl_FragColor = vec4( uLineColor4, 1.0 );',
            '}',
            '}',
            '}'
        ].join('\n')
    }
};
