//
// Copyright (c) 2017-present, by Evan Bacon. All Rights Reserved.
// @author Evan Bacon / https://github.com/EvanBacon
//

import * as THREE from 'three';

global.THREE = THREE;
export {THREE};
require('three/examples/js/effects/OutlineEffect');
require('three/examples/js/loaders/OBJLoader');

require('three/examples/js/shaders/ConvolutionShader');
require('three/examples/js/shaders/CopyShader');
require('three/examples/js/shaders/FilmShader');

require('three/examples/js/postprocessing/EffectComposer');
require('three/examples/js/postprocessing/ShaderPass');
require('three/examples/js/postprocessing/MaskPass');
require('three/examples/js/postprocessing/RenderPass');
require('three/examples/js/postprocessing/BloomPass');
require('three/examples/js/postprocessing/FilmPass');


import './FakeBrowser';
// require('three/src/math/Vector3');
// require('three/src/loaders/FontLoader');
// require('three/src/geometries/TextGeometry');

if (!console.time) {
  console.time = () => {};
}
if (!console.timeEnd) {
  console.timeEnd = () => {};
}

console.ignoredYellowBox = [
  'THREE.WebGLRenderer',
  'THREE.WebGLProgram',
];
