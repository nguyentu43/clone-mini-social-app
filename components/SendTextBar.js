import React, {useState} from 'react';
import {Button, Colors, View, TextField} from 'react-native-ui-lib';
import IonIcons from 'react-native-vector-icons/Ionicons';

export default function SendTextBar({onPressSend}) {
  const [text, setText] = useState('');

  return (
    <View
      row
      centerV
      paddingH-10
      style={{borderTopWidth: 1, borderColor: Colors.grey60}}>
      <View flex-1 marginH-10 marginT-10 style={{marginBottom: -10}}>
        <TextField
          placeholder="Type something"
          onSubmitEditing={() => {
            if (text.trim() === '') return;
            setText('');
            onPressSend(text);
          }}
          value={text}
          onChangeText={text => {
            setText(text);
          }}
        />
      </View>
      <Button
        marginL-10
        round
        bg-blue10
        size={Button.sizes.large}
        onPress={() => {
          if (text.trim() === '') return;
          setText('');
          onPressSend(text);
        }}
        iconSource={() => (
          <IonIcons name="send-outline" size={20} color="white" />
        )}
      />
    </View>
  );
}
