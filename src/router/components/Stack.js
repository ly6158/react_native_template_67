import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

import routes from '../route';

class DefaultDrawer extends React.Component {
  render() {
    return (
      <Stack.Navigator>
        {routes.map(route => (
          <Stack.Screen
            key={route.name}
            name={route.name}
            component={route.component}
          />
        ))}
      </Stack.Navigator>
    );
  }
}

export default DefaultDrawer;
