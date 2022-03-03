import * as React from 'react';
import 'react-native-gesture-handler';
import CommonRouter from './router';
import {NavigationContainer} from '@react-navigation/native';

export default function App() {
  return (
    <NavigationContainer>
      <CommonRouter type="Drawer" />
    </NavigationContainer>
  );
}
