import React from 'react';
import {
  Dimensions,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  Image,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  ToastAndroid,
  FlatList,
} from 'react-native';
import {IconOutline} from '@ant-design/icons-react-native';

import Button from '@ant-design/react-native/lib/button';
import DatePicker from '@ant-design/react-native/lib/date-picker';
import List from '@ant-design/react-native/lib/list';
import InputItem from '@ant-design/react-native/lib/input-item';
import Provider from '@ant-design/react-native/lib/provider';

import SplashScreen from 'react-native-splash-screen';
import {getUniqueId} from 'react-native-device-info';
import FS from 'react-native-fs';
import XLSX from 'xlsx';

import CommonButton from './src/components/CommonButton';

import {parseTime} from './src/utils';
import md5 from 'js-md5';

const {width, height} = Dimensions.get('window');

import storage from './src/utils/storage';

const defaultUserInfo = {
  account: 'admin',
  password: '123456',
};

const cycleData = [
  {
    label: '月',
    value: 'month',
  },
  {
    label: '周',
    value: 'week',
  },
  {
    label: '日',
    value: 'day',
  },
];

const getUserInfo = () => {
  return new Promise((resolve, reject) => {
    storage
      .load({
        key: 'UserInfo',
      })
      .then(res => {
        resolve(res);
      })
      .catch(() => {
        resolve(defaultUserInfo);
        storage.save({
          key: 'UserInfo',
          data: {
            ...defaultUserInfo,
          },
        });
      });
  });
};

const get6LengthKey = key => {
  return (
    key.charAt(3).toUpperCase() +
    key.charAt(7) +
    key.charAt(11).toUpperCase() +
    key.charAt(15) +
    key.charAt(19).toUpperCase() +
    key.charAt(23)
  );
};
const get8LengthKey = key => {
  return (
    key.charAt(3).toUpperCase() +
    key.charAt(7) +
    key.charAt(11).toUpperCase() +
    key.charAt(15) +
    key.charAt(19).toUpperCase() +
    key.charAt(23) +
    key.charAt(27).toUpperCase() +
    key.charAt(31)
  );
};

/**
 * 数据导出为Excel
 * @param {数据} data
 */
const exportExcel = (data = [], fileName) => {
  let wb = XLSX.utils.book_new();
  let ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Users');
  const wbout = XLSX.write(wb, {type: 'binary', bookType: 'xlsx'});

  // Write generated excel to Storage
  // 计算项目-计算历史记录
  FS.writeFile(`${FS.ExternalDirectoryPath}/${fileName}.xlsx`, wbout, 'ascii')
    .then(r => {
      Alert.alert(
        '导出成功！',
        '因系统限制，文件保存于Android/data/com.bwda.calculate_app/file文件夹。',
      );
    })
    .catch(e => {
      Alert.alert('导出失败！', '请检查读写权限！');
    });
};

/**
 *
 * @param str 待加密字符串
 * @param keyLength 秘钥长度 4,6,8
 * @param keyCount 秘钥个数
 */
const computed_str = (str, keyLength, keyCount) => {
  const result = [];
  for (let i = 0; i < keyCount; i++) {
    let newStr = md5.hex(`${str}${i}`);
    let key = '';
    if (keyLength === 6) {
      key = get6LengthKey(newStr);
    }
    if (keyLength === 8) {
      key = get8LengthKey(newStr);
    }

    result.push(key);
  }
  return result;
};

/**
 * 登录页面
 */
class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      account: 'admin',
      password: '123456',
    };
  }

  onAccountChangeText(account) {
    this.setState({account: account});
  }

  onPasswordChangeText(password) {
    this.setState({password: password});
  }

  login() {
    const checkInfo = info => {
      const {account, password} = info;
      if (this.state.account === account && this.state.password === password) {
        ToastAndroid.show('登录成功!', ToastAndroid.SHORT);
        this.props.loginChange();
      } else {
        Alert.alert('用户名密码错误');
      }
    };
    getUserInfo()
      .then(info => {
        checkInfo(info);
      })
      .catch(info => {
        checkInfo(info);
      });
  }

  render() {
    return (
      <View style={styles.login_container}>
        <ImageBackground
          source={require('./src/assets/images/login_background.png')}
          style={styles.login_basemap}>
          <View style={styles.login_info_wrap}>
            <ImageBackground
              source={require('./src/assets/images/login_logo.png')}
              style={styles.login_logo}
            />
            <ImageBackground
              source={require('./src/assets/images/login_info.png')}
              style={styles.login_info}
            />
          </View>

          <ImageBackground
            source={require('./src/assets/images/login_layout.png')}
            resizeMethod={'resize'}
            resizeMode={'stretch'}
            style={styles.login_layout}>
            <View style={styles.login_form_row}>
              <View style={styles.login_row_icon_wrap}>
                <IconOutline name="user" size={24} color="#606266" />
              </View>

              <TextInput
                style={styles.login_row_input_wrap}
                placeholder={'初始账号: admin'}
                placeholderTextColor={'#909399'}
                onChangeText={text => this.onAccountChangeText(text)}
                value={this.state.account}
              />
            </View>

            <View style={styles.login_form_row}>
              <View style={styles.login_row_icon_wrap}>
                <IconOutline name="safety" size={24} color="#606266" />
              </View>

              <TextInput
                style={styles.login_row_input_wrap}
                secureTextEntry={true}
                placeholder={'初始密码: 123456'}
                placeholderTextColor={'#909399'}
                onChangeText={text => this.onPasswordChangeText(text)}
                returnKeyType={'done'}
                onSubmitEditing={this.login}
                value={this.state.password}
              />
            </View>

            <Button
              type="primary"
              style={styles.login_button_wrap}
              onPress={() => this.login()}>
              登录
            </Button>
          </ImageBackground>
        </ImageBackground>
      </View>
    );
  }
}

/**
 * 授权页面
 */
