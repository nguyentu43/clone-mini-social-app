import React from 'react';
import {View, Text, Colors, TextField} from 'react-native-ui-lib';

export default function SearchBar({text, onChangeText, onSearch}) {
  return (
    <View bg-white marginB-10 paddingT-10 paddingH-10>
      <Text marginV-5 text40BL>
        Search something
      </Text>
      <TextField
        value={text}
        onChangeText={onChangeText}
        onSubmitEditing={onSearch}
        title="Keyword"
        placeholder="Enter some keyword"
      />
    </View>
  );
}
