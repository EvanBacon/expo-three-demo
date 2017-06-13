//
// Copyright (c) 2017-present, by Evan Bacon. All Rights Reserved.
// @author Evan Bacon / https://github.com/EvanBacon
//

import * as THREE from 'three';

global.THREE = THREE;
export {THREE};
require('three/examples/js/effects/OutlineEffect');
require('three/examples/js/loaders/OBJLoader');
// require('three/src/math/Vector3');
// require('three/src/loaders/FontLoader');
// require('three/src/geometries/TextGeometry');

document = {};
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
