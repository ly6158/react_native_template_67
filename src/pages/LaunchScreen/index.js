import {Text, View} from 'react-native';
import * as React from 'react';
import SplashScreen from 'react-native-splash-screen';

class LaunchScreen extends React.Component {
  componentDidMount() {
    SplashScreen.hide();
  }

  render() {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text>启动页</Text>
      </View>
    );
  }
}

export default LaunchScreen;
