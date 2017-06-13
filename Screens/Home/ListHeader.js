import React, { Component } from 'react';
import { Text, TouchableHighlight, View, StyleSheet } from 'react-native';
import { Constants } from 'expo';
import Colors from '../../Colors'

export default class ListItem extends Component {
  render() {
    const {title} = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          {title}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: '#ecf0f1',
  },
  title: {
    margin: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
});