class Authorize extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      key: '', // 授权码
      code: '', // 认证码
    };
  }

  componentDidMount() {
    const uniqueId = getUniqueId();
    const uniqueKey = uniqueId.substr(0, 6);
    this.onKeyChangeText(uniqueKey);

    // 测试使用
    const now = parseTime(new Date(), '{y}-{m}-{d}');
    const key = `${uniqueKey}${now}`;
    const code = computed_str(key, 6, 1)[0];
    console.log('key: ', key);
    console.log('授权秘钥: ', code);
    // console.log("测试code: ", computed_str("bcccdd2022-05-24", 6, 1)[0]);
  }

  onKeyChangeText(key) {
    this.setState({key: key});
  }

  onCodeChangeText(code) {
    this.setState({code: code});
  }

  onAuthorize() {
    const now = parseTime(new Date(), '{y}-{m}-{d}');
    const key = `${this.state.key}${now}`;
    const code = computed_str(key, 6, 1)[0];
    if (code === this.state.code) {
      storage
        .save({
          key: 'AuthorizeKey',
          data: {
            isAuthorize: true,
            code: code,
          },
        })
        .then()
        .catch()
        .finally(() => {
          this.props.onAuthorized();
        });
    } else {
      Alert.alert('授权秘钥错误!');
    }
  }

  render() {
    return (
      <View style={AuthorizeStyles.container}>
        <View style={AuthorizeStyles.body}>
          <Text style={AuthorizeStyles.title}>授权认证</Text>
          <Text style={AuthorizeStyles.key}>授权码: {this.state.key}</Text>
          <View style={AuthorizeStyles.code_container}>
            <TextInput
              style={AuthorizeStyles.code_input}
              placeholder={'请输入6位认证码'}
              placeholderTextColor={'#909399'}
              onChangeText={text => this.onCodeChangeText(text)}
              returnKeyType={'done'}
              onSubmitEditing={this.onAuthorize}
              value={this.state.code}
            />
          </View>

          <Button
            type="primary"
            style={AuthorizeStyles.confirm_button}
            onPress={() => this.onAuthorize()}>
            授权
          </Button>
        </View>
      </View>
    );
  }
}

/**
 * 标签文本组件
 */
class LabelInput extends React.Component {
  constructor(props) {
    super(props);
  }

  onTextChange(value) {
    this.props.textChange(value);
  }

  render() {
    return (
      <View style={InputStyles.row_container}>
        <Text style={InputStyles.row_label}>{this.props.label}</Text>
        <TextInput
          style={InputStyles.row_input}
          placeholder={'请输入'}
          keyboardType={this.props.keyboardType || 'default'}
          maxLength={this.props.maxLength}
          placeholderTextColor={'#909399'}
          onChangeText={text => this.onTextChange(text)}
          value={this.props.value}
        />
      </View>
    );
  }
}

/**
 * 头部组件
 */
class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  back() {
    console.log('header_back');
    this.props.back();
  }

  onExit() {
    this.props.onExit();
  }

  onEdit() {
    this.props.onEdit();
  }

  onExportExcel() {
    this.props.onExportExcel();
  }

  render() {
    return (
      <View style={HeaderStyles.header_container}>
        <View
          style={{
            ...HeaderStyles.header_button_wrap,
            ...HeaderStyles.header_left,
          }}>
          {this.props.isBack && (
            <TouchableOpacity onPress={() => this.back()} activeOpacity={0.5}>
              <Image
                style={HeaderStyles.header_button_icon}
                source={require('./src/assets/images/header_back.png')}
              />
            </TouchableOpacity>
          )}
        </View>
        <Text style={HeaderStyles.header_title}>{this.props.title}</Text>
        <View
          style={{
            ...HeaderStyles.header_button_wrap,
            ...HeaderStyles.header_right,
          }}>
          {this.props.isEdit && (
            <TouchableOpacity onPress={() => this.onEdit()} activeOpacity={0.5}>
              <Image
                style={HeaderStyles.header_button_icon}
                source={require('./src/assets/images/computed_edit.png')}
              />
            </TouchableOpacity>
          )}
          {this.props.isExit && (
            <TouchableOpacity onPress={() => this.onExit()} activeOpacity={0.5}>
              <Image
                style={HeaderStyles.header_button_icon}
                source={require('./src/assets/images/computed_exit.png')}
              />
            </TouchableOpacity>
          )}
          {this.props.isExportExcel && (
            <TouchableOpacity
              onPress={() => this.onExportExcel()}
              activeOpacity={0.5}>
              <Image
                style={HeaderStyles.header_button_icon}
                source={require('./src/assets/images/history_excel.png')}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
}

/**
 * 计算结果组件
 */
class ComputedResult extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={ComputedResultStyles.result_wrap}>
        <Text style={ComputedResultStyles.result_title}>计算结果</Text>
        <View style={ComputedResultStyles.result_list_wrap}>
          <View style={ComputedResultStyles.result_item_wrap}>
            <Text
              style={{
                ...ComputedResultStyles.result_index,
                ...ComputedResultStyles.result_index_common,
              }}>
              1
            </Text>
            <Text style={ComputedResultStyles.result_content}>
              {this.props.key_1}
            </Text>
          </View>
          <View style={ComputedResultStyles.result_item_wrap}>
            <Text
              style={{
                ...ComputedResultStyles.result_index,
                ...ComputedResultStyles.result_index_common,
              }}>
              2
            </Text>
            <Text style={ComputedResultStyles.result_content}>
              {this.props.key_2}
            </Text>
          </View>

          <View style={ComputedResultStyles.result_line} />

          <View style={ComputedResultStyles.result_item_wrap}>
            <Text
              style={{
                ...ComputedResultStyles.result_index,
                ...ComputedResultStyles.result_index_common,
              }}>
              3
            </Text>
            <Text style={ComputedResultStyles.result_content}>
              {this.props.key_3}
            </Text>
          </View>

          <View style={ComputedResultStyles.result_item_wrap}>
            <View style={ComputedResultStyles.result_key_wrap}>
              <Text
                style={{
                  ...ComputedResultStyles.result_index,
                  ...ComputedResultStyles.result_index_primary,
                }}>
                4
              </Text>
              <Text style={ComputedResultStyles.result_content}>
                {this.props.key_4}
              </Text>
            </View>
            <Text style={ComputedResultStyles.result_prompt}>(超级密码)</Text>
          </View>
          <View style={ComputedResultStyles.result_line} />
        </View>
      </View>
    );
  }
}

class ComputedNewResult extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={ComputedNewResultStyles.container}>
        <View style={ComputedNewResultStyles.frame}>
          <Text style={ComputedNewResultStyles.result_title}>计算结果</Text>
          <Text style={ComputedNewResultStyles.result_content}>
            {this.props.key_1}
          </Text>
        </View>
      </View>
    );
  }
}

/**
 * 计算页面
 */
class Computed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPage: 'delay', // delay loan delay_history loan_history
    };
  }

  componentDidMount() {}

  chnagePage(page) {
    this.setState({
      isPage: page,
    });
  }

  onExit() {
    this.props.onExit();
  }

  onEdit() {
    this.props.onEdit();
  }

  render() {
    return (
      <View style={ComputedStyles.container}>
        {this.state.isPage === 'delay' && (
          <DelayApplyComputed
            change={page => {
              this.chnagePage(page);
            }}
            onEdit={() => this.onEdit()}
            onExit={() => this.onExit()}
            onHistory={() => this.chnagePage('delay_history')}
          />
        )}
        {this.state.isPage === 'delay_history' && (
          <DelayApplyHistory
            change={page => {
              this.chnagePage(page);
            }}
          />
        )}
        {this.state.isPage === 'loan' && (
          <LoanApplyComputed
            change={page => {
              this.chnagePage(page);
            }}
            onEdit={() => this.onEdit()}
            onExit={() => this.onExit()}
            onHistory={() => this.chnagePage('loan_history')}
          />
        )}
        {this.state.isPage === 'loan_history' && (
          <LoanApplyHistory
            change={page => {
              this.chnagePage(page);
            }}
          />
        )}
      </View>
    );
  }
}

