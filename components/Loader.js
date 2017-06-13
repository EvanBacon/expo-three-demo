

import Expo from 'expo';
import * as THREE from 'three';
import ExpoTHREE from 'expo-three';

import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default class Loader extends Component {

  componentWillMount() {
    THREE.DefaultLoadingManager.onStart = function ( url, itemsLoaded, itemsTotal ) {

      console.warn( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

    };

    THREE.DefaultLoadingManager.onLoad = function ( ) {

      console.warn( 'Loading Complete!');

    };


    THREE.DefaultLoadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {

      console.warn( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

    };

    THREE.DefaultLoadingManager.onError = function ( url ) {

      console.warn( 'There was an error loading ' + url );

    };
  }


  render() {
    return (
      <View style={StyleSheet.flatten([StyleSheet.absoluteFill, styles.container])}>
        <Text style={styles.paragraph}>
          Loading
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {

    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
});
