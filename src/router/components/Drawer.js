import * as React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

import routes from '../route';

class DefaultDrawer extends React.Component {
  render() {
    return (
      <Drawer.Navigator>
        {routes.map(route => (
          <Drawer.Screen
            key={route.name}
            name={route.name}
            component={route.component}
          />
        ))}
      </Drawer.Navigator>
    );
  }
}

export default DefaultDrawer;
