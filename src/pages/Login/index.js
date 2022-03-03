import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Dimensions,
  ImageBackground,
} from 'react-native';
import Button from '@ant-design/react-native/lib/button';
import {IconFill, IconOutline} from '@ant-design/icons-react-native';

const {width, height} = Dimensions.get('window');

class Login extends React.Component {
  state = {account: 'admin', password: '123456'};

  onAccountChangeText(account) {
    console.log('account: ', account);
    this.setState({account: account});
  }

  onPasswordChangeText(password) {
    console.log('password: ', password);
    this.setState({password: password});
  }

  login() {
    console.log('登录');
  }

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={require('../../assets/images/login_background.png')}
          style={styles.backgroundImage}>
          <View style={styles.layout}>
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <IconOutline name="user" size={24} color="#606266" />
              </View>

              <TextInput
                style={styles.textInputWrap}
                onChangeText={text => this.onAccountChangeText(text)}
                value={this.state.account}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <IconOutline name="safety" size={24} color="#606266" />
              </View>

              <TextInput
                style={styles.textInputWrap}
                secureTextEntry={true}
                onChangeText={text => this.onPasswordChangeText(text)}
                returnKeyType={'done'}
                onSubmitEditing={this.login}
                value={this.state.password}
              />
            </View>

            <Button type="primary" onPress={this.login}>
              登录
            </Button>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const viewShadow = {
  elevation: 1.5, // 设置阴影色
  shadowColor: '#999',
  shadowOffset: {width: 0, height: 0},
  shadowOpacity: 1,
  shadowRadius: 1.5, // 设置阴影模糊半径,该值设置整个阴影的半径，默认的效果就是View的四周都有阴影
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height,
  },
  backgroundImage: {
    width: width,
    height: height,
    resizeMode: 'contain',
    justifyContent: 'center',
  },
  layout: {
    width: width * 0.8,
    height: height * 0.4,
    marginHorizontal: width * 0.1,
    marginTop: height * 0.1,
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 8,
    ...viewShadow,
  },
  row: {
    height: 42,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  iconWrap: {
    width: 40,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputWrap: {
    width: width * 0.8 - 41 - 8,
    height: 40,
    paddingLeft: 8,
    paddingRight: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#ccc',
  },
});

export default Login;
