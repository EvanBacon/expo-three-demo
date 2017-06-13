//
// Copyright (c) 2017-present, by Evan Bacon. All Rights Reserved.
// @author Evan Bacon / https://github.com/EvanBacon
//

import React, { Component } from 'react';

import { StackNavigator } from 'react-navigation';
import {Platform} from 'react-native';
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
};

const navigationOptions = {
  headerTintColor: Colors.tintColor,
  headerStyle: {
    backgroundColor: Colors.headerColor
  },
  headerBackTitle: "Back"
}

export const configuration = [
  {
    title: "Animation",
    key: "Animation",
    data: [
      Routes.AnimationCloth,
    ]
  },
  {
    title: "Particle",
    key: "Particle",
    data: [
      Routes.AnimationCloth,
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
