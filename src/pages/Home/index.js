import {Text, View} from 'react-native';
import * as React from 'react';
import SplashScreen from 'react-native-splash-screen'; //启动页

class Home extends React.Component {
  render() {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text>Home Screen</Text>
      </View>
    );
  }
}

export default Home;
