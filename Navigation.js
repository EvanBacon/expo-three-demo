//
// Copyright (c) 2017-present, by Evan Bacon. All Rights Reserved.
// @author Evan Bacon / https://github.com/EvanBacon
//

import React, { Component } from 'react';

import { StackNavigator } from 'react-navigation';
import { Platform, Button, Linking } from 'react-native';
import * as Scenes from './Scenes';
import * as Screens from './Screens';
import Colors from './Colors'
import Settings from './Settings'

export const Routes = {
  AnimationCloth: {
    title: 'Animation Cloth',
    key: 'AnimationCloth',
    description: 'Simple Cloth Simulation Verlet integration with relaxed constraints',
    link: 'https://threejs.org/examples/webgl_animation_cloth.html',
    screen: Scenes.AnimationCloth,
  },
  SkyShader: {
    title: 'Sky Shader',
    key: 'SkyShader',
    description: 'Sky Shader',
    link: 'https://threejs.org/examples/#webgl_shaders_sky',
    screen: Scenes.SkyShader,
  },
  OceanShader: {
    title: 'Ocean Shader',
    key: 'OceanShader',
    description: 'Ocean Shader',
    link: 'https://threejs.org/examples/#webgl_shaders_ocean2',
    screen: Scenes.OceanShader,
  },
  LavaShader: {
    title: 'Lava Shader',
    key: 'LavaShader',
    description: 'Lava Shader',
    link: 'https://threejs.org/examples/#webgl_shaders_ocean2',
    screen: Scenes.LavaShader,
  },
  // SkinningBlending: {
  //   title: 'Skinning Blending',
  //   key: 'SkinningBlending',
  //   description: 'Skinning And Blending Models',
  //   link: 'https://threejs.org/examples/#webgl_animation_skinning_blending',
  //   screen: Scenes.SkinningBlending,
  // },
  ParticleSystem: {
    title: 'Particle System',
    key: 'ParticleSystem',
    description: 'GPU Particle System',
    link: 'https://threejs.org/examples/?q=particl#webgl_gpu_particle_system',
    screen: Scenes.ParticleSystem,
  },
  VoxelPainter: {
    title: 'Voxel Painter',
    key: 'VoxelPainter',
    description: 'Interactive Voxel Scene',
    link: 'https://threejs.org/examples/#webgl_interactive_voxelpainter',
    screen: Scenes.VoxelPainter,
  },
  EditorLoader: {
    title: 'Editor Loader',
    key: 'EditorLoader',
    description: 'Loader for app.json exported from editor',
    link: 'https://github.com/mrdoob/three.js/tree/master/editor',
    screen: Scenes.EditorLoader,
  },

  GlitchEffect: {
    title: 'Glitch Effect',
    key: 'GlitchEffect',
    description: '',
    link: 'https://threejs.org/examples/?q=glitch#webgl_postprocessing_glitch',
    screen: Scenes.GlitchApp,
  },
  HatchShader: {
    title: 'Hatch Shader',
    key: 'HatchShader',
    description: '',
    link: 'https://codepen.io/EvanBacon/pen/xgEBPX',
    screen: Scenes.HatchApp,
  },
  ToonShader: {
    title: 'Toon Shader',
    key: 'ToonShader',
    description: '',
    link: 'https://codepen.io/EvanBacon/pen/oBzVzo',
    screen: Scenes.ToonApp,
  },
  VignetteEffect: {
    title: 'Vignette Effect',
    key: 'VignetteEffect',
    description: '',
    link: 'https://github.com/EvanBacon/expo-three-demo/blob/master/Scenes/VignetteApp.js',
    screen: Scenes.VignetteApp,
  },
  WaterShader: {
    title: 'Water Shader',
    key: 'WaterShader',
    description: '',
    link: 'https://codepen.io/EvanBacon/pen/yJQwbZ',
    screen: Scenes.WaterApp,
  },

  OrbitControls: {
    title: 'Orbit Controls',
    key: 'OrbitControls',
    description: '',
    link: 'https://github.com/EvanBacon/expo-three-demo/blob/master/Scenes/OrbitControlsApp.js',
    screen: Scenes.OrbitControlsApp,

  },
  FlameShader: {
    title: 'Flame Shader',
    key: 'FlameShader',
    description: '',
    link: 'https://codepen.io/EvanBacon/full/FlameApp',
    screen: Scenes.FlameApp,
  },
  VrHelloWorldApp: {
    title: 'Hello World',
    key: 'VrHelloWorldApp',
    description: '',
    link: 'https://github.com/EvanBacon/expo-three-demo/blob/master/Scenes/VrHelloWorldApp.js',
    screen: Scenes.VrHelloWorldApp,
  },
  Anaglyph3dApp: {
    title: 'Anaglyph',
    key: 'Anaglyph3dApp',
    description: '',
    link: 'https://github.com/EvanBacon/expo-three-demo/blob/master/Scenes/Anaglyph3dApp.js',
    screen: Scenes.Anaglyph3dApp,
  },
  ParallaxBarrierApp: {
    title: 'Parallax Barrier',
    key: 'ParallaxBarrierApp',
    description: '',
    link: 'https://github.com/EvanBacon/expo-three-demo/blob/master/Scenes/ParallaxBarrierApp.js',
    screen: Scenes.ParallaxBarrierApp,
  },
  Toxic: {
    title: 'Toxic',
    key: 'Toxic',
    description: '',
    link: 'https://github.com/EvanBacon/expo-three-demo/blob/master/Scenes/Toxic.js',
    screen: Scenes.Toxic,
  },
  Trees: {
    title: 'Trees',
    key: 'Trees',
    description: '',
    link: 'https://github.com/DungFu/TreeGen.js',
    screen: Scenes.Trees,
  },
  DayCycle: {
    title: 'Day Cycle',
    key: 'DayCycle',
    description: '',
    link: 'https://github.com/jeromeetienne/threex.daynight',
    screen: Scenes.DayCycle,
  },
  VirtualBoy: {
    title: 'Virtual Boy',
    key: 'VirtualBoy',
    description: '',
    link: '',
    screen: Scenes.VirtualBoy,
  },
  AMFLoaderDemo: {
    title: 'AMF',
    key: 'AMFLoaderDemo',
    description: '',
    link: '',
    screen: Scenes.AMFLoaderDemo,
  },
  ThreeMFLoaderDemo: {
    title: '3MF',
    key: 'ThreeMFLoaderDemo',
    description: '',
    link: '',
    screen: Scenes.ThreeMFLoaderDemo,
  },
  TDSLoaderDemo: {
    title: '3DS',
    key: 'TDSLoaderDemo',
    description: '',
    link: '',
    screen: Scenes.TDSLoaderDemo,
  }
};



