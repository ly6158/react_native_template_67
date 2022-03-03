import * as React from 'react';
import Drawer from './components/Drawer';
import Stack from './components/Stack';
import {View} from 'react-native';

class CommonRouter extends React.Component {
  render() {
    const {type} = this.props;
    console.log('type: ', type);
    return <View>{type === 'Drawer' ? <Drawer /> : <Stack />}</View>;
  }
}

export default Stack;