/**
 * 延期计算页面
 */
class DelayApplyComputed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apply_number: '0409.2022', // 初始借用申请单号
      borrow_user: '', // 携带人姓名
      machine_number: 'BXJSJ0000', // 便携机编号
      borrow_date: '', // 开始借用时间
      repaid_date: '', // 预计归还时间
      phone_apply_number: 'BXJJY2022', // 手机端借用申请单号
      delay_repaid_date: '', // 本次申请延期借用预计归还时间
      opera_time: '', // 计算时间
      key: '', // 解锁码
    };
  }

  componentDidMount() {}

  onApplyNumberChange(text) {
    this.setState({
      apply_number: text,
    });
  }

  onBorrowUserChange(text) {
    this.setState({
      borrow_user: text,
    });
  }

  onMachineNumberChange(text) {
    this.setState({
      machine_number: text,
    });
  }

  onBorrowDateChange(date) {
    this.setState({
      borrow_date: date,
    });
  }

  onRepaidDateChange(date) {
    this.setState({
      repaid_date: date,
    });
  }

  onPhoneApplyNumberChange(date) {
    this.setState({
      phone_apply_number: date,
    });
  }

  onDelayRepaidDateChange(text) {
    this.setState({
      delay_repaid_date: text,
    });
  }

  onReset() {
    this.setState({
      apply_number: '0409.2022', // 初始借用申请单号
      borrow_user: '', // 携带人姓名
      machine_number: 'BXJSJ0000', // 便携机编号
      borrow_date: '', // 开始借用时间
      repaid_date: '', // 预计归还时间
      phone_apply_number: 'BXJJY2022', // 手机端借用申请单号
      delay_repaid_date: '', // 本次申请延期借用预计归还时间
      key: '', // 解锁码
    });
  }

  /**
   * 添加到历史
   */
  addHistory() {
    let dataStr = JSON.stringify(this.state);
    let key = md5.hex(dataStr);

    storage
      .load({
        key: 'ComputedHistory',
      })
      .then(res => {
        let index = res.findIndex(item => item.key === key);

        if (index === -1) {
          storage.save({
            key: 'ComputedHistory',
            data: [].concat([{key, ...this.state}], res),
          });
        } else {
          res.forEach(item => {
            if (item.key === key) {
              item.opera_time = new Date().getTime();
            }
          });
          storage.save({
            key: 'ComputedHistory',
            data: [...res],
          });
        }
      })
      .catch(() => {
        storage.save({
          key: 'ComputedHistory',
          data: [
            {
              key,
              ...this.state,
            },
          ],
        });
      });
  }

  onComputed() {
    let apply_numberLength = `${this.state.apply_number.toString().length}`;
    let machine_numberLength = `${this.state.machine_number.toString().length}`;
    let phone_apply_numberLength = `${
      this.state.phone_apply_number.toString().length
    }`;
    if (apply_numberLength != 17) {
      Alert.alert('初始借用申请单号必须为17位，请重新输入');
      return null;
    }
    if (!this.state.borrow_user) {
      Alert.alert('请输入携带人姓名');
      return null;
    }
    if (machine_numberLength != 12) {
      Alert.alert('便携机编号必须为12位，请重新输入');
      return null;
    }
    if (phone_apply_numberLength != 16) {
      Alert.alert('手机端借用申请单号必须为16位，请重新输入');
      return null;
    }

    if (!this.state.machine_number) {
      Alert.alert('请输入便携机编号');
      return null;
    }

    let borrow_date = parseTime(this.state.borrow_date, '{y}{m}{d}');
    let repaid_date = parseTime(this.state.repaid_date, '{y}{m}{d}');

    let str = `${this.state.borrow_user}${this.state.machine_number}${borrow_date}${repaid_date}`;

    let keys = computed_str(str, 6, 1);

    this.setState({
      opera_time: new Date().getTime(),
      key: keys[0],
    });

    this.addHistory();
  }

  onHistory() {
    this.props.onHistory();
  }

  onPageChange() {
    this.props.change('loan');
  }

  onExit() {
    this.props.onExit();
  }

  onEdit() {
    this.props.onEdit();
  }

  render() {
    const isResult = !!this.state.key;
    return (
      <View style={ComputedStyles.container}>
        <SafeAreaView style={ComputedStyles.safe_container}>
          <ScrollView>
            <Header
              title={'延期借用'}
              isEdit={true}
              isExit={true}
              onExit={() => this.onExit()}
              onEdit={() => this.onEdit()}
            />
            <View style={ComputedStyles.computed_wrap}>
              <LabelInput
                value={this.state.apply_number}
                label={'初始借用申请单号'}
                maxLength={17}
                textChange={text => this.onApplyNumberChange(text)}
              />
              <LabelInput
                value={this.state.borrow_user}
                label={'携带人姓名'}
                maxLength={10}
                textChange={text => this.onBorrowUserChange(text)}
              />
              <LabelInput
                value={this.state.machine_number}
                label={'便携机编号\n(区分大小写)'}
                maxLength={12}
                textChange={text => this.onMachineNumberChange(text)}
              />
              <List>
                <DatePicker
                  value={this.state.borrow_date}
                  mode="date"
                  minDate={new Date(1970, 1, 1)}
                  maxDate={new Date(2099, 12, 31)}
                  format="YYYY-MM-DD"
                  onChange={date => this.onBorrowDateChange(date)}>
                  <List.Item arrow="horizontal">开始借用时间</List.Item>
                </DatePicker>
              </List>
              <List>
                <DatePicker
                  value={this.state.repaid_date}
                  mode="date"
                  minDate={new Date(1970, 1, 1)}
                  maxDate={new Date(2099, 12, 31)}
                  format="YYYY-MM-DD"
                  onChange={date => this.onRepaidDateChange(date)}>
                  <List.Item arrow="horizontal">预计归还时间</List.Item>
                </DatePicker>
              </List>

              <LabelInput
                value={this.state.phone_apply_number}
                label={'手机端借用\n申请单号'}
                maxLength={16}
                textChange={text => this.onPhoneApplyNumberChange(text)}
              />

              <List>
                <DatePicker
                  value={this.state.delay_repaid_date}
                  mode="date"
                  minDate={new Date(1970, 1, 1)}
                  maxDate={new Date(2099, 12, 31)}
                  format="YYYY-MM-DD"
                  onChange={date => this.onDelayRepaidDateChange(date)}>
                  <List.Item arrow="horizontal">
                    <View style={InputStyles.multiple_label_wrap}>
                      <Text style={InputStyles.multiple_label_item}>
                        本次申请延期借用
                      </Text>
                      <Text style={InputStyles.multiple_label_item}>
                        预计归还时间
                      </Text>
                    </View>
                  </List.Item>
                </DatePicker>
              </List>

              {/*<LabelInput
                value={this.state.renewal_number}
                label={"续借次数"}
                keyboardType={"numeric"}
                maxLength={1}
                textChange={text => this.onRenewalNumberChange(text)}
              />
              <List>
                <Picker
                  data={cycleData}
                  cols={1}
                  value={this.state.renewal_cycle}
                  onChange={text => this.onRenewalCycleChange(text)}>
                  <List.Item arrow="horizontal">续借周期</List.Item>
                </Picker>
              </List>*/}

              <View style={ComputedStyles.button_wrap}>
                <CommonButton title={'重置'} click={() => this.onReset()} />
                <CommonButton
                  type={'primary'}
                  title={'计算超期解锁码'}
                  click={() => this.onComputed()}
                />
              </View>
            </View>
            {isResult && (
              /*<ComputedResult key_1={this.state.key_1} key_2={this.state.key_2} key_3={this.state.key_3}
                              key_4={this.state.key_4} />*/

              <ComputedNewResult key_1={this.state.key} />
            )}
            <View style={ComputedStyles.history_button}>
              <TouchableOpacity
                onPress={() => this.onHistory()}
                activeOpacity={0.5}>
                <Text style={ComputedStyles.history_content}>历史记录 ></Text>
              </TouchableOpacity>
            </View>
            <View style={ComputedStyles.history_button}>
              <TouchableOpacity
                onPress={() => this.onPageChange()}
                activeOpacity={0.5}>
                <Text style={ComputedStyles.history_content}>
                  转借借用页面 >
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }
}

