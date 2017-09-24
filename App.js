//
// Copyright (c) 2017-present, by Evan Bacon. All Rights Reserved.
// @author Evan Bacon / https://github.com/EvanBacon
//

import Expo, { AppLoading } from 'expo';
import React from 'react';
import { Platform, StyleSheet, StatusBar, Text, View } from 'react-native';
import { AnimationCloth } from './Scenes'
import Navigation from './Navigation'
import { Loader } from './components'

export default class App extends React.Component {
  componentWillMount() {
    this.setState({ appIsReady: true });

    // this._loadAssetsAsync();
  }

  async _loadAssetsAsync() {
    try {
      await cacheAssetsAsync({
      });
    } catch (e) {
      console.warn(
        'There was an error caching assets (see: main.js), perhaps due to a ' +
        'network timeout, so we skipped caching. Reload the app to try again.'
      );
      console.log(e.message);
    } finally {
      this.setState({ appIsReady: true });
    }
  }
  state = {
    appIsReady: false
  }
  render() {
    if (this.state.appIsReady) {
      return (
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="dark-content" />}
          {Platform.OS === 'android' && <View style={styles.statusBarUnderlay} />}
          <Navigation
          />
        </View>
      );
    }
    return <AppLoading />
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBarUnderlay: {
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});