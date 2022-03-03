import Login from '../pages/Login';
import Home from '../pages/Home';
import LaunchScreen from '../pages/LaunchScreen';

const routes = [
  {
    name: '启动页',
    component: LaunchScreen,
  },
  {
    name: '登录',
    component: Login,
  },
  {
    name: '首页',
    component: Home,
  },
];

export default routes;
