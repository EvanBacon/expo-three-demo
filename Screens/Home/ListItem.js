//
// Copyright (c) 2017-present, by Evan Bacon. All Rights Reserved.
// @author Evan Bacon / https://github.com/EvanBacon
//

import React, { Component } from 'react';
import { Text, TouchableHighlight, View, StyleSheet } from 'react-native';
import { Constants } from 'expo';
import Colors from '../../Colors'

export default class ListItem extends Component {
  render() {
    const {title, onPress} = this.props;
    return (
      <TouchableHighlight style={styles.touchable} onPress={onPress} underlayColor='#ddd'>
        <View style={styles.container}>
          <Text style={styles.title}>
            {title}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  touchable: {
    flex: 1,
  },
  title: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.tintColor,
  },
});
