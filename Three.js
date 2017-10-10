// import * as THREE from 'three';
const THREE = require('three');
global.THREE = THREE;

global.THREEx = global.THREEx || {};

export default THREE;

require('three/examples/js/loaders/OBJLoader');
require('three/examples/js/loaders/STLLoader');
// require('three/examples/js/loaders/ColladaLoader');
require('three/examples/js/loaders/ColladaLoader2');
require('three/examples/js/loaders/OBJLoader2');

require('three/examples/js/postprocessing/EffectComposer');
require('three/examples/js/postprocessing/RenderPass');
require('three/examples/js/postprocessing/ShaderPass');
require('three/examples/js/postprocessing/MaskPass');
require('three/examples/js/postprocessing/GlitchPass');
require('three/examples/js/postprocessing/BloomPass');
require('three/examples/js/postprocessing/FilmPass');

require('three/examples/js/shaders/CopyShader');
require('three/examples/js/shaders/ColorCorrectionShader');
require('three/examples/js/shaders/VignetteShader');
require('three/examples/js/shaders/DigitalGlitch');
require('three/examples/js/shaders/ConvolutionShader');
require('three/examples/js/shaders/FilmShader');

require('three/examples/js/shaders/HorizontalBlurShader');
require('three/examples/js/shaders/VerticalBlurShader');


require('three/examples/js/effects/OutlineEffect');
require('three/examples/js/effects/AnaglyphEffect');
require('three/examples/js/effects/ParallaxBarrierEffect');

require('three/examples/js/controls/DeviceOrientationControls');
require('three/examples/js/controls/OrbitControls');

require('./assets/components/threex.toxicpproc.js');
require('./assets/components/threex.uniformstween.js');
require('./assets/components/threex.daynight.js');


// const SEA3D = require('three/examples/js/loaders/sea3d/SEA3D');
// global.SEA3D = SEA3D;
// require('three/examples/js/loaders/sea3d/SEA3DLoader');

// require('three/examples/js/loaders/sea3d/SEA3DLZMA');


if (!console.time) {
    console.time = () => { };
}
if (!console.timeEnd) {
    console.timeEnd = () => { };
}
if (!console.assert) {
    console.assert = () => { };
}
console.ignoredYellowBox = [
    'THREE.WebGLRenderer',
    'THREE.WebGLProgram',
];