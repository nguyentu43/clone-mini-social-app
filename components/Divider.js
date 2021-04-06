import React from 'react';
import {View, Colors} from 'react-native-ui-lib';

export default function Divider({color = Colors.grey60}) {
  return (
    <View flex-1 style={{borderTopWidth: 1, borderTopColor: color}}></View>
  );
}
