import React, { Component } from 'react';
import { StyleSheet, SectionList } from 'react-native';
import ListItem from './ListItem';
import ListHeader from './ListHeader';

import {configuration} from '../../Navigation';

export default class Home extends Component {

  static navigationOptions = {
    title: 'Three Demo',
  }

  onPressItem = (item) => this.props.navigation.navigate(item.key, {});

  render = () => (
    <SectionList
      style={styles.list}
      renderItem={({item}) => <ListItem title={item.title} onPress={_ => this.onPressItem(item) } />}
      renderSectionHeader={({section}) => <ListHeader title={section.title} />}
      sections={configuration}/>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
});