Object.keys(Routes).map(key => {
  const obj = Routes[key];
  obj.screen.navigationOptions = {
    title: obj.title,
    headerRight: ((() => {
      const { link: url } = obj;
      if (!url || url === "") {
        return (null);
      }
      return (
        <Button title={"Code"} onPress={() => {
          Linking.canOpenURL(url).then(supported => {
            if (!supported) {
              console.log('Can\'t handle url: ' + url);
            } else {
              return Linking.openURL(url);
            }
          }).catch(err => console.error('An error occurred', err));
        }
        }
        />
      )
    })())
  }
});

const navigationOptions = {
  headerTintColor: Colors.tintColor,
  headerStyle: {
    backgroundColor: Colors.headerColor
  },
  headerBackTitle: "Back",
  headerRight: ((() => {
    const url = "https://github.com/EvanBacon/expo-three-demo";
   
    return (
      <Button title={"Repo"} onPress={() => {
        Linking.canOpenURL(url).then(supported => {
          if (!supported) {
            console.log('Can\'t handle url: ' + url);
          } else {
            return Linking.openURL(url);
          }
        }).catch(err => console.error('An error occurred', err));
      }
      }
      />
    )
  })())
}

export const configuration = [
  // {
  //   title: "VR",
  //   key: "vr",
  //   data: [
  //     Routes.VrHelloWorldApp
  //   ]
  // },
  {
    title: "AR",
    key: "AR",
    data: [
      Routes.Toxic,
    ]
  },
  {
    title: "Game",
    key: "Game",
    data: [
      Routes.Trees,
      Routes.DayCycle
    ]
  },
  {
    title: "Effects",
    key: "Effects",
    data: [
      Routes.GlitchEffect,
      Routes.VignetteEffect,
      Routes.ParallaxBarrierApp,
      Routes.Anaglyph3dApp,
      Routes.VirtualBoy
    ]
  },
  {
    title: "Shader",
    key: "Shader",
    data: [
      Routes.WaterShader,
      Routes.ToonShader,
      Routes.HatchShader,
      Routes.FlameShader,

      Routes.SkyShader,

      // Routes.LavaShader,
      // Routes.OceanShader,      
    ]
  },
  {
    title: "Controls",
    key: "Controls",
    data: [
      Routes.OrbitControls,
    ]
  },
  {
    title: "Animation",
    key: "Animation",
    data: [
      Routes.AnimationCloth,
      // Routes.SkinningBlending
    ]
  },
  {
    title: "Particle",
    key: "Particle",
    data: [
      Routes.ParticleSystem,
    ]
  },
  {
    title: "Interactive",
    key: "Interactive",
    data: [
      Routes.VoxelPainter,
    ]
  },
  {
    title: "Loader",
    key: "Loader",
    data: [
      Routes.EditorLoader,
      Routes.AMFLoaderDemo,
      Routes.ThreeMFLoaderDemo,
      Routes.TDSLoaderDemo
      
    ]
  },
]


const AppNavigator = StackNavigator(
  {
    ...Routes,
    Home: {
      screen: Screens.Home,
    },
  },
  {
    initialRouteName: Settings.initialRouteName,
    navigationOptions
    // headerMode: 'none',
    // mode: Platform.OS === 'ios' ? 'modal' : 'card',
  }
);

export default () => <AppNavigator />;
