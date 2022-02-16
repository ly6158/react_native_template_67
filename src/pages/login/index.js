import React from 'react';
import type {Node} from 'react';
import {View, TextInput} from 'react-native';
import {Icon} from '@ant-design/react-native';

const LabelInput: () => Node = () => {
  return (
    <View>
      <Icon name={'alibaba'} />
      <TextInput />
    </View>
  );
};

const Login: () => Node = () => {
  return (
    <View>
      <LabelInput />
      <LabelInput />
    </View>
  );
};