/**
 * 转借借用
 */
class LoanApplyComputed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apply_number: '0409.2022', // a 初始借用申请单号
      borrow_user: '', // b 携带人姓名
      machine_number: 'BXJSJ0000', // c 便携机编号
      borrow_date: '', // d 开始借用时间
      repaid_date: '', // e 预计归还时间
      overdue_borrow_count: 0, // f 已超期借用次数
      phone_apply_number: 'BXJJY2022', // g 手机端借用申请单号
      delay_repaid_date: '', // h 本次申请延期借用预计归还时间
      loan_borrow_user_name: '', // i 新携带人姓名
      loan_borrow_user_phone: '', // j 新携带人手机号
      opera_time: '', // 计算时间
      key: '', // 解锁码
    };
  }

  componentDidMount() {}

  /**
   * a 初始借用申请单号
   * @param {String} text 初始借用申请单号
   */
  onApplyNumberChange(text) {
    this.setState({
      apply_number: text,
    });
  }

  /**
   * b 携带人姓名
   * @param {String} text 携带人姓名
   */
  onBorrowUserChange(text) {
    this.setState({
      borrow_user: text,
    });
  }

  /**
   * c 便携机编号
   * @param {*} text 便携机编号
   */
  onMachineNumberChange(text) {
    this.setState({
      machine_number: text,
    });
  }

  /**
   * d 开始借用时间
   * @param {*} date 开始借用时间
   */
  onBorrowDateChange(date) {
    this.setState({
      borrow_date: date,
    });
  }

  /**
   * e 预计归还时间
   * @param {*} date 预计归还时间
   */
  onRepaidDateChange(date) {
    this.setState({
      repaid_date: date,
    });
  }

  /**
   * f、已超期借用次数
   * @param {*} date 已超期借用次数
   */
  onOverdueBorrowCountChange(date) {
    this.setState({
      overdue_borrow_count: date,
    });
  }

  /**
   * g 手机端借用申请单号
   * @param {*} date 手机端借用申请单号
   */
  onPhoneApplyNumberChange(date) {
    this.setState({
      phone_apply_number: date,
    });
  }

  /**
   * h 本次申请延期借用预计归还时间
   * @param {*} text 本次申请延期借用预计归还时间
   */
  onDelayRepaidDateChange(text) {
    this.setState({
      delay_repaid_date: text,
    });
  }

  /**
   * i、输入新携带人姓名
   * @param {*} text 输入新携带人姓名
   */
  onLoanBorrowUserNameChange(text) {
    this.setState({
      loan_borrow_user_name: text,
    });
  }

  /**
   * j、新携带人手机号
   * @param {*} text 新携带人手机号
   */
  onLoanBorrowUserPhoneChange(text) {
    this.setState({
      loan_borrow_user_phone: text,
    });
  }

  onReset() {
    this.setState({
      apply_number: '0409.2022', // a 初始借用申请单号
      borrow_user: '', // b 携带人姓名
      machine_number: 'BXJSJ0000', // c 便携机编号
      borrow_date: '', // d 开始借用时间
      repaid_date: '', // e 预计归还时间
      overdue_borrow_count: 0, // f 已超期借用次数
      phone_apply_number: 'BXJJY2022', // g 手机端借用申请单号
      delay_repaid_date: '', // h 本次申请延期借用预计归还时间
      loan_borrow_user_name: '', // i 新携带人姓名
      loan_borrow_user_phone: '', // j 新携带人手机号
      opera_time: '', // 计算时间
      key: '', // 解锁码
    });
  }

  /**
   * 添加到历史
   */
  addHistory() {
    let dataStr = JSON.stringify(this.state);
    let key = md5.hex(dataStr);

    storage
      .load({
        key: 'LoanApplyComputedHistory',
      })
      .then(res => {
        let index = res.findIndex(item => item.key === key);

        if (index === -1) {
          storage.save({
            key: 'LoanApplyComputedHistory',
            data: [].concat([{key, ...this.state}], res),
          });
        } else {
          res.forEach(item => {
            if (item.key === key) {
              item.opera_time = new Date().getTime();
            }
          });
          storage.save({
            key: 'LoanApplyComputedHistory',
            data: [...res],
          });
        }
      })
      .catch(() => {
        storage.save({
          key: 'LoanApplyComputedHistory',
          data: [
            {
              key,
              ...this.state,
            },
          ],
        });
      });
  }

  onComputed() {
    let apply_numberLength = `${this.state.apply_number.toString().length}`;
    let machine_numberLength = `${this.state.machine_number.toString().length}`;
    let phone_apply_numberLength = `${
      this.state.phone_apply_number.toString().length
    }`;
    if (apply_numberLength != 17) {
      Alert.alert('初始借用申请单号必须为17位，请重新输入');
      return null;
    }
    if (machine_numberLength != 12) {
      Alert.alert('便携机编号必须为12位，请重新输入');
      return null;
    }
    if (phone_apply_numberLength != 16) {
      Alert.alert('手机端借用申请单号必须为16位，请重新输入');
      return null;
    }
    if (!this.state.loan_borrow_user_name) {
      Alert.alert('请输入新携带人姓名');

      return null;
    }

    if (!this.state.machine_number) {
      Alert.alert('请输入便携机编号');
      return null;
    }

    let borrow_date = parseTime(this.state.borrow_date, '{y}{m}{d}');
    let delay_repaid_date = parseTime(
      this.state.delay_repaid_date,
      '{y}{m}{d}',
    );

    let str = `${this.state.loan_borrow_user_name}${this.state.machine_number}${borrow_date}${delay_repaid_date}`;

    let keys = computed_str(str, 6, 1);

    this.setState({
      opera_time: new Date().getTime(),
      key: keys[0],
    });

    this.addHistory();
  }

  onHistory() {
    this.props.onHistory();
  }

  onPageChange() {
    this.props.change('delay');
  }

  onExit() {
    this.props.onExit();
  }

  onEdit() {
    this.props.onEdit();
  }

  render() {
    const isResult = !!this.state.key;
    return (
      <View style={ComputedStyles.container}>
        <SafeAreaView style={ComputedStyles.safe_container}>
          <ScrollView>
            <Header
              title={'转借借用'}
              isEdit={true}
              isExit={true}
              onExit={() => this.onExit()}
              onEdit={() => this.onEdit()}
            />
            <View style={ComputedStyles.computed_wrap}>
              <LabelInput
                value={this.state.apply_number}
                label={'初始借用申请单号'}
                maxLength={17}
                textChange={text => this.onApplyNumberChange(text)}
              />
              <LabelInput
                value={this.state.borrow_user}
                label={'携带人姓名'}
                maxLength={10}
                textChange={text => this.onBorrowUserChange(text)}
              />
              <LabelInput
                value={this.state.machine_number}
                label={'便携机编号\n(区分大小写)'}
                maxLength={12}
                textChange={text => this.onMachineNumberChange(text)}
              />
              <List>
                <DatePicker
                  value={this.state.borrow_date}
                  mode="date"
                  minDate={new Date(1970, 1, 1)}
                  maxDate={new Date(2099, 12, 31)}
                  format="YYYY-MM-DD"
                  onChange={date => this.onBorrowDateChange(date)}>
                  <List.Item arrow="horizontal">开始借用时间</List.Item>
                </DatePicker>
              </List>
              <List>
                <DatePicker
                  value={this.state.repaid_date}
                  mode="date"
                  minDate={new Date(1970, 1, 1)}
                  maxDate={new Date(2099, 12, 31)}
                  format="YYYY-MM-DD"
                  onChange={date => this.onRepaidDateChange(date)}>
                  <List.Item arrow="horizontal">预计归还时间</List.Item>
                </DatePicker>
              </List>

              <LabelInput
                value={this.state.overdue_borrow_count}
                label={'已超期借用次数'}
                keyboardType={'numeric'}
                maxLength={1}
                textChange={text => this.onOverdueBorrowCountChange(text)}
              />

              <LabelInput
                value={this.state.phone_apply_number}
                label={'手机端借用\n申请单号'}
                maxLength={16}
                textChange={text => this.onPhoneApplyNumberChange(text)}
              />

              <List>
                <DatePicker
                  value={this.state.delay_repaid_date}
                  mode="date"
                  minDate={new Date(1970, 1, 1)}
                  maxDate={new Date(2099, 12, 31)}
                  format="YYYY-MM-DD"
                  onChange={date => this.onDelayRepaidDateChange(date)}>
                  <List.Item arrow="horizontal">
                    <View style={InputStyles.multiple_label_wrap}>
                      <Text style={InputStyles.multiple_label_item}>
                        本次申请延期借用
                      </Text>
                      <Text style={InputStyles.multiple_label_item}>
                        预计归还时间
                      </Text>
                    </View>
                  </List.Item>
                </DatePicker>
              </List>

              <LabelInput
                value={this.state.loan_borrow_user_name}
                label={'新携带人姓名'}
                maxLength={10}
                textChange={text => this.onLoanBorrowUserNameChange(text)}
              />

              <LabelInput
                value={this.state.loan_borrow_user_phone}
                label={'新携带人手机号'}
                maxLength={11}
                textChange={text => this.onLoanBorrowUserPhoneChange(text)}
              />

              {/*<LabelInput
                value={this.state.renewal_number}
                label={"续借次数"}
                keyboardType={"numeric"}
                maxLength={1}
                textChange={text => this.onRenewalNumberChange(text)}
              />
              <List>
                <Picker
                  data={cycleData}
                  cols={1}
                  value={this.state.renewal_cycle}
                  onChange={text => this.onRenewalCycleChange(text)}>
                  <List.Item arrow="horizontal">续借周期</List.Item>
                </Picker>
              </List>*/}

              <View style={ComputedStyles.button_wrap}>
                <CommonButton title={'重置'} click={() => this.onReset()} />
                <CommonButton
                  type={'primary'}
                  title={'计算转借解锁码'}
                  click={() => this.onComputed()}
                />
              </View>
            </View>
            {isResult && (
              /*<ComputedResult key_1={this.state.key_1} key_2={this.state.key_2} key_3={this.state.key_3}
                              key_4={this.state.key_4} />*/

              <ComputedNewResult key_1={this.state.key} />
            )}
            <View style={ComputedStyles.history_button}>
              <TouchableOpacity
                onPress={() => this.onHistory()}
                activeOpacity={0.5}>
                <Text style={ComputedStyles.history_content}>历史记录 ></Text>
              </TouchableOpacity>
            </View>
            <View style={ComputedStyles.history_button}>
              <TouchableOpacity
                onPress={() => this.onPageChange()}
                activeOpacity={0.5}>
                <Text style={ComputedStyles.history_content}>
                  延期借用页面 >
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }
}

class DelayApplyHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      historyList: [],
    };
  }

  componentDidMount() {
    storage
      .load({
        key: 'ComputedHistory',
      })
      .then(res => {
        this.setState({
          historyList: res,
        });
      })
      .catch(() => {
        this.setState({
          historyList: [],
        });
      });
  }

  onBack() {
    this.props.change('delay');
  }

  onExportExcel() {
    let data = this.state.historyList.reduce((r, c) => {
      r.push({
        初始借用申请单号: c.apply_number,
        携带人姓名: c.borrow_user,
        便携机编号: c.machine_number,
        开始借用时间: parseTime(new Date(c.borrow_date), '{y}-{m}-{d}'),
        预计归还日期: parseTime(new Date(c.repaid_date), '{y}-{m}-{d}'),
        手机端借用申请单号: c.phone_apply_number,
        本次申请延期借用预计归还时间: parseTime(
          new Date(c.delay_repaid_date),
          '{y}-{m}-{d}',
        ),
        计算时间: parseTime(new Date(c.delay_repaid_date), '{y}-{m}-{d}'),
      });
      return r;
    }, []);
    exportExcel(data, '计算项目-延期借用记录');
  }

  getItem({item}) {
    const repaid_date = parseTime(new Date(item.repaid_date), '{y}-{m}-{d}');
    const borrow_date = parseTime(new Date(item.borrow_date), '{y}-{m}-{d}');
    const delay_repaid_date = parseTime(
      new Date(item.delay_repaid_date),
      '{y}-{m}-{d}',
    );
    const opera_time = parseTime(
      new Date(item.opera_time),
      '{y}-{m}-{d} {h}:{i}:{s}',
    );
    return (
      <View style={HistoryStyles.list_item_wrap}>
        <View style={HistoryStyles.list_row_wrap}>
          <View style={HistoryStyles.list_row_item_wrap}>
            <Text style={HistoryStyles.row_title}>初始借用申请单号</Text>
            <Text style={HistoryStyles.row_content}>{item.apply_number}</Text>
          </View>
          <View style={HistoryStyles.list_row_item_wrap}>
            <Text style={HistoryStyles.row_title}>手机端借用申请单号</Text>
            <Text style={HistoryStyles.row_content}>
              {item.phone_apply_number}
            </Text>
          </View>
        </View>

        <View style={HistoryStyles.list_row_wrap}>
          <View style={HistoryStyles.list_row_item_wrap}>
            <Text style={HistoryStyles.row_title}>携带人姓名</Text>
            <Text style={HistoryStyles.row_content}>{item.borrow_user}</Text>
          </View>
          <View style={HistoryStyles.list_row_item_wrap}>
            <Text style={HistoryStyles.row_title}>便携机编号</Text>
            <Text style={HistoryStyles.row_content}>{item.machine_number}</Text>
          </View>
        </View>

        <View style={HistoryStyles.list_row_wrap}>
          <View style={HistoryStyles.list_row_item_wrap}>
            <Text style={HistoryStyles.row_title}>开始借用时间</Text>
            <Text style={HistoryStyles.row_content}>{borrow_date}</Text>
          </View>
          <View style={HistoryStyles.list_row_item_wrap}>
            <Text style={HistoryStyles.row_title}>预计归还时间</Text>
            <Text style={HistoryStyles.row_content}>{repaid_date}</Text>
          </View>
        </View>
        <View style={HistoryStyles.list_row_wrap}>
          <View style={HistoryStyles.list_row_item_wrap}>
            <Text style={HistoryStyles.row_title}>操作时间</Text>
            <Text style={HistoryStyles.row_content}>{opera_time}</Text>
          </View>
        </View>
        <View style={HistoryStyles.list_row_wrap}>
          <View style={HistoryStyles.list_row_full_item_wrap}>
            <Text style={HistoryStyles.row_title}>
              本次申请延期借用预计归还时间
            </Text>
            <Text style={HistoryStyles.row_content}>{delay_repaid_date}</Text>
          </View>
        </View>
        <ComputedNewResult key_1={item.key} />
      </View>
    );
  }

  render() {
    const historyList = this.state.historyList.sort(
      (a, b) => b.opera_time - a.opera_time,
    );
    return (
      <View style={HistoryStyles.container}>
        <SafeAreaView style={HistoryStyles.safe_container}>
          <Header
            title={'延期借用历史记录'}
            isBack={true}
            isExportExcel={true}
            back={() => this.onBack()}
            onExportExcel={() => this.onExportExcel()}
          />
          <FlatList
            style={HistoryStyles.list_wrap}
            data={historyList}
            renderItem={item => this.getItem(item)}
            keyExtractor={item => item.key}
          />
        </SafeAreaView>
      </View>
    );
  }
}

class LoanApplyHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      historyList: [],
    };
  }

  componentDidMount() {
    storage
      .load({
        key: 'LoanApplyComputedHistory',
      })
      .then(res => {
        this.setState({
          historyList: res,
        });
      })
      .catch(() => {
        this.setState({
          historyList: [],
        });
      });
  }

  onBack() {
    this.props.change('loan');
  }

  onExportExcel() {
    let data = this.state.historyList.reduce((r, c) => {
      r.push({
        初始借用申请单号: c.apply_number, // a
        携带人姓名: c.borrow_user, // b
        便携机编号: c.machine_number, // c
        开始借用时间: parseTime(new Date(c.borrow_date), '{y}-{m}-{d}'), // d
        预计归还日期: parseTime(new Date(c.repaid_date), '{y}-{m}-{d}'), // e
        已超期借用次数: c.overdue_borrow_count, // f
        手机端借用申请单号: c.phone_apply_number, // g
        本次申请延期借用预计归还时间: parseTime(
          new Date(c.delay_repaid_date),
          '{y}-{m}-{d}',
        ), // h
        新携带人姓名: c.loan_borrow_user_name, // i
        新携带人手机号: c.loan_borrow_user_phone, // j
        计算时间: parseTime(new Date(c.delay_repaid_date), '{y}-{m}-{d}'),
      });
      return r;
    }, []);
    exportExcel(data, '计算项目-转借借用记录');
  }

  getItem({item}) {
    const repaid_date = parseTime(new Date(item.repaid_date), '{y}-{m}-{d}');
    const borrow_date = parseTime(new Date(item.borrow_date), '{y}-{m}-{d}');
    const delay_repaid_date = parseTime(
      new Date(item.delay_repaid_date),
      '{y}-{m}-{d}',
    );
    const opera_time = parseTime(
      new Date(item.opera_time),
      '{y}-{m}-{d} {h}:{i}:{s}',
    );
    return (
      <View style={HistoryStyles.loan_list_item_wrap}>
        <View style={HistoryStyles.list_row_wrap}>
          <View style={HistoryStyles.list_row_item_wrap}>
            <Text style={HistoryStyles.row_title}>初始借用申请单号</Text>
            <Text style={HistoryStyles.row_content}>{item.apply_number}</Text>
          </View>
          <View style={HistoryStyles.list_row_item_wrap}>
            <Text style={HistoryStyles.row_title}>手机端借用申请单号</Text>
            <Text style={HistoryStyles.row_content}>
              {item.phone_apply_number}
            </Text>
          </View>
        </View>

        <View style={HistoryStyles.list_row_wrap}>
          <View style={HistoryStyles.list_row_item_wrap}>
            <Text style={HistoryStyles.row_title}>携带人姓名</Text>
            <Text style={HistoryStyles.row_content}>{item.borrow_user}</Text>
          </View>
          <View style={HistoryStyles.list_row_item_wrap}>
            <Text style={HistoryStyles.row_title}>便携机编号</Text>
            <Text style={HistoryStyles.row_content}>{item.machine_number}</Text>
          </View>
        </View>

        <View style={HistoryStyles.list_row_wrap}>
          <View style={HistoryStyles.list_row_item_wrap}>
            <Text style={HistoryStyles.row_title}>开始借用时间</Text>
            <Text style={HistoryStyles.row_content}>{borrow_date}</Text>
          </View>
          <View style={HistoryStyles.list_row_item_wrap}>
            <Text style={HistoryStyles.row_title}>预计归还时间</Text>
            <Text style={HistoryStyles.row_content}>{repaid_date}</Text>
          </View>
        </View>

        <View style={HistoryStyles.list_row_wrap}>
          <View style={HistoryStyles.list_row_item_wrap}>
            <Text style={HistoryStyles.row_title}>新携带人姓名</Text>
            <Text style={HistoryStyles.row_content}>
              {item.loan_borrow_user_name}
            </Text>
          </View>
          <View style={HistoryStyles.list_row_item_wrap}>
            <Text style={HistoryStyles.row_title}>新携带人手机号</Text>
            <Text style={HistoryStyles.row_content}>
              {item.loan_borrow_user_phone}
            </Text>
          </View>
        </View>

        <View style={HistoryStyles.list_row_wrap}>
          <View style={HistoryStyles.list_row_full_item_wrap}>
            <Text style={HistoryStyles.row_title}>已超期借用次数</Text>
            <Text style={HistoryStyles.row_content}>
              {item.overdue_borrow_count}
            </Text>
          </View>
        </View>

        <View style={HistoryStyles.list_row_wrap}>
          <View style={HistoryStyles.list_row_full_item_wrap}>
            <Text style={HistoryStyles.row_title}>操作时间</Text>
            <Text style={HistoryStyles.row_content}>{opera_time}</Text>
          </View>
        </View>
        <View style={HistoryStyles.list_row_wrap}>
          <View style={HistoryStyles.list_row_full_item_wrap}>
            <Text style={HistoryStyles.row_title}>
              本次申请延期借用预计归还时间
            </Text>
            <Text style={HistoryStyles.row_content}>{delay_repaid_date}</Text>
          </View>
        </View>
        <ComputedNewResult key_1={item.key} />
      </View>
    );
  }

  render() {
    const historyList = this.state.historyList.sort(
      (a, b) => b.opera_time - a.opera_time,
    );
    return (
      <View style={HistoryStyles.container}>
        <SafeAreaView style={HistoryStyles.safe_container}>
          <Header
            title={'转借借用历史记录'}
            isBack={true}
            isExportExcel={true}
            back={() => this.onBack()}
            onExportExcel={() => this.onExportExcel()}
          />
          <FlatList
            style={HistoryStyles.list_wrap}
            data={historyList}
            renderItem={item => this.getItem(item)}
            keyExtractor={item => item.key}
          />
        </SafeAreaView>
      </View>
    );
  }
}

