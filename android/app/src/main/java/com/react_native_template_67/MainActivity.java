package com.react_native_template_67;

import com.facebook.react.ReactActivity;
import android.os.Bundle;// react-native-screens 需要

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
    super.onCreate(null);
  }
}
