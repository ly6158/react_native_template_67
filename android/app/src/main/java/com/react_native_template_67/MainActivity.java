package com.react_native_template_67;

import com.facebook.react.ReactActivity;
import android.os.Bundle;// react-native-screens 需要
import org.devio.rn.splashscreen.SplashScreen; // 启动页 react-native-splash-screen >= 0.3.1

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "react_native_template_67";
  }

  /**
   * 为确保 react-native-screens 正常工作
   * 添加一下代码
   */
  @Override
  protected void onCreate(Bundle savedInstanceState) {
  SplashScreen.show(this);  // 启动页
    super.onCreate(null);
  }
}