/**
 * 修改密码页面
 */
class EditPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      oldPassword: '',
      newPassword: '',
    };
  }

  onOldChange(password) {
    this.setState({
      oldPassword: password,
    });
  }

  onNewChange(password) {
    this.setState({
      newPassword: password,
    });
  }

  submit() {
    storage
      .load({
        key: 'UserInfo',
      })
      .then(info => {
        const {password} = info;

        if (this.state.oldPassword.length) {
          if (this.state.newPassword.length) {
          } else {
            Alert.alert('请输入新密码!');
            return null;
          }

          if (this.state.oldPassword === password) {
            storage
              .save({
                key: 'UserInfo',
                data: {
                  account: defaultUserInfo.account,
                  password: this.state.newPassword,
                },
              })
              .done(() => {
                ToastAndroid.show('修改成功!', ToastAndroid.SHORT);
                this.onBack();
              });
          } else {
            Alert.alert('旧密码输入错误!');
            return null;
          }
        } else {
          Alert.alert('请输入旧密码!');
          return null;
        }
      });
  }

  onBack() {
    this.props.onClose();
  }

  render() {
    return (
      <View style={EditPasswordStyles.edit_password_page}>
        <SafeAreaView style={EditPasswordStyles.safe_container}>
          <Header title={'修改密码'} isBack={true} back={() => this.onBack()} />
          <View style={EditPasswordStyles.edit_password_wrap}>
            <View style={EditPasswordStyles.input_row_wrap}>
              <Text style={EditPasswordStyles.label}>请输入旧密码</Text>
              <InputItem
                value={this.state.oldPassword}
                type="password"
                maxLength={20}
                onChange={text => this.onOldChange(text)}
              />
            </View>
          </View>
          <View style={EditPasswordStyles.edit_password_wrap}>
            <View style={EditPasswordStyles.input_row_wrap}>
              <Text style={EditPasswordStyles.label}>请输入新密码</Text>
              <InputItem
                value={this.state.newPassword}
                type="password"
                maxLength={20}
                onChange={text => this.onNewChange(text)}
              />
            </View>
          </View>

          <View style={{paddingLeft: 20, paddingRight: 20, paddingTop: 18}}>
            <CommonButton
              type={'primary'}
              title={'提交'}
              width={width - 40}
              click={() => this.submit()}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

/**
 * 主页面
 */
class App extends React.Component {
  constructor() {
    super();
    this.state = {
      isLogin: false, // 是否登陆
      isAuthorize: false, // 是否授权
      page: 'authorize', // computed password authorize
    };
  }

  componentDidMount() {
    SplashScreen.hide();

    this.checkAuthorize();
  }

  checkAuthorize() {
    const toAuthorizePage = () => {
      this.setState({
        isAuthorize: false, // 是否授权
        isLogin: true,
        page: 'authorize',
      });
    };
    storage
      .load({
        key: 'AuthorizeKey',
      })
      .then(res => {
        if (res && res.isAuthorize) {
          this.setState({
            isAuthorize: true,
            isLogin: false,
            page: 'login',
          });
        } else {
          toAuthorizePage();
        }
      })
      .catch(() => {
        toAuthorizePage();
      });
  }

  login() {
    this.setState({isLogin: true, page: 'computed'});
  }

  closeEditPassword() {
    this.setState({
      page: 'computed',
    });
  }

  closeHistory() {
    this.setState({
      page: 'computed',
    });
  }

  onExit() {
    this.setState({
      isLogin: false,
      page: 'login',
    });
    ToastAndroid.show('退出成功!', ToastAndroid.SHORT);
  }

  onEdit() {
    this.setState({
      page: 'password',
    });
  }

  onAuthorized() {
    this.setState({
      isAuthorize: true,
      isLogin: false,
      page: 'login',
    });
  }

  render() {
    return (
      <Provider>
        <SafeAreaView>
          <StatusBar />

          {!this.state.isAuthorize && (
            <Authorize onAuthorized={() => this.onAuthorized()} />
          )}

          {this.state.isAuthorize &&
            this.state.isLogin &&
            this.state.page === 'computed' && (
              <Computed
                onEdit={() => this.onEdit()}
                onExit={() => this.onExit()}
              />
            )}

          {this.state.isAuthorize &&
            this.state.isLogin &&
            this.state.page === 'password' && (
              <EditPassword onClose={() => this.closeEditPassword()} />
            )}

          {this.state.isAuthorize &&
            !this.state.isLogin &&
            this.state.page === 'login' && (
              <Login
                status={this.state.isLogin}
                loginChange={() => this.login()}
              />
            )}
        </SafeAreaView>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  login_container: {
    width: width,
    height: height,
  },
  login_basemap: {
    width: width,
    height: height,
    resizeMode: 'contain',
  },
  login_info_wrap: {
    width,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.2,
  },
  login_info: {
    width: 139,
    height: 35,
  },
  login_logo: {
    width: 35,
    height: 35,
    marginRight: 20,
  },
  login_layout: {
    width: width * 0.9,
    height: 64 * 2 + height * 0.1 + 80,
    marginHorizontal: width * 0.05,
    paddingTop: 40,
    paddingLeft: width * 0.1,
    paddingRight: width * 0.1,
    marginTop: 20,
  },
  login_form_row: {
    height: 42,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  login_row_icon_wrap: {
    width: 40,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  login_row_input_wrap: {
    width: width * 0.8 - 41 - 8,
    height: 40,
    paddingLeft: 8,
    paddingRight: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#ccc',
    color: '#000000',
  },
  login_button_wrap: {
    marginTop: 20,
  },
});

const InputStyles = StyleSheet.create({
  row_container: {
    width: width,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderBottomColor: '#e6e6e6',
    borderBottomWidth: 1,
  },
  row_label: {
    width: width / 2,
    height: 50,
    paddingLeft: 16,
    color: '#000000',
    fontSize: 17,
    textAlignVertical: 'center',
  },
  row_input: {
    width: width / 2,
    height: 50,
    color: '#808080',
    fontSize: 17,
    textAlignVertical: 'center',
  },
  multiple_label_wrap: {
    width: width / 2,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap',
  }, // 多行标签外层容器
  multiple_label_item: {
    color: '#000000',
    fontSize: 17,
    textAlignVertical: 'center',
  },
});

const HeaderStyles = StyleSheet.create({
  header_container: {
    width: width,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#4481fe',
  },
  header_title: {
    width: width * 0.5,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 18,
    color: '#fff',
    height: '100%',
  },
  header_button_wrap: {
    width: width * 0.25,
    textAlign: 'center',
    textAlignVertical: 'center',
    flexDirection: 'row',

    alignItems: 'center',
    height: '100%',
  },
  header_left: {
    justifyContent: 'flex-start',
    paddingLeft: 20,
  },
  header_right: {
    justifyContent: 'flex-end',
  },
  header_button_icon: {
    width: 20,
    height: 20,
    marginRight: 20,
  },
});

const ComputedResultStyles = StyleSheet.create({
  result_wrap: {
    backgroundColor: '#fff',
    height: 170,
    paddingTop: 12,
  },
  result_title: {
    fontSize: 22,
    color: '#4481fe',
    paddingLeft: 18,
  },
  result_list_wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingLeft: 18,
    paddingRight: 18,
  },
  result_item_wrap: {
    width: width / 2 - 36,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
    fontSize: 18,
  },
  result_key_wrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  result_index: {
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: 12,
    fontSize: 16,
  },
  result_index_common: {
    backgroundColor: '#dae6ff',
    color: '#6294fd',
  },
  result_index_primary: {
    backgroundColor: '#4481FE',
    color: '#ffffff',
  },
  result_content: {
    color: '#000',
    fontSize: 16,
    minWidth: 100,
  },
  result_prompt: {
    paddingLeft: 24 + 10,
    color: '#999999',
  },
  result_line: {
    width: '100%',
    height: 1,
    backgroundColor: '#e6e6e6',
  },
});

const ComputedNewResultStyles = StyleSheet.create({
  container: {
    width,
    height: 120,
    backgroundColor: '#fff',
  },
  frame: {
    width: width - 20,
    height: 100,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    marginLeft: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  result_title: {
    fontSize: 18,
  },
  result_content: {
    fontSize: 28,
    color: '#6294fd',
  },
});

const ComputedStyles = StyleSheet.create({
  container: {
    width: width,
    height: height,
  },
  safe_container: {
    flex: 1,
    backgroundColor: '#F5F5FA',
  },
  computed_wrap: {
    backgroundColor: '#ffffff',
    paddingBottom: 10,
  },
  button_wrap: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  history_button: {
    width: width,
    height: 40,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
  },
  history_content: {
    fontSize: 18,
    color: '#6294fd',
    height: 40,
  },
});

const EditPasswordStyles = StyleSheet.create({
  edit_password_page: {
    width: width,
    height: height,
  },

  safe_container: {
    flex: 1,
    backgroundColor: '#F5F5FA',
  },
  edit_password_wrap: {
    paddingRight: 20,
    paddingLeft: 20,
    paddingTop: 18,
    backgroundColor: '#fff',
  },
  input_row_wrap: {
    width: width - 40,
    height: 80,
  },
  label: {
    color: '#000',
    fontSize: 16,
  },
  input: {
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
    fontSize: 16,
  },
});

const HistoryStyles = StyleSheet.create({
  container: {
    width: width,
    height: height,
    backgroundColor: '#f5f5f5',
  },
  safe_container: {
    flex: 1,
    backgroundColor: '#F5F5FA',
  },
  list_wrap: {
    height: height - 48,
  },
  list_item_wrap: {
    height: 60 * 5 + 170 - 50,
    width,
    backgroundColor: '#fff',
    marginBottom: 18,
  },

  loan_list_item_wrap: {
    height: 60 * 7 + 170 - 50,
    width,
    backgroundColor: '#fff',
    marginBottom: 18,
  },
  list_row_wrap: {
    width,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  list_row_item_wrap: {
    width: width / 2,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 18,
  },
  list_row_full_item_wrap: {
    width: width,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 18,
  },
  row_title: {
    color: '#999',
    fontSize: 17,
  },
  row_content: {
    color: '#333',
    fontSize: 15,
  },
});

const AuthorizeStyles = StyleSheet.create({
  container: {
    width: width,
    height: height,
  },
  body: {
    width: width * 0.8,
    marginTop: height * 0.2,
    marginLeft: width * 0.1,
  },
  title: {
    fontSize: 28,
    color: '#303133',
    marginBottom: 30,
  },
  key: {
    fontSize: 18,
    color: '#606266',
    marginBottom: 20,
  },
  code_container: {
    height: 42,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  code_input: {
    width: width * 0.8 - 41 - 8,
    height: 40,
    paddingLeft: 8,
    paddingRight: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#ccc',
    color: '#000000',
  },
  confirm_button: {
    marginTop: 20,
  },
});

export default App;
